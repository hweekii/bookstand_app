import { motion } from "framer-motion";
import { Star, BookOpen } from "lucide-react";

export default function BookShelf({ books = [], onBookClick }) {
  const rows = [];
  for (let i = 0; i < books.length; i += 4) rows.push(books.slice(i, i + 4));

  return (
    <div className="space-y-8">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="relative">
          <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-2">
            {row.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (rowIdx * 4 + i) * 0.06 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => onBookClick?.(book)}
                className="cursor-pointer group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300 bg-secondary">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-muted-foreground opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 right-2">
                      {book.rating && (
                        <div className="flex items-center gap-0.5 mb-0.5">
                          {Array.from({ length: book.rating }).map((_, j) => (
                            <Star key={j} className="w-2.5 h-2.5 fill-accent text-accent" />
                          ))}
                        </div>
                      )}
                      <p className="text-white text-[11px] font-medium truncate">{book.title}</p>
                    </div>
                  </div>
                  {book.mood && <div className="absolute top-1.5 right-1.5 text-sm">{book.mood.split(" ")[0]}</div>}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="h-3 bg-gradient-to-b from-secondary to-secondary/40 rounded-b-lg shadow-inner" />
          <div className="h-1 bg-border/50 rounded-b-md mx-1" />
        </div>
      ))}
    </div>
  );
}
