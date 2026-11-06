/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { IPLTeam, Player, BidRecord } from '../types/auction';
import { formatCrores } from '../data/iplData';

// Key retrieval order: LocalStorage override -> Vite env -> Process env
export function getGeminiApiKey(): string {
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // Ignore localStorage access issues
  }

  // Check Vite client env
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }

  // Check process env (injected via vite.config.ts define)
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }

  return '';
}

export function setGeminiApiKey(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      if (key && key.trim()) {
        localStorage.setItem('gemini_api_key', key.trim());
      } else {
        localStorage.removeItem('gemini_api_key');
      }
    }
  } catch {
    // Ignore localStorage access issues
  }
}

/**
 * Creates or retrieves a memoized instance of GoogleGenAI
 */
let cachedClient: GoogleGenAI | null = null;
let lastUsedKey: string | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const currentKey = getGeminiApiKey();
  if (!currentKey) return null;
  if (!cachedClient || lastUsedKey !== currentKey) {
    cachedClient = new GoogleGenAI({ apiKey: currentKey });
    lastUsedKey = currentKey;
  }
  return cachedClient;
}

/**
 * Checks if a valid-looking Gemini API key is configured.
 */
export function isGeminiConfigured(): boolean {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 20);
}

/**
 * Generates broadcast-grade live IPL Auctioneer & Pundit commentary.
 * Styled after legendary cricket broadcasters (Harsha Bhogle, Ravi Shastri).
 */
export async function generateAuctionCommentary(params: {
  player: Player;
  bidAmount: number;
  biddingTeam: IPLTeam;
  previousBidder?: IPLTeam | null;
  isWinningBid?: boolean;
}): Promise<string> {
  const { player, bidAmount, biddingTeam, previousBidder, isWinningBid } = params;

  try {
    const ai = getGeminiClient();
    if (!ai) throw new Error('Gemini API key not configured');
    const prompt = `You are the lead broadcast commentator at the official BCCI IPL 2027 Mega Auction.
Give a single punchy, thrilling, high-energy 1-2 sentence commentary line.

Auction Situation:
- Player: ${player.name} (${player.role}, ${player.country}${player.isOverseas ? ', Overseas' : ''})
- Base Price: ₹${player.basePrice} Cr | Recent form: ${player.iplStats?.performance2026 || 'Key player'}
- Current Bid: ₹${bidAmount} Cr placed by ${biddingTeam.name} (${biddingTeam.code})
${previousBidder ? `- Previous bidder outbid: ${previousBidder.name} (${previousBidder.code})` : '- Opening bid of the round'}
${isWinningBid ? '- Gavel going down: this could be the winning bid!' : '- Bidding war is intensifying!'}

Style instructions:
- Authentic cricket broadcast tone (like Harsha Bhogle / Ravi Shastri).
- Mention franchise tactics or player stature.
- Keep it under 35 words. Return ONLY the commentary line. Do not use quotes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    if (text) return text;
  } catch (err) {
    console.warn('Gemini commentary fallback:', err);
  }

  // Graceful broadcast fallback if network is offline
  if (isWinningBid) {
    return `${biddingTeam.name} hold firm at ${formatCrores(bidAmount)} for ${player.name}! The auctioneer raises the gavel!`;
  }
  if (previousBidder) {
    return `${biddingTeam.code} counter immediately at ${formatCrores(bidAmount)}! They refuse to let ${previousBidder.code} have an easy run at ${player.name}.`;
  }
  return `${biddingTeam.name} open the bidding for ${player.name} cleanly at ${formatCrores(bidAmount)}!`;
}

export interface PlayerScoutingReport {
  verdict: 'Must Buy' | 'Strong Fit' | 'Cautious Value' | 'Pass / Overpriced';
  recommendedCeiling: number; // in ₹ Cr
  tacticalSummary: string;
  franchiseSynergy: string;
}

/**
 * Generates an in-depth tactical scouting report and recommended bid ceiling for a player.
 */
export async function generatePlayerScoutingReport(params: {
  player: Player;
  franchise: IPLTeam;
  currentSquad: Player[];
  remainingPurse: number;
}): Promise<PlayerScoutingReport> {
  const { player, franchise, currentSquad, remainingPurse } = params;

  const overseasInSquad = currentSquad.filter((p) => p.isOverseas).length;
  const rolesInSquad = currentSquad.map((p) => p.role).join(', ');

  try {
    const ai = getGeminiClient();
    if (!ai) throw new Error('Gemini API key not configured');
    const prompt = `You are the Chief Talent Scout & Strategic Analyst for IPL franchise ${franchise.name} (${franchise.code}).
Analyze player ${player.name} for our upcoming auction bid.

Context:
- Player: ${player.name} (${player.role}, ${player.country}, Overseas: ${player.isOverseas ? 'Yes' : 'No'})
- Base Price: ₹${player.basePrice} Cr
- IPL Stats: ${player.iplStats?.matches || 0} Matches, ${player.iplStats?.runs || 0} Runs (SR ${player.iplStats?.strikeRate || 0}), ${player.iplStats?.wickets || 0} Wkts (Econ ${player.iplStats?.economy || 0})
- Scouting Note: ${player.iplStats?.performance2026 || 'Proven performer'}
- Our Franchise Purse: ₹${remainingPurse} Cr remaining
- Current Squad (${currentSquad.length} players, ${overseasInSquad} overseas): [${rolesInSquad || 'None yet'}]

Provide an analytical evaluation in JSON format:
{
  "verdict": "Must Buy" | "Strong Fit" | "Cautious Value" | "Pass / Overpriced",
  "recommendedCeiling": <number in Crores, e.g. 12.5>,
  "tacticalSummary": "<2 sentences evaluating player's recent form and role scarcity>",
  "franchiseSynergy": "<2 sentences specifically explaining how he completes ${franchise.code}'s team combination>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.verdict && parsed.recommendedCeiling) {
      return {
        verdict: parsed.verdict,
        recommendedCeiling: Number(parsed.recommendedCeiling) || player.basePrice * 1.5,
        tacticalSummary: parsed.tacticalSummary || `${player.name} brings valuable ${player.role} depth.`,
        franchiseSynergy: parsed.franchiseSynergy || `Fits ${franchise.name}'s balance nicely.`,
      };
    }
  } catch (err) {
    console.warn('Gemini scouting report fallback:', err);
  }

  // Tactical algorithmic fallback
  const isMarquee = player.marquee;
  const ceiling = Number(Math.min(remainingPurse * 0.4, isMarquee ? player.basePrice * 4.5 : player.basePrice * 2.2).toFixed(2));

  return {
    verdict: isMarquee ? 'Must Buy' : player.basePrice > 1.5 ? 'Strong Fit' : 'Cautious Value',
    recommendedCeiling: ceiling,
    tacticalSummary: `${player.name} is a proven ${player.role} with ${player.iplStats?.matches || 0} IPL appearances and solid match-winning pedigree.`,
    franchiseSynergy: `Slotting him into ${franchise.name} addresses key squad requirements while maintaining purse solvency.`,
  };
}

/**
 * Generates an end-of-auction franchise performance review and squad grade.
 */
export async function generateFranchiseDebrief(params: {
  team: IPLTeam;
  squad: Player[];
  remainingPurse: number;
}): Promise<{ grade: string; review: string; keyStrengths: string[] }> {
  const { team, squad, remainingPurse } = params;

  try {
    const ai = getGeminiClient();
    if (!ai) throw new Error('Gemini API key not configured');
    const overseasCount = squad.filter((p) => p.isOverseas).length;
    const marqueeCount = squad.filter((p) => p.marquee).length;

    const prompt = `You are a senior IPL cricket analyst reviewing the auction results for ${team.name} (${team.code}).
Squad summary:
- Total Players: ${squad.length} / 25
- Overseas Players: ${overseasCount} / 8
- Marquee Stars: ${marqueeCount}
- Remaining Purse: ₹${remainingPurse} Cr
- Squad Names: ${squad.map((p) => `${p.name} (${p.role})`).slice(0, 15).join(', ')}

Provide an official review in JSON format:
{
  "grade": "A+" | "A" | "A-" | "B+" | "B",
  "review": "<3 sentences evaluating their overall auction balance and title contention chances>",
  "keyStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.grade && parsed.review) {
      return parsed;
    }
  } catch (err) {
    console.warn('Gemini debrief fallback:', err);
  }

  return {
    grade: squad.length >= 18 ? 'A' : 'B+',
    review: `${team.name} completed a tactically disciplined auction, securing key core match-winners while optimizing their ₹120.00 Cr purse.`,
    keyStrengths: [
      'Balanced distribution of overseas and domestic players',
      'Strong lower-order finishing depth',
      'Efficient purse allocation across all rounds',
    ],
  };
}
