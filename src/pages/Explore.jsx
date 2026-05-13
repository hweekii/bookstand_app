import { useState, useEffect } from "react";
import HeroSection from "@/components/explore/HeroSection";
import GenreCarousel from "@/components/explore/GenreCarousel";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Star, MessageCircle, Loader2, Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export default function Explore() {
  const { user } = useAuth();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: friendships } = await supabase
        .from("friendships")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted");

      const friendIds = (friendships || []).map(f =>
        f.sender_id === user.id ? f.receiver_id : f.sender_id
      );

      if (friendIds.length === 0) { setLoading(false); return; }

      // Get recent books logged by friends
      const { data: books } = await supabase
        .from("books")
        .select("*, profile:user_id(id, display_name, initials)")
        .in("user_id", friendIds)
        .order("logged_at", { ascending: false })
        .limit(10);

      // Get recent likes by friends
      const { data: likes } = await supabase
        .from("bookstand_likes")
        .select("*, liker:liker_id(id, display_name, initials), target:target_user_id(id, display_name)")
        .in("liker_id", friendIds)
        .order("created_at", { ascending: false })
        .limit(10);

      // Merge and sort by date
      const bookEvents = (books || []).map(b => ({ type: "book", date: b.logged_at, data: b }));
      const likeEvents = (likes || []).map(l => ({ type: "like", date: l.created_at, data: l }));
      const merged = [...bookEvents, ...likeEvents].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);

      setActivity(merged);
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <div>
      <HeroSection />
      <GenreCarousel />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-display text-2xl font-bold mb-6 tracking-tight">Friend Activity</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : activity.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-display text-lg">No activity yet</p>
            <p className="text-sm mt-1">Add friends to see what they're reading</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((event, i) => (
              <motion.div
                key={`${event.type}-${event.data.id}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card border hover:border-accent/30 transition-colors"
              >
                {event.type === "book" ? (
                  <>
                    <Avatar className="h-10 w-10 bg-secondary shrink-0">
                      <AvatarFallback className="text-sm font-medium bg-secondary text-secondary-foreground">
                        {event.data.profile.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{event.data.profile.display_name}</span>{" "}
                        <span className="text-muted-foreground">
                          {event.data.status === "finished" ? "finished" : event.data.status === "reading" ? "is reading" : event.data.status === "want_to_read" ? "wants to read" : "logged"}
                        </span>{" "}
                        <span className="font-display font-semibold italic">{event.data.title}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {event.data.rating && (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: event.data.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-accent text-accent" />)}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">{new Date(event.data.logged_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {event.data.cover_url && (
                      <img src={event.data.cover_url} alt={event.data.title} className="w-8 h-11 rounded object-cover shadow-sm shrink-0" />
                    )}
                  </>
                ) : (
                  <>
                    <Avatar className="h-10 w-10 bg-secondary shrink-0">
                      <AvatarFallback className="text-sm font-medium bg-secondary text-secondary-foreground">
                        {event.data.liker.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{event.data.liker.display_name}</span>{" "}
                        <span className="text-muted-foreground">liked</span>{" "}
                        <Link to={`/bookstand/${event.data.data?.target_user_id}`} className="font-semibold hover:text-accent transition-colors">
                          {event.data.target.display_name}'s bookstand
                        </Link>
                      </p>
                      <span className="text-xs text-muted-foreground">{new Date(event.data.created_at).toLocaleDateString()}</span>
                    </div>
                    <Heart className="w-4 h-4 text-accent fill-accent shrink-0" />
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
