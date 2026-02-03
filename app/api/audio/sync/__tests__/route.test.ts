import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock auth
vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    authorized: true,
    session: { user: { id: 'user_123' } },
  }),
}));

// Mock the beat detector
vi.mock('@/lib/audio/sync', () => ({
  beatDetector: {
    analyzeAudio: vi.fn().mockResolvedValue({
      duration: 60,
      tempo: 120,
      timeSignature: '4/4',
      beats: [
        { time: 0, strength: 1.0, type: 'downbeat' },
        { time: 0.5, strength: 0.6, type: 'upbeat' },
        { time: 1.0, strength: 1.0, type: 'downbeat' },
      ],
      bars: [0, 2.0, 4.0],
    }),
    generateSyncPoints: vi.fn().mockReturnValue([
      { time: 0, type: 'beat', strength: 1.0, suggestedAction: 'transition' },
      { time: 1.0, type: 'beat', strength: 1.0, suggestedAction: 'transition' },
    ]),
    updateConfig: vi.fn(),
    getConfig: vi.fn().mockReturnValue({
      syncMode: 'beats',
      transitionOnStrongBeats: true,
      minTransitionInterval: 0.5,
      maxTransitionsPerBar: 4,
    }),
  },
}));

describe('POST /api/audio/sync', () => {
  const createRequest = (body: object) => {
    return new NextRequest('http://localhost:3000/api/audio/sync', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should require audio URL', async () => {
    const request = createRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('audioUrl');
  });

  it('should analyze audio and return sync points', async () => {
    const request = createRequest({
      audioUrl: 'https://example.com/track.mp3',
      videoDuration: 10,
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis).toBeDefined();
    expect(data.analysis.tempo).toBe(120);
    expect(data.syncPoints).toBeDefined();
    expect(data.syncPoints.length).toBeGreaterThan(0);
  });

  it('should accept optional sync config', async () => {
    const request = createRequest({
      audioUrl: 'https://example.com/track.mp3',
      videoDuration: 10,
      config: {
        transitionOnStrongBeats: true,
        minTransitionInterval: 1.0,
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.syncPoints).toBeDefined();
  });

  it('should return tempo analysis', async () => {
    const request = createRequest({
      audioUrl: 'https://example.com/track.mp3',
      videoDuration: 10,
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis.tempo).toBeGreaterThan(0);
    expect(data.analysis.beats).toBeDefined();
    expect(data.analysis.duration).toBeGreaterThan(0);
  });

  it('should return beat markers', async () => {
    const request = createRequest({
      audioUrl: 'https://example.com/track.mp3',
      videoDuration: 10,
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis.beats.length).toBeGreaterThan(0);
    expect(data.analysis.beats[0]).toHaveProperty('time');
    expect(data.analysis.beats[0]).toHaveProperty('strength');
  });

  it('should return bars in analysis', async () => {
    const request = createRequest({
      audioUrl: 'https://example.com/track.mp3',
      videoDuration: 10,
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis.bars).toBeDefined();
    expect(Array.isArray(data.analysis.bars)).toBe(true);
  });

  it('should use default video duration if not provided', async () => {
    const request = createRequest({
      audioUrl: 'https://example.com/track.mp3',
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.syncPoints).toBeDefined();
  });
});
