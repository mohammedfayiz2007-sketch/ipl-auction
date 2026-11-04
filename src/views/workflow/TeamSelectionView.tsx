/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { IPLTeam } from '../../types/auction';
import { TeamEmblem } from '../../components/TeamEmblem';
import { Shield, Check, MapPin, Trophy, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface TeamSelectionViewProps {
  onComplete: () => void;
  onNext?: () => void;
}

export const TeamSelectionView: React.FC<TeamSelectionViewProps> = ({ onComplete, onNext }) => {
  const { activeRoom, teams, user, claimFranchiseInRoom, setWorkflowStep } = useAuction();
  const [teamToConfirm, setTeamToConfirm] = useState<IPLTeam | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!activeRoom) return null;

  const isHost = Boolean(activeRoom.hostId === user.id);
  const myAssignedTeam = Object.entries(activeRoom.teamAssignments).find(
    ([_, assignment]) => assignment.userId === user.id
  );
  const hasSelectedTeam = Boolean(myAssignedTeam);

  // Total selected teams
  const selectedCount = Object.keys(activeRoom.teamAssignments).length;

  const handleSelectTeam = (team: IPLTeam) => {
    // Check if team is already claimed by someone else
    const currentOwner = activeRoom.teamAssignments[team.id];
    if (currentOwner && currentOwner.userId !== user.id) {
      setErrorMsg(`${team.name} is already reserved by ${currentOwner.userName}.`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setTeamToConfirm(team);
  };

  const confirmSelection = () => {
    if (!teamToConfirm) return;
    claimFranchiseInRoom(teamToConfirm.id);
    setTeamToConfirm(null);
    if (!isHost) {
      onComplete();
    }
  };

  const handleHostNext = () => {
    if (!hasSelectedTeam) {
      setErrorMsg('Please select your franchise before proceeding to Step 5 (10 Teams Ready).');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }
    if (onNext) {
      onNext();
    } else {
      setWorkflowStep('READY_CHECK');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F5B942] mb-1">
            <span>STEP 4 OF 10</span>
            <span>·</span>
            <span>FRANCHISE ALLOCATION</span>
            {isHost && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#F5B942] text-[#080D1A]">
                Host
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Select Your IPL Franchise
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Each participant can manage exactly one franchise. Once selected, the team is locked to your account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onComplete}
            className="px-3.5 py-2.5 rounded-2xl bg-[#10192B] hover:bg-[#172338] text-slate-300 font-semibold text-xs border border-[#21304d] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lobby</span>
          </button>

          <div className="p-3 rounded-2xl bg-[#10192B] border border-[#21304d] text-center min-w-[130px]">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
              Claimed
            </span>
            <span className="text-lg font-extrabold font-mono text-[#F5B942] tabular-nums">
              {selectedCount} / 10
            </span>
          </div>

          {/* NEXT BUTTON ONLY FOR HOST */}
          {isHost && (
            <button
              onClick={handleHostNext}
              className="px-5 py-2.5 rounded-2xl bg-[#F5B942] hover:bg-[#ffc95c] text-[#080D1A] font-extrabold text-xs shadow-lg shadow-[#F5B942]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#FF5263]/15 border border-[#FF5263] text-white text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-[#FF5263] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid of 10 Franchises */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => {
          const assignment = activeRoom.teamAssignments[team.id];
          const isSelectedByMe = assignment?.userId === user.id;
          const isReservedByOther = assignment && assignment.userId !== user.id;

          return (
            <div
              key={team.id}
              className={`p-5 rounded-3xl border transition-all ${
                isSelectedByMe
                  ? 'bg-[#172338] border-[#F5B942] ring-2 ring-[#F5B942]/30 shadow-xl'
                  : isReservedByOther
                  ? 'bg-[#080D1A]/50 border-[#21304d] opacity-60'
                  : 'bg-[#10192B] border-[#21304d] hover:border-slate-500'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3.5">
                  <TeamEmblem code={team.code} size="lg" />
                  <div>
                    <h2 className="text-base font-bold text-white font-heading">{team.name}</h2>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{team.homeGround}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#20C997] block">
                    ₹{team.totalPurse.toFixed(2)} Cr
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Mega Auction Purse</span>
                </div>
              </div>

              {/* Trophies & Owner */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#080D1A] border border-[#21304d] text-center text-xs mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 block">Championships</span>
                  <span className="font-bold text-[#F5B942]">
                    {team.trophies.length > 0 ? `${team.trophies.length}x Trophies 🏆` : 'Finalist'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Squad Capacity</span>
                  <span className="font-bold text-white">18 - 25 Players</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2 border-t border-[#21304d]/60">
                <span className="text-[11px] text-slate-400">
                  {isReservedByOther ? `Claimed by ${assignment.userName}` : 'Open for Selection'}
                </span>

                {isSelectedByMe ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5B942] text-[#080D1A] font-extrabold text-xs">
                    <Check className="w-4 h-4" />
                    <span>Selected</span>
                  </div>
                ) : isReservedByOther ? (
                  <button
                    disabled
                    className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-500 font-semibold text-xs cursor-not-allowed"
                  >
                    Reserved
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectTeam(team)}
                    className="px-4 py-2 rounded-xl bg-[#172338] hover:bg-[#F5B942] text-slate-200 hover:text-[#080D1A] font-bold text-xs border border-[#21304d] hover:border-[#F5B942] transition-colors cursor-pointer"
                  >
                    Select {team.code}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Host Bottom Next Bar */}
      {isHost && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#172338] via-[#10192B] to-[#172338] border-2 border-[#F5B942]/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#F5B942]/15 border border-[#F5B942]/30 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#F5B942]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#F5B942] text-[#080D1A]">
                  Host Workflow Control
                </span>
                <span className="text-xs font-bold text-white font-heading">
                  Step 4: Franchise Allocation
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {hasSelectedTeam
                  ? 'Your franchise has been selected. Proceed to Step 5 to review the 10-team readiness checklist.'
                  : 'Select your franchise from the list above, then click Next to advance.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleHostNext}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#F5B942] hover:bg-[#ffc95c] text-[#080D1A] font-extrabold text-xs shadow-lg shadow-[#F5B942]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            <span>Next: 10 Ready</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {teamToConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-[#080D1A] border-2 border-[#F5B942] rounded-3xl p-6 text-center shadow-2xl">
            <TeamEmblem code={teamToConfirm.code} size="xl" className="mx-auto mb-4" />
            <h2 className="text-xl font-extrabold text-white font-heading">
              Confirm Franchise Reservation
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Are you sure you want to take command of{' '}
              <strong className="text-[#F5B942]">{teamToConfirm.name}</strong>? Other participants
              will not be able to choose this team.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTeamToConfirm(null)}
                className="w-1/2 py-2.5 rounded-xl bg-[#172338] hover:bg-[#1f2f4a] text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSelection}
                className="w-1/2 py-2.5 rounded-xl bg-[#F5B942] hover:bg-[#ffc95c] text-[#080D1A] font-extrabold text-xs shadow transition-all cursor-pointer"
              >
                Confirm Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
