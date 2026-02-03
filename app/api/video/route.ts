// dashboard/app/api/video/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  startVideoGeneration,
  startImageToVideo,
  getVideoModels,
  getDefaultVideoModel,
  estimateVideoCost,
} from '@/lib/video';
import { createVideoJob } from '@/lib/db/video';
import { enhancePrompt, getDefaultSettings } from '@/lib/brand-motion';
import { canGenerate, trackCost } from '@/lib/cost-tracking';
import { nanoid } from 'nanoid';
import { providerRegistry } from '@/lib/video/registry';

/**
 * POST /api/video
 * Start a video generation job
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const {
      prompt,
      negativePrompt,
      model,
      aspectRatio = '16:9',
      duration = 5,
      startImage,
      endImage,
      characterIds,
      clientId,
      applyBrandPresets = true,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Get default settings from brand motion
    const defaults = await getDefaultSettings(clientId);
    const selectedModel = model || defaults.model || getDefaultVideoModel();
    const selectedAspectRatio = aspectRatio || defaults.aspectRatio || '16:9';
    const selectedDuration = duration || defaults.duration || 5;

    // Get model config for validation
    const modelConfig = providerRegistry.getModelConfig(selectedModel);
    if (!modelConfig) {
      return NextResponse.json(
        { error: 'Invalid model', model: selectedModel },
        { status: 400 }
      );
    }

    // Validate duration against model limits
    if (selectedDuration > modelConfig.maxDuration) {
      return NextResponse.json(
        {
          error: 'Duration exceeds model limit',
          requested: selectedDuration,
          maxDuration: modelConfig.maxDuration,
          model: selectedModel,
        },
        { status: 400 }
      );
    }

    // Validate aspect ratio against model support
    if (!modelConfig.aspectRatios.includes(selectedAspectRatio)) {
      return NextResponse.json(
        {
          error: 'Unsupported aspect ratio for model',
          requested: selectedAspectRatio,
          supported: modelConfig.aspectRatios,
          model: selectedModel,
        },
        { status: 400 }
      );
    }

    // Select provider dynamically from registry
    const selection = providerRegistry.selectProvider({
      prompt,
      model: selectedModel,
      duration: selectedDuration,
      aspectRatio: selectedAspectRatio,
      startImage,
      endImage,
    });

    if (!selection) {
      return NextResponse.json(
        { error: 'No available provider for this request' },
        { status: 503 }
      );
    }

    const { provider } = selection;
    const providerId = provider.id;

    // Health check before generation
    const health = await provider.healthCheck();
    if (!health.available) {
      return NextResponse.json(
        {
          error: 'Provider temporarily unavailable',
          provider: providerId,
          message: health.message,
          retryAfter: 30,
        },
        { status: 503 }
      );
    }

    // Estimate cost
    const estimated = estimateVideoCost(selectedModel, selectedDuration);

    // Check budget
    const budgetCheck = await canGenerate(clientId, estimated);
    if (!budgetCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Budget limit reached',
          message: budgetCheck.message,
          currentSpend: budgetCheck.currentSpend,
          limit: budgetCheck.limit,
        },
        { status: 402 }
      );
    }

    // Enhance prompt with brand presets
    const enhanced = await enhancePrompt(clientId, prompt, {
      applyBrandPresets,
      characterIds,
    });

    // Generate unique job ID
    const jobId = `vj_${nanoid(12)}`;

    // Start generation - use image-to-video if startImage is provided
    const jobResult = startImage
      ? await startImageToVideo({
          imageUrl: startImage,
          prompt: enhanced.prompt,
          negativePrompt: enhanced.negativePrompt || negativePrompt,
          model: selectedModel,
          duration: selectedDuration,
          aspectRatio: selectedAspectRatio,
        })
      : await startVideoGeneration({
          prompt: enhanced.prompt,
          negativePrompt: enhanced.negativePrompt || negativePrompt,
          model: selectedModel,
          duration: selectedDuration,
          aspectRatio: selectedAspectRatio,
        });

    // Record job in database
    await createVideoJob({
      id: jobId,
      clientId,
      providerId,
      model: selectedModel,
      prompt: enhanced.prompt,
      negativePrompt: enhanced.negativePrompt,
      startImageUrl: startImage,
      endImageUrl: endImage,
      referenceImages: enhanced.characterRefs,
      settings: {
        aspectRatio: selectedAspectRatio,
        duration: selectedDuration,
      },
      brandPresetsApplied: enhanced.wasEnhanced,
      estimatedCost: jobResult.estimatedCost,
    });

    // Track estimated cost
    await trackCost({
      videoJobId: jobId,
      clientId,
      providerId,
      model: selectedModel,
      costUsd: jobResult.estimatedCost,
      durationSeconds: selectedDuration,
    });

    return NextResponse.json({
      jobId,
      externalJobId: jobResult.predictionId,
      providerId,
      model: selectedModel,
      status: 'pending',
      estimatedCost: jobResult.estimatedCost,
      estimatedTime: jobResult.estimatedTime,
      budgetWarning: budgetCheck.warning,
      enhanced: {
        wasEnhanced: enhanced.wasEnhanced,
        appliedKeywords: enhanced.appliedKeywords,
        characterRefs: enhanced.characterRefs.length,
      },
    });
  } catch (error) {
    console.error('[POST /api/video] Error:', error);
    return NextResponse.json(
      { error: 'Failed to start video generation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/video
 * List available models and providers
 */
export async function GET() {
  const models = getVideoModels();
  const defaultModel = getDefaultVideoModel();

  // Group models by provider (all are replicate-based for now)
  const byProvider: Record<string, typeof models> = {
    replicate: models,
  };

  return NextResponse.json({
    models,
    byProvider,
    defaultModel,
  });
}
