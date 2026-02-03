// dashboard/lib/audio/sync/types.ts

/**
 * Music-Video Sync Types
 *
 * Type definitions for beat detection and music-video synchronization.
 */

/**
 * A detected beat marker in the audio
 */
export interface BeatMarker {
  /** Time in seconds from start of audio */
  time: number;
  /** Strength of the beat (0-1, where 1 is strongest) */
  strength: number;
  /** Optional beat type classification */
  type?: 'downbeat' | 'upbeat' | 'accent';
}

/**
 * A synchronization point for video transitions
 */
export interface SyncPoint {
  /** Time in seconds */
  time: number;
  /** Type of sync point */
  type: 'beat' | 'bar' | 'phrase' | 'custom';
  /** Strength/importance of this sync point (0-1) */
  strength: number;
  /** Suggested action for video at this point */
  suggestedAction?: 'cut' | 'transition' | 'effect' | 'none';
}

/**
 * Complete audio analysis result
 */
export interface AudioAnalysis {
  /** Total duration in seconds */
  duration: number;
  /** Detected tempo in BPM */
  tempo: number;
  /** Time signature (e.g., "4/4", "3/4") */
  timeSignature: string;
  /** All detected beats */
  beats: BeatMarker[];
  /** Detected bar start times in seconds */
  bars: number[];
}

/**
 * Configuration for music-video synchronization
 */
export interface SyncConfig {
  /** How to sync video to music */
  syncMode: 'beats' | 'bars' | 'phrases' | 'manual';
  /** Whether to trigger transitions on strong beats */
  transitionOnStrongBeats: boolean;
  /** Minimum time between transitions in seconds */
  minTransitionInterval: number;
  /** Maximum number of transitions per bar */
  maxTransitionsPerBar: number;
}

/**
 * Complete result from music-video synchronization analysis
 */
export interface MusicVideoSyncResult {
  /** The full audio analysis */
  audioAnalysis: AudioAnalysis;
  /** Generated sync points for video transitions */
  syncPoints: SyncPoint[];
  /** AI-generated recommendations for syncing */
  recommendations: string[];
}
