// AdminDashboard.tsx
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";
import {
  QrCode,
  Users,
  CheckCircle,
  XCircle,
  Camera,
  Scan,
  Download,
  ArrowLeft,
  Plus,
  Mail,
  Phone,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { QRCodeCanvas } from "qrcode.react";
import QRScanner from "./QRScanner";

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
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [addingGuest, setAddingGuest] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "guests" | "attendance" | "scanner"
  >("guests");

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

  const handleScanSuccess = () => {
    // Reload attendance when a scan is successful
    loadAttendance();
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
    link.download = `yzkaella-yang-guests-${
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
      <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl mb-1 font-serif italic">
                Admin Dashboard
              </h1>
            </div>

            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="self-center md:self-end bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-4 py-2 rounded-full border-2 border-red-400 font-medium tracking-wide flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Invitation
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              icon: Users,
              value: stats.total,
              label: "Total Guests",
              color: "text-blue-400",
              bg: "from-blue-600 to-blue-800",
            },
            {
              icon: CheckCircle,
              value: stats.responded,
              label: "Responded",
              color: "text-green-400",
              bg: "from-green-600 to-green-800",
            },
            {
              icon: QrCode,
              value: stats.attending,
              label: "Attending",
              color: "text-yellow-400",
              bg: "from-yellow-600 to-yellow-800",
            },
            {
              icon: Scan,
              value: stats.checkedIn,
              label: "Checked In",
              color: "text-red-400",
              bg: "from-red-600 to-red-800",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.bg} p-6 rounded-2xl border-2 border-white/20 shadow-2xl text-center`}
            >
              <stat.icon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
              <div className="text-3xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-red-100 text-sm tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-4 mb-8 border-b-2 border-red-800/50"
        >
          {[
            { id: "guests" as const, label: "Guests", icon: Users },
            { id: "attendance" as const, label: "Attendance", icon: Calendar },
            { id: "scanner" as const, label: "QR Scanner", icon: Camera },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 border-b-2 transition-all font-medium tracking-wide ${
                activeTab === tab.id
                  ? "border-red-500 text-white bg-red-900/30 rounded-t-lg"
                  : "border-transparent text-red-300 hover:text-white hover:bg-red-900/10"
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Scanner Section - Only show QR Scanner */}
        {activeTab === "scanner" && (
          <QRScanner 
            onScanSuccess={handleScanSuccess}
            onClose={() => setActiveTab("attendance")}
          />
        )}

        {/* Guests Section - Only show when guests tab is active */}
        {activeTab === "guests" && (
          <>
            {/* Add Guest Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 bg-gradient-to-br from-red-900 to-black p-8 rounded-2xl border-2 border-red-700 shadow-2xl"
            >
              <h2 className="text-3xl font-serif italic mb-6">Add Guest</h2>
              <form
                onSubmit={addGuest}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div>
                  <Label
                    htmlFor="guestName"
                    className="text-white text-lg mb-3 block"
                  >
                    Name *
                  </Label>
                  <Input
                    id="guestName"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="Full name"
                    className="bg-black/50 border-red-500/30 text-white placeholder:text-red-300/50 rounded-xl p-4 border-2 focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="guestEmail"
                    className="text-white text-lg mb-3 block"
                  >
                    Email
                  </Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={newGuestEmail}
                    onChange={(e) => setNewGuestEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="bg-black/50 border-red-500/30 text-white placeholder:text-red-300/50 rounded-xl p-4 border-2 focus:border-red-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="guestPhone"
                    className="text-white text-lg mb-3 block"
                  >
                    Phone
                  </Label>
                  <Input
                    id="guestPhone"
                    type="tel"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    placeholder="Phone number"
                    className="bg-black/50 border-red-500/30 text-white placeholder:text-red-300/50 rounded-xl p-4 border-2 focus:border-red-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <motion.button
                    type="submit"
                    disabled={addingGuest}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center mx-2 gap-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-8 py-4 rounded-xl transition-all border-2 border-red-400 font-medium tracking-wide disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                    {addingGuest ? "Adding Guest..." : "Add Guest"}
                  </motion.button>
                </div>
              </form>
            </motion.div>

            {/* Export Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <motion.button
                onClick={exportGuests}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white px-6 py-3 rounded-full transition-all border-2 border-gray-400 font-medium tracking-wide"
              >
                <Download className="w-4 h-4 mr-2 inline" />
                Export Guests List
              </motion.button>
            </motion.div>

            {/* Guests List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-serif italic mb-6">Guests List</h2>

              <div className="bg-gradient-to-br from-red-900 to-black rounded-2xl border-2 border-red-700 shadow-2xl overflow-hidden">
                <div className="max-h-96 overflow-y-auto divide-y divide-red-800/50">
                  {guests.map((guest, index) => (
                    <motion.div
                      key={guest.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col md:flex-row items-center md:items-start p-4 hover:bg-red-900/20 transition-colors text-red-100"
                    >
                      {/* QR CODE LEFT */}
                      <div className="flex-shrink-0 bg-black/40 border border-red-700 p-4 rounded-xl flex items-center justify-center w-[120px] h-[120px]">
                        <QRCodeCanvas
                          value={`Name: ${guest.name}\nEmail: ${
                            guest.email
                          }\nContact: ${guest.phone || "N/A"}`}
                          size={100}
                          bgColor="#ff4d4d"
                          fgColor="#ffffff"
                          level="M"
                        />
                      </div>
                      {/* TEXT RIGHT */}
                      <div className="px-6 flex-col justify-center w-full md:pl-4">
                        <div className="text-base sm:text-lg leading-relaxed space-y-2">
                          <p>
                            <span className="font-semibold text-red-300">
                              Name:
                            </span>{" "}
                            <span className="text-red-100">{guest.name}</span>
                          </p>

                          <p className="flex items-center gap-2 text-red-100">
                            <span className="font-semibold text-red-300">
                              Contact:
                            </span>
                            <span className="flex items-center gap-4 text-red-100">
                              <span className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-red-400" />
                                {guest.email}
                              </span>

                              {guest.phone && (
                                <span className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-red-400" />
                                  {guest.phone}
                                </span>
                              )}
                            </span>
                          </p>

                          <p>
                            <span className="font-semibold text-red-300">
                              Status:
                            </span>{" "}
                            {guest.is_attending ? (
                              <span className="flex items-center gap-2 text-green-400 inline-flex">
                                <CheckCircle className="w-5 h-5" /> Attending
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 text-red-400 inline-flex">
                                <XCircle className="w-5 h-5" /> Not Attending
                              </span>
                            )}
                          </p>

                          <p>
                            <span className="font-semibold text-red-300">
                              Message:
                            </span>{" "}
                            <span className="italic text-red-100">
                              {guest.message || "No message provided"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Attendance Section - Only show when attendance tab is active */}
        {activeTab === "attendance" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl font-serif italic mb-6">
              Attendance Records
            </h2>
            <div className="bg-gradient-to-br from-red-900 to-black rounded-2xl border-2 border-red-700 shadow-2xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-6 border-b-2 border-red-700 font-semibold text-red-200 tracking-wide">
                <div className="col-span-6">Guest Name</div>
                <div className="col-span-6">Check-in Time</div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {attendance.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-12 gap-4 p-6 border-b border-red-800/50 hover:bg-red-900/20 transition-colors"
                  >
                    <div className="col-span-6 font-medium text-white text-lg">
                      {record.guest.name}
                    </div>
                    <div className="col-span-6 text-red-200">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(record.scanned_at).toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {attendance.length === 0 && (
                  <div className="p-12 text-center text-red-300 text-lg">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    No check-ins yet
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}