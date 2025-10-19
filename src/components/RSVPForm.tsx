// RSVPForm.tsx
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Check, X, Loader2, QrCode, Download } from "lucide-react";
import emailjs from "@emailjs/browser";
import { EMAILJS_CONFIG } from "../config/emailjs";
import { supabase } from "../lib/supabase";
import QRCode from "qrcode";
import { QRCodeCanvas } from "qrcode.react";

interface GuestResponse {
  id: string;
  name: string;
  qrCode: string;
  isAttending: boolean;
}

export function RSVPForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestResponse, setGuestResponse] = useState<GuestResponse | null>(
    null
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Generate QR code when guest response is received
  useEffect(() => {
    if (guestResponse) {
      generateQRCode(guestResponse.qrCode);
    }
  }, [guestResponse]);

  const generateQRCode = async (qrData: string) => {
    try {
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#dc2626", // Red color
          light: "#ffffff", // White background
        },
      });
      setQrCodeDataUrl(url);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
      toast.error("Failed to generate QR code");
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement("a");
    link.download = `qr-code-${guestResponse?.name
      .replace(/\s+/g, "-")
      .toLowerCase()}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const generateUniqueQRCode = (name: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `MC25-${btoa(name).replace(/=/g, "")}-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (attending === null) {
      toast.error("Please select if you can attend");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if guest already exists
      const { data: existingGuest } = await supabase
        .from("guests")
        .select("*")
        .ilike("name", name.trim())
        .single();

      let guestId: string;
      let qrCode: string;

      if (existingGuest) {
        // Update existing guest
        guestId = existingGuest.id;
        qrCode = existingGuest.qr_code;

        const { error } = await supabase
          .from("guests")
          .update({
            is_attending: attending,
            message: message.trim() || null,
            has_responded: true,
            email: email.trim() || null,
            phone: phone.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", guestId);

        if (error) throw error;
      } else {
        // Create new guest with QR code
        qrCode = generateUniqueQRCode(name.trim());

        const { data: newGuest, error } = await supabase
          .from("guests")
          .insert([
            {
              name: name.trim(),
              email: email.trim() || null,
              phone: phone.trim() || null,
              is_attending: attending,
              message: message.trim() || null,
              qr_code: qrCode,
              has_responded: true,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        guestId = newGuest.id;
      }

      // Prepare and send email
      const templateParams = {
        to_name: "Maria Chezka",
        from_name: name.trim(),
        guest_name: name.trim(),
        attending: attending ? "✅ Yes, I will be there!" : "❌ Cannot make it",
        message: message.trim() || "No message provided",
        date: new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: new Date().toLocaleTimeString("en-US"),
      };

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      // Set guest response for QR code display
      setGuestResponse({
        id: guestId,
        name: name.trim(),
        qrCode: qrCode,
        isAttending: attending,
      });

      toast.success(
        attending
          ? "Thank you! We're excited to celebrate with you! 🎉"
          : "Thank you for letting us know. You'll be missed! 💝"
      );

      // Reset form fields but keep name for QR display
      setEmail("");
      setPhone("");
      setAttending(null);
      setMessage("");
    } catch (error) {
      console.error("❌ RSVP submission failed:", error);
      toast.error("Failed to submit RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if deadline has passed
  const now = new Date();
  const deadline = new Date("2026-04-01T23:59:59");
  const isPastDeadline = now > deadline;

  if (isPastDeadline) {
    return (
      <div className="bg-red-900/30 backdrop-blur-sm p-8 rounded-2xl border-2 border-red-500 text-center">
        <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-2xl text-white mb-2">RSVP Closed</h3>
        <p className="text-red-200">
          The RSVP deadline has passed. Please contact the host directly for any
          inquiries.
        </p>
      </div>
    );
  }

  // Show QR Code after successful submission
  if (guestResponse) {
    return (
      <div className="bg-white/10 backdrop-blur-sm p-8 md:p-12 rounded-2xl border-2 border-green-500 shadow-2xl text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-2xl text-white mb-2">RSVP Confirmed!</h3>
        <p className="text-white mb-6">
          {guestResponse.isAttending
            ? "We can't wait to celebrate with you!"
            : "Thank you for letting us know!"}
        </p>

        {guestResponse.isAttending && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Your Event QR Code
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Show this QR code at the entrance for quick check-in
              </p>

              {qrCodeDataUrl && (
                <div className="space-y-4">
                  <img
                    src={qrCodeDataUrl}
                    alt="Event QR Code"
                    className="mx-auto border-4 border-red-200 rounded-xl"
                  />
                  <p className="text-xs text-gray-500 font-mono">
                    {guestResponse.name}
                  </p>
                </div>
              )}

              <Button
                onClick={downloadQRCode}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                disabled={!qrCodeDataUrl}
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </div>

            <div className="bg-yellow-600/20 border border-yellow-500 rounded-xl p-4">
              <p className="text-white text-sm">
                💡 <strong>Important:</strong> Save this QR code and present it
                at the venue entrance for quick access.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm p-8 md:p-12 rounded-2xl border-2 border-red-300 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name" className="text-white mb-2 block text-lg">
            Your Name *
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="bg-white/90 border-red-200 text-black placeholder:text-gray-500"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email" className="text-white mb-2 block text-lg">
              Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="bg-white/90 border-red-200 text-black placeholder:text-gray-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-white mb-2 block text-lg">
              Phone (Optional)
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+63 912 345 6789"
              className="bg-white/90 border-red-200 text-black placeholder:text-gray-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <Label className="text-white mb-4 block text-lg">
            Will you be attending? *
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAttending(true)}
              disabled={isSubmitting}
              className={`p-4 rounded-xl border-2 transition-all ${
                attending === true
                  ? "bg-green-600 border-green-400 text-white scale-105"
                  : "bg-white/20 border-red-300 text-white hover:bg-white/30"
              } disabled:opacity-50`}
            >
              <Check className="w-8 h-8 mx-auto mb-2" />
              <div>Yes, I'll be there!</div>
            </button>
            <button
              type="button"
              onClick={() => setAttending(false)}
              disabled={isSubmitting}
              className={`p-4 rounded-xl border-2 transition-all ${
                attending === false
                  ? "bg-red-600 border-red-400 text-white scale-105"
                  : "bg-white/20 border-red-300 text-white hover:bg-white/30"
              } disabled:opacity-50`}
            >
              <X className="w-8 h-8 mx-auto mb-2" />
              <div>Can't make it</div>
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="message" className="text-white mb-2 block text-lg">
            Leave a message for Maria Chezka (Optional)
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your birthday wishes..."
            rows={4}
            className="bg-white/90 border-red-200 text-black placeholder:text-gray-500 resize-none"
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white py-6 text-lg tracking-wider disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending RSVP...
            </>
          ) : (
            "Submit RSVP"
          )}
        </Button>
      </form>
    </div>
  );
}
