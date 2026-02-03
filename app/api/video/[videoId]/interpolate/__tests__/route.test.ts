import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../route';
import { NextRequest } from 'next/server';

// Mock auth
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn().mockResolvedValue({ user: { id: 'user_123' } }),
}));

// Mock the interpolation service
vi.mock('@/lib/video/interpolation', () => ({
  frameInterpolationService: {
    validateParams: vi.fn().mockReturnValue({ valid: true, errors: [] }),
    estimateCost: vi.fn().mockReturnValue({
      amount: 0.05,
      currency: 'USD',
      breakdown: { baseCost: 0.05, multiplierFactor: 1, interpolationMultiplier: 2 },
    }),
    getMultiplier: vi.fn().mockReturnValue(2),
  },
}));

describe('POST /api/video/[videoId]/interpolate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: object) => {
    return new NextRequest('http://localhost:3000/api/video/vid_123/interpolate', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  it('should validate required parameters', async () => {
    const request = createRequest({});
    const response = await POST(request, { params: Promise.resolve({ videoId: 'vid_123' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should accept valid interpolation request', async () => {
    const request = createRequest({
      multiplier: 2,
      quality: 'standard',
    });
    const response = await POST(request, { params: Promise.resolve({ videoId: 'vid_123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.jobId).toBeDefined();
    expect(data.estimatedCost).toBeDefined();
  });

  it('should return cost estimate', async () => {
    const request = createRequest({
      multiplier: 4,
      quality: 'high',
    });
    const response = await POST(request, { params: Promise.resolve({ videoId: 'vid_123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.estimatedCost.amount).toBeGreaterThan(0);
    expect(data.estimatedCost.currency).toBe('USD');
  });

  it('should reject invalid multiplier', async () => {
    const { frameInterpolationService } = await import('@/lib/video/interpolation');
    vi.mocked(frameInterpolationService.validateParams).mockReturnValueOnce({
      valid: false,
      errors: ['Invalid multiplier: must be 2 or 4'],
    });

    const request = createRequest({
      multiplier: 3,
      quality: 'standard',
    });
    const response = await POST(request, { params: Promise.resolve({ videoId: 'vid_123' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('multiplier');
  });

  it('should include videoId in response', async () => {
    const request = createRequest({
      multiplier: 2,
      quality: 'standard',
    });
    const response = await POST(request, { params: Promise.resolve({ videoId: 'vid_123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.videoId).toBe('vid_123');
  });

  it('should include multiplier and quality in response', async () => {
    const request = createRequest({
      multiplier: 4,
      quality: 'high',
    });
    const response = await POST(request, { params: Promise.resolve({ videoId: 'vid_123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.multiplier).toBe(4);
    expect(data.quality).toBe('high');
  });

  it('should default quality to standard if not provided', async () => {
    const request = createRequest({
      multiplier: 2,
    });
    const response = await POST(request, { params: Promise.resolve({ videoId: 'vid_123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.quality).toBe('standard');
  });
});

describe('GET /api/video/[videoId]/interpolate', () => {
  it('should return interpolation job status', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/video/vid_123/interpolate?jobId=job_456'
    );
    const response = await GET(request, { params: Promise.resolve({ videoId: 'vid_123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBeDefined();
  });

  it('should require jobId parameter', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/video/vid_123/interpolate'
    );
    const response = await GET(request, { params: Promise.resolve({ videoId: 'vid_123' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('jobId');
  });

  it('should include videoId in status response', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/video/vid_123/interpolate?jobId=job_456'
    );
    const response = await GET(request, { params: Promise.resolve({ videoId: 'vid_123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.videoId).toBe('vid_123');
    expect(data.jobId).toBe('job_456');
  });
});
