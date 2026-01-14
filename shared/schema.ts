import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const greetings = pgTable("greetings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  message: text("message").notNull(),
});

export const insertGreetingSchema = createInsertSchema(greetings).pick({
  name: true,
  message: true,
});

export type Greeting = typeof greetings.$inferSelect;
export type InsertGreeting = z.infer<typeof insertGreetingSchema>;

export const crashHistory = pgTable("crash_history", {
  id: serial("id").primaryKey(),
  multiplier: text("multiplier").notNull(),
  timestamp: text("timestamp").notNull(),
  serverSeed: text("server_seed"),
  serverSeedHash: text("server_seed_hash"),
  clientSeed: text("client_seed"),
  nonce: text("nonce"),
  gameHash: text("game_hash"),
  participantSeeds: text("participant_seeds"), // JSON array of {address, clientSeed} for verification
});

export const insertCrashHistorySchema = createInsertSchema(crashHistory).pick({
  multiplier: true,
  timestamp: true,
  serverSeed: true,
  serverSeedHash: true,
  clientSeed: true,
  nonce: true,
  gameHash: true,
  participantSeeds: true,
});

export type CrashHistory = typeof crashHistory.$inferSelect;
export type InsertCrashHistory = z.infer<typeof insertCrashHistorySchema>;

// User balances for internal wallet system
export const userBalances = pgTable("user_balances", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  balance: text("balance").notNull().default("0"), // Store as string for large numbers
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserBalanceSchema = createInsertSchema(userBalances).pick({
  walletAddress: true,
  balance: true,
});

export type UserBalance = typeof userBalances.$inferSelect;
export type InsertUserBalance = z.infer<typeof insertUserBalanceSchema>;

// Balance transactions for audit trail
export const balanceTransactions = pgTable("balance_transactions", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  type: text("type").notNull(), // deposit, withdraw, bet, win
  amount: text("amount").notNull(),
  txHash: text("tx_hash"),
  game: text("game"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBalanceTransactionSchema = createInsertSchema(balanceTransactions).pick({
  walletAddress: true,
  type: true,
  amount: true,
  txHash: true,
  game: true,
});

export type BalanceTransaction = typeof balanceTransactions.$inferSelect;
export type InsertBalanceTransaction = z.infer<typeof insertBalanceTransactionSchema>;

// Pending withdrawals queue - admin processes manually
export const pendingWithdrawals = pgTable("pending_withdrawals", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  amount: text("amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const insertPendingWithdrawalSchema = createInsertSchema(pendingWithdrawals).pick({
  walletAddress: true,
  amount: true,
});

export type PendingWithdrawal = typeof pendingWithdrawals.$inferSelect;
export type InsertPendingWithdrawal = z.infer<typeof insertPendingWithdrawalSchema>;

// Lucky Pot rounds
export const potRounds = pgTable("pot_rounds", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("active"), // active, completed
  totalPot: text("total_pot").notNull().default("0"),
  winnerAddress: text("winner_address"),
  winnerAmount: text("winner_amount"),
  winnerChance: text("winner_chance"),
  serverSeed: text("server_seed"),
  serverSeedHash: text("server_seed_hash"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const insertPotRoundSchema = createInsertSchema(potRounds).pick({
  status: true,
  totalPot: true,
});

export type PotRound = typeof potRounds.$inferSelect;
export type InsertPotRound = z.infer<typeof insertPotRoundSchema>;

// Lucky Pot entries (participants in a round)
export const potEntries = pgTable("pot_entries", {
  id: serial("id").primaryKey(),
  roundId: serial("round_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  amount: text("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPotEntrySchema = createInsertSchema(potEntries).pick({
  roundId: true,
  walletAddress: true,
  amount: true,
});

export type PotEntry = typeof potEntries.$inferSelect;
export type InsertPotEntry = z.infer<typeof insertPotEntrySchema>;

// Price Bet rounds (5-minute BTC prediction)
export const priceBetRounds = pgTable("price_bet_rounds", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("betting"), // betting, locked, settled
  startPrice: text("start_price"), // BTC price when betting locked
  settlePrice: text("settle_price"), // BTC price at settlement
  lockAt: timestamp("lock_at").notNull(), // When betting locks
  settleAt: timestamp("settle_at").notNull(), // When round settles (5 min after lock)
  winDirection: text("win_direction"), // up or down
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPriceBetRoundSchema = createInsertSchema(priceBetRounds).pick({
  status: true,
  lockAt: true,
  settleAt: true,
});

export type PriceBetRound = typeof priceBetRounds.$inferSelect;
export type InsertPriceBetRound = z.infer<typeof insertPriceBetRoundSchema>;

// Price Bet wagers
export const priceBets = pgTable("price_bets", {
  id: serial("id").primaryKey(),
  roundId: serial("round_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  direction: text("direction").notNull(), // up or down
  stake: text("stake").notNull(),
  payout: text("payout"), // null until settled
  result: text("result"), // win, lose, or null
  placedAt: timestamp("placed_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertPriceBetSchema = createInsertSchema(priceBets).pick({
  roundId: true,
  walletAddress: true,
  direction: true,
  stake: true,
});

export type PriceBet = typeof priceBets.$inferSelect;
export type InsertPriceBet = z.infer<typeof insertPriceBetSchema>;

// Dice Roll bets (provably fair)
export const diceBets = pgTable("dice_bets", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  stake: text("stake").notNull(),
  target: text("target").notNull(), // User's target (1-98), roll under this to win
  multiplier: text("multiplier").notNull(), // Payout multiplier based on target
  diceResult: text("dice_result"), // 0-99 result
  payout: text("payout"), // null if lose, payout if win
  result: text("result"), // win, lose
  serverSeed: text("server_seed"),
  serverSeedHash: text("server_seed_hash"),
  clientSeed: text("client_seed"),
  nonce: text("nonce"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDiceBetSchema = createInsertSchema(diceBets).pick({
  walletAddress: true,
  stake: true,
  target: true,
  multiplier: true,
});

export type DiceBet = typeof diceBets.$inferSelect;
export type InsertDiceBet = z.infer<typeof insertDiceBetSchema>;
