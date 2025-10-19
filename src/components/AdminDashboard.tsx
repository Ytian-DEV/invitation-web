// AdminDashboard.tsx
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  QrCode,
  Users,
  CheckCircle,
  XCircle,
  Camera,
  Scan,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  is_attending: boolean;
  message: string | null;
  qr_code: string;
  has_responded: boolean;
  created_at: string;
}

interface AttendanceRecord {
  id: string;
  guest: Guest;
  scanned_at: string;
}

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [addingGuest, setAddingGuest] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadGuests();
    loadAttendance();
  }, []);

  const loadGuests = async () => {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error("Error loading guests:", error);
      toast.error("Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select(
          `
          *,
          guest:guests(*)
        `
        )
        .order("scanned_at", { ascending: false });

      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  };

  const addGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) {
      toast.error("Please enter guest name");
      return;
    }

    setAddingGuest(true);
    try {
      const qrCode = `MC25-${btoa(newGuestName.trim()).replace(
        /=/g,
        ""
      )}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      const { data, error } = await supabase
        .from("guests")
        .insert([
          {
            name: newGuestName.trim(),
            email: newGuestEmail.trim() || null,
            phone: newGuestPhone.trim() || null,
            qr_code: qrCode,
            has_responded: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setGuests((prev) => [data, ...prev]);
      setNewGuestName("");
      setNewGuestEmail("");
      setNewGuestPhone("");
      toast.success("Guest added successfully");
    } catch (error) {
      console.error("Error adding guest:", error);
      toast.error("Failed to add guest");
    } finally {
      setAddingGuest(false);
    }
  };

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setScanning(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Cannot access camera");
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleScan = async (qrData: string) => {
    try {
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
        return;
      }

      if (!guest.is_attending) {
        toast.error("This guest is not attending the event");
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
      loadAttendance();
      stopScanner();
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast.error("Error processing QR code");
    }
  };

  const exportGuests = () => {
    const csv = [
      [
        "Name",
        "Email",
        "Phone",
        "Attending",
        "Has Responded",
        "QR Code",
        "Created At",
      ],
      ...guests.map((guest) => [
        guest.name,
        guest.email || "",
        guest.phone || "",
        guest.is_attending ? "Yes" : "No",
        guest.has_responded ? "Yes" : "No",
        guest.qr_code,
        new Date(guest.created_at).toLocaleString(),
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `maria-chezka-guests-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: guests.length,
    responded: guests.filter((g) => g.has_responded).length,
    attending: guests.filter((g) => g.is_attending).length,
    checkedIn: attendance.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-400">
                Maria Chezka's 25th Birthday Celebration
              </p>
            </div>
            <button
              onClick={onBack}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Invitation
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-gray-400 text-sm">Total Guests</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold">{stats.responded}</div>
            <div className="text-gray-400 text-sm">Responded</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <QrCode className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl font-bold">{stats.attending}</div>
            <div className="text-gray-400 text-sm">Attending</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <Scan className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <div className="text-2xl font-bold">{stats.checkedIn}</div>
            <div className="text-gray-400 text-sm">Checked In</div>
          </div>
        </div>

        {/* Scanner Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">QR Code Scanner</h2>
            {!scanning ? (
              <Button
                onClick={startScanner}
                className="bg-red-600 hover:bg-red-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Scanner
              </Button>
            ) : (
              <Button
                onClick={stopScanner}
                variant="outline"
                className="border-white text-white"
              >
                Stop Scanner
              </Button>
            )}
          </div>

          {scanning && (
            <div className="bg-black rounded-lg p-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover rounded-lg"
              />
              <p className="text-center mt-2 text-gray-400">
                Point camera at guest's QR code
              </p>
            </div>
          )}
        </div>

        {/* Add Guest Form */}
        <div className="mb-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Add Guest</h2>
          <form
            onSubmit={addGuest}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <Label htmlFor="guestName" className="text-white">
                Name *
              </Label>
              <Input
                id="guestName"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                placeholder="Full name"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="guestEmail" className="text-white">
                Email
              </Label>
              <Input
                id="guestEmail"
                type="email"
                value={newGuestEmail}
                onChange={(e) => setNewGuestEmail(e.target.value)}
                placeholder="email@example.com"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="guestPhone" className="text-white">
                Phone
              </Label>
              <Input
                id="guestPhone"
                type="tel"
                value={newGuestPhone}
                onChange={(e) => setNewGuestPhone(e.target.value)}
                placeholder="Phone number"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="md:col-span-3">
              <Button
                type="submit"
                disabled={addingGuest}
                className="bg-green-600 hover:bg-green-700"
              >
                {addingGuest ? "Adding..." : "Add Guest"}
              </Button>
            </div>
          </form>
        </div>

        {/* Export Button */}
        <div className="mb-4">
          <Button
            onClick={exportGuests}
            variant="outline"
            className="border-white text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Guests List
          </Button>
        </div>

        {/* Guests List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Guests List</h2>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 font-semibold">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-center">Response</div>
              <div className="col-span-1 text-center">QR</div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {guests.map((guest) => (
                <div
                  key={guest.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 items-center"
                >
                  <div className="col-span-4 font-medium">{guest.name}</div>
                  <div className="col-span-3 text-sm text-gray-400">
                    {guest.email && <div>{guest.email}</div>}
                    {guest.phone && <div>{guest.phone}</div>}
                  </div>
                  <div className="col-span-2 text-center">
                    {guest.is_attending ? (
                      <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                    )}
                  </div>
                  <div className="col-span-2 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        guest.has_responded
                          ? "bg-green-900 text-green-200"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {guest.has_responded ? "Responded" : "Pending"}
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <QrCode className="w-4 h-4 text-gray-400 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Attendance Records</h2>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 font-semibold">
              <div className="col-span-6">Guest Name</div>
              <div className="col-span-6">Check-in Time</div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700"
                >
                  <div className="col-span-6 font-medium">
                    {record.guest.name}
                  </div>
                  <div className="col-span-6 text-sm text-gray-400">
                    {new Date(record.scanned_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {attendance.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No check-ins yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
