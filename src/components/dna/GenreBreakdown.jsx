import { motion } from "framer-motion";

const COLORS = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];

export default function GenreBreakdown({ genres = [] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold">Genre Overlap</h3>
      {genres.map((item, i) => (
        <motion.div key={item.genre} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.5 }} className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{item.genre}</span>
            <span className="text-muted-foreground text-xs">You {item.you}% · Friend {item.friend}%</span>
          </div>
          <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
            <motion.div className={`${COLORS[i % COLORS.length]} rounded-l-full opacity-70`} initial={{ width: 0 }} animate={{ width: `${item.you}%` }} transition={{ duration: 0.8, delay: i * 0.1 + 0.6 }} />
            <motion.div className={`${COLORS[i % COLORS.length]} rounded-r-full opacity-40`} initial={{ width: 0 }} animate={{ width: `${item.friend}%` }} transition={{ duration: 0.8, delay: i * 0.1 + 0.7 }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
