import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dna, ArrowRight, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DNAVisualization from "@/components/dna/DNAVisualization";
import GenreBreakdown from "@/components/dna/GenreBreakdown";
import SharedBooks from "@/components/dna/SharedBooks";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { useSearchParams } from "react-router-dom";

function calcDNA(myBooks, theirBooks) {
  const readOnly = books => books.filter(b => b.status !== "want_to_read" && b.categories?.length > 0);
  const mine = readOnly(myBooks);
  const theirs = readOnly(theirBooks);

  if (!mine.length || !theirs.length) {
    return { percentage: 0, sharedBooks: [], genreData: [] };
  }

  // Build weighted genre maps (rating boosts a genre's weight)
  function buildGenreMap(books) {
    const map = {};
    books.forEach(b => {
      const weight = b.rating || 3;
      (b.categories || []).forEach(g => {
        map[g] = (map[g] || 0) + weight;
      });
    });
    // Normalise to percentages
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    Object.keys(map).forEach(g => { map[g] = Math.round((map[g] / total) * 100); });
    return map;
  }

  const myMap = buildGenreMap(mine);
  const theirMap = buildGenreMap(theirs);

  // All genres either of us has read
  const allGenres = [...new Set([...Object.keys(myMap), ...Object.keys(theirMap)])];

  // Similarity = 1 - average absolute difference across all genres
  const totalDiff = allGenres.reduce((sum, g) => {
    return sum + Math.abs((myMap[g] || 0) - (theirMap[g] || 0));
  }, 0);
  const maxPossibleDiff = allGenres.length * 100;
  const percentage = Math.round((1 - totalDiff / maxPossibleDiff) * 100);

  // Genre breakdown for display — top 5 genres by combined presence
  const genreData = allGenres
    .map(g => ({ genre: g, you: myMap[g] || 0, friend: theirMap[g] || 0 }))
    .sort((a, b) => (b.you + b.friend) - (a.you + a.friend))
    .slice(0, 5);

  // Shared books (still show if any)
  const myBookMap = Object.fromEntries(myBooks.map(b => [b.google_book_id, b]));
  const sharedBooks = theirBooks
    .filter(b => myBookMap[b.google_book_id])
    .map(b => ({
      title: b.title,
      author: b.author,
      cover: b.cover_url,
      yourRating: myBookMap[b.google_book_id].rating,
      friendRating: b.rating,
    }));

  return { percentage, sharedBooks, genreData };
}

export default function BookDNA() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(searchParams.get("friend") || "");
  const [showResults, setShowResults] = useState(!!searchParams.get("friend"));
  const [dnaData, setDnaData] = useState(null);
  const [friendProfile, setFriendProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("friendships")
      .select("*, sender:sender_id(id,display_name,initials), receiver:receiver_id(id,display_name,initials)")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq("status", "accepted")
      .then(({ data }) => {
        setFriends((data || []).map(f => f.sender_id === user.id ? f.receiver : f.sender));
      });
  }, [user]);

  useEffect(() => {
    if (selectedFriend && showResults) compare(selectedFriend);
  }, [selectedFriend, showResults]);

  async function compare(friendId) {
    setLoading(true);
    const [{ data: myBooks }, { data: theirBooks }, { data: prof }] = await Promise.all([
      supabase.from("books").select("*").eq("user_id", user.id),
      supabase.from("books").select("*").eq("user_id", friendId),
      supabase.from("profiles").select("*").eq("id", friendId).single(),
    ]);
    setFriendProfile(prof);
    setDnaData(calcDNA(myBooks || [], theirBooks || []));
    setLoading(false);
  }

  const friend = friends.find(f => f.id === selectedFriend);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-accent/10"><Dna className="w-6 h-6 text-accent" /></div>
          <div>
            <h1 className="font-display text-3xl font-bold">Book DNA</h1>
            <p className="text-muted-foreground text-sm">Compare your reading taste with a friend</p>
          </div>
        </div>

        <div className="bg-card border rounded-3xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-16 w-16 bg-primary">
                <AvatarFallback className="text-xl font-display font-bold bg-primary text-primary-foreground">{profile?.initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">You</span>
            </div>
            <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
              <div className="hidden sm:block h-px flex-1 bg-border" />
              <Dna className="w-5 h-5 text-accent animate-pulse" />
              <div className="hidden sm:block h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
              {friend ? (
                <Avatar className="h-16 w-16 bg-secondary">
                  <AvatarFallback className="text-xl font-display font-bold bg-secondary text-secondary-foreground">{friend.initials}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-16 w-16 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                  <span className="text-2xl text-muted-foreground">?</span>
                </div>
              )}
              <Select value={selectedFriend} onValueChange={(v) => { setSelectedFriend(v); setShowResults(false); setDnaData(null); }}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl h-10">
                  <SelectValue placeholder="Choose a friend" />
                </SelectTrigger>
                <SelectContent>
                  {friends.map(f => <SelectItem key={f.id} value={f.id}>{f.display_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedFriend && !showResults && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex justify-center">
              <Button onClick={() => setShowResults(true)} size="lg" className="rounded-full px-8 group">
                Compare DNA <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}
        </div>

        {showResults && (
          loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : dnaData && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="bg-card border rounded-3xl p-8 text-center">
                <h2 className="font-display text-xl font-bold mb-2">You & {friendProfile?.display_name}</h2>
                <p className="text-sm text-muted-foreground mb-6">Your literary DNA comparison</p>
                <DNAVisualization percentage={dnaData.percentage} />
                {dnaData.sharedBooks.length === 0 ? (
                  <p className="mt-6 text-sm text-muted-foreground">No books in common yet — log more books!</p>
                ) : (
                <p className="mt-6 text-sm text-muted-foreground max-w-sm mx-auto">
                  {dnaData.percentage >= 80
                    ? "Your reading tastes are remarkably similar — you're literary soulmates."
                    : dnaData.percentage >= 60
                    ? "You share strong genre overlap with some interesting differences."
                    : dnaData.percentage >= 40
                    ? "Your tastes overlap in places but you read quite differently."
                    : "You have very different reading tastes — great for recommendations!"}
                </p>
                )}
              </div>
              {dnaData.genreData.length > 0 && (
                <div className="bg-card border rounded-3xl p-6 sm:p-8">
                  <GenreBreakdown genres={dnaData.genreData} />
                </div>
              )}
              {dnaData.sharedBooks.length > 0 && (
                <div className="bg-card border rounded-3xl p-6 sm:p-8">
                  <SharedBooks books={dnaData.sharedBooks} />
                </div>
              )}
            </motion.div>
          )
        )}
      </motion.div>
    </div>
  );
}
