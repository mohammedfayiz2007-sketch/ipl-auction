/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { TeamEmblem } from '../components/TeamEmblem';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { formatCrores } from '../data/iplData';
import {
  Gavel,
  Shield,
  Users,
  Radio,
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Cpu,
  RefreshCw,
  PlusCircle,
  LogIn,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setCurrentTab, teams, players, createRoom, joinRoom } = useAuction();
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const marqueePlayers = players.filter((p) => p.marquee).slice(0, 6);

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const ok = joinRoom(joinCodeInput.trim());
    if (ok) {
      setCurrentTab('auction');
      setIsJoinModalOpen(false);
    }
  };

  const handleQuickCreate = () => {
    createRoom('IPL 2027 Official War Room', 15);
    setCurrentTab('auction');
  };

  return (
    <div className="min-h-screen bg-[#080D1A] text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#21304d]">
        {/* Stadium lighting glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-[#F5B942]/10 via-[#4388FF]/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-32 left-10 w-96 h-96 bg-[#4388FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-[#F5B942]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Official season kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10192B] border border-[#21304d] text-xs font-semibold text-slate-300 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#20C997] animate-pulse" />
            <span className="text-[#F5B942] font-bold">BCCI OFFICIAL RULES</span>
            <span className="text-slate-500">·</span>
            <span>MEGA AUCTION 2027</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-heading leading-tight text-balance max-w-4xl mx-auto">
            IPL AUCTION <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5B942] via-[#ffe082] to-[#F5B942]">ARENA 2027</span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Build Your Team. Win Your Auction. Take command of any of the 10 IPL franchises in a broadcast-grade live bidding battle.
          </p>

          {/* Action Buttons Triad */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setCurrentTab('auction')}
              className="px-6 py-3.5 rounded-xl bg-[#F5B942] hover:bg-[#ffc95c] text-[#080D1A] font-extrabold text-sm shadow-lg shadow-[#F5B942]/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-[#080D1A] animate-pulse" />
              <span>Enter Live Auction Arena</span>
            </button>

            <button
              onClick={handleQuickCreate}
              className="px-6 py-3.5 rounded-xl bg-[#172338] hover:bg-[#1f2f4a] text-white font-bold text-sm border border-[#21304d] hover:border-[#F5B942]/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#F5B942]" />
              <span>Create Auction Room</span>
            </button>

            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-[#10192B] hover:bg-[#172338] text-slate-200 font-bold text-sm border border-[#21304d] transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-blue-400" />
              <span>Join via Room Code</span>
            </button>

            <button
              onClick={() => setCurrentTab('teams')}
              className="px-5 py-3.5 rounded-xl text-slate-400 hover:text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <span>Explore Teams →</span>
            </button>
          </div>

          {/* Key Facts Strip */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#10192B]/80 border border-[#21304d] backdrop-blur">
            <div className="text-center p-2">
              <span className="block text-2xl font-extrabold font-mono text-[#F5B942] tabular-nums">
                ₹120.00 Cr
              </span>
              <span className="text-xs text-slate-400 font-medium">Purse Per Franchise</span>
            </div>

            <div className="text-center p-2">
              <span className="block text-2xl font-extrabold font-mono text-white tabular-nums">
                10 Teams
              </span>
              <span className="text-xs text-slate-400 font-medium">Official Franchises</span>
            </div>

            <div className="text-center p-2">
              <span className="block text-2xl font-extrabold font-mono text-[#20C997] tabular-nums">
                {players.length}+ Players
              </span>
              <span className="text-xs text-slate-400 font-medium">Curated 2027 Draft</span>
            </div>

            <div className="text-center p-2">
              <span className="block text-2xl font-extrabold font-mono text-blue-400 tabular-nums">
                15 Sec
              </span>
              <span className="text-xs text-slate-400 font-medium">Bidding Timer Per Call</span>
            </div>
          </div>
        </div>
      </section>

      {/* ALL 10 IPL FRANCHISES SHOWCASE */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#21304d]">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F5B942] block mb-1">
            2027 Tournament Franchises
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Choose Your Franchise & Dominate the Table
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Select any team to manage squad retention, track remaining purse, and outbid opponents in real-time.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 lg:gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              onClick={() => setCurrentTab('teams')}
              className="p-4 rounded-2xl bg-[#10192B] border border-[#21304d] hover:border-[#F5B942]/50 hover:bg-[#172338] transition-all cursor-pointer group flex flex-col items-center text-center"
            >
              <TeamEmblem code={team.code} size="lg" className="mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white text-sm group-hover:text-[#F5B942] transition-colors truncate w-full">
                {team.name}
              </h3>
              <span className="text-xs font-mono text-[#20C997] mt-1 tabular-nums">
                Purse: ₹{(team.totalPurse - team.spentPurse).toFixed(2)} Cr
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {team.trophies.length > 0 ? `${team.trophies.length}x Trophies` : 'Contender'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW THE AUCTION WORKS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#21304d]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F5B942] block mb-1">
            Official Auction Mechanics
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            How IPL Mega Auction 2027 Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-[#10192B] border border-[#21304d]">
            <div className="w-10 h-10 rounded-xl bg-[#F5B942]/10 text-[#F5B942] flex items-center justify-center font-bold font-mono text-base mb-4 border border-[#F5B942]/20">
              01
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 font-heading">Squad Retention</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Lock in up to 6 key players before the auction starts using standard BCCI tier deductions (₹18 Cr, ₹14 Cr, ₹11 Cr, etc.).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#10192B] border border-[#21304d]">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold font-mono text-base mb-4 border border-blue-500/20">
              02
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 font-heading">Marquee Sets</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Superstar players enter first in sets M1 and M2, followed by specialized sets: Batters, All-Rounders, Keepers, and Bowlers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#10192B] border border-[#21304d]">
            <div className="w-10 h-10 rounded-xl bg-[#20C997]/10 text-[#20C997] flex items-center justify-center font-bold font-mono text-base mb-4 border border-[#20C997]/20">
              03
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 font-heading">Live Bidding Arena</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              15-second countdown timer. Each bid raises the stakes with official tiered increments (+₹10L, +₹20L, +₹50L, +₹1 Cr).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#10192B] border border-[#21304d]">
            <div className="w-10 h-10 rounded-xl bg-[#FF5263]/10 text-[#FF5263] flex items-center justify-center font-bold font-mono text-base mb-4 border border-[#FF5263]/20">
              04
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 font-heading">The Gavel Falls</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When the timer expires, the auctioneer hammers SOLD or marks the player UNSOLD. Purse and squad limits update instantly.
            </p>
          </div>
        </div>
      </section>

      {/* MARQUEE PLAYER DRAFT PREVIEW */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#21304d]">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#F5B942] block mb-1">
              Top Talent In High Demand
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Marquee Stars Headline 2027
            </h2>
          </div>

          <button
            onClick={() => setCurrentTab('players')}
            className="text-xs font-bold text-[#F5B942] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Browse Full Player Database ({players.length} players)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {marqueePlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => setCurrentTab('players')}
              className="p-4 rounded-2xl bg-[#10192B] border border-[#21304d] hover:border-[#F5B942]/50 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <PlayerAvatar player={player} size="lg" showRoleBadge />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                  <span className="text-[#F5B942] font-semibold">{player.role}</span>
                  <span>·</span>
                  <span>{player.country}</span>
                </div>
                <h3 className="font-extrabold text-white text-base group-hover:text-[#F5B942] transition-colors truncate">
                  {player.name}
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Base Price:</span>
                  <span className="font-bold text-white tabular-nums">
                    {formatCrores(player.basePrice)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK JOIN ROOM MODAL */}
      {isJoinModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-room-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-[#080D1A] border border-[#21304d] rounded-2xl p-6 shadow-2xl">
            <h2 id="join-room-title" className="text-xl font-extrabold text-white font-heading mb-1">
              Join Auction Room
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Enter the 6-character room code shared by your auction host.
            </p>

            <form onSubmit={handleQuickJoin} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">Room Code</label>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. IPL-27"
                  maxLength={10}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10192B] border border-[#21304d] focus:border-[#F5B942] text-white font-mono text-center tracking-widest text-lg uppercase outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-[#172338] hover:bg-[#1f2f4a] text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!joinCodeInput.trim()}
                  className="w-1/2 py-2.5 rounded-xl bg-[#F5B942] hover:bg-[#ffc95c] disabled:opacity-50 text-[#080D1A] font-extrabold text-xs shadow transition-all cursor-pointer"
                >
                  Join Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-base">🏏</span>
          <span className="font-heading font-extrabold text-slate-300 tracking-wider">
            IPL AUCTION ARENA 2027
          </span>
        </div>
        <p className="max-w-md mx-auto mb-4">
          A high-performance cricket auction simulator adhering to official BCCI IPL Mega Auction guidelines.
        </p>
        <div className="flex items-center justify-center gap-4 text-slate-400">
          <button onClick={() => setCurrentTab('auction')} className="hover:text-white cursor-pointer">Live Arena</button>
          <span>·</span>
          <button onClick={() => setCurrentTab('teams')} className="hover:text-white cursor-pointer">Franchises</button>
          <span>·</span>
          <button onClick={() => setCurrentTab('players')} className="hover:text-white cursor-pointer">Players</button>
          <span>·</span>
          <button onClick={() => setCurrentTab('settings')} className="hover:text-white cursor-pointer">Tournament Rules</button>
        </div>
      </footer>
    </div>
  );
};
