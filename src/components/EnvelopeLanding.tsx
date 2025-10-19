import { motion } from "motion/react";
import { Mail, Settings } from "lucide-react";
import { useState } from "react";

interface EnvelopeLandingProps {
  onOpen: () => void;
  onAdminAccess: () => void; // Add this prop
}

export function EnvelopeLanding({
  onOpen,
  onAdminAccess,
}: EnvelopeLandingProps) {
  const [showAdmin, setShowAdmin] = useState(false);
  const [password, setPassword] = useState("");

  const handleAdminAccess = () => {
    if (password === "maria25") {
      onAdminAccess(); // Use the prop instead of redirect
      setShowAdmin(false);
      setPassword("");
    } else {
      alert("Invalid password");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdminAccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Admin button */}
      <motion.button
        onClick={() => {
          console.log("Admin button clicked");
          setShowAdmin(true);
        }}
        className="fixed top-6 right-6 text-white hover:text-red-300 transition-all z-50 bg-red-600 hover:bg-red-700 rounded-full p-4 border-2 border-yellow-400 shadow-2xl"
        title="Admin Access"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{ zIndex: 9999 }}
      >
        <Settings className="w-6 h-6" />
      </motion.button>

      {/* Admin modal */}
      {showAdmin && (
        <motion.div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => {
            setShowAdmin(false);
            setPassword("");
          }}
        >
          <motion.div
            className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl max-w-sm w-full mx-4 border-2 border-red-500/30 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-2">
              <Settings className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-white font-serif">
                Admin Access
              </h3>
              <p className="text-red-200 mb-6">
                Enter admin password to continue
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-black/50 border-2 border-red-500/30 rounded-xl text-white placeholder-red-300/50 focus:border-red-500 focus:outline-none transition-colors mb-6"
                placeholder="Enter password..."
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdmin(false);
                    setPassword("");
                  }}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-xl hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-800 text-white py-3 rounded-xl hover:from-red-700 hover:to-red-900 transition-all font-medium shadow-lg"
                >
                  Access
                </button>
              </div>
            </form>

            <p className="text-xs text-red-300/50 text-center mt-4">
              Contact the celebrant for admin access
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Rest of your decorative elements and main content */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-red-500 rounded-full animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-40 h-40 border-2 border-white rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 border-2 border-red-400 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-white mb-2 text-5xl md:text-7xl font-serif italic tracking-wide">
            You're Invited
          </h1>
          <p className="text-red-300 mb-12 text-lg md:text-xl tracking-widest">
            TO A SPECIAL CELEBRATION
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative mb-12 cursor-pointer"
          onClick={onOpen}
        >
          {/* Envelope */}
          <div className="relative w-64 h-40 md:w-80 md:h-48 mx-auto cursor-pointer envelope-container">
            {/* Envelope body */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-2xl cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 border-4 border-red-900 rounded-lg"></div>
            </motion.div>

            {/* Envelope flap */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-24 md:h-28 origin-top cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                clipPath: "polygon(0 0, 50% 100%, 100% 0)",
              }}
              whileHover={{ rotateX: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                className="absolute inset-0 border-t-4 border-x-4 border-red-900"
                style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }}
              ></div>
            </motion.div>

            {/* Seal */}
            <motion.div
              className="absolute top-16 md:top-20 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg z-10 cursor-pointer"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Mail className="w-8 h-8 text-red-600" />
            </motion.div>

            {/* Decorative lines */}
            <div className="absolute bottom-8 left-8 right-8 space-y-2">
              <div className="h-0.5 bg-red-300 opacity-40 w-3/4"></div>
              <div className="h-0.5 bg-red-300 opacity-40 w-1/2"></div>
            </div>
          </div>
        </motion.div>

        <motion.button
          onClick={onOpen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-black px-12 py-4 rounded-full tracking-widest hover:bg-red-50 transition-colors shadow-2xl border-2 border-red-200 font-semibold"
        >
          OPEN INVITATION
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-red-200 mt-8 text-sm tracking-wide"
        >
          Click to reveal the details
        </motion.p>
      </div>
    </div>
  );
}
