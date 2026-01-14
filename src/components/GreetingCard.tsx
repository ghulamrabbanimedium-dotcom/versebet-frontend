import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import type { Greeting } from "@shared/schema";

interface GreetingCardProps {
  greeting: Greeting;
  index: number;
}

export function GreetingCard({ greeting, index }: GreetingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
    >
      <div className="absolute -top-3 -left-3 bg-secondary p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Quote className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <p className="text-foreground/80 leading-relaxed text-lg mb-4 font-medium">
        "{greeting.message}"
      </p>
      
      <div className="flex items-center gap-3 mt-auto">
        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-xs font-bold text-primary">
          {greeting.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {greeting.name}
          </span>
          <span className="text-xs text-muted-foreground">Guest</span>
        </div>
      </div>
    </motion.div>
  );
}
