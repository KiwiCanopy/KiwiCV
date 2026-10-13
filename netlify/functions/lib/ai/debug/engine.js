import { getVertexResponse } from '../vertex.js';
import { buildMockAIResult, buildMockResumeResult } from './mock.js';

/**
 * Centered engine to handle AI responses, either via Vertex or Mock.
 * Both branches read the sanitized CV only.
 */
export async function getAIResponse(request) {
  const { mock, granularity, sanitizedResumeData } = request;

  if (mock) {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate work
    const mockResult =
      granularity === 'cv_parsing'
        ? buildMockResumeResult()
        : buildMockAIResult(granularity, sanitizedResumeData);

    return {
      improvedContent: JSON.stringify(mockResult),
      data: {
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20 },
      },
      latency: Date.now() - startTime,
      candidate: { finishReason: 'STOP', safetyRatings: [] },
    };
  }

  return getVertexResponse(request);
}
