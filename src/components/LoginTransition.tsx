import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoOsDevs from "@/assets/logo-osdevs.jpeg";

interface LoginTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

function Bubbles() {
  const bubbles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 12 + Math.random() * 40,
    delay: 0.3 + Math.random() * 0.8,
    duration: 0.8 + Math.random() * 0.6,
  }));

  return (
    <>
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="absolute rounded-full"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), rgba(120,200,255,0.15) 60%, transparent 80%)",
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "inset 0 -2px 6px rgba(255,255,255,0.15)",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.9, 0.6], scale: [0, 1.2, 1] }}
          transition={{ delay: b.delay, duration: b.duration, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

export default function LoginTransition({ isActive, onComplete }: LoginTransitionProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #101828 50%, #0a0e1a 100%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Water jet sweep */}
          <motion.div
            className="absolute inset-y-0 w-[40%]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(56,189,248,0.08), rgba(56,189,248,0.25), rgba(255,255,255,0.4), rgba(56,189,248,0.25), rgba(56,189,248,0.08), transparent)",
              filter: "blur(8px)",
            }}
            initial={{ left: "-40%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {/* Bubbles */}
          <Bubbles />

          {/* Aurora glow behind logo */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 260,
              height: 260,
              background: "conic-gradient(from 0deg, #38bdf8, #818cf8, #c084fc, #38bdf8)",
              filter: "blur(40px)",
              opacity: 0.5,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Pulse rings */}
          {[0, 0.4, 0.8].map((delay, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-sky-400/30"
              style={{ width: 160, height: 160 }}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ delay: 0.5 + delay, duration: 1.2, ease: "easeOut" }}
            />
          ))}

          {/* Logo */}
          <motion.img
            src={logoOsDevs}
            alt="Os Devs"
            className="relative z-10 w-28 h-28 rounded-full object-cover shadow-2xl"
            style={{ boxShadow: "0 0 40px rgba(56,189,248,0.4)" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring", stiffness: 200 }}
          />

          {/* Loading text */}
          <motion.p
            className="absolute bottom-[20%] text-sky-200/80 text-sm font-medium tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Preparando seu painel
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 1 + i * 0.2, duration: 0.6, repeat: Infinity }}
              >
                .
              </motion.span>
            ))}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
