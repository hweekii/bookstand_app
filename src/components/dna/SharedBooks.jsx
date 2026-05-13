import { motion } from "framer-motion";
import { BookOpen, Star } from "lucide-react";

export default function SharedBooks({ books = [] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-accent" />
        <h3 className="font-display text-lg font-bold">Books in Common</h3>
        <span className="text-sm text-muted-foreground">({books.length})</span>
      </div>
      <div className="space-y-3">
        {books.map((book, i) => (
          <motion.div key={book.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.8 }} className="flex items-center gap-4 p-3 rounded-xl bg-card border hover:border-accent/20 transition-colors">
            {book.cover ? (
              <img src={book.cover} alt={book.title} className="w-10 h-14 rounded-md object-cover shadow-sm" />
            ) : (
              <div className="w-10 h-14 rounded-md bg-secondary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm truncate">{book.title}</p>
              <p className="text-xs text-muted-foreground">{book.author}</p>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs">
              {book.yourRating && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">You</span>
                  <div className="flex">{Array.from({ length: book.yourRating }).map((_, j) => <Star key={j} className="w-2.5 h-2.5 fill-accent text-accent" />)}</div>
                </div>
              )}
              {book.friendRating && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Them</span>
                  <div className="flex">{Array.from({ length: book.friendRating }).map((_, j) => <Star key={j} className="w-2.5 h-2.5 fill-primary text-primary" />)}</div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
