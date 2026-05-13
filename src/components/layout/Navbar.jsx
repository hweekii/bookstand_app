import { Link, useLocation } from "react-router-dom";
import { BookOpen, Search, Users, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/explore", label: "Explore", icon: BookOpen },
  { path: "/log", label: "Log", icon: Search },
  { path: "/bookstand", label: "Bookstand", icon: User },
  { path: "/friends", label: "Friends", icon: Users },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-2xl mx-auto px-4 flex items-center h-14">
          <Link to="/bookstand" className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            <span className="font-display text-xl font-bold tracking-tight">The Neighbourhood Bookstand</span>
          </Link>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t">
        <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200",
                  isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                <span className="text-[10px] font-body font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
