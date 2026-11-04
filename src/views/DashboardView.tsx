/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { TeamEmblem } from '../components/TeamEmblem';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { formatCrores } from '../data/iplData';
import {
  Gavel,
  Shield,
  Users,
  Radio,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  PlusCircle,
  ArrowLeftRight,
  UserCheck,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    setCurrentTab,
    teams,
    players,
    activities,
    activeRoom,
    user,
    setInspectedPlayer,
  } = useAuction();

  const userTeam = teams.find((t) => t.id === user.selectedTeamId);
  const availableCount = players.filter((p) => p.status === 'available' || p.status === 'live').length;
  const soldCount = players.filter((p) => p.status === 'sold' || p.status === 'retained').length;
  const unsoldCount = players.filter((p) => p.status === 'unsold').length;

  // Highest sold player
  const soldPlayers = players
    .filter((p) => (p.status === 'sold' || p.status === 'retained') && p.soldPrice)
    .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0));
  const topBuy = soldPlayers[0];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Greeting */}
      <div className="relative p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-[#10192B] via-[#172338] to-[#10192B] border border-[#21304d] overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5B942]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#20C997] animate-pulse" />
              <span>BCCI OFFICIAL WAR ROOM · SEASON 2027</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-heading">
              Welcome, {user.name}
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Currently representing{' '}
              <strong className="text-[#F5B942]">
                {userTeam ? userTeam.name : 'Unassigned Franchise'}
              </strong>{' '}
              with <span className="font-mono text-[#20C997] font-bold">₹{userTeam ? (userTeam.totalPurse - userTeam.spentPurse).toFixed(2) : '120.00'} Cr</span> remaining purse.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentTab('auction')}
              className="px-5 py-3 rounded-xl bg-[#F5B942] hover:bg-[#ffc95c] text-[#080D1A] font-extrabold text-xs shadow-md shadow-[#F5B942]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Go to Live Arena</span>
            </button>

            <button
              onClick={() => setCurrentTab('retention')}
              className="px-4 py-3 rounded-xl bg-[#172338] hover:bg-[#1f2f4a] text-white font-bold text-xs border border-[#21304d] transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#F5B942]" />
              <span>Retention Desk</span>
            </button>

            <button
              onClick={() => setCurrentTab('trade')}
              className="px-4 py-3 rounded-xl bg-[#10192B] hover:bg-[#172338] text-slate-300 font-bold text-xs border border-[#21304d] transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 text-blue-400" />
              <span>Trade Centre</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRIC STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#10192B] border border-[#21304d]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Franchises</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {teams.length} Teams
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">₹1,200 Cr Total Purse</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#10192B] border border-[#21304d]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Player Pool Status</span>
            <Users className="w-4 h-4 text-[#20C997]" />
          </div>
          <div className="text-2xl font-extrabold text-[#20C997] font-mono tabular-nums">
            {availableCount} Left
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {soldCount} Sold / {unsoldCount} Unsold
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#10192B] border border-[#21304d]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Room</span>
            <Radio className="w-4 h-4 text-[#FF5263] animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono uppercase tracking-wider">
            {activeRoom ? activeRoom.code : 'No Room'}
          </div>
          <span className="text-[11px] text-[#20C997] mt-0.5 block">
            {activeRoom?.status === 'LIVE_AUCTION' ? 'Bidding in Session' : 'Lobby Ready'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#10192B] border border-[#21304d]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Top Acquisition</span>
            <TrendingUp className="w-4 h-4 text-[#F5B942]" />
          </div>
          {topBuy ? (
            <div>
              <div className="text-lg font-bold text-[#F5B942] font-heading truncate">
                {topBuy.name}
              </div>
              <span className="text-xs font-mono text-white font-bold tabular-nums">
                {formatCrores(topBuy.soldPrice || 0)}
              </span>
            </div>
          ) : (
            <div>
              <div className="text-lg font-bold text-slate-400">Marquee M1</div>
              <span className="text-[11px] text-slate-500">Opening Bids Pending</span>
            </div>
          )}
        </div>
      </div>

      {/* 2-COLUMN SPLIT: TEAMS PURSE OVERVIEW & RECENT ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 10 Teams Purse & Squad Summary (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#F5B942]" />
              <span>Franchise Purse & Squad Roster</span>
            </h2>
            <button
              onClick={() => setCurrentTab('teams')}
              className="text-xs text-[#F5B942] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All 10 Franchises</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map((team) => {
              const remaining = Number((team.totalPurse - team.spentPurse).toFixed(2));
              const pctSpent = Math.min(100, Math.round((team.spentPurse / team.totalPurse) * 100));
              const squadCount = players.filter((p) => p.soldTo === team.id || team.retainedPlayers.includes(p.id)).length;
              const isUser = team.id === user.selectedTeamId;

              return (
                <div
                  key={team.id}
                  className={`p-4 rounded-2xl bg-[#10192B] border transition-all ${
                    isUser
                      ? 'border-[#F5B942] ring-1 ring-[#F5B942]/30 shadow-md'
                      : 'border-[#21304d] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <TeamEmblem code={team.code} size="sm" />
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          {team.name}
                          {isUser && (
                            <span className="text-[9px] font-mono px-1 py-0.2 bg-[#F5B942] text-[#080D1A] rounded font-extrabold">
                              YOU
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Squad: {squadCount} / {team.maxSquad} (Min {team.minSquad})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#20C997] tabular-nums block">
                        ₹{remaining.toFixed(2)} Cr
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Spent: ₹{team.spentPurse.toFixed(2)} Cr
                      </span>
                    </div>
                  </div>

                  {/* Purse progress bar */}
                  <div className="w-full bg-[#172338] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#F5B942] h-full rounded-full transition-all"
                      style={{ width: `${pctSpent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Activity Stream (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>War Room Feed</span>
            </h2>
            <span className="text-[11px] text-slate-400">Real-time Log</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#10192B] border border-[#21304d] space-y-3 max-h-[500px] overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No recent activity</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="text-xs pb-3 border-b border-[#21304d]/60 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span
                      className={`font-bold uppercase tracking-wider ${
                        act.type === 'sold'
                          ? 'text-[#20C997]'
                          : act.type === 'bid'
                          ? 'text-[#F5B942]'
                          : act.type === 'retention'
                          ? 'text-blue-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {act.type}
                    </span>
                    <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-200 leading-snug">{act.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
