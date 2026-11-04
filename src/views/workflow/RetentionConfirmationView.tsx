/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { TeamEmblem } from '../../components/TeamEmblem';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { formatCrores } from '../../data/iplData';
import {
  CheckCircle2,
  Clock,
  Shield,
  Lock,
  ArrowRight,
  Cpu,
  Check,
  AlertCircle,
} from 'lucide-react';

export const RetentionConfirmationView: React.FC<{ onFinalize: () => void }> = ({
  onFinalize,
}) => {
  const {
    activeRoom,
    teams,
    players,
    user,
    confirmTeamRetention,
    autoConfirmBotRetentions,
  } = useAuction();

  if (!activeRoom) return null;

  const isHost = activeRoom.hostId === user.id;

  // Find user's team
  const userTeamId = Object.entries(activeRoom.teamAssignments).find(
    ([_, conf]) => conf.userId === user.id
  )?.[0] || user.selectedTeamId || 'csk';

  const userTeam = teams.find((t) => t.id === userTeamId) || teams[0];
  const userRetention = activeRoom.retentions[userTeam.id];
  const isUserConfirmed = Boolean(userRetention?.isConfirmed);

  // Retained players for user's team
  const retainedPlayers = players.filter((p) => userTeam.retainedPlayers.includes(p.id));

  // Count confirmed teams across the 10 franchises
  const confirmedCount = Object.values(activeRoom.retentions).filter((r) => r.isConfirmed).length;
  const allTenConfirmed = confirmedCount === 10;

  const handleConfirmMyRetention = () => {
    confirmTeamRetention(userTeam.id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#10192B] border border-[#21304d] shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F5B942] mb-1.5">
              <span>STEP 7 & 8 OF 10</span>
              <span>·</span>
              <span>CENTRAL RETENTION VERIFICATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Retention Decision Confirmation
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              All 10 franchise managers must verify and lock their retention submissions before the live mega auction can commence.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#080D1A] border border-[#21304d] text-center min-w-[160px]">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
              Retention Progress
            </span>
            <span
              className={`text-lg font-black font-mono tabular-nums block ${
                allTenConfirmed ? 'text-[#20C997]' : 'text-[#F5B942]'
              }`}
            >
              {confirmedCount} / 10 Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Manager's Decision Card vs Central Host Progress Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Current Manager's Final Decision */}
        <div className="p-6 rounded-3xl bg-[#10192B] border-2 border-[#21304d] flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#21304d]">
              <div className="flex items-center gap-3">
                <TeamEmblem code={userTeam.code} size="md" />
                <div>
                  <h2 className="text-base font-bold text-white font-heading">{userTeam.name}</h2>
                  <span className="text-xs text-slate-400">Your Assigned Franchise</span>
                </div>
              </div>

              {isUserConfirmed ? (
                <span className="px-3 py-1 rounded-xl bg-[#20C997]/20 border border-[#20C997] text-[#20C997] text-xs font-bold font-mono flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>CONFIRMED</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>PENDING SUBMISSION</span>
                </span>
              )}
            </div>

            {/* Financial Ledger Summary */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#080D1A] border border-[#21304d] mb-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Total Retention Cost
                </span>
                <span className="text-lg font-mono font-bold text-[#FF5263] tabular-nums">
                  ₹{userTeam.spentPurse.toFixed(2)} Cr
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Remaining Auction Purse
                </span>
                <span className="text-lg font-mono font-bold text-[#20C997] tabular-nums">
                  ₹{(userTeam.totalPurse - userTeam.spentPurse).toFixed(2)} Cr
                </span>
              </div>
            </div>

            {/* Retained Players List */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Retained Players ({retainedPlayers.length} / 6)
              </span>

              {retainedPlayers.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-3">
                  Zero players retained. Entire ₹120.00 Cr purse will be available in live auction!
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {retainedPlayers.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-[#080D1A] border border-[#21304d] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-500 font-mono font-bold text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-white">{p.name}</span>
                        <span className="text-slate-400 text-[11px]">({p.role})</span>
                      </div>
                      <span className="font-mono text-[#F5B942] font-bold">
                        {formatCrores(p.soldPrice || p.basePrice)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Button */}
          <div className="pt-4 border-t border-[#21304d]">
            {!isUserConfirmed ? (
              <button
                onClick={handleConfirmMyRetention}
                className="w-full py-3.5 rounded-2xl bg-[#20C997] hover:bg-[#2ae0ab] text-[#080D1A] font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>CONFIRM RETENTION FOR {userTeam.code}</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-[#080D1A] border border-[#20C997]/30 text-center text-xs text-[#20C997] font-semibold flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Decision Locked. Waiting for other franchises to confirm...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Central Host Retention Progress Dashboard */}
        <div className="p-6 rounded-3xl bg-[#10192B] border border-[#21304d] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#21304d]">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-heading flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#F5B942]" />
                <span>Central Retention Status Dashboard</span>
              </h2>
              <span className="text-xs font-mono text-[#F5B942]">
                {confirmedCount} / 10 Franchises
              </span>
            </div>

            {/* 10 Teams Status List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {teams.map((t) => {
                const ret = activeRoom.retentions[t.id];
                const isConfirmed = Boolean(ret?.isConfirmed);
                const retainedCount = t.retainedPlayers.length;

                return (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl bg-[#080D1A] border border-[#21304d] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <TeamEmblem code={t.code} size="sm" />
                      <div>
                        <span className="font-bold text-white block">{t.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {retainedCount} Retained · Remaining: ₹{(t.totalPurse - t.spentPurse).toFixed(2)} Cr
                        </span>
                      </div>
                    </div>

                    <div>
                      {isConfirmed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/40 uppercase">
                          Confirmed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 uppercase">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Host Auto-Confirm Bot Teams */}
            {isHost && confirmedCount < 10 && (
              <button
                onClick={autoConfirmBotRetentions}
                className="mt-3 w-full py-2 rounded-xl bg-[#172338] hover:bg-[#1f2f4a] text-blue-300 font-bold text-xs border border-blue-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Auto-Confirm Decisions for AI Bot Teams</span>
              </button>
            )}
          </div>

          {/* Host Finalize Action */}
          <div className="pt-4 border-t border-[#21304d]">
            {isHost ? (
              <button
                onClick={onFinalize}
                disabled={!allTenConfirmed}
                className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  allTenConfirmed
                    ? 'bg-[#F5B942] hover:bg-[#ffc95c] text-[#080D1A]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>FINALIZE ALL RETENTIONS & COMPILE AUCTION POOL</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-[#080D1A] text-center text-xs text-slate-400">
                Host will finalize the retention phase once all 10 franchises confirm.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
