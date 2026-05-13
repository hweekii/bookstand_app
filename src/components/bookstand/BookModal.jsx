import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, BookOpen, Send, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

const STATUS_LABELS = {
  finished: "Finished",
  reading: "Currently Reading",
  want_to_read: "Want to Read",
  abandoned: "Abandoned",
};

export default function BookModal({ book, onClose, onToggleFavourite, canAddFavourite, isOwnProfile = false }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!book) return;
    setComments([]);
    setText("");
    setLoadingComments(true);
    supabase
    .from("comments")
    .select("id, author_id, text, created_at, author:author_id(display_name, initials)")
    .eq("book_id", book.id)
    .order("created_at", { ascending: true })
      .then(({ data }) => {
        setComments(data || []);
        setLoadingComments(false);
      });
  }, [book?.id]);

  async function handlePost() {
    if (!text.trim()) return;
    setPosting(true);
    const { data } = await supabase
      .from("comments")
      .insert({ author_id: user.id, book_id: book.id, text })
      .select("*, author:author_id(display_name, initials)")
      .single();
    if (data) setComments(c => [...c, data]);
    setText("");
    setPosting(false);
  }

  async function handleDelete(commentId) {
    await supabase.from("comments").delete().eq("id", commentId);
    setComments(c => c.filter(c => c.id !== commentId));
  }

  if (!book) return null;
  const canFavourite = book.is_favourite || canAddFavourite;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5 sm:hidden" />

          {/* Book info */}
          <div className="flex gap-5 mb-6">
            <div className="w-24 h-36 rounded-xl overflow-hidden shadow-md shrink-0 bg-secondary">
              {book.cover_url
                ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-muted-foreground opacity-40" /></div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold leading-tight mb-1">{book.title}</h2>
              <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
              <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-accent/10 text-accent mb-3">
                {STATUS_LABELS[book.status] || book.status}
              </span>
              {book.rating && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < book.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
              )}
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0 self-start">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mood */}
          {book.mood && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Mood</p>
              <p className="text-sm">{book.mood}</p>
            </div>
          )}

          {/* Review */}
          {book.review && (
            <div className="bg-muted rounded-2xl p-4 mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Review</p>
              <p className="text-sm leading-relaxed">{book.review}</p>
            </div>
          )}

          {!book.rating && !book.review && book.status !== "want_to_read" && (
            <p className="text-sm text-muted-foreground text-center py-2 mb-4">No rating or review yet</p>
          )}

          {/* Favourite toggle — own profile only */}
          {isOwnProfile && book.status !== "want_to_read" && (
            <Button
              variant={book.is_favourite ? "default" : "outline"}
              className="w-full rounded-xl h-11 gap-2 mb-6"
              onClick={() => onToggleFavourite?.(book)}
              disabled={!canFavourite}
            >
              <Star className={`w-4 h-4 ${book.is_favourite ? "fill-primary-foreground" : ""}`} />
              {book.is_favourite
                ? "Remove from All Time Favourites"
                : canAddFavourite
                  ? "Add to All Time Favourites"
                  : "Favourites full (max 3)"}
            </Button>
          )}

          {/* Comments */}
          <div className="border-t pt-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-4 h-4 text-accent" />
              <h3 className="font-display font-bold">Comments</h3>
              <span className="text-xs text-muted-foreground">({comments.length})</span>
            </div>

            {loadingComments ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-3">No comments yet. Be the first!</p>
            ) : (
              <div className="space-y-3 mb-4">
                {comments.map(c => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                    <Avatar className="h-7 w-7 shrink-0 bg-secondary">
                      <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">{c.author.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-2xl rounded-tl-md px-3 py-2">
                        <p className="text-xs font-semibold mb-0.5">{c.author.display_name}</p>
                        <p className="text-sm">{c.text}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 ml-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString()}
                        </p>
                        {c.author_id === user.id && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Post a comment */}
            <div className="flex gap-2 mt-3">
              <Avatar className="h-8 w-8 shrink-0 bg-primary">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">{profile?.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !posting && handlePost()}
                  className="rounded-full h-9 text-sm"
                />
                <Button
                  size="icon"
                  className="rounded-full h-9 w-9 shrink-0"
                  onClick={handlePost}
                  disabled={posting || !text.trim()}
                >
                  {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}