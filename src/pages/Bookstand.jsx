import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ProfileHeader from "@/components/bookstand/ProfileHeader";
import BookModal from "@/components/bookstand/BookModal";
import { BookOpen, Bookmark, Star, Loader2, GripVertical } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";

export default function Bookstand() {
  const { user, profile } = useAuth();
  const [books, setBooks] = useState([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("books").select("*").eq("user_id", user.id).order("display_order", { ascending: true }),
      supabase.from("friendships").select("id", { count: "exact" }).or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).eq("status", "accepted"),
      supabase.from("bookstand_likes").select("id", { count: "exact" }).eq("target_user_id", user.id),
    ]).then(([{ data: bks }, { count: fc }, { count: lc }]) => {
      setBooks(bks || []);
      setFriendsCount(fc || 0);
      setLikeCount(lc || 0);
      setLoading(false);
    });
  }, [user]);

  const favourites = books.filter(b => b.is_favourite).slice(0, 3);
  const readBooks = books.filter(b => b.status !== "want_to_read");
  const wantToRead = books.filter(b => b.status === "want_to_read");

  const avgRating = readBooks.filter(b => b.rating).length
    ? (readBooks.filter(b => b.rating).reduce((s, b) => s + b.rating, 0) / readBooks.filter(b => b.rating).length).toFixed(1)
    : 0;

  async function handleToggleFavourite(book) {
    if (!book.is_favourite && favourites.length >= 3) return;
    const updated = !book.is_favourite;
    setBooks(prev => prev.map(b => b.id === book.id ? { ...b, is_favourite: updated } : b));
    setSelectedBook(prev => prev?.id === book.id ? { ...prev, is_favourite: updated } : prev);
    await supabase.from("books").update({ is_favourite: updated }).eq("id", book.id);
  }

  async function handleDragEnd(result, sectionBooks) {
    if (!result.destination || result.source.index === result.destination.index) return;
    const reordered = Array.from(sectionBooks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setBooks(prev => {
      const others = prev.filter(b => !sectionBooks.find(s => s.id === b.id));
      return [...others, ...reordered];
    });
    await Promise.all(
      reordered.map((b, i) => supabase.from("books").update({ display_order: i }).eq("id", b.id))
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <ProfileHeader
        name={profile?.display_name}
        initials={profile?.initials}
        booksCount={books.length}
        friendsCount={friendsCount}
        likeCount={likeCount}
        avgRating={Number(avgRating)}
        isOwnProfile={true}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
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

          {/* My Books — draggable */}
          <DraggableShelf
            title="My Books"
            icon={BookOpen}
            books={readBooks}
            droppableId="read"
            onBookClick={setSelectedBook}
            onDragEnd={(r) => handleDragEnd(r, readBooks)}
            emptyTitle="No books yet"
            emptySub="Log your first book to get started"
          />

          {/* Want to Read — draggable */}
          <DraggableShelf
            title="Want to Read"
            icon={Bookmark}
            books={wantToRead}
            droppableId="want"
            onBookClick={setSelectedBook}
            onDragEnd={(r) => handleDragEnd(r, wantToRead)}
            emptyTitle="Nothing on your list yet"
            emptySub="Add books you want to read"
          />
        </div>
      )}

      <BookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onToggleFavourite={handleToggleFavourite}
        canAddFavourite={favourites.length < 3}
        isOwnProfile={true}
      />
    </div>
  );
}

function DraggableShelf({ title, icon: Icon, books, droppableId, onBookClick, onDragEnd, emptyTitle, emptySub }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Icon className="w-5 h-5 text-accent" />
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <span className="text-sm text-muted-foreground">({books.length})</span>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Icon className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-display text-lg">{emptyTitle}</p>
          <p className="text-sm mt-1">{emptySub}</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={droppableId}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-4 gap-3 sm:gap-4"
              >
                {books.map((book, index) => (
                  <Draggable key={book.id} draggableId={book.id} index={index}>
                    {(drag, snapshot) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        style={drag.draggableProps.style}
                        className={`group ${snapshot.isDragging ? "opacity-80 z-50" : ""}`}
                      >
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow bg-secondary">
                          {/* Drag handle */}
                          <div
                            {...drag.dragHandleProps}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-1 left-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-0.5 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="w-3 h-3 text-white" />
                          </div>

                          <div onClick={() => onBookClick?.(book)} className="w-full h-full cursor-pointer">
                            {book.cover_url
                              ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-muted-foreground opacity-40" /></div>
                            }
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-2 left-2 right-2">
                                {book.rating && (
                                  <div className="flex gap-0.5 mb-0.5">
                                    {Array.from({ length: book.rating }).map((_, j) => (
                                      <Star key={j} className="w-2.5 h-2.5 fill-accent text-accent" />
                                    ))}
                                  </div>
                                )}
                                <p className="text-white text-[11px] font-medium truncate">{book.title}</p>
                              </div>
                            </div>
                            {book.mood && <div className="absolute top-1.5 right-1.5 text-sm">{book.mood.split(" ")[0]}</div>}
                            {book.is_favourite && <Star className="absolute bottom-1.5 right-1.5 w-3 h-3 fill-accent text-accent" />}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <div className="h-3 bg-gradient-to-b from-secondary to-secondary/40 rounded-b-lg shadow-inner mt-2" />
      <div className="h-1 bg-border/50 rounded-b-md mx-1" />
    </div>
  );
}
