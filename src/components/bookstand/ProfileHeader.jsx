import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, Users, Star, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfileHeader({ name = "", initials = "?", booksCount = 0, friendsCount = 0, likeCount = 0, avgRating = 0, isOwnProfile = true }) {
  const stats = isOwnProfile
    ? [
        { label: "Books", value: booksCount, icon: BookOpen },
        { label: "Friends", value: friendsCount, icon: Users },
        { label: "Avg Rating", value: avgRating || "—", icon: Star },
        { label: "Likes", value: likeCount, icon: Heart },
      ]
    : [
        { label: "Books", value: booksCount, icon: BookOpen },
        { label: "Friends", value: friendsCount, icon: Users },
        { label: "Avg Rating", value: avgRating || "—", icon: Star },
        { label: "Likes", value: likeCount, icon: Heart },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10"
    >
      <Avatar className="h-20 w-20 shadow-lg">
        <AvatarFallback className="text-2xl font-display font-bold bg-primary text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 text-center sm:text-left">
        <h1 className="font-display text-3xl font-bold">{name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isOwnProfile ? "Your personal bookstand" : `${name}'s bookstand`}
        </p>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 mt-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-lg font-bold leading-none">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
