import { useGreetings } from "@/hooks/use-greetings";
import { GuestbookForm } from "@/components/GuestbookForm";
import { GreetingCard } from "@/components/GreetingCard";
import { Loader2, ArrowDown } from "lucide-react";

export default function Home() {
  const { data: greetings, isLoading, error } = useGreetings();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-secondary text-primary text-xs font-semibold tracking-wide mb-6">
            WELCOME TO MY SPACE
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight text-balance">
            Minimalist Design, <br />
            <span className="text-muted-foreground">Maximum Impact.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Welcome to my personal corner of the internet. Feel free to explore, get inspired, 
            and leave a mark in the digital guestbook below.
          </p>
          
          <div className="flex justify-center">
            <a 
              href="#guestbook"
              className="group flex flex-col items-center gap-2 text-sm font-medium text-primary/60 hover:text-primary transition-colors"
            >
              Scroll to Guestbook
              <div className="p-2 rounded-full border border-border group-hover:border-primary/50 transition-colors animate-bounce">
                <ArrowDown className="w-4 h-4" />
              </div>
            </a>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl -z-10 pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 bg-secondary/50 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob" />
          <div className="absolute top-40 left-10 w-72 h-72 bg-gray-100 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
        </div>
      </section>

      {/* Guestbook Section */}
      <section id="guestbook" className="py-20 px-6 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Form */}
            <div className="lg:col-span-5 lg:sticky lg:top-8 h-fit">
              <GuestbookForm />
              
              <div className="mt-8 p-6 bg-primary text-primary-foreground rounded-xl hidden lg:block">
                <h4 className="font-display font-bold text-lg mb-2">Why sign?</h4>
                <p className="text-primary-foreground/80 text-sm leading-relaxed">
                  Every message here is a permanent part of this site's history. 
                  Share your thoughts, say hello, or just leave your name!
                </p>
              </div>
            </div>

            {/* Right Column: List */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold font-display">Recent Messages</h2>
                <div className="text-sm text-muted-foreground">
                  {greetings?.length || 0} messages
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p>Loading messages...</p>
                </div>
              ) : error ? (
                <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-xl text-center">
                  <p className="text-destructive font-medium">Failed to load messages</p>
                  <p className="text-sm text-destructive/70 mt-1">Please try again later.</p>
                </div>
              ) : greetings && greetings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {greetings.map((greeting, i) => (
                    <GreetingCard key={greeting.id} greeting={greeting} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground text-lg mb-2">No messages yet</p>
                  <p className="text-sm text-muted-foreground/60">Be the first to sign the guestbook!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Minimal Guestbook. Built with React & Tailwind.</p>
        </div>
      </footer>
    </div>
  );
}
