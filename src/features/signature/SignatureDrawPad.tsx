import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

import { SIGNATURE_INK } from '@/components/preview/themes/shared/signature';
import { type SignatureImageResult, toSignaturePng } from '@/features/signature/signatureImage';

export interface SignatureDrawPadHandle {
  clear: () => void;
  toPng: () => SignatureImageResult;
}

interface SignatureDrawPadProps {
  label: string;
  onInkChange: (hasInk: boolean) => void;
}

function copyOf(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const copy = document.createElement('canvas');
  copy.width = canvas.width;
  copy.height = canvas.height;
  copy.getContext('2d')?.drawImage(canvas, 0, 0);
  return copy;
}

/** CSS px; widened for a pen's pressure, so a stylus line reads as a pen line. */
const BASE_WIDTH = 2.4;

/**
 * White paper and near-black ink in both app themes: what the user draws is
 * what prints, and no brand colour reaches the document (#103).
 */
export const SignatureDrawPad = forwardRef<SignatureDrawPadHandle, SignatureDrawPadProps>(
  function SignatureDrawPad({ label, onInkChange }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const last = useRef<{ x: number; y: number; mid: { x: number; y: number } } | null>(null);
    const hasInk = useRef(false);
    const cssSize = useRef({ width: 0, height: 0 });

    const context = useCallback(() => canvasRef.current?.getContext('2d') ?? null, []);

    const resize = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ratio = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width === Math.round(width * ratio)) return;
      // Resizing wipes the bitmap (zoom, rotation, reflow), so the drawing is
      // copied out and scaled back in rather than lost.
      const previous = hasInk.current && canvas.width && canvas.height ? copyOf(canvas) : null;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const ctx = context();
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = SIGNATURE_INK;
      ctx.fillStyle = SIGNATURE_INK;
      // Uniform scale, so a narrower pad shrinks the drawing instead of squashing it.
      const was = cssSize.current;
      if (previous && was.width && was.height) {
        const k = Math.min(width / was.width, height / was.height);
        ctx.drawImage(previous, 0, 0, was.width * k, was.height * k);
      }
      cssSize.current = { width, height };
    }, [context]);

    // A fresh pad has no ink, whatever the dialog last heard from a previous one.
    useEffect(() => onInkChange(false), [onInkChange]);

    useEffect(() => {
      resize();
      const canvas = canvasRef.current;
      if (!canvas || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      return () => observer.disconnect();
    }, [resize]);

    const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const width = (event: React.PointerEvent) =>
      event.pointerType === 'pen' && event.pressure > 0
        ? BASE_WIDTH * (0.6 + event.pressure * 0.9)
        : BASE_WIDTH;

    const markInk = () => {
      if (!hasInk.current) {
        hasInk.current = true;
        onInkChange(true);
      }
    };

    const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      const p = point(event);
      last.current = { ...p, mid: p };
      const ctx = context();
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, width(event) / 2, 0, Math.PI * 2);
      ctx.fill();
      markInk();
    };

    const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
      const prev = last.current;
      const ctx = context();
      if (!prev || !ctx) return;
      const p = point(event);
      const mid = { x: (prev.x + p.x) / 2, y: (prev.y + p.y) / 2 };
      // Quadratic segments through the midpoints: a smooth stroke from
      // pointer samples that arrive at uneven intervals.
      ctx.lineWidth = width(event);
      ctx.beginPath();
      ctx.moveTo(prev.mid.x, prev.mid.y);
      ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
      ctx.stroke();
      last.current = { ...p, mid };
    };

    const onPointerUp = () => {
      last.current = null;
    };

    useImperativeHandle(
      ref,
      () => ({
        clear: () => {
          const canvas = canvasRef.current;
          const ctx = context();
          if (!canvas || !ctx) return;
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
          hasInk.current = false;
          onInkChange(false);
        },
        toPng: () => {
          const canvas = canvasRef.current;
          if (!canvas || !hasInk.current) return { ok: false, reason: 'empty' };
          return toSignaturePng(canvas, canvas.width, canvas.height);
        },
      }),
      [context, onInkChange],
    );

    return (
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        // White paper in both themes, deliberately not a token (#103).
        className="border-input block h-44 w-full cursor-crosshair touch-none rounded-lg border bg-white"
      />
    );
  },
);
