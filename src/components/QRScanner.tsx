import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import jsQR from "jsqr";

interface QRScannerProps {
  onScanSuccess: () => void;
  onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef(false);

  // Debug useEffect
  useEffect(() => {
    console.log("🔍 QRScanner mounted, scanning state:", scanning);
    console.log("🔍 Camera active state:", cameraActive);
    console.log("🔍 Video ref:", videoRef.current);
    console.log("🔍 Stream ref:", streamRef.current);
  }, [scanning, cameraActive]);

  // Cleanup function - FIXED to be more careful
  const stopScanner = useCallback(() => {
    console.log("🛑 Stopping scanner...");

    // Stop scanning flag first
    isScanningRef.current = false;

    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop camera stream
    if (streamRef.current) {
      console.log("📹 Stopping camera stream tracks...");
      streamRef.current.getTracks().forEach((track) => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
      streamRef.current = null;
    }

    // Clear video - but be careful with timing
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScanning(false);
    setCameraActive(false);
    setScanResult(null);
    setCameraError(null);
  }, []);

  // Handle scan results
  const handleScanResult = useCallback(
    async (qrData: string) => {
      if (isProcessing) return;

      setIsProcessing(true);
      isScanningRef.current = false;

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
          setIsProcessing(false);
          isScanningRef.current = true;
          return;
        }

        if (!guest.is_attending) {
          toast.error("This guest is not attending the event");
          setScanResult(null);
          setIsProcessing(false);
          isScanningRef.current = true;
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
          setIsProcessing(false);
          isScanningRef.current = true;
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

        onScanSuccess();

        setTimeout(() => {
          stopScanner();
          onClose();
        }, 2000);
      } catch (error) {
        console.error("❌ Error processing QR code:", error);
        toast.error("Error processing QR code");
        setScanResult(null);
        setIsProcessing(false);
        isScanningRef.current = true;
      }
    },
    [isProcessing, onScanSuccess, onClose, stopScanner]
  );

  // QR scanning function
  const scanQRCode = useCallback(() => {
    if (!isScanningRef.current || !videoRef.current || !canvasRef.current) {
      console.log("Scan stopped or refs not ready");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      console.error("Cannot get canvas context");
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    try {
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log(`📐 Canvas resized: ${canvas.width}x${canvas.height}`);
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });

      if (code && code.data) {
        console.log("✅ QR Code detected:", code.data);
        handleScanResult(code.data);
        return;
      }
    } catch (error) {
      console.error("Error in scan loop:", error);
    }

    if (isScanningRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
    }
  }, [handleScanResult]);

  // Start camera function - FIXED VERSION
  const startScanner = async () => {
    try {
      console.log("🚀 Starting scanner...");

      // Set loading state first
      setScanning(true);
      setCameraActive(false);
      setCameraError(null);
      setScanResult(null);

      // Clean up any existing stream more carefully
      if (streamRef.current) {
        console.log("🔄 Cleaning up previous stream...");
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Small delay to ensure cleanup is processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get camera access
      console.log("📷 Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      console.log("✅ Camera access granted");
      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error("Video element not found");
      }

      const video = videoRef.current;

      // Set up event listeners FIRST
      const onLoadedData = () => {
        console.log("🎬 Video data loaded");
        console.log(`📺 Video size: ${video.videoWidth}x${video.videoHeight}`);

        video
          .play()
          .then(() => {
            console.log("🎥 Video is playing!");

            isScanningRef.current = true;
            setCameraActive(true);
            setIsProcessing(false);

            // Start scanning after video is definitely playing
            setTimeout(() => {
              console.log("🔍 Starting QR scan loop...");
              if (isScanningRef.current) {
                scanQRCode();
              }
            }, 1000);
          })
          .catch((error) => {
            console.error("❌ Error playing video:", error);
            setCameraError("Failed to start camera feed");
            toast.error("Failed to start camera feed");
            stopScanner();
          });
      };

      const onError = (error: any) => {
        console.error("❌ Video error:", error);
        setCameraError("Camera error occurred");
        toast.error("Camera error occurred");
        stopScanner();
      };

      // Remove any existing listeners
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("error", onError);

      // Add new listeners
      video.addEventListener("loadeddata", onLoadedData);
      video.addEventListener("error", onError);

      // Set stream and wait for it to load
      console.log("🔗 Setting video source...");
      video.srcObject = stream;
    } catch (error) {
      console.error("❌ Error accessing camera:", error);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          const errorMsg =
            "Camera permission denied. Please allow camera access.";
          setCameraError(errorMsg);
          toast.error(errorMsg);
        } else if (error.name === "NotFoundError") {
          const errorMsg = "No camera found on this device.";
          setCameraError(errorMsg);
          toast.error(errorMsg);
        } else if (error.name === "NotReadableError") {
          const errorMsg = "Camera is already in use by another application.";
          setCameraError(errorMsg);
          toast.error(errorMsg);
        } else {
          const errorMsg = "Cannot access camera: " + error.message;
          setCameraError(errorMsg);
          toast.error(errorMsg);
        }
      } else {
        const errorMsg = "Cannot access camera. Please check permissions.";
        setCameraError(errorMsg);
        toast.error(errorMsg);
      }
      stopScanner();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Component unmounting");
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-8 max-w-4xl mx-auto p-4"
    >
      <div className="bg-gradient-to-br from-red-900 to-red-950 p-8 rounded-2xl border-2 border-red-700 shadow-2xl">
        {/* DEBUG MESSAGE */}
        <div className="bg-yellow-500/20 border border-yellow-500 p-3 rounded-lg mb-4">
          {cameraError && (
            <p className="text-red-300 text-sm mt-2">❌ Error: {cameraError}</p>
          )}
        </div>

        <div className="flex items-center justify-between mb-6 gap-4">
          <h2 className="text-3xl font-serif italic text-white">
            QR Code Scanner
          </h2>
          {!scanning ? (
            <motion.button
              onClick={startScanner}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-8 py-3 rounded-full transition-all border-2 border-red-400 font-medium tracking-wide flex items-center"
            >
              <Camera className="w-5 h-5 mr-2" />
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
              {/* Video Element - ADD UNIQUE ID */}
              <video
                ref={videoRef}
                id="main-qr-scanner-video"
                autoPlay
                playsInline
                muted
                className={`w-full h-96 object-cover rounded-xl border-2 ${
                  cameraActive ? "border-green-500/50" : "border-red-500/50"
                } bg-black`}
              />

              {/* Loading overlay */}
              {!cameraActive && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-lg">Starting camera...</p>
                    <p className="text-sm text-red-300 mt-2">Please wait</p>
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl">
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <p className="text-lg text-red-300">Camera Error</p>
                    <p className="text-sm text-red-400 mt-2">{cameraError}</p>
                    <button
                      onClick={startScanner}
                      className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Scan result display */}
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-green-900/30 border border-green-500 rounded-lg"
              >
                <p className="text-green-400 text-center font-medium">
                  {scanResult}
                </p>
              </motion.div>
            )}

            {/* Status message */}
            <p className="text-center mt-4 text-red-200 text-lg tracking-wide">
              {cameraError
                ? "Camera error - click Try Again"
                : cameraActive
                ? "Point camera at guest's QR code"
                : "Initializing camera..."}
            </p>
          </div>
        )}

        {/* Initial state when not scanning */}
        {!scanning && (
          <div className="text-center py-12 text-red-300">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">
              Click "Start Scanner" to begin scanning QR codes
            </p>
          </div>
        )}
      </div>

      {/* EMERGENCY FIX: Hide any other video elements on the page */}
      <style>
        {`
        video:not(#main-qr-scanner-video) {
          display: none !important;
        }
      `}
      </style>
    </motion.div>
  );
}
