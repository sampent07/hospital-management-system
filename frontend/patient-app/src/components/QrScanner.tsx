import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, X } from 'lucide-react';
import { vi } from '../i18n/vi';

interface BarcodeResult { rawValue: string; }
interface NativeBarcodeDetector {
  detect(source: HTMLVideoElement): Promise<BarcodeResult[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => NativeBarcodeDetector;
  }
}

export function QrScanner({ onScan, onClose }: { onScan: (value: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer = 0;
    let cancelled = false;
    const Detector = window.BarcodeDetector;
    if (!Detector) {
      setMessage(vi.scanUnsupported);
      return () => undefined;
    }
    const detector = new Detector({ formats: ['qr_code'] });

    async function scan() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
        if (!videoRef.current || cancelled) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const readFrame = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes[0]?.rawValue) {
              onScan(codes[0].rawValue);
              return;
            }
          } catch {
            setMessage(vi.qrScanError);
          }
          timer = window.setTimeout(() => void readFrame(), 350);
        };
        void readFrame();
      } catch {
        setMessage(vi.cameraPermission);
      }
    }

    void scan();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-label={vi.scanQr}>
      <div className="w-full max-w-md rounded-3xl bg-white p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-slate-900">{vi.scanQr}</h2><button onClick={onClose} aria-label={vi.close}><X /></button></div>
        <div className="relative overflow-hidden rounded-2xl bg-slate-900">
          <video ref={videoRef} muted playsInline className="aspect-[4/3] w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="h-52 w-52 rounded-3xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(15,23,42,0.35)]" /></div>
          {message && <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-xl bg-white/95 p-3 text-sm text-slate-800">{message.includes('camera') ? <CameraOff size={17} /> : <Camera size={17} />}{message}</div>}
        </div>
        <p className="mt-3 text-xs text-slate-500">{vi.qrNote}</p>
      </div>
    </div>
  );
}
