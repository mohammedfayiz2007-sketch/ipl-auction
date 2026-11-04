/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { Player, IPLTeam } from '../../types/auction';
import { TeamEmblem } from '../../components/TeamEmblem';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { formatCrores, RETENTION_TIERS } from '../../data/iplData';
import {
  UserCheck,
  UserX,
  Shield,
  DollarSign,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Lock,
  Check,
  RotateCcw,
} from 'lucide-react';

export const RetentionDashboardView: React.FC<{ onProceedToConfirm: () => void }> = ({
  onProceedToConfirm,
}) => {
  const {
    activeRoom,
    teams,
    players,
    user,
    retainPlayer,
    retainMultiplePlayers,
    releasePlayer,
    confirmTeamRetention,
    setInspectedPlayer,
  } = useAuction();

  if (!activeRoom) return null;

  // User's assigned franchise in this room
  const myAssignedTeamId =
    Object.entries(activeRoom.teamAssignments).find(([_, conf]) => conf.userId === user.id)?.[0] ||
    user.selectedTeamId ||
    'csk';

  // Active viewing/managing franchise tab (defaults to user's assigned team)
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>(myAssignedTeamId);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [statusNotification, setStatusNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const currentTeam: IPLTeam =
    teams.find((t) => t.id === selectedFranchiseId) || teams[0];

  const remainingPurse = Number((currentTeam.totalPurse - currentTeam.spentPurse).toFixed(2));
  const remainingSlots = Math.max(0, 6 - currentTeam.retainedPlayers.length);

  // Players currently retained by this franchise
  const retainedList = useMemo(() => {
    return players.filter(
      (p) => currentTeam.retainedPlayers.includes(p.id) || (p.soldTo === currentTeam.id && p.status === 'retained')
    );
  }, [players, currentTeam]);

  // STABLE, STRICT TEAM-WISE CANDIDATES:
  // When CSK is selected -> ONLY CSK players.
  // When MI is selected -> ONLY MI players.
  // Never display another team's players in the selected team's retention section.
  const candidatePool = useMemo(() => {
    return players.filter(
      (p) =>
        p.status === 'available' &&
        (p.teamId === currentTeam.id || p.previousTeam === currentTeam.code)
    );
  }, [players, currentTeam]);

  // Next retention tier calculation
  const nextSlotIndex = currentTeam.retainedPlayers.length;
  const nextTier = RETENTION_TIERS[nextSlotIndex] || { cost: 18.0, label: 'Standard Slot' };

  // Check if this franchise has locked its retention decision
  const isTeamConfirmed = Boolean(activeRoom.retentions[currentTeam.id]?.isConfirmed);

  const handleToggleSelect = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const handleSelectAllCandidates = () => {
    const availableToPick = candidatePool.slice(0, remainingSlots).map((p) => p.id);
    setSelectedPlayerIds(availableToPick);
  };

  const handleClearSelection = () => {
    setSelectedPlayerIds([]);
  };

  const handleSingleRetain = (player: Player) => {
    const res = retainPlayer(currentTeam.id, player.id);
    setStatusNotification({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    setSelectedPlayerIds((prev) => prev.filter((id) => id !== player.id));
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const handleBatchRetain = () => {
    if (selectedPlayerIds.length === 0) return;
    const res = retainMultiplePlayers(currentTeam.id, selectedPlayerIds);
    setStatusNotification({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    setSelectedPlayerIds([]);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const handleRelease = (player: Player) => {
    const res = releasePlayer(currentTeam.id, player.id);
    setStatusNotification({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const handleLockConfirmation = () => {
    confirmTeamRetention(currentTeam.id);
    setStatusNotification({
      type: 'success',
      message: `Retention decisions successfully confirmed and locked for ${currentTeam.name}!`,
    });
    setTimeout(() => setStatusNotification(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Toast Alert */}
      {statusNotification && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 border shadow-xl animate-in slide-in-from-top-2 ${
            statusNotification.type === 'success'
              ? 'bg-[#20C997]/20 border-[#20C997] text-white'
              : 'bg-[#FF5263]/20 border-[#FF5263] text-white'
          }`}
        >
          {statusNotification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#20C997] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#FF5263] shrink-0" />
          )}
          <span className="text-xs font-semibold">{statusNotification.message}</span>
        </div>
      )}

      {/* Header & Disclaimer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#10192B] border border-[#21304d] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F5B942] mb-1.5">
            <span>STEP 6 OF 10</span>
            <span>·</span>
            <span>TEAM-WISE RETENTION DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading flex items-center gap-2.5">
            <span>Retention Desk:</span>
            <span className="text-[#F5B942]">{currentTeam.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Retain up to 6 players from {currentTeam.name}'s preloaded roster. Each retention deducts from your ₹120.00 Cr auction purse.
          </p>
          <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-300">
            ℹ️ Initial 2026 baseline roster for IPL 2027 simulation game. Not final confirmed 2027 squads.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TeamEmblem code={currentTeam.code} size="xl" />
        </div>
      </div>

      {/* 10 TEAMS SELECTOR TABS */}
      <div className="p-3.5 rounded-2xl bg-[#10192B] border border-[#21304d]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Select Franchise to Manage Retention (10 Official Teams)
        </span>
        <div className="flex flex-wrap gap-2">
          {teams.map((t) => {
            const isCurrent = t.id === currentTeam.id;
            const isConfirmed = Boolean(activeRoom.retentions[t.id]?.isConfirmed);
            const count = t.retainedPlayers.length;

            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedFranchiseId(t.id);
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
                {isConfirmed && <Check className="w-3 h-3 text-[#20C997]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#10192B] border border-[#21304d]">
          <span className="text-xs text-slate-400 block mb-0.5">Retained Players</span>
          <span className="text-2xl font-extrabold font-mono text-[#F5B942] tabular-nums">
            {currentTeam.retainedPlayers.length} / 6 Max
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
            {remainingSlots} retention slots remaining
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#10192B] border border-[#21304d]">
          <span className="text-xs text-slate-400 block mb-0.5">Starting Purse</span>
          <span className="text-2xl font-extrabold font-mono text-white tabular-nums">
            ₹{currentTeam.totalPurse.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Standard Mega Auction Cap</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#10192B] border border-[#21304d]">
          <span className="text-xs text-slate-400 block mb-0.5">Retention Deductions</span>
          <span className="text-2xl font-extrabold font-mono text-[#FF5263] tabular-nums">
            ₹{currentTeam.spentPurse.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Official BCCI scale deductions</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#10192B] border border-[#21304d]">
          <span className="text-xs text-slate-400 block mb-0.5">Available Auction Purse</span>
          <span className="text-2xl font-extrabold font-mono text-[#20C997] tabular-nums">
            ₹{remainingPurse.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">For live auction bidding</span>
        </div>
      </div>

      {/* BCCI Official Tier Deductions Strip */}
      <div className="p-3.5 rounded-2xl bg-[#10192B]/80 border border-[#21304d] text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#F5B942] shrink-0" />
          <span className="font-semibold text-white">BCCI Retention Slots & Purse Deductions:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px] font-mono">
          {RETENTION_TIERS.map((tier, idx) => {
            const isFilled = currentTeam.retainedPlayers.length > idx;
            const isNext = currentTeam.retainedPlayers.length === idx;
            return (
              <div
                key={tier.slot}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isFilled
                    ? 'bg-[#20C997]/15 border-[#20C997] text-[#20C997]'
                    : isNext
                    ? 'bg-[#F5B942]/15 border-[#F5B942] text-[#F5B942] ring-1 ring-[#F5B942]'
                    : 'bg-[#080D1A] border-[#21304d] text-slate-400'
                }`}
              >
                <span className="block font-bold">Slot {tier.slot}</span>
                <span>₹{tier.cost.toFixed(1)} Cr</span>
                {isFilled && <span className="block text-[9px] uppercase font-bold text-[#20C997]">Filled</span>}
                {isNext && <span className="block text-[9px] uppercase font-bold text-[#F5B942]">Next</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Squad Management Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMN 1: RETAINED SQUAD */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-heading flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#20C997]" />
              <span>
                Retained {currentTeam.code} Squad ({retainedList.length} / 6)
              </span>
            </h2>
            <span className="text-xs text-slate-400">
              {remainingSlots} slots remaining
            </span>
          </div>

          {retainedList.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#10192B] border border-[#21304d]">
              <p className="text-xs text-slate-400">
                No players currently retained for {currentTeam.name}. Select from the {candidatePool.length} available {currentTeam.code} players on the right!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {retainedList.map((player, idx) => {
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
                          <span className="block text-sm font-bold text-white truncate hover:text-[#F5B942]">
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
                        <span className="text-xs font-mono font-bold text-[#F5B942]">
                          ₹{tier.cost.toFixed(2)} Cr
                        </span>
                      </div>

                      <button
                        onClick={() => handleRelease(player)}
                        className="px-3 py-1.5 rounded-xl bg-[#172338] hover:bg-[#FF5263] text-slate-300 hover:text-white font-bold text-xs border border-[#21304d] transition-colors cursor-pointer flex items-center gap-1"
                        title="Release player back to available candidates"
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

        {/* COLUMN 2: CANDIDATES TO RETAIN (STRICTLY THIS TEAM ONLY) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white font-heading flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#F5B942]" />
                <span>Available {currentTeam.code} Candidates ({candidatePool.length})</span>
              </h2>
              <span className="text-[11px] text-slate-400">
                Only {currentTeam.name} players are shown here.
              </span>
            </div>

            <div className="flex items-center gap-2">
              {candidatePool.length > 0 && remainingSlots > 0 && (
                <>
                  <button
                    onClick={handleSelectAllCandidates}
                    className="text-[11px] text-[#F5B942] hover:underline cursor-pointer font-semibold"
                  >
                    Select Max ({remainingSlots})
                  </button>
                  {selectedPlayerIds.length > 0 && (
                    <button
                      onClick={handleClearSelection}
                      className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* BATCH RETAIN ACTION BAR (When checkboxes selected) */}
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
                Maximum 6 player retention limit reached for {currentTeam.name}!
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                To retain a different player, release one from the retained squad list on the left.
              </p>
            </div>
          ) : candidatePool.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#10192B] border border-[#21304d]">
              <p className="text-xs text-slate-400">
                All available {currentTeam.name} players have been retained.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {candidatePool.map((player) => {
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
                          <span className="block text-sm font-bold text-white truncate hover:text-[#F5B942]">
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

                    {/* Single Retain Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSingleRetain(player)}
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

      {/* Confirmation & Advance CTA */}
      <div className="p-6 rounded-3xl bg-[#10192B] border border-[#21304d] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white block">
              Lock & Verify {currentTeam.name} Decisions
            </span>
            {isTeamConfirmed ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#20C997]/20 border border-[#20C997] text-[#20C997] text-[10px] font-bold font-mono">
                LOCKED
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold font-mono">
                DECISION PENDING
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            {retainedList.length} player(s) retained · Remaining auction purse: ₹{remainingPurse.toFixed(2)} Cr
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isTeamConfirmed ? (
            <button
              onClick={handleLockConfirmation}
              className="px-5 py-3 rounded-2xl bg-[#F5B942] hover:bg-[#ffc95c] text-[#080D1A] font-extrabold text-xs shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>LOCK RETENTION FOR {currentTeam.code}</span>
            </button>
          ) : (
            <div className="px-4 py-2.5 rounded-2xl bg-[#080D1A] border border-[#20C997]/40 text-[#20C997] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{currentTeam.code} Retention Locked</span>
            </div>
          )}

          <button
            onClick={onProceedToConfirm}
            className="px-6 py-3.5 rounded-2xl bg-[#20C997] hover:bg-[#2fe8af] text-[#080D1A] font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>CENTRAL RETENTION CONFIRMATION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
