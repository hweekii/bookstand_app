import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Loader2, Bookmark, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useParams } from "react-router-dom";
import ProfileHeader from "@/components/bookstand/ProfileHeader";
import BookShelf from "@/components/bookstand/BookShelf";
import BookModal from "@/components/bookstand/BookModal";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

export default function FriendBookstand() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [friendProfile, setFriendProfile] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: prof }, { data: bks }, { data: likes }, { data: myLike }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("books").select("*").eq("user_id", id).order("display_order", { ascending: true }),
        supabase.from("bookstand_likes").select("id").eq("target_user_id", id),
        supabase.from("bookstand_likes").select("id").eq("target_user_id", id).eq("liker_id", user.id).maybeSingle(),
      ]);
      setFriendProfile(prof);
      setBooks(bks || []);
      setLikeCount((likes || []).length);
      setLiked(!!myLike);
      setLoading(false);
    }
    load();
  }, [id, user.id]);

  async function handleLike() {
    if (liking) return;
    setLiking(true);
    if (liked) {
      await supabase.from("bookstand_likes").delete().eq("liker_id", user.id).eq("target_user_id", id);
      setLiked(false);
      setLikeCount(c => c - 1);
    } else {
      await supabase.from("bookstand_likes").insert({ liker_id: user.id, target_user_id: id });
      setLiked(true);
      setLikeCount(c => c + 1);
    }
    setLiking(false);
  }

  const favourites = books.filter(b => b.is_favourite).slice(0, 3);
  const readBooks = books.filter(b => b.status !== "want_to_read");
  const wantToRead = books.filter(b => b.status === "want_to_read");
  const avgRating = readBooks.filter(b => b.rating).length
    ? (readBooks.filter(b => b.rating).reduce((s, b) => s + b.rating, 0) / readBooks.filter(b => b.rating).length).toFixed(1)
    : 0;

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <Link to="/friends" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />Back to friends
      </Link>

      <ProfileHeader
        name={friendProfile?.display_name}
        initials={friendProfile?.initials}
        booksCount={books.length}
        avgRating={Number(avgRating)}
        likeCount={likeCount}
        isOwnProfile={false}
      />

      <div className="flex gap-3 mb-10">
        <Button
          variant={liked ? "default" : "outline"}
          className="rounded-full gap-2"
          onClick={handleLike}
          disabled={liking}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-primary-foreground" : ""}`} />
          {liked ? "Liked" : "Like"} · {likeCount}
        </Button>
        <Button asChild className="rounded-full gap-2">
          <Link to={`/book-dna?friend=${id}`}>Check Book DNA</Link>
        </Button>
      </div>

      <div className="space-y-12">
        {/* All Time Favourites */}
        {favourites.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-accent fill-accent" />
              <h2 className="font-display text-xl font-bold">All Time Favourites</h2>
              <span className="text-sm text-muted-foreground">({favourites.length}/3)</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {favourites.map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelectedBook(book)}
                  className="cursor-pointer group"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all bg-secondary">
                    {book.cover_url
                      ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-muted-foreground opacity-40" /></div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2">
                        {book.rating && (
                          <div className="flex gap-0.5 mb-1">
                            {Array.from({ length: book.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-accent text-accent" />)}
                          </div>
                        )}
                        <p className="text-white text-xs font-medium truncate">{book.title}</p>
                      </div>
                    </div>
                    <Star className="absolute top-1.5 left-1.5 w-4 h-4 fill-accent text-accent drop-shadow" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Read Books */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl font-bold">Books</h2>
            <span className="text-sm text-muted-foreground">({readBooks.length})</span>
          </div>
          {readBooks.length === 0
            ? <p className="text-center text-muted-foreground py-12">No books logged yet</p>
            : <BookShelf books={readBooks} onBookClick={setSelectedBook} />
          }
        </div>

        {/* Want to Read */}
        {wantToRead.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Bookmark className="w-5 h-5 text-accent" />
              <h2 className="font-display text-xl font-bold">Want to Read</h2>
              <span className="text-sm text-muted-foreground">({wantToRead.length})</span>
            </div>
            <BookShelf books={wantToRead} onBookClick={setSelectedBook} />
          </div>
        )}
      </div>

      <BookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        isOwnProfile={false}
      />
    </div>
  );
}
