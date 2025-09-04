import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Default embedding model - optimized for semantic similarity
const DEFAULT_MODEL = process.env.HUGGINGFACE_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

// Cache for embeddings to avoid redundant API calls
const embeddingCache = new Map<string, number[]>();

/**
 * Generate embeddings using Hugging Face's sentence-transformers models
 * @param text - Text to generate embeddings for
 * @param options - Optional configuration
 * @returns Promise<number[]> - Embedding vector
 */
export async function generateEmbedding(
  text: string,
  options: {
    model?: string;
    useCache?: boolean;
  } = {}
): Promise<number[]> {
  const { model = DEFAULT_MODEL, useCache = true } = options;
  
  // Create cache key
  const cacheKey = `${model}:${text.trim()}`;
  
  // Check cache first
  if (useCache && embeddingCache.has(cacheKey)) {
    console.log('[Embeddings] Cache hit for text:', text.substring(0, 50) + '...');
    return embeddingCache.get(cacheKey)!;
  }
  
  try {
    console.log('[Embeddings] Generating embedding with model:', model);
    console.log('[Embeddings] Text length:', text.length);
    
    // Clean and prepare text
    const cleanText = text.trim().replace(/\s+/g, ' ');
    
    if (!cleanText) {
      throw new Error('Empty text provided for embedding generation');
    }
    
    // Generate embedding using Hugging Face
    const response = await hf.featureExtraction({
      model,
      inputs: cleanText,
    });
    
    // Handle different response formats
    let embedding: number[];
    
    if (Array.isArray(response) && Array.isArray(response[0])) {
      // 2D array format - take first row
      embedding = response[0] as number[];
    } else if (Array.isArray(response)) {
      // 1D array format
      embedding = response as number[];
    } else {
      throw new Error('Unexpected response format from Hugging Face API');
    }
    
    // Validate embedding
    if (!embedding || embedding.length === 0) {
      throw new Error('Received empty embedding from Hugging Face API');
    }
    
    // Ensure all values are numbers
    const validEmbedding = embedding.map(val => {
      const num = typeof val === 'number' ? val : parseFloat(val);
      if (isNaN(num)) {
        throw new Error('Invalid embedding value received from API');
      }
      return num;
    });
    
    console.log('[Embeddings] Generated embedding of size:', validEmbedding.length);
    
    // Cache the result
    if (useCache) {
      embeddingCache.set(cacheKey, validEmbedding);
      
      // Limit cache size to prevent memory issues
      if (embeddingCache.size > 1000) {
        const firstKey = embeddingCache.keys().next().value;
        embeddingCache.delete(firstKey);
      }
    }
    
    return validEmbedding;
    
  } catch (error) {
    console.error('[Embeddings] Error generating embedding:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        throw new Error('Rate limit exceeded for Hugging Face API. Please try again in a moment.');
      }
      if (error.message.includes('unauthorized')) {
        throw new Error('Invalid Hugging Face API key. Please check your configuration.');
      }
      if (error.message.includes('model not found')) {
        throw new Error(`Model ${model} not found. Please check the model name.`);
      }
    }
    
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts - Array of texts to generate embeddings for
 * @param options - Optional configuration
 * @returns Promise<number[][]> - Array of embedding vectors
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  options: {
    model?: string;
    useCache?: boolean;
    batchSize?: number;
  } = {}
): Promise<number[][]> {
  const { batchSize = 10 } = options;
  
  if (texts.length === 0) {
    return [];
  }
  
  // Process in batches to avoid overwhelming the API
  const results: number[][] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map(text => generateEmbedding(text, options));
    
    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      console.error(`[Embeddings] Error processing batch ${i / batchSize + 1}:`, error);
      throw error;
    }
    
    // Add small delay between batches to respect rate limits
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

/**
 * Calculate cosine similarity between two embedding vectors
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns number - Similarity score between 0 and 1
 */
export function calculateSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embedding vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  
  // Ensure similarity is between 0 and 1
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Clear the embedding cache
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
  console.log('[Embeddings] Cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: embeddingCache.size,
    keys: Array.from(embeddingCache.keys()).slice(0, 10), // Show first 10 keys
  };
}

/**
 * Validate that the Hugging Face API is properly configured
 */
export async function validateHuggingFaceConfig(): Promise<{ valid: boolean; error?: string }> {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      return { valid: false, error: 'HUGGINGFACE_API_KEY environment variable is not set' };
    }
    
    if (!process.env.HUGGINGFACE_API_KEY.startsWith('hf_')) {
      return { valid: false, error: 'Invalid Hugging Face API key format (should start with hf_)' };
    }
    
    // Test with a simple embedding generation
    await generateEmbedding('test', { useCache: false });
    
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    };
  }
}

// Export types for TypeScript support
export interface EmbeddingOptions {
  model?: string;
  useCache?: boolean;
}

export interface BatchEmbeddingOptions extends EmbeddingOptions {
  batchSize?: number;
}