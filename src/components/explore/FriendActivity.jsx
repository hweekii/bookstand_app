import { motion } from "framer-motion";
import { Star, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ACTIVITY = [
  { id: 1, user: "Sarah M.", initials: "SM", action: "finished reading", book: "Klara and the Sun", rating: 5, time: "2h ago" },
  { id: 2, user: "Jake R.", initials: "JR", action: "started reading", book: "The Name of the Wind", rating: null, time: "5h ago" },
  { id: 3, user: "Maya L.", initials: "ML", action: "reviewed", book: "Sapiens", rating: 4, time: "8h ago" },
  { id: 4, user: "Tom K.", initials: "TK", action: "finished reading", book: "Dune", rating: 5, time: "1d ago" },
];

export default function FriendActivity() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h2 className="font-display text-2xl font-bold mb-6">Friend Activity</h2>
      <div className="space-y-3">
        {ACTIVITY.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }} className="flex items-center gap-4 p-4 rounded-2xl bg-card border hover:border-accent/30 transition-colors cursor-pointer group">
            <Avatar className="h-10 w-10 bg-secondary">
              <AvatarFallback className="font-body text-sm font-medium bg-secondary text-secondary-foreground">{item.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-semibold">{item.user}</span>{" "}
                <span className="text-muted-foreground">{item.action}</span>{" "}
                <span className="font-display font-semibold italic">{item.book}</span>
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {item.rating && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: item.rating }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-accent text-accent" />
                    ))}
                  </div>
                )}
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            </div>
            <MessageCircle className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
