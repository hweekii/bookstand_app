import { useState, useEffect } from "react";
import { Search, Users, UserPlus, Loader2, Dna } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { BookOpen } from "lucide-react";

export default function Friends() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [sentIds, setSentIds] = useState(new Set());
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadFriends(); }, [user]);

  async function loadFriends() {
    setLoading(true);
    const [{ data: accepted }, { data: pend }, { data: sent }] = await Promise.all([
      supabase.from("friendships")
        .select("*, sender:sender_id(id,display_name,initials,username), receiver:receiver_id(id,display_name,initials,username)")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted"),
      supabase.from("friendships")
        .select("*, sender:sender_id(id,display_name,initials,username)")
        .eq("receiver_id", user.id)
        .eq("status", "pending"),
      supabase.from("friendships")
        .select("receiver_id")
        .eq("sender_id", user.id)
        .eq("status", "pending"),
    ]);
    setFriends((accepted || []).map(f => f.sender_id === user.id ? f.receiver : f.sender));
    setPending(pend || []);
    setSentIds(new Set((sent || []).map(s => s.receiver_id)));
    setLoading(false);
  }

  async function searchUsers(q) {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("id,display_name,initials,username")
      .ilike("username", `%${q}%`)
      .neq("id", user.id)
      .limit(8);
    setSearchResults(data || []);
    setSearching(false);
  }

  async function sendRequest(receiverId) {
    await supabase.from("friendships").insert({ sender_id: user.id, receiver_id: receiverId });
    setSentIds(s => new Set([...s, receiverId]));
  }

  async function acceptRequest(friendshipId) {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
    loadFriends();
  }

  async function rejectRequest(friendshipId) {
    await supabase.from("friendships").update({ status: "rejected" }).eq("id", friendshipId);
    setPending(p => p.filter(f => f.id !== friendshipId));
  }

  const friendIds = new Set(friends.map(f => f.id));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-accent/10"><Users className="w-6 h-6 text-accent" /></div>
        <div>
          <h1 className="font-display text-3xl font-bold">Friends</h1>
          <p className="text-muted-foreground text-sm">{friends.length} friends</p>
        </div>
      </div>

      {/* Search by username */}
      <div className="mb-6">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">Find by username</label>
        <div className="relative">
          {searching
            ? <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
            : <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />}
          <Input
            placeholder="Search @username..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); searchUsers(e.target.value); }}
            className="pl-12 h-12 rounded-xl"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 bg-card border rounded-xl overflow-hidden shadow-sm">
            {searchResults.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/5">
                <Avatar className="h-9 w-9 bg-secondary"><AvatarFallback className="bg-secondary text-secondary-foreground text-sm">{u.initials}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{u.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                </div>
                {friendIds.has(u.id) ? (
                  <span className="text-xs text-muted-foreground">Friends</span>
                ) : sentIds.has(u.id) ? (
                  <span className="text-xs text-muted-foreground">Request sent</span>
                ) : (
                  <Button size="sm" className="rounded-full text-xs h-8" onClick={() => sendRequest(u.id)}>
                    <UserPlus className="w-3.5 h-3.5 mr-1" />Add
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-lg font-bold mb-3">Pending Requests</h2>
          <div className="space-y-2">
            {pending.map(req => (
              <div key={req.id} className="flex items-center gap-3 p-4 bg-card border rounded-2xl">
                <Avatar className="h-10 w-10 bg-secondary"><AvatarFallback className="bg-secondary text-secondary-foreground">{req.sender.initials}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{req.sender.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{req.sender.username}</p>
                </div>
                <Button size="sm" className="rounded-full text-xs h-8" onClick={() => acceptRequest(req.id)}>Accept</Button>
                <Button size="sm" variant="outline" className="rounded-full text-xs h-8" onClick={() => rejectRequest(req.id)}>Decline</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : friends.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-display text-lg">No friends yet</p>
          <p className="text-sm mt-1">Search by username above to add people</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {friends.map((friend, i) => (
            <motion.div key={friend.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="bg-card border rounded-2xl p-5 hover:border-accent/30 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12 bg-secondary"><AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">{friend.initials}</AvatarFallback></Avatar>
                <div className="min-w-0">
                  <p className="font-display font-bold text-lg truncate">{friend.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{friend.username}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1 rounded-full text-xs">
                  <Link to={`/bookstand/${friend.id}`}><BookOpen className="w-3.5 h-3.5 mr-1.5" />Bookstand</Link>
                </Button>
                <Button asChild size="sm" className="flex-1 rounded-full text-xs">
                  <Link to={`/book-dna?friend=${friend.id}`}><Dna className="w-3.5 h-3.5 mr-1.5" />Book DNA</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
