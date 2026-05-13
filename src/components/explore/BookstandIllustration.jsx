import { motion } from "framer-motion";

export default function BookstandIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex justify-center items-end"
    >
      <svg viewBox="0 0 280 260" className="w-64 h-64 md:w-80 md:h-80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="140" cy="248" rx="100" ry="8" fill="hsl(var(--muted))" />
        <rect x="60" y="110" width="120" height="110" rx="4" fill="hsl(var(--primary))" />
        <rect x="48" y="95" width="144" height="22" rx="3" fill="hsl(var(--accent))" />
        {[0,1,2,3,4,5].map(i => (
          <rect key={i} x={52 + i * 24} y="95" width="12" height="22" rx="0" fill="hsl(var(--accent-foreground)/0.08)" />
        ))}
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <path key={i} d={`M${48 + i * 18} 117 Q${57 + i * 18} 125 ${66 + i * 18} 117`} stroke="hsl(var(--accent))" strokeWidth="2" fill="hsl(var(--accent))" />
        ))}
        <rect x="68" y="130" width="104" height="6" rx="2" fill="hsl(var(--primary-foreground)/0.15)" />
        <rect x="72" y="108" width="14" height="22" rx="1" fill="#e07b54" />
        <rect x="88" y="112" width="12" height="18" rx="1" fill="#4a7c9e" />
        <rect x="102" y="110" width="10" height="20" rx="1" fill="#6b8e6b" />
        <rect x="114" y="113" width="13" height="17" rx="1" fill="#c9a84c" />
        <rect x="129" y="109" width="11" height="21" rx="1" fill="#9b6b9b" />
        <rect x="142" y="111" width="14" height="19" rx="1" fill="#c74a4a" />
        <rect x="158" y="114" width="10" height="16" rx="1" fill="#4a8a7a" />
        <rect x="68" y="170" width="104" height="6" rx="2" fill="hsl(var(--primary-foreground)/0.15)" />
        <rect x="72" y="148" width="12" height="22" rx="1" fill="#4a7c9e" />
        <rect x="86" y="151" width="15" height="19" rx="1" fill="#e07b54" />
        <rect x="103" y="149" width="11" height="21" rx="1" fill="#9b6b9b" />
        <rect x="116" y="152" width="13" height="18" rx="1" fill="#6b8e6b" />
        <rect x="131" y="150" width="10" height="20" rx="1" fill="#c74a4a" />
        <rect x="143" y="148" width="14" height="22" rx="1" fill="#c9a84c" />
        <rect x="159" y="151" width="11" height="19" rx="1" fill="#4a8a7a" />
        <rect x="60" y="200" width="120" height="18" rx="3" fill="hsl(var(--primary-foreground)/0.12)" />
        <rect x="115" y="218" width="10" height="28" rx="2" fill="hsl(var(--primary))" />
        <rect x="100" y="242" width="40" height="6" rx="3" fill="hsl(var(--primary))" />
        <motion.g animate={{ rotate: [0, -4, 0, 4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "206px", originY: "145px" }}>
          <circle cx="206" cy="145" r="16" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1.5" />
          <circle cx="201" cy="143" r="1.5" fill="hsl(var(--foreground)/0.5)" />
          <circle cx="211" cy="143" r="1.5" fill="hsl(var(--foreground)/0.5)" />
          <path d="M202 150 Q206 153 210 150" stroke="hsl(var(--foreground)/0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </motion.g>
        <rect x="196" y="161" width="20" height="40" rx="8" fill="hsl(var(--accent))" />
        <motion.path d="M196 175 Q178 170 175 178" stroke="hsl(var(--accent))" strokeWidth="8" strokeLinecap="round" fill="none" animate={{ d: ["M196 175 Q178 170 175 178", "M196 175 Q178 168 172 176", "M196 175 Q178 170 175 178"] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
        <path d="M216 175 Q228 172 230 182" stroke="hsl(var(--accent))" strokeWidth="8" strokeLinecap="round" fill="none" />
        <motion.rect x="162" y="172" width="14" height="18" rx="2" fill="#e07b54" animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "169px", originY: "181px" }} />
        <rect x="199" y="198" width="8" height="38" rx="4" fill="hsl(var(--foreground)/0.7)" />
        <rect x="210" y="198" width="8" height="38" rx="4" fill="hsl(var(--foreground)/0.7)" />
        <rect x="196" y="232" width="14" height="6" rx="3" fill="hsl(var(--foreground)/0.6)" />
        <rect x="208" y="232" width="14" height="6" rx="3" fill="hsl(var(--foreground)/0.6)" />
        <motion.g animate={{ opacity: [0.4, 1, 0.4], y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
          <circle cx="240" cy="115" r="3" fill="hsl(var(--accent))" />
          <circle cx="250" cy="130" r="2" fill="hsl(var(--accent)/0.6)" />
          <circle cx="232" cy="128" r="2" fill="hsl(var(--accent)/0.4)" />
        </motion.g>
      </svg>
    </motion.div>
  );
}
