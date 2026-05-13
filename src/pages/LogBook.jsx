import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookPlus, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BookSearchDropdown from "@/components/log/BookSearchDropdown";
import StarRating from "@/components/log/StarRating";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

const MOODS = ["🤯 Mind-blowing", "😍 Loved it", "😊 Enjoyed", "😐 It was okay", "😴 Boring"];

export default function LogBook() {
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [status, setStatus] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const isWantToRead = status === "want_to_read";

  const handleSubmit = async () => {
    if (!selectedBook || !status) { setError("Please select a book and reading status."); return; }
    setError("");
    setLoading(true);
    const { error: err } = await supabase.from("books").upsert({
      user_id: user.id,
      google_book_id: selectedBook.id,
      title: selectedBook.title,
      author: selectedBook.author,
      cover_url: selectedBook.cover || null,
      rating: isWantToRead ? null : (rating || null),
      mood: isWantToRead ? null : (selectedMood || null),
      status,
      review: isWantToRead ? null : (review || null),
      categories: selectedBook.categories || [],
      page_count: selectedBook.pageCount || null,
      published_year: selectedBook.year || null,
    }, { onConflict: "user_id,google_book_id" });

    setLoading(false);
    if (err) { setError(err.message); return; }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedBook(null);
      setRating(0);
      setReview("");
      setStatus("");
      setSelectedMood("");
    }, 2500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-accent/10">
            <BookPlus className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Log a Book</h1>
            <p className="text-muted-foreground text-sm">Add to your bookstand</p>
          </div>
        </div>

        <div className="mb-8">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Find your book</label>
          <BookSearchDropdown onSelect={setSelectedBook} selectedBook={selectedBook} />
        </div>

        {selectedBook && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

            {/* Status first so we know what to show */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Reading status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="reading">Currently reading</SelectItem>
                  <SelectItem value="want_to_read">Want to read</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Only show rating/mood/review if not want_to_read */}
            <AnimatePresence>
              {status && !isWantToRead && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-8 overflow-hidden"
                >
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">Your rating</label>
                    <StarRating rating={rating} onRate={setRating} />
                    {rating > 0 && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-accent mt-2 font-medium">
                        {rating === 5 ? "A masterpiece!" : rating === 4 ? "Really great!" : rating === 3 ? "Pretty good" : rating === 2 ? "Not great" : "Didn't like it"}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">How did it make you feel?</label>
                    <div className="flex flex-wrap gap-2">
                      {MOODS.map((mood) => (
                        <Badge key={mood} variant={selectedMood === mood ? "default" : "outline"} className={cn("cursor-pointer py-2 px-4 text-sm transition-all hover:scale-105", selectedMood === mood && "bg-primary")} onClick={() => setSelectedMood(mood)}>
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Your thoughts</label>
                    <Textarea placeholder="What did you think? What stood out? Would you recommend it?" value={review} onChange={(e) => setReview(e.target.value)} className="min-h-[140px] rounded-xl resize-none text-base" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {status && (
              <Button size="lg" className="w-full rounded-xl h-14 text-base group" onClick={handleSubmit} disabled={loading || submitted}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : submitted ? (
                  <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
                    ✓ Added to your bookstand!
                  </motion.span>
                ) : (
                  <>Add to Bookstand <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                )}
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
