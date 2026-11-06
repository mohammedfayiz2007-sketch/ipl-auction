/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IPLTeam, Player, PlayerRole, BidRecord } from '../types/auction';
import { RETENTION_TIERS, calculateNextBid } from '../data/iplData';

export type AIBiddingStrategy = 'Aggressive' | 'Balanced' | 'Budget Saver' | 'Strategic';

export interface AITeamProfile {
  teamId: string;
  strategy: AIBiddingStrategy;
  aggressionMultiplier: number; // e.g. 1.25 for aggressive
  valuationCeilingPercent: number; // % of max valuation willing to pay
  preferredRoles: PlayerRole[];
}

/**
 * Authentic tactical bidding profiles for all 10 IPL franchises
 */
export const TEAM_AI_PROFILES: Record<string, AITeamProfile> = {
  csk: {
    teamId: 'csk',
    strategy: 'Strategic',
    aggressionMultiplier: 1.15,
    valuationCeilingPercent: 0.88,
    preferredRoles: ['All-Rounder', 'Bowler', 'Batter'],
  },
  mi: {
    teamId: 'mi',
    strategy: 'Aggressive',
    aggressionMultiplier: 1.28,
    valuationCeilingPercent: 0.95,
    preferredRoles: ['Bowler', 'Batter', 'All-Rounder'],
  },
  rcb: {
    teamId: 'rcb',
    strategy: 'Aggressive',
    aggressionMultiplier: 1.25,
    valuationCeilingPercent: 0.94,
    preferredRoles: ['Batter', 'All-Rounder', 'Bowler'],
  },
  kkr: {
    teamId: 'kkr',
    strategy: 'Strategic',
    aggressionMultiplier: 1.18,
    valuationCeilingPercent: 0.90,
    preferredRoles: ['All-Rounder', 'Bowler', 'Batter'],
  },
  srh: {
    teamId: 'srh',
    strategy: 'Aggressive',
    aggressionMultiplier: 1.22,
    valuationCeilingPercent: 0.92,
    preferredRoles: ['Batter', 'Bowler', 'All-Rounder'],
  },
  rr: {
    teamId: 'rr',
    strategy: 'Balanced',
    aggressionMultiplier: 1.05,
    valuationCeilingPercent: 0.85,
    preferredRoles: ['Batter', 'Bowler', 'Wicketkeeper'],
  },
  dc: {
    teamId: 'dc',
    strategy: 'Balanced',
    aggressionMultiplier: 1.05,
    valuationCeilingPercent: 0.84,
    preferredRoles: ['Bowler', 'Batter', 'All-Rounder'],
  },
  gt: {
    teamId: 'gt',
    strategy: 'Strategic',
    aggressionMultiplier: 1.12,
    valuationCeilingPercent: 0.88,
    preferredRoles: ['All-Rounder', 'Bowler', 'Batter'],
  },
  lsg: {
    teamId: 'lsg',
    strategy: 'Balanced',
    aggressionMultiplier: 1.08,
    valuationCeilingPercent: 0.86,
    preferredRoles: ['Batter', 'All-Rounder', 'Bowler'],
  },
  pbks: {
    teamId: 'pbks',
    strategy: 'Budget Saver',
    aggressionMultiplier: 0.90,
    valuationCeilingPercent: 0.78,
    preferredRoles: ['All-Rounder', 'Bowler', 'Batter'],
  },
};

/**
 * Evaluates a player's intrinsic retention score (0 - 100+)
 */
export function scorePlayerForRetention(player: Player): number {
  let score = 0;

  // 1. Marquee Superstar status (+35)
  if (player.marquee) score += 35;

  // 2. IPL Career Volume & Performance
  const runs = player.iplStats?.runs || 0;
  const wickets = player.iplStats?.wickets || 0;
  const matches = player.iplStats?.matches || 0;
  const sr = player.iplStats?.strikeRate || 0;
  const econ = player.iplStats?.economy || 0;

  if (runs >= 4000) score += 30;
  else if (runs >= 2500) score += 22;
  else if (runs >= 1200) score += 15;
  else if (runs >= 500) score += 8;

  if (wickets >= 100) score += 30;
  else if (wickets >= 60) score += 22;
  else if (wickets >= 30) score += 15;
  else if (wickets >= 15) score += 8;

  if (matches >= 100) score += 10;
  else if (matches >= 50) score += 6;

  // 3. Efficiency & Impact Rates
  if (sr >= 150) score += 12;
  else if (sr >= 135) score += 8;

  if (econ > 0 && econ <= 7.6) score += 12;
  else if (econ > 0 && econ <= 8.4) score += 7;

  // 4. Role Scarcity Bonus (Wicketkeepers & All-Rounders)
  if (player.role === 'Wicketkeeper') score += 10;
  if (player.role === 'All-Rounder') score += 8;

  // 5. Recent Form / Leadership Mentions
  const perf = (player.iplStats?.performance2026 || '').toLowerCase();
  if (perf.includes('captain') || perf.includes('mvp') || perf.includes('match-winner') || perf.includes('leading')) {
    score += 8;
  }

  return score;
}

export interface BotRetentionResult {
  teamId: string;
  retainedPlayerIds: string[];
  releasedPlayerIds: string[];
  totalRetentionCost: number;
  remainingPurse: number;
}

/**
 * Evaluates and decides player retentions for an AI-controlled franchise.
 * Follows BCCI retention rules:
 * - Maximum 6 retentions per franchise.
 * - Maximum 2 overseas players.
 * - Tiered deductions: Slot 1: ₹18 Cr, Slot 2: ₹14 Cr, Slot 3: ₹11 Cr, Slot 4: ₹18 Cr, Slot 5: ₹14 Cr, Slot 6: ₹4 Cr.
 * - Preserves sufficient purse (at least ₹45 Cr) for the live auction pool.
 */
export function evaluateBotRetentions(
  team: IPLTeam,
  candidatePlayers: Player[],
  maxAllowedRetentions: number = 6
): BotRetentionResult {
  // 1. Identify all players belonging to this franchise
  const teamRoster = candidatePlayers.filter(
    (p) => p.teamId === team.id || p.previousTeam === team.code
  );

  if (teamRoster.length === 0) {
    return {
      teamId: team.id,
      retainedPlayerIds: [],
      releasedPlayerIds: [],
      totalRetentionCost: 0,
      remainingPurse: team.totalPurse,
    };
  }

  // 2. Score and sort candidates
  const scoredCandidates = teamRoster
    .map((p) => ({ player: p, score: scorePlayerForRetention(p) }))
    .sort((a, b) => b.score - a.score);

  const retained: Player[] = [];
  let currentOverseas = 0;
  let simulatedCost = 0;

  for (const candidate of scoredCandidates) {
    if (retained.length >= maxAllowedRetentions) break;

    // Check overseas quota: max 2 overseas in retention
    if (candidate.player.isOverseas && currentOverseas >= 2) {
      continue;
    }

    // Minimum quality threshold: only retain players worth paying the BCCI tier cost for
    // Slot 1-3 requires score >= 30, Slot 4-5 requires score >= 40
    const slotIdx = retained.length;
    const tier = RETENTION_TIERS[slotIdx] || { cost: 18.0 };
    const minRequiredScore = slotIdx >= 3 ? 42 : 28;

    if (candidate.score < minRequiredScore && !candidate.player.marquee) {
      continue;
    }

    // Ensure the franchise retains at least ₹45 Cr for the auction floor
    if (simulatedCost + tier.cost > 75.0) {
      break;
    }

    retained.push(candidate.player);
    simulatedCost += tier.cost;
    if (candidate.player.isOverseas) currentOverseas++;
  }

  // If no one met threshold, ensure at least the #1 top marquee or best player is retained if available
  if (retained.length === 0 && scoredCandidates.length > 0 && scoredCandidates[0].score >= 25) {
    const topStar = scoredCandidates[0].player;
    const tier = RETENTION_TIERS[0];
    retained.push(topStar);
    simulatedCost = tier.cost;
  }

  const retainedIds = retained.map((p) => p.id);
  const releasedIds = teamRoster
    .filter((p) => !retainedIds.includes(p.id))
    .map((p) => p.id);

  const finalCost = Number(simulatedCost.toFixed(2));
  const remainingPurse = Number((team.totalPurse - finalCost).toFixed(2));

  return {
    teamId: team.id,
    retainedPlayerIds: retainedIds,
    releasedPlayerIds: releasedIds,
    totalRetentionCost: finalCost,
    remainingPurse,
  };
}

/**
 * Calculates the maximum bid amount (in ₹ Crores) an AI bot franchise is willing to pay for a player.
 */
export function calculatePlayerAuctionValuation(
  player: Player,
  botTeam: IPLTeam,
  squad: Player[],
  remainingPurse: number,
  strategy: AIBiddingStrategy = 'Balanced'
): number {
  // 1. Hard Constraints: Squad capacity & overseas limit
  if (squad.length >= botTeam.maxSquad) return 0;
  if (player.isOverseas) {
    const currentOverseas = squad.filter((p) => p.isOverseas).length;
    if (currentOverseas >= botTeam.maxOverseas) return 0;
  }

  // 2. Purse Solvency Guard: Team must preserve base reserve for minimum squad of 18
  const currentSquadSize = squad.length;
  const remainingSlotsToMin = Math.max(0, botTeam.minSquad - (currentSquadSize + 1));
  const minimumReserve = Number((remainingSlotsToMin * 0.30).toFixed(2)); // ₹30L minimum reserve per slot
  const maxAffordableBid = Number((remainingPurse - minimumReserve).toFixed(2));

  if (maxAffordableBid < player.basePrice) return 0;

  // 3. Intrinsic Baseline Valuation (in ₹ Crores)
  let baseValuation = player.basePrice;

  // Marquee star prestige
  if (player.marquee) {
    baseValuation = Math.max(baseValuation, 14.0);
  }

  // Performance metrics boost
  const runs = player.iplStats?.runs || 0;
  const wickets = player.iplStats?.wickets || 0;
  const sr = player.iplStats?.strikeRate || 0;
  const econ = player.iplStats?.economy || 0;

  if (runs >= 3500) baseValuation += 6.5;
  else if (runs >= 2000) baseValuation += 4.5;
  else if (runs >= 1000) baseValuation += 2.5;

  if (wickets >= 100) baseValuation += 6.5;
  else if (wickets >= 60) baseValuation += 4.5;
  else if (wickets >= 30) baseValuation += 2.5;

  if (sr >= 150) baseValuation += 2.5;
  else if (sr >= 135) baseValuation += 1.5;

  if (econ > 0 && econ <= 7.5) baseValuation += 2.5;
  else if (econ > 0 && econ <= 8.2) baseValuation += 1.5;

  // 4. Team Need Analysis (Role balance)
  const battersCount = squad.filter((p) => p.role === 'Batter').length;
  const bowlersCount = squad.filter((p) => p.role === 'Bowler').length;
  const allRoundersCount = squad.filter((p) => p.role === 'All-Rounder').length;
  const keepersCount = squad.filter((p) => p.role === 'Wicketkeeper').length;

  let needMultiplier = 1.0;

  if (player.role === 'Wicketkeeper') {
    if (keepersCount === 0) needMultiplier = 1.45; // Critical need
    else if (keepersCount === 1) needMultiplier = 1.05;
    else needMultiplier = 0.65; // Already has 2 keepers
  } else if (player.role === 'Batter') {
    if (battersCount < 4) needMultiplier = 1.30;
    else if (battersCount < 7) needMultiplier = 1.05;
    else needMultiplier = 0.70;
  } else if (player.role === 'Bowler') {
    if (bowlersCount < 5) needMultiplier = 1.30;
    else if (bowlersCount < 8) needMultiplier = 1.05;
    else needMultiplier = 0.70;
  } else if (player.role === 'All-Rounder') {
    if (allRoundersCount < 2) needMultiplier = 1.35;
    else if (allRoundersCount < 5) needMultiplier = 1.10;
    else needMultiplier = 0.75;
  }

  // 5. Strategy Multiplier
  let strategyMultiplier = 1.0;
  let ceilingPercent = 0.85;

  switch (strategy) {
    case 'Aggressive':
      strategyMultiplier = player.marquee ? 1.30 : 1.15;
      ceilingPercent = 0.94;
      break;
    case 'Balanced':
      strategyMultiplier = 1.05;
      ceilingPercent = 0.86;
      break;
    case 'Strategic':
      strategyMultiplier = needMultiplier > 1.1 ? 1.25 : 0.85;
      ceilingPercent = 0.88;
      break;
    case 'Budget Saver':
      strategyMultiplier = 0.88;
      ceilingPercent = 0.76;
      break;
  }

  // Compute final targeted valuation
  let valuation = baseValuation * needMultiplier * strategyMultiplier;

  // Scale down if remaining purse is low
  if (remainingPurse < 30.0) {
    valuation *= 0.75;
  } else if (remainingPurse < 15.0) {
    valuation *= 0.50;
  }

  // Apply maximum ceiling willing to bid
  const cappedValuation = Math.min(valuation * ceilingPercent, maxAffordableBid);

  // Valuation must be at least the base price to participate
  return Number(Math.max(player.basePrice, cappedValuation).toFixed(2));
}

export interface AIBidDecision {
  shouldBid: boolean;
  botTeamId: string;
  botTeamName: string;
  botTeamCode: string;
  proposedBidAmount: number;
  maxValuation: number;
  eagernessScore: number; // Higher score = higher priority to place the bid
  reason: string;
}

/**
 * Decides whether an AI bot team should place a bid on the active auction player.
 */
export function evaluateAIBidForTeam(params: {
  botTeam: IPLTeam;
  player: Player;
  currentBid: BidRecord | null;
  squad: Player[];
  strategy?: AIBiddingStrategy;
}): AIBidDecision {
  const { botTeam, player, currentBid, squad, strategy = 'Balanced' } = params;

  // 1. Guard: AI never bids against itself
  if (currentBid && currentBid.teamId === botTeam.id) {
    return {
      shouldBid: false,
      botTeamId: botTeam.id,
      botTeamName: botTeam.name,
      botTeamCode: botTeam.code,
      proposedBidAmount: 0,
      maxValuation: 0,
      eagernessScore: -1,
      reason: 'Already holding the highest bid',
    };
  }

  const remainingPurse = Number((botTeam.totalPurse - botTeam.spentPurse).toFixed(2));
  const currentBidAmount = currentBid?.amount || 0;
  const nextBidAmount = currentBidAmount === 0 ? player.basePrice : calculateNextBid(currentBidAmount);

  // 2. Guard: Cannot afford next bid
  if (remainingPurse < nextBidAmount) {
    return {
      shouldBid: false,
      botTeamId: botTeam.id,
      botTeamName: botTeam.name,
      botTeamCode: botTeam.code,
      proposedBidAmount: nextBidAmount,
      maxValuation: 0,
      eagernessScore: -1,
      reason: `Insufficient purse (₹${remainingPurse} Cr available, need ₹${nextBidAmount} Cr)`,
    };
  }

  // 3. Compute AI Valuation
  const maxValuation = calculatePlayerAuctionValuation(player, botTeam, squad, remainingPurse, strategy);

  if (nextBidAmount > maxValuation) {
    return {
      shouldBid: false,
      botTeamId: botTeam.id,
      botTeamName: botTeam.name,
      botTeamCode: botTeam.code,
      proposedBidAmount: nextBidAmount,
      maxValuation,
      eagernessScore: -1,
      reason: `Bid ₹${nextBidAmount} Cr exceeds valuation of ₹${maxValuation} Cr`,
    };
  }

  // 4. Calculate eagerness: valuation headroom + tactical desire
  const headroom = maxValuation - nextBidAmount;
  const eagernessScore = headroom + (player.marquee ? 5 : 0);

  return {
    shouldBid: true,
    botTeamId: botTeam.id,
    botTeamName: botTeam.name,
    botTeamCode: botTeam.code,
    proposedBidAmount: nextBidAmount,
    maxValuation,
    eagernessScore,
    reason: `Targeting player (willing to pay up to ₹${maxValuation} Cr, next bid ₹${nextBidAmount} Cr)`,
  };
}

/**
 * Evaluates all AI-controlled teams in the room and selects the best candidate to bid next.
 */
export function selectBestAIBidder(params: {
  botTeams: IPLTeam[];
  player: Player;
  currentBid: BidRecord | null;
  allPlayers: Player[];
  teamStrategies?: Record<string, AIBiddingStrategy>;
}): AIBidDecision | null {
  const { botTeams, player, currentBid, allPlayers, teamStrategies = {} } = params;

  const validDecisions: AIBidDecision[] = [];

  for (const botTeam of botTeams) {
    // Current squad of this bot team
    const squad = allPlayers.filter(
      (p) => p.soldTo === botTeam.id || botTeam.retainedPlayers.includes(p.id)
    );

    const strategy = teamStrategies[botTeam.id] || TEAM_AI_PROFILES[botTeam.id]?.strategy || 'Balanced';

    const decision = evaluateAIBidForTeam({
      botTeam,
      player,
      currentBid,
      squad,
      strategy,
    });

    if (decision.shouldBid) {
      validDecisions.push(decision);
    }
  }

  if (validDecisions.length === 0) return null;

  // Sort by eagerness score descending, with slight human-like randomness
  validDecisions.sort((a, b) => {
    const jitter = (Math.random() - 0.5) * 1.5;
    return (b.eagernessScore + jitter) - a.eagernessScore;
  });

  return validDecisions[0];
}

