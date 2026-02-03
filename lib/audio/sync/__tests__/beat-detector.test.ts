import { describe, it, expect, beforeEach } from 'vitest';
import { BeatDetector, beatDetector, STRONG_BEAT_THRESHOLD } from '../beat-detector';
import type { BeatMarker } from '../types';

describe('BeatDetector', () => {
  let detector: BeatDetector;

  beforeEach(() => {
    detector = new BeatDetector();
  });

  describe('analyzeTempo', () => {
    it('should detect 120 BPM from 500ms intervals', () => {
      // 120 BPM = 2 beats per second = 500ms between beats
      const beats: BeatMarker[] = [
        { time: 0, strength: 1.0 },
        { time: 0.5, strength: 0.8 },
        { time: 1.0, strength: 1.0 },
        { time: 1.5, strength: 0.8 },
        { time: 2.0, strength: 1.0 },
        { time: 2.5, strength: 0.8 },
        { time: 3.0, strength: 1.0 },
        { time: 3.5, strength: 0.8 },
      ];

      const bpm = detector.analyzeTempo(beats);

      expect(bpm).toBe(120);
    });

    it('should detect 60 BPM from 1000ms intervals', () => {
      // 60 BPM = 1 beat per second = 1000ms between beats
      const beats: BeatMarker[] = [
        { time: 0, strength: 1.0 },
        { time: 1.0, strength: 1.0 },
        { time: 2.0, strength: 1.0 },
        { time: 3.0, strength: 1.0 },
      ];

      const bpm = detector.analyzeTempo(beats);

      expect(bpm).toBe(60);
    });

    it('should handle varying intervals and return average BPM', () => {
      // Beats with slightly varying intervals (average ~500ms = 120 BPM)
      const beats: BeatMarker[] = [
        { time: 0, strength: 1.0 },
        { time: 0.48, strength: 0.8 },
        { time: 1.0, strength: 1.0 },
        { time: 1.52, strength: 0.8 },
        { time: 2.0, strength: 1.0 },
      ];

      const bpm = detector.analyzeTempo(beats);

      // Should be approximately 120 BPM (allowing some variance)
      expect(bpm).toBeGreaterThanOrEqual(115);
      expect(bpm).toBeLessThanOrEqual(125);
    });

    it('should return 0 for empty or single beat array', () => {
      expect(detector.analyzeTempo([])).toBe(0);
      expect(detector.analyzeTempo([{ time: 0, strength: 1.0 }])).toBe(0);
    });
  });

  describe('generateSyncPoints', () => {
    it('should create sync points at beat positions', () => {
      const beats: BeatMarker[] = [
        { time: 0, strength: 1.0 },
        { time: 0.5, strength: 0.5 },
        { time: 1.0, strength: 0.9 },
        { time: 1.5, strength: 0.5 },
      ];

      const syncPoints = detector.generateSyncPoints(beats, 2.0);

      expect(syncPoints.length).toBe(4);
      expect(syncPoints[0].time).toBe(0);
      expect(syncPoints[1].time).toBe(0.5);
      expect(syncPoints[2].time).toBe(1.0);
      expect(syncPoints[3].time).toBe(1.5);
    });

    it('should suggest "transition" action for strong beats (>=0.8 strength)', () => {
      const beats: BeatMarker[] = [
        { time: 0, strength: 1.0 },
        { time: 0.5, strength: 0.5 },
        { time: 1.0, strength: 0.8 },
        { time: 1.5, strength: 0.79 },
      ];

      const syncPoints = detector.generateSyncPoints(beats, 2.0);

      expect(syncPoints[0].suggestedAction).toBe('transition');
      expect(syncPoints[1].suggestedAction).toBe('none');
      expect(syncPoints[2].suggestedAction).toBe('transition');
      expect(syncPoints[3].suggestedAction).toBe('none');
    });

    it('should only include beats within video duration', () => {
      const beats: BeatMarker[] = [
        { time: 0, strength: 1.0 },
        { time: 0.5, strength: 0.8 },
        { time: 1.0, strength: 0.9 },
        { time: 1.5, strength: 0.8 },
        { time: 2.0, strength: 1.0 },
        { time: 2.5, strength: 0.8 },
      ];

      const syncPoints = detector.generateSyncPoints(beats, 1.5);

      expect(syncPoints.length).toBe(4);
      expect(syncPoints[syncPoints.length - 1].time).toBeLessThanOrEqual(1.5);
    });

    it('should set sync point type to "beat"', () => {
      const beats: BeatMarker[] = [
        { time: 0, strength: 1.0 },
        { time: 0.5, strength: 0.5 },
      ];

      const syncPoints = detector.generateSyncPoints(beats, 1.0);

      expect(syncPoints.every((sp) => sp.type === 'beat')).toBe(true);
    });
  });

  describe('findNearestBeat', () => {
    const beats: BeatMarker[] = [
      { time: 0, strength: 1.0 },
      { time: 0.5, strength: 0.8 },
      { time: 1.0, strength: 1.0 },
      { time: 1.5, strength: 0.8 },
      { time: 2.0, strength: 1.0 },
    ];

    it('should find the exact beat when time matches', () => {
      const nearest = detector.findNearestBeat(beats, 1.0);

      expect(nearest?.time).toBe(1.0);
    });

    it('should find the nearest beat to given time', () => {
      const nearest = detector.findNearestBeat(beats, 0.6);

      expect(nearest?.time).toBe(0.5);
    });

    it('should find nearest beat when closer to next beat', () => {
      const nearest = detector.findNearestBeat(beats, 0.8);

      expect(nearest?.time).toBe(1.0);
    });

    it('should return undefined for empty beats array', () => {
      const nearest = detector.findNearestBeat([], 1.0);

      expect(nearest).toBeUndefined();
    });

    it('should handle time before first beat', () => {
      const beatsStartingLater: BeatMarker[] = [
        { time: 1.0, strength: 1.0 },
        { time: 1.5, strength: 0.8 },
      ];

      const nearest = detector.findNearestBeat(beatsStartingLater, 0.5);

      expect(nearest?.time).toBe(1.0);
    });
  });

  describe('detectBars', () => {
    it('should detect bar starts for 4/4 time signature', () => {
      // 8 beats = 2 bars in 4/4
      const beats: BeatMarker[] = [
        { time: 0, strength: 1.0 },
        { time: 0.5, strength: 0.5 },
        { time: 1.0, strength: 0.7 },
        { time: 1.5, strength: 0.5 },
        { time: 2.0, strength: 1.0 },
        { time: 2.5, strength: 0.5 },
        { time: 3.0, strength: 0.7 },
        { time: 3.5, strength: 0.5 },
      ];

      const bars = detector.detectBars(beats, 4);

      expect(bars).toEqual([0, 2.0]);
    });

    it('should detect bar starts for 3/4 time signature', () => {
      // 6 beats = 2 bars in 3/4
      const beats: BeatMarker[] = [
        { time: 0, strength: 1.0 },
        { time: 0.5, strength: 0.5 },
        { time: 1.0, strength: 0.5 },
        { time: 1.5, strength: 1.0 },
        { time: 2.0, strength: 0.5 },
        { time: 2.5, strength: 0.5 },
      ];

      const bars = detector.detectBars(beats, 3);

      expect(bars).toEqual([0, 1.5]);
    });

    it('should default to 4 beats per bar', () => {
      const beats: BeatMarker[] = [
        { time: 0, strength: 1.0 },
        { time: 0.5, strength: 0.5 },
        { time: 1.0, strength: 0.7 },
        { time: 1.5, strength: 0.5 },
        { time: 2.0, strength: 1.0 },
      ];

      const bars = detector.detectBars(beats);

      expect(bars).toEqual([0, 2.0]);
    });

    it('should return empty array for insufficient beats', () => {
      const beats: BeatMarker[] = [{ time: 0, strength: 1.0 }];

      const bars = detector.detectBars(beats, 4);

      expect(bars).toEqual([]);
    });
  });

  describe('generateRecommendations', () => {
    it('should recommend faster cuts for high tempo (>140 BPM)', () => {
      const analysis = {
        duration: 60,
        tempo: 150,
        timeSignature: '4/4',
        beats: Array(300)
          .fill(null)
          .map((_, i) => ({ time: i * 0.4, strength: i % 4 === 0 ? 1.0 : 0.5 })),
        bars: [0, 1.6, 3.2],
      };

      const recommendations = detector.generateRecommendations(analysis, 30);

      expect(recommendations.some((r) => r.toLowerCase().includes('fast'))).toBe(true);
    });

    it('should recommend smoother transitions for low tempo (<80 BPM)', () => {
      const analysis = {
        duration: 60,
        tempo: 70,
        timeSignature: '4/4',
        beats: Array(70)
          .fill(null)
          .map((_, i) => ({ time: i * 0.857, strength: i % 4 === 0 ? 1.0 : 0.5 })),
        bars: [0, 3.43, 6.86],
      };

      const recommendations = detector.generateRecommendations(analysis, 30);

      expect(recommendations.some((r) => r.toLowerCase().includes('smooth'))).toBe(true);
    });

    it('should warn when video is longer than audio', () => {
      const analysis = {
        duration: 30,
        tempo: 120,
        timeSignature: '4/4',
        beats: [],
        bars: [],
      };

      const recommendations = detector.generateRecommendations(analysis, 60);

      expect(
        recommendations.some((r) => r.toLowerCase().includes('longer') || r.toLowerCase().includes('loop'))
      ).toBe(true);
    });
  });

  describe('analyzeAudio', () => {
    it('should return placeholder AudioAnalysis (stub)', async () => {
      const analysis = await detector.analyzeAudio('https://example.com/audio.mp3');

      expect(analysis).toHaveProperty('duration');
      expect(analysis).toHaveProperty('tempo');
      expect(analysis).toHaveProperty('timeSignature');
      expect(analysis).toHaveProperty('beats');
      expect(analysis).toHaveProperty('bars');
      expect(Array.isArray(analysis.beats)).toBe(true);
      expect(Array.isArray(analysis.bars)).toBe(true);
    });
  });
});

describe('STRONG_BEAT_THRESHOLD', () => {
  it('should be 0.8', () => {
    expect(STRONG_BEAT_THRESHOLD).toBe(0.8);
  });
});

describe('beatDetector singleton', () => {
  it('should be exported as singleton', () => {
    expect(beatDetector).toBeInstanceOf(BeatDetector);
  });
});
