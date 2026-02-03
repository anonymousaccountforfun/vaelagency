import { NextRequest, NextResponse } from 'next/server';
import { beatDetector } from '@/lib/audio/sync';
import type { SyncConfig } from '@/lib/audio/sync';

/**
 * POST /api/audio/sync
 *
 * Analyze audio for beat detection and generate video sync points.
 *
 * Body:
 * - audioUrl: string (required) - URL of audio file to analyze
 * - videoDuration: number (optional) - Duration of video in seconds (default: 30)
 * - config: Partial<SyncConfig> (optional) - Sync configuration options
 *   - syncMode: 'beats' | 'bars' | 'phrases' | 'manual'
 *   - transitionOnStrongBeats: boolean - Prefer strong beats for transitions
 *   - minTransitionInterval: number - Minimum seconds between transitions
 *   - maxTransitionsPerBar: number - Maximum transitions per musical bar
 *
 * Response:
 * - audioUrl: string - The analyzed audio URL
 * - analysis: AudioAnalysis - Full audio analysis with tempo, beats, bars
 * - syncPoints: SyncPoint[] - Generated sync points for video transitions
 * - config: SyncConfig - Applied sync configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.audioUrl) {
      return NextResponse.json(
        { error: 'audioUrl is required' },
        { status: 400 }
      );
    }

    // Extract and merge configuration
    const config: Partial<SyncConfig> = {
      syncMode: body.config?.syncMode ?? 'beats',
      transitionOnStrongBeats: body.config?.transitionOnStrongBeats ?? true,
      minTransitionInterval: body.config?.minTransitionInterval ?? 0.5,
      maxTransitionsPerBar: body.config?.maxTransitionsPerBar ?? 4,
    };

    // Update beat detector configuration
    beatDetector.updateConfig(config);

    // Analyze audio to get tempo and beats
    const audioAnalysis = await beatDetector.analyzeAudio(body.audioUrl);

    // Generate sync points for video transitions
    const videoDuration = body.videoDuration || 30;
    const syncPoints = beatDetector.generateSyncPoints(
      audioAnalysis.beats,
      videoDuration
    );

    return NextResponse.json({
      audioUrl: body.audioUrl,
      analysis: {
        duration: audioAnalysis.duration,
        tempo: audioAnalysis.tempo,
        timeSignature: audioAnalysis.timeSignature,
        beats: audioAnalysis.beats,
        bars: audioAnalysis.bars,
      },
      syncPoints,
      config: beatDetector.getConfig(),
    });
  } catch (error) {
    console.error('[Audio Sync API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze audio' },
      { status: 500 }
    );
  }
}
