import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BookOpen, Dna } from "lucide-react";
import { Link } from "react-router-dom";

export default function FriendCard({ friend, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.06 }} className="bg-card border rounded-2xl p-5 hover:border-accent/30 hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-12 w-12 bg-secondary">
          <AvatarFallback className="font-body font-semibold bg-secondary text-secondary-foreground">{friend.initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-lg">{friend.name}</p>
          <p className="text-xs text-muted-foreground">{friend.booksCount} books · {friend.mutualFriends} mutual friends</p>
        </div>
      </div>
      <div className="flex gap-1.5 mb-4">
        {friend.recentCovers.map((cover, i) => (
          <div key={i} className="w-10 h-14 rounded-md overflow-hidden shadow-sm">
            <img src={cover} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        {friend.booksCount > 4 && (
          <div className="w-10 h-14 rounded-md bg-secondary flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">+{friend.booksCount - 4}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1 rounded-full text-xs">
          <Link to={`/bookstand/${friend.id}`}>
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Bookstand
          </Link>
        </Button>
        <Button asChild size="sm" className="flex-1 rounded-full text-xs">
          <Link to={`/book-dna?friend=${friend.id}`}>
            <Dna className="w-3.5 h-3.5 mr-1.5" />
            Check DNA
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
