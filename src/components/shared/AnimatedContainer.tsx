"use client";

import { motion } from "framer-motion";

export function AnimatedContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="max-w-6xl mx-auto p-10 space-y-10 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-3xl shadow-inner animate-in fade-in duration-300"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
