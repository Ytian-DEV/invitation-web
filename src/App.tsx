import { useState } from 'react';
import { EnvelopeLanding } from './components/EnvelopeLanding';
import { InvitationContent } from './components/InvitationContent';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isOpened ? (
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
          >
            <EnvelopeLanding onOpen={() => setIsOpened(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <InvitationContent />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster position="top-center" richColors />
    </>
  );
}
