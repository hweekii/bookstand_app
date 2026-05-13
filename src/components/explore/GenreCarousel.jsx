import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Wand2, Brain, Heart, Rocket, Globe, Landmark, Palette, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const GENRES = [
  { name: "Fiction", icon: BookOpen, query: "new fiction books" },
  { name: "Fantasy", icon: Wand2, query: "best fantasy novels" },
  { name: "Psychology", icon: Brain, query: "popular psychology books" },
  { name: "Romance", icon: Heart, query: "new and relevant romance novels" },
  { name: "Sci-Fi", icon: Rocket, query: "best science fiction novels" },
  { name: "History", icon: Landmark, query: "popular history books" },
  { name: "Art", icon: Palette, query: "popular art books" },
];

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

export default function GenreCarousel({ onAddBook }) {
  const [selected, setSelected] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleGenreClick(genre) {
    if (selected?.name === genre.name) { setSelected(null); return; }
    setSelected(genre);
    setLoading(true);
    const key = API_KEY ? `&key=${API_KEY}` : "";
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(genre.query)}&maxResults=8&printType=books&langRestrict=en${key}`);
    const data = await res.json();
    setBooks((data.items || []).map(item => ({
      id: item.id,
      title: item.volumeInfo?.title || "Unknown",
      author: item.volumeInfo?.authors?.[0] || "Unknown",
      cover: item.volumeInfo?.imageLinks?.thumbnail?.replace("http://", "https://") || null,
      categories: item.volumeInfo?.categories || [genre.name],
      year: item.volumeInfo?.publishedDate?.slice(0, 4) || null,
      pageCount: item.volumeInfo?.pageCount || null,
    })));
    setLoading(false);
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h2 className="font-display text-2xl font-bold mb-6 tracking-tight">Browse by Genre</h2>

      {/* Genre pills */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {GENRES.map((genre, i) => {
          const Icon = genre.icon;
          const isActive = selected?.name === genre.name;
          return (
            <motion.button
              key={genre.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => handleGenreClick(genre)}
              className={cn(
                "flex items-center gap-2.5 px-5 py-3 rounded-full border whitespace-nowrap transition-all duration-200 hover:scale-105 hover:shadow-md",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-foreground border-border hover:bg-accent/10 hover:text-accent hover:border-accent/30"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{genre.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Books panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {books.map(book => (
                    <div key={book.id} className="group relative">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md bg-secondary">
                        {book.cover
                          ? <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-muted-foreground opacity-40" /></div>
                        }
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          <p className="text-white text-[10px] font-medium text-center leading-tight line-clamp-2">{book.title}</p>
                          <button
                            onClick={() => navigate("/log", { state: { book } })}
                            className="flex items-center gap-1 bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-1 rounded-full hover:opacity-90 transition-opacity"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}