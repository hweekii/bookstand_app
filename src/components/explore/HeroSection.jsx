import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import BookstandIllustration from "./BookstandIllustration";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
       
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-5">
              Create your own
              <span className="italic text-accent"> community</span>
              <br /> of readers.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mb-8">
              Log books, share reviews, discover what your friends are reading, and find your literary soulmates.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-6 group">
                <Link to="/log">
                  Log a book
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                <Link to="/bookstand">View my bookstand</Link>
              </Button>
            </div>
          </motion.div>
          <BookstandIllustration />
        </div>
      </div>
    </section>
  );
}
