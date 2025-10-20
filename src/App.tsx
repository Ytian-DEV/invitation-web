import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { EnvelopeLanding } from "./components/EnvelopeLanding";
import { InvitationContent } from "./components/InvitationContent";
import { AdminDashboard } from "./components/AdminDashboard";
import { Toaster } from "./components/ui/sonner";
import { motion, AnimatePresence } from "motion/react";
import AdministratorPage from "./components/pages/administrator";

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
                <EnvelopeLanding
                  onOpen={() => setIsOpened(true)}
                  onAdminAccess={() =>
                    (window.location.href = "/administrator")
                  } // redirect to /administrator
                />
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
