"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Settings } from "lucide-react";
import { AdminDashboard } from "../AdminDashboard";

export default function AdministratorPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "maria25") {
      setAuthenticated(true);
    } else {
      alert("Invalid password");
    }
  };

  // Add the onBack handler
  const handleBack = () => {
    // Navigate back to the main site
    window.location.href = "/";
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl w-[320px] border-2 border-red-500/30 shadow-2xl text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Settings className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-xl font-bold mb-1 text-red-600 font-serif">
            Admin Access
          </h3>
          <p className="text-white mb-5 text-sm mb-6 italic">
            Enter admin password to continue
          </p>

          <form onSubmit={handleAccess} className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 bg-black/50 border border-red-500 rounded-lg text-white placeholder-red-300 focus:border-red-500 focus:outline-none transition-colors text-sm"
              placeholder="  Enter password..."
              autoFocus
            />

            <button
              type="submit"
              className="px-6 bg-gradient-to-r from-red-600 to-red-800 text-white py-3 rounded-xl hover:from-red-700 hover:to-red-900 transition-all font-medium shadow-lg mx-auto"
            >
              Access
            </button>
          </form>

          <p className="text-[10px] text-red-300/50 mt-3">
            Contact the celebrant for admin access
          </p>
        </motion.div>
      </div>
    );
  }

  // Show dashboard if authenticated - NOW WITH THE onBack PROP
  return <AdminDashboard onBack={handleBack} />;
}
