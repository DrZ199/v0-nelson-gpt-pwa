import { NextRequest, NextResponse } from "next/server";
import { validateHuggingFaceConfig, generateEmbedding, getCacheStats } from "@/lib/embeddings";
import { createClient } from "@/lib/supabase/server";

/**
 * Health check endpoint for the medical assistant API
 * Tests database connection, embedding generation, and overall system status
 */
export async function GET(request: NextRequest) {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'unknown', details: '' },
      embeddings: { status: 'unknown', details: '', model: '' },
      cache: { status: 'unknown', details: '' },
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasHfApiKey: !!process.env.HUGGINGFACE_API_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    version: '1.0.0',
  };

  let overallHealthy = true;

  // Test database connection
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('chat_messages')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      healthCheck.services.database.status = 'error';
      healthCheck.services.database.details = error.message;
      overallHealthy = false;
    } else {
      healthCheck.services.database.status = 'healthy';
      healthCheck.services.database.details = `Connected successfully`;
    }
  } catch (error) {
    healthCheck.services.database.status = 'error';
    healthCheck.services.database.details = error instanceof Error ? error.message : 'Unknown database error';
    overallHealthy = false;
  }

  // Test embedding service
  try {
    const validation = await validateHuggingFaceConfig();
    
    if (!validation.valid) {
      healthCheck.services.embeddings.status = 'error';
      healthCheck.services.embeddings.details = validation.error || 'Configuration invalid';
      overallHealthy = false;
    } else {
      // Test actual embedding generation
      const testEmbedding = await generateEmbedding('pediatric fever symptoms test', { useCache: false });
      
      healthCheck.services.embeddings.status = 'healthy';
      healthCheck.services.embeddings.details = `Generated embedding of size ${testEmbedding.length}`;
      healthCheck.services.embeddings.model = process.env.HUGGINGFACE_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';
    }
  } catch (error) {
    healthCheck.services.embeddings.status = 'error';
    healthCheck.services.embeddings.details = error instanceof Error ? error.message : 'Unknown embedding error';
    overallHealthy = false;
  }

  // Test cache
  try {
    const cacheStats = getCacheStats();
    healthCheck.services.cache.status = 'healthy';
    healthCheck.services.cache.details = `${cacheStats.size} cached embeddings`;
  } catch (error) {
    healthCheck.services.cache.status = 'error';
    healthCheck.services.cache.details = error instanceof Error ? error.message : 'Unknown cache error';
    // Cache errors don't make the overall system unhealthy
  }

  healthCheck.status = overallHealthy ? 'healthy' : 'degraded';

  return NextResponse.json(healthCheck, { 
    status: overallHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}

/**
 * Test endpoint for embedding generation
 * POST /api/health with { "text": "your text here" }
 */
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text parameter is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 1000) {
      return NextResponse.json(
        { error: 'Text must be less than 1000 characters' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const embedding = await generateEmbedding(text, { useCache: false });
    const endTime = Date.now();

    return NextResponse.json({
      success: true,
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      embedding_size: embedding.length,
      generation_time_ms: endTime - startTime,
      model: process.env.HUGGINGFACE_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
      first_few_values: embedding.slice(0, 5),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Health Check] Embedding test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}