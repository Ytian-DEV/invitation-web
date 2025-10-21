import { useState } from "react";
import { HashRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { EnvelopeLanding } from "./components/EnvelopeLanding";
import { InvitationContent } from "./components/InvitationContent";
import { AdminDashboard } from "./components/AdminDashboard";
import { Toaster } from "./components/ui/sonner";
import { motion, AnimatePresence } from "motion/react";
import AdministratorPage from "./components/pages/administrator";

// Create a wrapper component to handle the navigation
function LandingWrapper() {
  const navigate = useNavigate();
  
  const handleOpen = () => {
    console.log("Navigating to invitation...");
    navigate("/invitation");
  };

  const handleAdminAccess = () => {
    navigate("/administrator");
  };

  return (
    <EnvelopeLanding 
      onOpen={handleOpen} 
      onAdminAccess={handleAdminAccess} 
    />
  );
}

export default function App() {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Landing Page */}
          <Route
            path="/"
            element={
              <motion.div
                key="landing"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8 }}
              >
                <LandingWrapper />
              </motion.div>
            }
          />

          {/* Invitation Content */}
          <Route
            path="/invitation"
            element={
              <motion.div
                key="content"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <InvitationContent />
              </motion.div>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/administrator"
            element={
              <motion.div
                key="admin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <AdministratorPage />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>

      <Toaster position="top-center" richColors />
    </Router>
  );
}