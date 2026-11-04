/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuction } from '../context/AuctionContext';
import { TeamEmblem } from '../components/TeamEmblem';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { formatCrores } from '../data/iplData';
import { Trophy, TrendingUp, DollarSign, Award, Users, Filter, Crown, Medal } from 'lucide-react';

export const AuctionHistoryView: React.FC = () => {
  const { players, teams, setInspectedPlayer } = useAuction();
  const [filterTeam, setFilterTeam] = useState<string>('All');

  // Sold & Retained players
  const acquiredPlayers = players.filter((p) => p.status === 'sold' || p.status === 'retained');

  // Top 5 most expensive buys
  const topBuys = [...acquiredPlayers]
    .filter((p) => p.soldPrice)
    .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
    .slice(0, 5);

  // Filtered roster
  const displayedPlayers = acquiredPlayers.filter((p) => {
    if (filterTeam === 'All') return true;
    return p.soldTo === filterTeam;
  });

  // Calculate team scores to determine projected / current winner
  const rankedTeams = useMemo(() => {
    const list = teams.map((team) => {
      const squad = players.filter(
        (p) => p.soldTo === team.id || team.retainedPlayers.includes(p.id)
      );
      const overseasCount = squad.filter((p) => p.isOverseas).length;
      const marqueeCount = squad.filter((p) => p.marquee).length;

      let depthScore = 0;
      if (squad.length >= 22) depthScore = 25;
      else if (squad.length >= 18) depthScore = 22;
      else if (squad.length >= 15) depthScore = 18;
      else if (squad.length >= 10) depthScore = 12;
      else if (squad.length > 0) depthScore = Math.round((squad.length / 18) * 15);

      const batters = squad.filter((p) => p.role === 'Batter').length;
      const bowlers = squad.filter((p) => p.role === 'Bowler').length;
      const allRounders = squad.filter((p) => p.role === 'All-Rounder').length;
      const wicketkeepers = squad.filter((p) => p.role === 'Wicketkeeper').length;

      let balanceScore = 0;
      balanceScore += Math.min(7, Math.round((batters / 4) * 7));
      balanceScore += Math.min(7, Math.round((bowlers / 5) * 7));
      balanceScore += Math.min(6, Math.round((allRounders / 2) * 6));
      balanceScore += Math.min(5, Math.round((wicketkeepers / 1.5) * 5));

      let starScore = Math.min(15, marqueeCount * 5);
      const totalMatches = squad.reduce((acc, p) => acc + (p.iplStats?.matches || 0), 0);
      if (totalMatches >= 300) starScore += 10;
      else if (totalMatches >= 150) starScore += 5;

      let efficiencyScore = 0;
      if (team.spentPurse >= 90.0 && squad.length >= 18) efficiencyScore = 20;
      else if (team.spentPurse >= 75.0) efficiencyScore = 15;
      else if (team.spentPurse > 0) efficiencyScore = 10;

      const totalScore = Math.min(100, depthScore + balanceScore + starScore + efficiencyScore);

      return {
        team,
        squadSize: squad.length,
        overseasCount,
        marqueeCount,
        totalScore,
        spent: team.spentPurse,
        remaining: team.totalPurse - team.spentPurse,
      };
    });

    list.sort((a, b) => b.totalScore - a.totalScore);
    return list;
  }, [teams, players]);

  const leadingTeam = rankedTeams[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-heading">
          Auction History & Leaderboards
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Historical records, championship standings, and franchise squad financial breakdowns.
        </p>
      </div>

      {/* CURRENT AUCTION LEADER / WINNER BANNER */}
      {leadingTeam && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#10192B] via-[#1a2842] to-[#10192B] border-2 border-[#F5B942]/70 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <TeamEmblem code={leadingTeam.team.code} size="lg" />
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#F5B942] text-[#080D1A] flex items-center justify-center font-black text-xs shadow">
                <Crown className="w-3.5 h-3.5 text-[#080D1A]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5B942] uppercase tracking-wider mb-0.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Current Auction Leader & Projected Winner</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
                {leadingTeam.team.name}
              </h2>
              <span className="text-xs text-slate-300">
                Squad: <strong className="text-white">{leadingTeam.squadSize}/25</strong> · Marquee Stars: <strong className="text-[#F5B942]">{leadingTeam.marqueeCount}</strong> · Spent: <strong className="text-white">₹{leadingTeam.spent.toFixed(2)} Cr</strong>
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#080D1A] border border-[#F5B942]/40 text-center min-w-[130px]">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
              Squad Rating
            </span>
            <span className="text-3xl font-black font-mono text-[#F5B942] tabular-nums">
              {leadingTeam.totalScore}
            </span>
            <span className="text-[10px] text-slate-500 block">/ 100</span>
          </div>
        </div>
      )}

      {/* TOP 5 RECORD SIGNINGS MARQUEE STRIP */}
      <div className="p-6 rounded-3xl bg-[#10192B] border border-[#21304d]">
        <h2 className="text-base font-bold text-white font-heading mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#F5B942]" />
          <span>Top 5 Record Buys of the 2027 Mega Auction</span>
        </h2>

        {topBuys.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center italic">
            No completed purchases yet. Bid on marquee players in the Live Arena!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {topBuys.map((player, idx) => {
              const team = teams.find((t) => t.id === player.soldTo);
              return (
                <div
                  key={player.id}
                  onClick={() => setInspectedPlayer(player)}
                  className="p-4 rounded-2xl bg-[#080D1A] border border-[#21304d] hover:border-[#F5B942]/50 transition-all cursor-pointer text-center relative group"
                >
                  <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#F5B942] text-[#080D1A] font-extrabold text-[10px] flex items-center justify-center font-mono">
                    #{idx + 1}
                  </div>

                  <PlayerAvatar player={player} size="md" className="mx-auto mb-2" />
                  <h3 className="font-extrabold text-white text-xs truncate group-hover:text-[#F5B942] transition-colors">
                    {player.name}
                  </h3>

                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    {team && <TeamEmblem code={team.code} size="sm" />}
                    <span className="text-xs font-mono font-bold text-[#F5B942] tabular-nums">
                      {formatCrores(player.soldPrice || 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FRANCHISE SPEND & PURSE TABLE */}
      <div className="p-6 rounded-3xl bg-[#10192B] border border-[#21304d] overflow-x-auto">
        <h2 className="text-base font-bold text-white font-heading mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#20C997]" />
          <span>Franchise Expenditure Summary</span>
        </h2>

        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-[#21304d] text-slate-400 font-semibold uppercase tracking-wider">
              <th className="pb-3">Franchise</th>
              <th className="pb-3 text-center">Squad Size</th>
              <th className="pb-3 text-center">Overseas</th>
              <th className="pb-3 text-right">Total Spent</th>
              <th className="pb-3 text-right">Remaining Purse</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#21304d]/60 font-mono">
            {teams.map((t) => {
              const remaining = Number((t.totalPurse - t.spentPurse).toFixed(2));
              const squad = players.filter((p) => p.soldTo === t.id || t.retainedPlayers.includes(p.id));
              const overseas = squad.filter((p) => p.isOverseas).length;

              return (
                <tr key={t.id} className="hover:bg-[#172338]/40 transition-colors">
                  <td className="py-3 font-sans font-bold text-white flex items-center gap-2">
                    <TeamEmblem code={t.code} size="sm" />
                    <span>{t.name}</span>
                  </td>
                  <td className="py-3 text-center tabular-nums text-slate-300">
                    {squad.length} / {t.maxSquad}
                  </td>
                  <td className="py-3 text-center tabular-nums text-blue-400">
                    {overseas} / {t.maxOverseas}
                  </td>
                  <td className="py-3 text-right tabular-nums text-slate-300">
                    ₹{t.spentPurse.toFixed(2)} Cr
                  </td>
                  <td className="py-3 text-right font-bold tabular-nums text-[#20C997]">
                    ₹{remaining.toFixed(2)} Cr
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* COMPLETED DRAFT ROSTERS */}
      <div className="p-6 rounded-3xl bg-[#10192B] border border-[#21304d] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Acquired Squad Rosters ({displayedPlayers.length} Players)</span>
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Team:</span>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="bg-[#080D1A] border border-[#21304d] rounded-lg px-2.5 py-1.5 text-white outline-none cursor-pointer"
            >
              <option value="All">All 10 Franchises</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {displayedPlayers.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center italic">
            No players currently assigned under this filter.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {displayedPlayers.map((player) => {
              const team = teams.find((t) => t.id === player.soldTo);
              return (
                <div
                  key={player.id}
                  onClick={() => setInspectedPlayer(player)}
                  className="p-3 rounded-2xl bg-[#080D1A] border border-[#21304d] hover:border-slate-500 transition-colors cursor-pointer flex items-center gap-3"
                >
                  <PlayerAvatar player={player} size="sm" showRoleBadge />
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-white truncate">
                      {player.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {team?.code} · {formatCrores(player.soldPrice || 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
