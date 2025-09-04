import { createClient } from "@/lib/supabase/server"
import { generateEmbedding, validateHuggingFaceConfig } from "@/lib/embeddings"
import { type NextRequest, NextResponse } from "next/server"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  citations?: Array<{
    page_number: number
    chapter_title: string
    section_title: string
  }>
  reasoning?: {
    query_decomposition: string[]
    clinical_reasoning: string[]
    confidence_score: number
    risk_level: "low" | "medium" | "high"
    requires_specialist: boolean
  }
}

interface ChatRequest {
  message: string
  sessionId?: string
}

function decomposeQuery(query: string): {
  symptoms: string[]
  demographics: string[]
  clinical_context: string[]
  urgency_indicators: string[]
} {
  const lowercaseQuery = query.toLowerCase()

  // Extract symptoms
  const symptomKeywords = [
    "fever",
    "cough",
    "rash",
    "pain",
    "vomiting",
    "diarrhea",
    "headache",
    "fatigue",
    "breathing",
    "seizure",
  ]
  const symptoms = symptomKeywords.filter((symptom) => lowercaseQuery.includes(symptom))

  // Extract demographics
  const ageMatches =
    query.match(/(\d+)\s*(year|month|week|day)s?\s*old|(\d+)\s*yo|infant|newborn|toddler|adolescent/gi) || []
  const demographics = ageMatches.map((match) => match.trim())

  // Extract clinical context
  const clinicalKeywords = ["history", "diagnosis", "treatment", "medication", "allergy", "family history"]
  const clinical_context = clinicalKeywords.filter((keyword) => lowercaseQuery.includes(keyword))

  // Extract urgency indicators
  const urgencyKeywords = ["emergency", "urgent", "severe", "acute", "critical", "immediate"]
  const urgency_indicators = urgencyKeywords.filter((keyword) => lowercaseQuery.includes(keyword))

  return { symptoms, demographics, clinical_context, urgency_indicators }
}

function assessClinicalRisk(
  query: string,
  decomposition: any,
): {
  risk_level: "low" | "medium" | "high"
  requires_specialist: boolean
  clinical_reasoning: string[]
} {
  const reasoning: string[] = []
  let risk_level: "low" | "medium" | "high" = "low"
  let requires_specialist = false

  // High-risk indicators
  const highRiskKeywords = [
    "seizure",
    "difficulty breathing",
    "chest pain",
    "severe dehydration",
    "altered consciousness",
  ]
  const hasHighRisk = highRiskKeywords.some((keyword) => query.toLowerCase().includes(keyword))

  if (hasHighRisk) {
    risk_level = "high"
    requires_specialist = true
    reasoning.push("High-risk symptoms detected requiring immediate medical evaluation")
  }

  // Age-based risk assessment
  if (decomposition.demographics.some((demo: string) => demo.includes("newborn") || demo.includes("infant"))) {
    if (risk_level === "low") risk_level = "medium"
    reasoning.push("Pediatric age group requires careful monitoring")
  }

  // Multiple symptoms increase complexity
  if (decomposition.symptoms.length > 2) {
    if (risk_level === "low") risk_level = "medium"
    reasoning.push("Multiple symptoms present - comprehensive evaluation needed")
  }

  // Urgency indicators
  if (decomposition.urgency_indicators.length > 0) {
    risk_level = "high"
    requires_specialist = true
    reasoning.push("Urgency indicators present - immediate medical attention required")
  }

  return { risk_level, requires_specialist, clinical_reasoning: reasoning }
}

async function performMultiStageRetrieval(supabase: any, query: string, decomposition: any) {
  const allChunks: any[] = []
  const searchQueries: string[] = []

  try {
    // Stage 1: Primary symptom search
    if (decomposition.symptoms.length > 0) {
      const symptomQuery = decomposition.symptoms.join(" ")
      searchQueries.push(symptomQuery)
      
      console.log('[Retrieval] Generating embedding for symptoms:', symptomQuery)
      const embedding = await generateEmbedding(symptomQuery)

      const { data: symptomChunks, error: symptomError } = await supabase.rpc("match_nelson_chunks", {
        query_embedding: embedding,
        match_threshold: 0.6,
        match_count: 3,
      })

      if (symptomError) {
        console.error('[Retrieval] Error in symptom search:', symptomError)
      } else if (symptomChunks) {
        allChunks.push(...symptomChunks)
        console.log('[Retrieval] Found', symptomChunks.length, 'symptom-related chunks')
      }
    }

    // Stage 2: Age-specific search
    if (decomposition.demographics.length > 0) {
      const ageQuery = `${decomposition.demographics.join(" ")} pediatric`
      searchQueries.push(ageQuery)
      
      console.log('[Retrieval] Generating embedding for demographics:', ageQuery)
      const embedding = await generateEmbedding(ageQuery)

      const { data: ageChunks, error: ageError } = await supabase.rpc("match_nelson_chunks", {
        query_embedding: embedding,
        match_threshold: 0.6,
        match_count: 2,
      })

      if (ageError) {
        console.error('[Retrieval] Error in age search:', ageError)
      } else if (ageChunks) {
        allChunks.push(...ageChunks)
        console.log('[Retrieval] Found', ageChunks.length, 'age-specific chunks')
      }
    }

    // Stage 3: General query search
    console.log('[Retrieval] Generating embedding for full query:', query.substring(0, 100) + '...')
    const embedding = await generateEmbedding(query)
    
    const { data: generalChunks, error: generalError } = await supabase.rpc("match_nelson_chunks", {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 3,
    })

    if (generalError) {
      console.error('[Retrieval] Error in general search:', generalError)
    } else if (generalChunks) {
      allChunks.push(...generalChunks)
      console.log('[Retrieval] Found', generalChunks.length, 'general chunks')
    }

    // Remove duplicates and rank by relevance
    const uniqueChunks = allChunks.filter((chunk, index, self) => 
      index === self.findIndex((c) => c.id === chunk.id)
    )

    console.log('[Retrieval] Total unique chunks found:', uniqueChunks.length)

    return {
      chunks: uniqueChunks.slice(0, 5), // Top 5 most relevant
      search_queries: searchQueries,
    }
  } catch (error) {
    console.error('[Retrieval] Error in multi-stage retrieval:', error)
    
    // If embedding generation fails, return empty results but don't crash
    return {
      chunks: [],
      search_queries: searchQueries,
      error: error instanceof Error ? error.message : 'Unknown retrieval error'
    }
  }
}


export async function POST(request: NextRequest) {
  try {
    // Validate Hugging Face configuration first
    const configValidation = await validateHuggingFaceConfig()
    if (!configValidation.valid) {
      console.error('[Chat API] Hugging Face configuration invalid:', configValidation.error)
      return NextResponse.json(
        { 
          error: "Embedding service not properly configured. Please check your Hugging Face API key.",
          details: configValidation.error 
        }, 
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { message, sessionId }: ChatRequest = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    console.log("[Chat API] Starting multi-stage reasoning for query:", message)

    // Stage 1: Query decomposition
    const decomposition = decomposeQuery(message)
    console.log("[Chat API] Query decomposition:", decomposition)

    // Stage 2: Clinical risk assessment
    const riskAssessment = assessClinicalRisk(message, decomposition)
    console.log("[Chat API] Risk assessment:", riskAssessment)

    // Stage 3: Multi-stage retrieval with real embeddings
    const retrievalResult = await performMultiStageRetrieval(supabase, message, decomposition)
    console.log("[Chat API] Retrieved chunks:", retrievalResult.chunks.length)

    // Check if retrieval had errors
    if (retrievalResult.error) {
      console.error('[Chat API] Retrieval error:', retrievalResult.error)
      return NextResponse.json({
        error: "I'm having trouble accessing the medical database right now. Please try again in a moment.",
        details: retrievalResult.error
      }, { status: 503 })
    }

    const context =
      retrievalResult.chunks
        ?.map(
          (chunk: any) => `Chapter: ${chunk.chapter_title}\nSection: ${chunk.section_title}\nContent: ${chunk.content}`,
        )
        .join("\n\n") || ""

    const response = await generateEnhancedMedicalResponse(message, context, decomposition, riskAssessment)

    // Extract citations from chunks
    const citations =
      retrievalResult.chunks?.map((chunk: any) => ({
        page_number: chunk.page_number,
        chapter_title: chunk.chapter_title,
        section_title: chunk.section_title,
        similarity_score: chunk.similarity || 0,
      })) || []

    const confidence_score = calculateConfidenceScore(retrievalResult.chunks, decomposition, riskAssessment)

    const reasoning = {
      query_decomposition: [
        ...decomposition.symptoms.map((s: string) => `Symptom: ${s}`),
        ...decomposition.demographics.map((d: string) => `Demographics: ${d}`),
        ...decomposition.clinical_context.map((c: string) => `Clinical context: ${c}`),
      ],
      clinical_reasoning: riskAssessment.clinical_reasoning,
      confidence_score,
      risk_level: riskAssessment.risk_level,
      requires_specialist: riskAssessment.requires_specialist,
      search_queries: retrievalResult.search_queries,
    }

    // Save chat session and messages if sessionId provided
    if (sessionId) {
      try {
        // Save user message
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          role: "user",
          content: message,
        })

        // Save assistant response with reasoning
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          role: "assistant",
          content: response,
          citations: citations,
          reasoning: reasoning,
        })
      } catch (dbError) {
        console.error('[Chat API] Database save error:', dbError)
        // Don't fail the request if we can't save to DB, just log it
      }
    }

    return NextResponse.json({
      response,
      citations,
      reasoning,
      context_used: retrievalResult.chunks?.length || 0,
      embedding_model: process.env.HUGGINGFACE_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2'
    })
  } catch (error) {
    console.error("Chat API error:", error)
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json({ 
          error: "I'm receiving too many requests right now. Please wait a moment and try again." 
        }, { status: 429 })
      }
      if (error.message.includes('unauthorized')) {
        return NextResponse.json({ 
          error: "Authentication error with the embedding service. Please try again." 
        }, { status: 401 })
      }
      if (error.message.includes('embedding')) {
        return NextResponse.json({ 
          error: "I'm having trouble processing your question right now. Please try rephrasing or try again later." 
        }, { status: 503 })
      }
    }
    
    return NextResponse.json({ 
      error: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment." 
    }, { status: 500 })
  }
}

async function generateEnhancedMedicalResponse(
  question: string,
  context: string,
  decomposition: any,
  riskAssessment: any,
): Promise<string> {
  if (!context.trim()) {
    return "I don't have enough information from the Nelson Textbook of Pediatrics to answer your question accurately. Please try rephrasing your question or consult with a healthcare professional."
  }

  // Build structured response based on clinical reasoning
  let response = "## Clinical Assessment\n\n"

  // Add risk level indicator
  const riskEmoji = riskAssessment.risk_level === "high" ? "🔴" : riskAssessment.risk_level === "medium" ? "🟡" : "🟢"
  response += `**Risk Level:** ${riskEmoji} ${riskAssessment.risk_level.toUpperCase()}\n\n`

  // Add specialist recommendation if needed
  if (riskAssessment.requires_specialist) {
    response += "⚠️ **Immediate medical evaluation recommended**\n\n"
  }

  // Add evidence-based information
  response += "## Evidence-Based Information\n\n"
  response += `Based on the Nelson Textbook of Pediatrics:\n\n${context.substring(0, 800)}...\n\n`

  // Add clinical reasoning
  if (riskAssessment.clinical_reasoning.length > 0) {
    response += "## Clinical Reasoning\n\n"
    riskAssessment.clinical_reasoning.forEach((reason: string, index: number) => {
      response += `${index + 1}. ${reason}\n`
    })
    response += "\n"
  }

  // Add medical disclaimer
  response +=
    "---\n\n**Medical Disclaimer**: This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical decisions."

  if (riskAssessment.requires_specialist) {
    response += " **Seek immediate medical attention for the symptoms described.**"
  }

  return response
}

function calculateConfidenceScore(chunks: any[], decomposition: any, riskAssessment: any): number {
  let score = 0.5 // Base score

  // Increase confidence with more relevant chunks
  score += Math.min(chunks.length * 0.1, 0.3)

  // Decrease confidence for high-risk cases (more caution needed)
  if (riskAssessment.risk_level === "high") {
    score -= 0.2
  }

  // Increase confidence if we have specific symptom matches
  if (decomposition.symptoms.length > 0) {
    score += 0.1
  }

  // Increase confidence if we have demographic information
  if (decomposition.demographics.length > 0) {
    score += 0.1
  }

  return Math.max(0.1, Math.min(0.9, score)) // Clamp between 0.1 and 0.9
}
