import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes"
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function parseBook(item) {
  const info = item.volumeInfo || {};
  const cover =
    info.imageLinks?.thumbnail?.replace("http://", "https://") ||
    info.imageLinks?.smallThumbnail?.replace("http://", "https://") ||
    null;
  return {
    id: item.id,
    title: info.title || "Unknown Title",
    author: info.authors?.join(", ") || "Unknown Author",
    cover,
    year: info.publishedDate?.slice(0, 4) || null,
    description: info.description || null,
    pageCount: info.pageCount || null,
    categories: info.categories || [],
  };
}

export default function BookSearchDropdown({ onSelect, selectedBook }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const debouncedQuery = useDebounce(query, 400);

  // Fetch from Google Books
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const keyParam = API_KEY ? `&key=${API_KEY}` : ''
    fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(debouncedQuery)}&maxResults=8&printType=books&langRestrict=en${keyParam}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        const books = (data.items || []).map(parseBook);
        setResults(books);
        setOpen(true);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("Search failed. Check your connection.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (selectedBook) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border bg-card">
        {selectedBook.cover ? (
          <img src={selectedBook.cover} alt={selectedBook.title} className="w-10 h-14 rounded-md object-cover shadow-sm shrink-0" />
        ) : (
          <div className="w-10 h-14 rounded-md bg-secondary flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold truncate">{selectedBook.title}</p>
          <p className="text-sm text-muted-foreground truncate">{selectedBook.author}</p>
          {selectedBook.year && <p className="text-xs text-muted-foreground">{selectedBook.year}</p>}
        </div>
        <button onClick={() => onSelect(null)} className="text-muted-foreground hover:text-foreground shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        {loading ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        )}
        <Input
          placeholder="Search by title or author..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-10 h-12 rounded-xl"
        />
      </div>

      {error && <p className="text-xs text-destructive mt-1 ml-1">{error}</p>}

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute z-50 w-full mt-2 bg-card border rounded-xl shadow-lg overflow-hidden max-h-80 overflow-y-auto"
          >
            {results.map((book) => (
              <button
                key={book.id}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors text-left"
                onClick={() => { onSelect(book); setQuery(""); setOpen(false); setResults([]); }}
              >
                {book.cover ? (
                  <img src={book.cover} alt={book.title} className="w-8 h-11 rounded object-cover shadow-sm shrink-0" />
                ) : (
                  <div className="w-8 h-11 rounded bg-secondary flex items-center justify-center shrink-0">
                    <BookOpen className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                  {book.year && <p className="text-xs text-muted-foreground">{book.year}</p>}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
