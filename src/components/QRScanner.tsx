// QRScanner.tsx
import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import jsQR from "jsqr";

interface QRScannerProps {
  onScanSuccess: () => void;
  onClose: () => void;
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setScanning(true);
      setScanResult(null);
      
      // Start scanning loop
      scanQRCode();
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Cannot access camera. Please check permissions.");
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setScanning(false);
    setScanResult(null);
  };

  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR to decode QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      
      if (code && code.data) {
        handleScanResult(code.data);
        return; // Stop scanning after successful detection
      }
    }

    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(scanQRCode);
  };

  const handleScanResult = async (qrData: string) => {
    try {
      setScanResult("Processing...");
      
      // Find guest by QR code
      const { data: guest, error } = await supabase
        .from("guests")
        .select("*")
        .eq("qr_code", qrData)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          toast.error("Guest not found in database");
        } else {
          throw error;
        }
        setScanResult(null);
        return;
      }

      if (!guest.is_attending) {
        toast.error("This guest is not attending the event");
        setScanResult(null);
        return;
      }

      // Check if already scanned in
      const { data: existingRecord } = await supabase
        .from("attendance")
        .select("*")
        .eq("guest_id", guest.id)
        .single();

      if (existingRecord) {
        toast.error(`${guest.name} has already been checked in`);
        setScanResult(null);
        return;
      }

      // Record attendance
      const { error: attendanceError } = await supabase
        .from("attendance")
        .insert([
          {
            guest_id: guest.id,
            scanned_by: "admin",
          },
        ]);

      if (attendanceError) throw attendanceError;

      toast.success(`Welcome, ${guest.name}!`);
      setScanResult(`Success: ${guest.name} checked in!`);
      
      // Notify parent component
      onScanSuccess();
      
      // Stop scanner after successful scan
      setTimeout(() => {
        stopScanner();
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast.error("Error processing QR code");
      setScanResult(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-br from-red-900 to-red-950 p-8 rounded-2xl border-2 border-red-700 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-serif italic">QR Code Scanner</h2>
          {!scanning ? (
            <motion.button
              onClick={startScanner}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-8 py-3 rounded-full transition-all border-2 border-red-400 font-medium tracking-wide"
            >
              <Camera className="w-5 h-5 mr-2 inline" />
              Start Scanner
            </motion.button>
          ) : (
            <motion.button
              onClick={stopScanner}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white px-8 py-3 rounded-full transition-all border-2 border-gray-400 font-medium tracking-wide"
            >
              Stop Scanner
            </motion.button>
          )}
        </div>

        {scanning && (
          <div className="bg-black/50 rounded-2xl p-6 border-2 border-red-500/30">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-96 object-cover rounded-xl border-2 border-red-500/50"
              />
              {/* Scanner overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-red-500 rounded-lg w-64 h-64 relative">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-red-500"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-red-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-red-500"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-red-500"></div>
                </div>
              </div>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
            
            {scanResult && (
              <div className="mt-4 p-4 bg-green-900/30 border border-green-500 rounded-lg">
                <p className="text-green-400 text-center font-medium">{scanResult}</p>
              </div>
            )}
            
            <p className="text-center mt-4 text-red-200 text-lg tracking-wide">
              Point camera at guest's QR code
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}