import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { initModal } from "./walletConfig";
import CrashGame from "@/pages/CrashGame";
import NotFound from "@/pages/not-found";
import { Rocket, Dices, TrendingUp, Coins } from "lucide-react";

const games = [
  { path: "/", name: "Crash Pro", icon: Rocket },
  { path: "/dice", name: "Dice Roll", icon: Dices },
  { path: "/price", name: "Price Bet", icon: TrendingUp },
  { path: "/pot", name: "Lucky Pot", icon: Coins },
];

function WalletButton() {
  return (
    <div className="flex items-center gap-2">
      <appkit-button />
    </div>
  );
}

function NavBar() {
  const [location] = useLocation();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/">
            <span className="font-display font-bold text-xl neon-text cursor-pointer" data-testid="link-home">
              VERSEBET
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {games.map((game) => {
              const isActive = location === game.path;
              const Icon = game.icon;
              return (
                <Link key={game.path} href={game.path}>
                  <span
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary/20 text-primary neon-glow"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                    data-testid={`nav-${game.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    {game.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        
        <WalletButton />
      </div>
      
      <div className="md:hidden flex items-center justify-around py-2 border-t border-white/5">
        {games.map((game) => {
          const isActive = location === game.path;
          const Icon = game.icon;
          return (
            <Link key={game.path} href={game.path}>
              <span
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`nav-mobile-${game.name.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className="w-5 h-5" />
                {game.name.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={CrashGame} />
      <Route path="/dice" component={() => <ComingSoon name="Dice Roll" />} />
      <Route path="/price" component={() => <ComingSoon name="Price Bet" />} />
      <Route path="/pot" component={() => <ComingSoon name="Lucky Pot" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-display font-bold mb-4 neon-text">{name}</h1>
      <p className="text-muted-foreground">Coming soon...</p>
    </div>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initModal().then(() => setIsInitialized(true));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen">
          <NavBar />
          <main className="pt-28 md:pt-20 pb-8 px-4">
            <div className="max-w-7xl mx-auto">
              <Router />
            </div>
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
