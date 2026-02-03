// dashboard/lib/audio/sync/beat-detector.ts

/**
 * Beat Detection and Music-Video Synchronization
 *
 * Provides beat detection, tempo analysis, and sync point generation
 * for synchronizing video transitions with background music.
 */

import type { BeatMarker, SyncPoint, AudioAnalysis, SyncConfig } from './types';

/** Threshold for considering a beat as "strong" (0-1) */
export const STRONG_BEAT_THRESHOLD = 0.8;

/** Default minimum time between transitions in seconds */
export const DEFAULT_MIN_TRANSITION_INTERVAL = 0.5;

/**
 * Default configuration for music-video synchronization
 */
export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  syncMode: 'beats',
  transitionOnStrongBeats: true,
  minTransitionInterval: DEFAULT_MIN_TRANSITION_INTERVAL,
  maxTransitionsPerBar: 4,
};

/**
 * BeatDetector class for analyzing audio beats and generating video sync points
 */
export class BeatDetector {
  private config: SyncConfig;

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
  }

  /**
   * Calculate BPM (beats per minute) from an array of beat markers
   * @param beats Array of detected beats
   * @returns BPM value, or 0 if insufficient beats
   */
  analyzeTempo(beats: BeatMarker[]): number {
    if (beats.length < 2) {
      return 0;
    }

    // Calculate intervals between consecutive beats
    const intervals: number[] = [];
    for (let i = 1; i < beats.length; i++) {
      intervals.push(beats[i].time - beats[i - 1].time);
    }

    // Calculate average interval
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

    // Convert to BPM: 60 seconds / interval in seconds = BPM
    const bpm = Math.round(60 / averageInterval);

    return bpm;
  }

  /**
   * Generate sync points from beats for video transitions
   * @param beats Array of detected beats
   * @param videoDuration Duration of the video in seconds
   * @returns Array of sync points with suggested actions
   */
  generateSyncPoints(beats: BeatMarker[], videoDuration: number): SyncPoint[] {
    // Filter beats that fall within the video duration
    const relevantBeats = beats.filter((beat) => beat.time <= videoDuration);

    return relevantBeats.map((beat) => ({
      time: beat.time,
      type: 'beat' as const,
      strength: beat.strength,
      suggestedAction: beat.strength >= STRONG_BEAT_THRESHOLD ? 'transition' : 'none',
    }));
  }

  /**
   * Find the beat nearest to a given time
   * @param beats Array of detected beats
   * @param time Time in seconds to find nearest beat to
   * @returns The nearest beat, or undefined if no beats
   */
  findNearestBeat(beats: BeatMarker[], time: number): BeatMarker | undefined {
    if (beats.length === 0) {
      return undefined;
    }

    let nearestBeat = beats[0];
    let smallestDistance = Math.abs(beats[0].time - time);

    for (const beat of beats) {
      const distance = Math.abs(beat.time - time);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        nearestBeat = beat;
      }
    }

    return nearestBeat;
  }

  /**
   * Detect bar start times based on beat pattern
   * @param beats Array of detected beats
   * @param beatsPerBar Number of beats per bar (default: 4 for 4/4 time)
   * @returns Array of bar start times in seconds
   */
  detectBars(beats: BeatMarker[], beatsPerBar: number = 4): number[] {
    if (beats.length < beatsPerBar) {
      return [];
    }

    const bars: number[] = [];
    for (let i = 0; i < beats.length; i += beatsPerBar) {
      bars.push(beats[i].time);
    }

    return bars;
  }

  /**
   * Generate recommendations for syncing video to audio
   * @param analysis Audio analysis result
   * @param videoDuration Duration of the video in seconds
   * @returns Array of recommendation strings
   */
  generateRecommendations(analysis: AudioAnalysis, videoDuration: number): string[] {
    const recommendations: string[] = [];

    // Tempo-based recommendations
    if (analysis.tempo > 140) {
      recommendations.push(
        'High tempo detected. Consider using fast cuts and quick transitions to match the energy.'
      );
    } else if (analysis.tempo < 80) {
      recommendations.push(
        'Low tempo detected. Use smooth, flowing transitions for a more cinematic feel.'
      );
    } else {
      recommendations.push(
        `Moderate tempo (${analysis.tempo} BPM). A mix of cuts and transitions will work well.`
      );
    }

    // Duration comparison
    if (videoDuration > analysis.duration) {
      recommendations.push(
        'Video is longer than the audio track. Consider looping the music or extending the track.'
      );
    } else if (videoDuration < analysis.duration * 0.5) {
      recommendations.push(
        'Video is much shorter than the audio. Consider trimming the music to match key sections.'
      );
    }

    // Beat density recommendations
    const beatsPerSecond = analysis.beats.length / analysis.duration;
    if (beatsPerSecond > 3) {
      recommendations.push(
        'Dense beat pattern. Not every beat needs a transition - focus on downbeats and strong accents.'
      );
    }

    return recommendations;
  }

  /**
   * Analyze audio from a URL (stub implementation)
   * Returns placeholder data - real implementation would use audio analysis library
   * @param audioUrl URL of the audio file to analyze
   * @returns Promise resolving to AudioAnalysis
   */
  async analyzeAudio(audioUrl: string): Promise<AudioAnalysis> {
    // Stub implementation - returns placeholder data
    // Real implementation would use Web Audio API or external service
    console.log(`[BeatDetector] Analyzing audio: ${audioUrl}`);

    // Generate placeholder beats at 120 BPM for 60 seconds
    const duration = 60;
    const tempo = 120;
    const beatInterval = 60 / tempo;
    const beats: BeatMarker[] = [];

    for (let time = 0; time < duration; time += beatInterval) {
      // Every 4th beat (downbeat) is stronger
      const isDownbeat = Math.floor(time / beatInterval) % 4 === 0;
      beats.push({
        time,
        strength: isDownbeat ? 1.0 : 0.6,
        type: isDownbeat ? 'downbeat' : 'upbeat',
      });
    }

    // Generate bars (every 4 beats)
    const bars = this.detectBars(beats, 4);

    return {
      duration,
      tempo,
      timeSignature: '4/4',
      beats,
      bars,
    };
  }

  /**
   * Update the sync configuration
   * @param config Partial configuration to merge
   */
  updateConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get the current sync configuration
   */
  getConfig(): SyncConfig {
    return { ...this.config };
  }
}

/** Singleton instance for convenience */
export const beatDetector = new BeatDetector();
