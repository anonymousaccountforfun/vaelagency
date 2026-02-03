// dashboard/app/api/video/templates/route.ts

import { NextResponse } from 'next/server';
import { listTemplates, getTemplatesByCategory } from '@/lib/video/templates';
import type { VideoTemplate } from '@/lib/video/templates';

/**
 * GET /api/video/templates
 *
 * List all available video templates with metadata and brand placeholders.
 *
 * Query parameters:
 * - category: Filter by category ('product' | 'social' | 'testimonial' | 'reveal')
 *
 * Response:
 * - templates: Array of template metadata
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const validCategories = ['product', 'social', 'testimonial', 'reveal'] as const;
    const categoryParam = searchParams.get('category');
    const category = (categoryParam && validCategories.includes(categoryParam as any))
      ? (categoryParam as VideoTemplate['category'])
      : null;

    let templates: VideoTemplate[];

    if (category) {
      templates = getTemplatesByCategory(category);
    } else {
      templates = listTemplates();
    }

    // Return template metadata (excluding full prompt templates for security)
    const response = templates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      thumbnail: template.thumbnail,
      defaultAspectRatio: template.defaultAspectRatio,
      supportedAspectRatios: template.supportedAspectRatios,
      defaultDuration: template.defaultDuration,
      maxDuration: template.maxDuration,
      layerCount: template.layers.length,
      layerKeys: template.layers.map((l) => l.layerKey),
      brandPlaceholders: template.brandPlaceholders.map((p) => ({
        key: p.key,
        label: p.label,
        type: p.type,
        defaultValue: p.defaultValue,
        required: p.layerKey
          ? template.layers.find((l) => l.layerKey === p.layerKey)?.required ?? false
          : false,
      })),
    }));

    return NextResponse.json({
      success: true,
      templates: response,
      total: response.length,
      categories: ['product', 'social', 'testimonial', 'reveal'],
    });
  } catch (error) {
    console.error('Error fetching templates:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch templates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
