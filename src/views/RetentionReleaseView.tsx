/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Player, IPLTeam } from '../types/auction';
import { TeamEmblem } from '../components/TeamEmblem';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { formatCrores, RETENTION_TIERS } from '../data/iplData';
import {
  UserCheck,
  UserX,
  Shield,
  DollarSign,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Lock,
  Check,
} from 'lucide-react';

export const RetentionReleaseView: React.FC = () => {
  const {
    teams,
    players,
    user,
    setUserTeam,
    retainPlayer,
    retainMultiplePlayers,
    releasePlayer,
    confirmTeamRetention,
    activeRoom,
    setInspectedPlayer,
    setCurrentTab,
  } = useAuction();

  // Active viewing/managing franchise tab (defaults to user's selected team or CSK)
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>(
    user.selectedTeamId || 'csk'
  );
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const currentTeam = teams.find((t) => t.id === selectedFranchiseId) || teams[0];
  const remainingPurse = Number((currentTeam.totalPurse - currentTeam.spentPurse).toFixed(2));
  const remainingSlots = Math.max(0, 6 - currentTeam.retainedPlayers.length);

  // Players currently retained by this franchise
  const squadPlayers = useMemo(() => {
    return players.filter(
      (p) =>
        currentTeam.retainedPlayers.includes(p.id) ||
        (p.soldTo === currentTeam.id && p.status === 'retained')
    );
  }, [players, currentTeam]);

  // STABLE, STRICT TEAM-WISE CANDIDATES:
  // When CSK is selected -> ONLY CSK players.
  // When MI is selected -> ONLY MI players.
  // Never display another team's players in the selected team's retention section.
  const candidatePlayers = useMemo(() => {
    return players.filter(
      (p) =>
        p.status === 'available' &&
        (p.teamId === currentTeam.id || p.previousTeam === currentTeam.code)
    );
  }, [players, currentTeam]);

  // Next retention tier calculation
  const nextSlotIndex = currentTeam.retainedPlayers.length;
  const nextTier = RETENTION_TIERS[nextSlotIndex] || { cost: 18.0, label: 'Standard Slot' };

  // Check if retention decision is confirmed in active room
  const isConfirmed = Boolean(activeRoom?.retentions?.[currentTeam.id]?.isConfirmed);

  const handleToggleSelect = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const handleSelectMax = () => {
    const toPick = candidatePlayers.slice(0, remainingSlots).map((p) => p.id);
    setSelectedPlayerIds(toPick);
  };

  const handleClearSelect = () => {
    setSelectedPlayerIds([]);
  };

  const handleRetainSingle = (player: Player) => {
    const res = retainPlayer(currentTeam.id, player.id);
    setNotification({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    setSelectedPlayerIds((prev) => prev.filter((id) => id !== player.id));
    setTimeout(() => setNotification(null), 3500);
  };

  const handleBatchRetain = () => {
    if (selectedPlayerIds.length === 0) return;
    const res = retainMultiplePlayers(currentTeam.id, selectedPlayerIds);
    setNotification({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    setSelectedPlayerIds([]);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRelease = (player: Player) => {
    const res = releasePlayer(currentTeam.id, player.id);
    setNotification({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleLockConfirmation = () => {
    if (activeRoom) {
      confirmTeamRetention(currentTeam.id);
    }
    setNotification({
      type: 'success',
      message: `Retention decisions confirmed and verified for ${currentTeam.name}!`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 border shadow-lg animate-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-[#20C997]/15 border-[#20C997] text-white'
              : 'bg-[#FF5263]/15 border-[#FF5263] text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-[#20C997] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#FF5263] shrink-0" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header and Franchise Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-heading">
            Squad Retention & Release Desk
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Official BCCI retention limits: Max 6 retentions per franchise with structured purse deductions.
          </p>
          <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-300">
            ℹ️ Initial 2026 baseline roster for IPL 2027 simulation game. Not final confirmed 2027 squads.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('auction')}
            className="px-4 py-2.5 rounded-xl bg-[#F5B942] hover:bg-[#ffc95c] text-[#080D1A] font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Enter Live Auction Arena</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 10 TEAMS SELECTOR STRIP */}
      <div className="p-3.5 rounded-2xl bg-[#10192B] border border-[#21304d]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Select Franchise to View & Retain Players (10 IPL Teams)
        </span>
        <div className="flex flex-wrap gap-2">
          {teams.map((t) => {
            const isCurrent = t.id === currentTeam.id;
            const count = t.retainedPlayers.length;

            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedFranchiseId(t.id);
                  setUserTeam(t.id);
                  setSelectedPlayerIds([]);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#F5B942] text-[#080D1A] shadow-md font-extrabold scale-105'
                    : 'bg-[#172338] text-slate-300 hover:text-white hover:bg-[#1f2f4a] border border-[#21304d]'
                }`}
              >
                <TeamEmblem code={t.code} size="xs" />
                <span>{t.code}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isCurrent ? 'bg-black/20 text-[#080D1A]' : 'bg-black/40 text-slate-400'
                  }`}
                >
                  {count}/6
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUMMARY BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-3xl bg-[#10192B] border border-[#21304d]">
        <div className="p-3 rounded-2xl bg-[#080D1A] border border-[#21304d]">
          <span className="text-xs text-slate-400 block mb-0.5">Retained Players</span>
          <span className="text-2xl font-extrabold font-mono text-[#F5B942] tabular-nums">
            {currentTeam.retainedPlayers.length} / 6 Max
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {remainingSlots} retention slots available
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#080D1A] border border-[#21304d]">
          <span className="text-xs text-slate-400 block mb-0.5">Remaining Purse</span>
          <span className="text-2xl font-extrabold font-mono text-[#20C997] tabular-nums">
            ₹{remainingPurse.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Initial: ₹{currentTeam.totalPurse.toFixed(2)} Cr
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#080D1A] border border-[#21304d]">
          <span className="text-xs text-slate-400 block mb-0.5">Retention Deductions</span>
          <span className="text-2xl font-extrabold font-mono text-[#FF5263] tabular-nums">
            ₹{currentTeam.spentPurse.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Purse deducted before auction
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#080D1A] border border-[#21304d]">
          <span className="text-xs text-slate-400 block mb-0.5">Next Retention Tier</span>
          <span className="text-xl font-extrabold font-mono text-blue-400 tabular-nums">
            ₹{nextTier.cost.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            {nextTier.label}
          </span>
        </div>
      </div>

      {/* RETENTION RULES BREAKDOWN STRIP */}
      <div className="p-4 rounded-2xl bg-[#10192B]/70 border border-[#21304d] text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#F5B942] shrink-0" />
          <span>
            <strong>BCCI Retention Tier Scale:</strong> Slot 1 (₹18 Cr) · Slot 2 (₹14 Cr) · Slot 3 (₹11 Cr) · Slot 4 (₹18 Cr) · Slot 5 (₹14 Cr) · Uncapped (₹4 Cr).
          </span>
        </div>
      </div>

      {/* 2-COLUMN VIEW: CURRENT SQUAD vs RETENTION CANDIDATES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CURRENT SQUAD (Can Release) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#20C997]" />
              <span>
                Retained {currentTeam.name} Squad ({squadPlayers.length} / 6)
              </span>
            </h2>
            <span className="text-xs text-slate-400">{remainingSlots} slots left</span>
          </div>

          {squadPlayers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#10192B] border border-[#21304d]">
              <p className="text-xs text-slate-400">
                No players currently retained for {currentTeam.name}. Retain key candidates from the right panel!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {squadPlayers.map((player, idx) => {
                const tier = RETENTION_TIERS[idx] || { cost: player.soldPrice || 18.0 };
                return (
                  <div
                    key={player.id}
                    className="p-3.5 rounded-2xl bg-[#10192B] border border-[#21304d] flex items-center justify-between gap-3 hover:border-slate-500 transition-colors"
                  >
                    <div
                      onClick={() => setInspectedPlayer(player)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <PlayerAvatar player={player} size="sm" showRoleBadge />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                            Slot {idx + 1}
                          </span>
                          <span className="block text-sm font-bold text-white truncate hover:text-[#F5B942] transition-colors">
                            {player.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {player.role} · {player.country} {player.isOverseas ? '✈️' : '🇮🇳'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Deduction</span>
                        <span className="text-xs font-mono font-bold text-[#F5B942] tabular-nums">
                          ₹{tier.cost.toFixed(2)} Cr
                        </span>
                      </div>

                      <button
                        onClick={() => handleRelease(player)}
                        className="px-3 py-1.5 rounded-xl bg-[#172338] hover:bg-[#FF5263] text-slate-300 hover:text-white font-bold text-xs border border-[#21304d] hover:border-[#FF5263] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Release</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CANDIDATES TO RETAIN (STRICTLY THIS TEAM ONLY) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#F5B942]" />
                <span>Available {currentTeam.code} Candidates ({candidatePlayers.length})</span>
              </h2>
              <span className="text-xs text-slate-400">
                Next Slot: ₹{nextTier.cost} Cr · Strictly {currentTeam.name} roster
              </span>
            </div>

            <div className="flex items-center gap-2">
              {candidatePlayers.length > 0 && remainingSlots > 0 && (
                <>
                  <button
                    onClick={handleSelectMax}
                    className="text-[11px] text-[#F5B942] hover:underline cursor-pointer font-semibold"
                  >
                    Select Max ({remainingSlots})
                  </button>
                  {selectedPlayerIds.length > 0 && (
                    <button
                      onClick={handleClearSelect}
                      className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* BATCH RETAIN BAR */}
          {selectedPlayerIds.length > 0 && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-[#172338] to-[#10192B] border border-[#F5B942] flex items-center justify-between gap-3 animate-in fade-in">
              <span className="text-xs text-white font-semibold">
                Selected: <strong className="text-[#F5B942] font-mono">{selectedPlayerIds.length}</strong> player(s)
              </span>
              <button
                onClick={handleBatchRetain}
                className="px-4 py-2 rounded-xl bg-[#F5B942] hover:bg-[#ffc95c] text-[#080D1A] font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>Retain Selected ({selectedPlayerIds.length})</span>
              </button>
            </div>
          )}

          {remainingSlots === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#10192B] border border-[#21304d]">
              <p className="text-xs text-[#20C997] font-semibold">
                Maximum 6 retentions reached for {currentTeam.name}. Remaining players will enter the live auction pool!
              </p>
            </div>
          ) : candidatePlayers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#10192B] border border-[#21304d]">
              <p className="text-xs text-slate-400">
                All available {currentTeam.name} players have been retained.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {candidatePlayers.map((player) => {
                const isChecked = selectedPlayerIds.includes(player.id);

                return (
                  <div
                    key={player.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'bg-[#172338] border-[#F5B942]'
                        : 'bg-[#10192B] border-[#21304d] hover:border-slate-500'
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSelect(player.id)}
                      className="w-4 h-4 rounded text-[#F5B942] focus:ring-0 focus:ring-offset-0 bg-[#080D1A] border-[#21304d] cursor-pointer"
                    />

                    {/* Player Info */}
                    <div
                      onClick={() => setInspectedPlayer(player)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <PlayerAvatar player={player} size="sm" showRoleBadge />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="block text-sm font-bold text-white truncate hover:text-[#F5B942] transition-colors">
                            {player.name}
                          </span>
                          {player.marquee && (
                            <span className="text-[10px] text-[#F5B942] font-black">★</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{player.role}</span>
                          <span>·</span>
                          <span>{player.country}</span>
                          <span>·</span>
                          <span className="text-[#F5B942] font-mono text-[11px]">
                            Simulated Base: ₹{player.basePrice} Cr
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Retain Action */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleRetainSingle(player)}
                        disabled={remainingPurse < nextTier.cost}
                        className="px-3.5 py-1.5 rounded-xl bg-[#F5B942] hover:bg-[#ffc95c] disabled:opacity-40 text-[#080D1A] font-extrabold text-xs shadow transition-all cursor-pointer flex items-center gap-1"
                        title={`Retain ${player.name} for ₹${nextTier.cost} Cr`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Retain (₹{nextTier.cost} Cr)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Card */}
      <div className="p-6 rounded-3xl bg-[#10192B] border border-[#21304d] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-sm font-bold text-white block">
            Lock & Verify {currentTeam.name} Retention Decisions
          </span>
          <span className="text-xs text-slate-400">
            {squadPlayers.length} player(s) retained · Remaining auction purse: ₹{remainingPurse.toFixed(2)} Cr
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLockConfirmation}
            className="px-5 py-3 rounded-2xl bg-[#20C997] hover:bg-[#2ae0ab] text-[#080D1A] font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>CONFIRM RETENTION FOR {currentTeam.code}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
