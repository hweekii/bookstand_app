import { motion } from "framer-motion";

export default function DNAVisualization({ percentage }) {
  const strands = 12;
  return (
    <div className="relative w-48 h-48 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
            className="text-5xl font-display font-bold text-accent block"
          >
            {percentage}%
          </motion.span>
          <span className="text-sm text-muted-foreground font-medium">match</span>
        </div>
      </div>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r="42" fill="none"
          stroke="hsl(var(--accent))" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 42}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - percentage / 100) }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      {Array.from({ length: strands }).map((_, i) => {
        const angle = (i / strands) * 360;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-accent/40"
            style={{
              top: `${50 + 44 * Math.sin((angle * Math.PI) / 180)}%`,
              left: `${50 + 44 * Math.cos((angle * Math.PI) / 180)}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.6] }}
            transition={{ duration: 0.6, delay: i * 0.1 + 0.5 }}
          />
        );
      })}
    </div>
  );
}
