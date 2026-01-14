import { useEffect, useState, useCallback, useRef } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Rocket, TrendingUp, History, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CrashState {
  multiplier: number;
  status: "waiting" | "playing" | "crashed";
  countdown: number;
  bets: Array<{ address: string; amount: string; targetMultiplier: number; cashedOut?: boolean; cashOutMultiplier?: number }>;
  history: Array<{ multiplier: number; timestamp: string }>;
  gameHash?: string;
  serverSeedHash?: string;
}

interface CrashHistoryEntry {
  id: number;
  multiplier: string;
  timestamp: string;
  serverSeed?: string;
  serverSeedHash?: string;
  clientSeed?: string;
  nonce?: string;
  gameHash?: string;
}

export default function CrashGame() {
  const { address, isConnected } = useAppKitAccount();
  const { toast } = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [gameState, setGameState] = useState<CrashState>({
    multiplier: 1.0,
    status: "waiting",
    countdown: 5,
    bets: [],
    history: [],
  });
  const [betAmount, setBetAmount] = useState("100");
  const [autoCashout, setAutoCashout] = useState("2.00");
  const [myBet, setMyBet] = useState<{ amount: string; targetMultiplier: number } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [fullHistory, setFullHistory] = useState<CrashHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log("Connected to crash game");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "crash_state") {
          setGameState(data.state);
        } else if (data.type === "crash_tick") {
          setGameState((prev) => ({
            ...prev,
            multiplier: data.multiplier,
            status: "playing",
          }));
        } else if (data.type === "crash_countdown") {
          setGameState((prev) => ({
            ...prev,
            countdown: data.countdown,
            status: "waiting",
            multiplier: 1.0,
          }));
        } else if (data.type === "crash_start") {
          setGameState((prev) => ({
            ...prev,
            status: "playing",
            multiplier: 1.0,
            bets: data.bets || prev.bets,
          }));
        } else if (data.type === "crash_crashed") {
          setGameState((prev) => ({
            ...prev,
            status: "crashed",
            multiplier: data.multiplier,
            history: [{ multiplier: data.multiplier, timestamp: new Date().toISOString() }, ...prev.history].slice(0, 20),
          }));
          setMyBet(null);
          fetchFullHistory();
        } else if (data.type === "crash_cashout") {
          if (data.address?.toLowerCase() === address?.toLowerCase()) {
            setMyBet(null);
            toast({
              title: "Cashed out!",
              description: `Won ${parseFloat(data.payout).toFixed(2)} VERSE at ${data.multiplier}x`,
            });
          }
        } else if (data.type === "bet_placed") {
          setGameState((prev) => ({
            ...prev,
            bets: [...prev.bets, data.bet],
          }));
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onerror = (e) => console.error("WS error:", e);
    ws.onclose = () => console.log("WS closed");

    setSocket(ws);

    return () => ws.close();
  }, [address, toast]);

  const fetchFullHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/crash/history");
      const data = await res.json();
      setFullHistory(data.slice(0, 50));
    } catch (e) {
      console.error("Failed to fetch history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchFullHistory();
  }, [fetchFullHistory]);

  const placeBet = async () => {
    if (!isConnected || !address) {
      toast({ title: "Connect wallet first", variant: "destructive" });
      return;
    }
    if (gameState.status !== "waiting") {
      toast({ title: "Wait for next round", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("/api/crash/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          amount: betAmount,
          targetMultiplier: parseFloat(autoCashout),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place bet");

      setMyBet({ amount: betAmount, targetMultiplier: parseFloat(autoCashout) });
      toast({ title: "Bet placed!", description: `${betAmount} VERSE at ${autoCashout}x auto cashout` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const cashout = async () => {
    if (!address || !myBet) return;

    try {
      const res = await fetch("/api/crash/cashout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cashout");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const getMultiplierColor = (mult: number) => {
    if (mult < 1.5) return "text-red-400";
    if (mult < 2) return "text-yellow-400";
    if (mult < 5) return "text-green-400";
    return "text-cyan-400";
  };

  const recentHistory = gameState.history.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {recentHistory.map((h, i) => (
          <span
            key={i}
            className={`history-badge ${h.multiplier >= 2 ? "history-badge-win" : "history-badge-loss"}`}
            data-testid={`crash-history-${i}`}
          >
            {h.multiplier.toFixed(2)}x
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass-card p-6 relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
            
            {gameState.status === "waiting" ? (
              <div className="text-center z-10">
                <p className="text-muted-foreground mb-2">Next round in</p>
                <div className="text-6xl md:text-8xl font-display font-bold text-primary animate-pulse-glow">
                  {gameState.countdown}s
                </div>
                <p className="text-sm text-muted-foreground mt-4">Place your bets now!</p>
              </div>
            ) : gameState.status === "crashed" ? (
              <div className="text-center z-10">
                <p className="text-red-400 mb-2 font-medium">CRASHED AT</p>
                <div className="text-6xl md:text-8xl font-display font-bold text-red-500">
                  {gameState.multiplier.toFixed(2)}x
                </div>
              </div>
            ) : (
              <div className="text-center z-10">
                <div className="mb-4">
                  <Rocket className="w-16 h-16 text-primary animate-rocket mx-auto" />
                </div>
                <div className="crash-multiplier text-6xl md:text-8xl">
                  {gameState.multiplier.toFixed(2)}x
                </div>
                <p className="text-sm text-muted-foreground mt-4">Click cashout to secure your win!</p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="glass-card p-5">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Place Bet
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Bet Amount (VERSE)</label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="bg-white/5 border-white/10"
                  placeholder="100"
                  data-testid="input-bet-amount"
                />
                <div className="flex gap-2 mt-2">
                  {["100", "500", "1000", "5000"].map((val) => (
                    <Button
                      key={val}
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAmount(val)}
                      className="flex-1 text-xs"
                      data-testid={`button-bet-${val}`}
                    >
                      {val}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Auto Cashout (x)</label>
                <Input
                  type="number"
                  value={autoCashout}
                  onChange={(e) => setAutoCashout(e.target.value)}
                  className="bg-white/5 border-white/10"
                  step="0.1"
                  min="1.01"
                  placeholder="2.00"
                  data-testid="input-auto-cashout"
                />
                <div className="flex gap-2 mt-2">
                  {["1.5", "2", "3", "5"].map((val) => (
                    <Button
                      key={val}
                      variant="outline"
                      size="sm"
                      onClick={() => setAutoCashout(val)}
                      className="flex-1 text-xs"
                      data-testid={`button-cashout-${val}`}
                    >
                      {val}x
                    </Button>
                  ))}
                </div>
              </div>

              {myBet && gameState.status === "playing" ? (
                <Button
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-display font-bold text-lg h-14"
                  onClick={cashout}
                  data-testid="button-cashout"
                >
                  CASHOUT @ {gameState.multiplier.toFixed(2)}x
                </Button>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-display font-bold text-lg h-14"
                  onClick={placeBet}
                  disabled={!isConnected || gameState.status !== "waiting" || !!myBet}
                  data-testid="button-place-bet"
                >
                  {!isConnected
                    ? "CONNECT WALLET"
                    : myBet
                    ? "BET PLACED"
                    : gameState.status !== "waiting"
                    ? "WAIT FOR NEXT ROUND"
                    : "PLACE BET"}
                </Button>
              )}
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Players</span>
              <span className="font-medium">{gameState.bets.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Total Stake</span>
              <span className="font-medium text-primary">
                {gameState.bets.reduce((sum, b) => sum + parseFloat(b.amount), 0).toFixed(0)} VERSE
              </span>
            </div>
          </Card>
        </div>
      </div>

      <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
        <Card className="glass-card overflow-hidden">
          <CollapsibleTrigger asChild>
            <button
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              data-testid="button-toggle-history"
            >
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-primary" />
                <span className="font-display font-bold">Last 50 Rounds</span>
              </div>
              {historyOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="border-t border-white/10 p-4">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : fullHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No history yet</p>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {fullHistory.map((entry, i) => {
                    const mult = parseFloat(entry.multiplier);
                    return (
                      <div
                        key={entry.id || i}
                        className={`text-center p-2 rounded-lg ${
                          mult >= 2
                            ? "bg-green-500/10 text-green-400"
                            : mult >= 1.5
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                        title={`Game #${entry.id} - ${new Date(entry.timestamp).toLocaleString()}`}
                        data-testid={`history-entry-${i}`}
                      >
                        <span className="font-display font-bold text-sm">{mult.toFixed(2)}x</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
