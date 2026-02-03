// dashboard/lib/video/interpolation/__tests__/service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  FrameInterpolationService,
  frameInterpolationService,
} from '../service';
import type {
  InterpolationParams,
  InterpolationMultiplier,
} from '../types';

describe('FrameInterpolationService', () => {
  let service: FrameInterpolationService;

  beforeEach(() => {
    service = new FrameInterpolationService();
  });

  describe('getMultiplier', () => {
    it('should return 2 for 30fps to 60fps', () => {
      const multiplier = service.getMultiplier(30, 60);
      expect(multiplier).toBe(2);
    });

    it('should return 4 for 30fps to 120fps', () => {
      const multiplier = service.getMultiplier(30, 120);
      expect(multiplier).toBe(4);
    });

    it('should return 2 for 24fps to 48fps', () => {
      const multiplier = service.getMultiplier(24, 48);
      expect(multiplier).toBe(2);
    });

    it('should return 2 for 24fps to 60fps (rounds to nearest multiplier)', () => {
      // 60/24 = 2.5, closer to 2x than 4x
      const multiplier = service.getMultiplier(24, 60);
      expect(multiplier).toBe(2);
    });

    it('should return 4 for 24fps to 96fps', () => {
      const multiplier = service.getMultiplier(24, 96);
      expect(multiplier).toBe(4);
    });
  });

  describe('validateParams', () => {
    const validParams: InterpolationParams = {
      videoUrl: 'https://example.com/video.mp4',
      targetFps: 60,
      inputFps: 30,
      durationSeconds: 30,
    };

    it('should accept valid parameters', () => {
      const result = service.validateParams(validParams);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject when targetFps is less than inputFps', () => {
      const params: InterpolationParams = {
        ...validParams,
        targetFps: 24,
        inputFps: 30,
      };
      const result = service.validateParams(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Target FPS must be greater than input FPS');
    });

    it('should reject when targetFps equals inputFps', () => {
      const params: InterpolationParams = {
        ...validParams,
        targetFps: 30,
        inputFps: 30,
      };
      const result = service.validateParams(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Target FPS must be greater than input FPS');
    });

    it('should reject videos longer than 120 seconds', () => {
      const params: InterpolationParams = {
        ...validParams,
        durationSeconds: 121,
      };
      const result = service.validateParams(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Video duration must be 120 seconds or less');
    });

    it('should accept videos exactly 120 seconds', () => {
      const params: InterpolationParams = {
        ...validParams,
        durationSeconds: 120,
      };
      const result = service.validateParams(params);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid URL', () => {
      const params: InterpolationParams = {
        ...validParams,
        videoUrl: 'not-a-valid-url',
      };
      const result = service.validateParams(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid video URL');
    });

    it('should reject empty URL', () => {
      const params: InterpolationParams = {
        ...validParams,
        videoUrl: '',
      };
      const result = service.validateParams(params);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid video URL');
    });

    it('should return multiple errors when multiple validations fail', () => {
      const params: InterpolationParams = {
        videoUrl: 'invalid',
        targetFps: 30,
        inputFps: 60,
        durationSeconds: 200,
      };
      const result = service.validateParams(params);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('estimateCost', () => {
    it('should calculate base cost based on duration', () => {
      const params: InterpolationParams = {
        videoUrl: 'https://example.com/video.mp4',
        targetFps: 60,
        inputFps: 30,
        durationSeconds: 10,
      };
      const estimate = service.estimateCost(params);

      // Base rate is $0.005/sec, 10 seconds = $0.05 base
      // 2x multiplier = $0.05 * 1 (no extra for 2x) = $0.05
      expect(estimate.amount).toBe(0.05);
      expect(estimate.currency).toBe('USD');
    });

    it('should cost more for 4x interpolation than 2x', () => {
      const params2x: InterpolationParams = {
        videoUrl: 'https://example.com/video.mp4',
        targetFps: 60,
        inputFps: 30,
        durationSeconds: 10,
      };

      const params4x: InterpolationParams = {
        videoUrl: 'https://example.com/video.mp4',
        targetFps: 120,
        inputFps: 30,
        durationSeconds: 10,
      };

      const estimate2x = service.estimateCost(params2x);
      const estimate4x = service.estimateCost(params4x);

      expect(estimate4x.amount).toBeGreaterThan(estimate2x.amount);
    });

    it('should apply 2x cost factor for 4x interpolation', () => {
      const params: InterpolationParams = {
        videoUrl: 'https://example.com/video.mp4',
        targetFps: 120,
        inputFps: 30,
        durationSeconds: 10,
      };
      const estimate = service.estimateCost(params);

      // Base rate is $0.005/sec, 10 seconds = $0.05 base
      // 4x multiplier = $0.05 * 2 = $0.10
      expect(estimate.amount).toBe(0.10);
      expect(estimate.breakdown.baseCost).toBe(0.05);
      expect(estimate.breakdown.multiplierFactor).toBe(2);
    });

    it('should include breakdown in cost estimate', () => {
      const params: InterpolationParams = {
        videoUrl: 'https://example.com/video.mp4',
        targetFps: 60,
        inputFps: 30,
        durationSeconds: 20,
      };
      const estimate = service.estimateCost(params);

      expect(estimate.breakdown).toBeDefined();
      expect(estimate.breakdown.baseCost).toBe(0.10); // $0.005 * 20
      expect(estimate.breakdown.multiplierFactor).toBe(1); // 2x has no extra factor
      expect(estimate.breakdown.interpolationMultiplier).toBe(2);
    });
  });

  describe('buildFfmpegCommand', () => {
    it('should build command with minterpolate filter', () => {
      const command = service.buildFfmpegCommand(
        '/input/video.mp4',
        '/output/video.mp4',
        {
          videoUrl: 'https://example.com/video.mp4',
          targetFps: 60,
          inputFps: 30,
          durationSeconds: 10,
        }
      );

      expect(command).toContain('-i /input/video.mp4');
      expect(command).toContain('minterpolate');
      expect(command).toContain('fps=60');
      expect(command).toContain('/output/video.mp4');
    });

    it('should include quality settings when quality is high', () => {
      const command = service.buildFfmpegCommand(
        '/input/video.mp4',
        '/output/video.mp4',
        {
          videoUrl: 'https://example.com/video.mp4',
          targetFps: 60,
          inputFps: 30,
          durationSeconds: 10,
          quality: 'high',
        }
      );

      expect(command).toContain('mi_mode=mci');
    });

    it('should use blend mode for standard quality', () => {
      const command = service.buildFfmpegCommand(
        '/input/video.mp4',
        '/output/video.mp4',
        {
          videoUrl: 'https://example.com/video.mp4',
          targetFps: 60,
          inputFps: 30,
          durationSeconds: 10,
          quality: 'standard',
        }
      );

      expect(command).toContain('mi_mode=blend');
    });
  });

  describe('startInterpolation', () => {
    it('should return a pending job result', async () => {
      const params: InterpolationParams = {
        videoUrl: 'https://example.com/video.mp4',
        targetFps: 60,
        inputFps: 30,
        durationSeconds: 10,
      };

      const result = await service.startInterpolation(params);

      expect(result.jobId).toBeDefined();
      expect(result.jobId.length).toBeGreaterThan(0);
      expect(result.status).toBe('pending');
      expect(result.outputFps).toBe(60);
    });

    it('should throw error for invalid params', async () => {
      const params: InterpolationParams = {
        videoUrl: 'invalid-url',
        targetFps: 30,
        inputFps: 60,
        durationSeconds: 200,
      };

      await expect(service.startInterpolation(params)).rejects.toThrow();
    });
  });

  describe('checkStatus', () => {
    it('should return status for a job', async () => {
      const result = await service.checkStatus('job-123');

      expect(result.jobId).toBe('job-123');
      expect(result.status).toBeDefined();
    });

    it('should return pending status for unknown jobs (stub behavior)', async () => {
      const result = await service.checkStatus('unknown-job');

      // Stub returns pending for any job
      expect(result.status).toBe('pending');
    });
  });

  describe('singleton export', () => {
    it('should export a singleton instance', () => {
      expect(frameInterpolationService).toBeDefined();
      expect(frameInterpolationService).toBeInstanceOf(FrameInterpolationService);
    });

    it('should be the same instance on multiple imports', async () => {
      // Import again
      const { frameInterpolationService: secondImport } = await import('../service');
      expect(secondImport).toBe(frameInterpolationService);
    });
  });
});
