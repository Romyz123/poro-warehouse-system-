
import React, { useEffect, useRef, useState } from 'react';

interface ScannerProps {
  onClose: () => void;
  onScan: (sku: string) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Camera permission denied or not available.");
        console.error(err);
      }
    }
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6">
      <div className="absolute top-6 right-6 z-10">
        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-4 rounded-full text-white backdrop-blur-md transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="relative w-full max-w-sm aspect-square bg-slate-900 rounded-3xl overflow-hidden border-2 border-indigo-500/50 shadow-2xl">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
            <i className="fas fa-camera-slash text-4xl mb-4 text-rose-500"></i>
            <p className="text-lg font-bold mb-2">Camera Error</p>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-[40px] border-black/40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-indigo-500 rounded-2xl relative shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white -mt-1 -ml-1 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white -mt-1 -mr-1 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white -mb-1 -ml-1 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white -mb-1 -mr-1 rounded-br-lg"></div>
                <div className="absolute inset-x-0 h-0.5 bg-indigo-500/80 animate-[scan_2s_linear_infinite] shadow-[0_0_10px_#6366f1]"></div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-12 text-center text-white space-y-4">
        <h3 className="text-2xl font-black">Scan Item SKU</h3>
        <p className="text-slate-400">Position the barcode inside the frame to checkout</p>
        
        <div className="pt-8">
          <button 
            onClick={() => onScan('EL-001-PRO')} // Mock scan for demo
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-900/40 transition-all active:scale-95"
          >
            Simulate Scan Success
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
