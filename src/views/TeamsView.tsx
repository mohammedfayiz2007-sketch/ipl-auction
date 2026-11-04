/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { IPLTeam } from '../types/auction';
import { TeamEmblem } from '../components/TeamEmblem';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Shield, Check, Users, Trophy, DollarSign, MapPin, AlertCircle } from 'lucide-react';
import { formatCrores } from '../data/iplData';

export const TeamsView: React.FC = () => {
  const { teams, players, user, setUserTeam, setInspectedPlayer, setCurrentTab } = useAuction();
  const [teamToConfirm, setTeamToConfirm] = useState<IPLTeam | null>(null);

  const handleSelectTeam = (team: IPLTeam) => {
    setTeamToConfirm(team);
  };

  const confirmTeamAssignment = () => {
    if (teamToConfirm) {
      setUserTeam(teamToConfirm.id);
      setTeamToConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-heading">
            Official IPL Franchises
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Choose your franchise for the 2027 Mega Auction. Each team commands a standard ₹120.00 Cr purse.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('retention')}
            className="px-4 py-2.5 rounded-xl bg-[#172338] hover:bg-[#1f2f4a] text-white font-bold text-xs border border-[#21304d] transition-colors cursor-pointer"
          >
            Manage Retention & Release →
          </button>
        </div>
      </div>

      {/* Grid of 10 Franchise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {teams.map((team) => {
          const remainingPurse = Number((team.totalPurse - team.spentPurse).toFixed(2));
          const squad = players.filter((p) => p.soldTo === team.id || team.retainedPlayers.includes(p.id));
          const overseasSquad = squad.filter((p) => p.isOverseas);
          const isSelected = user.selectedTeamId === team.id;

          return (
            <div
              key={team.id}
              className={`p-5 lg:p-6 rounded-3xl bg-[#10192B] border transition-all ${
                isSelected
                  ? 'border-[#F5B942] ring-2 ring-[#F5B942]/30 shadow-xl shadow-[#F5B942]/10'
                  : 'border-[#21304d] hover:border-slate-500'
              }`}
            >
              {/* Top franchise branding strip */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <TeamEmblem code={team.code} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white font-heading">{team.name}</h2>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#F5B942] text-[#080D1A] uppercase tracking-wide">
                          Your Franchise
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{team.homeGround}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block mb-0.5">Remaining Purse</span>
                  <span className="text-xl font-extrabold font-mono text-[#20C997] tabular-nums">
                    ₹{remainingPurse.toFixed(2)} Cr
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#080D1A] border border-[#21304d] text-center mb-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Squad Size</span>
                  <span className="text-sm font-bold font-mono text-white tabular-nums">
                    {squad.length} / {team.maxSquad}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Overseas</span>
                  <span className="text-sm font-bold font-mono text-blue-400 tabular-nums">
                    {overseasSquad.length} / {team.maxOverseas}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Trophies</span>
                  <span className="text-sm font-bold font-mono text-[#F5B942] tabular-nums">
                    {team.trophies.length > 0 ? `${team.trophies.length} 🏆` : '—'}
                  </span>
                </div>
              </div>

              {/* Squad Preview Mini-chips */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {squad.length > 0
                      ? `Active Squad (${squad.length} Players)`
                      : `Preloaded Roster (${players.filter((p) => p.teamId === team.id).length} Players)`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {squad.length > 0 ? 'Retained & Auction Wins' : 'Available for Retention'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {(squad.length > 0 ? squad : players.filter((p) => p.teamId === team.id)).map((player) => (
                    <button
                      key={player.id}
                      onClick={() => setInspectedPlayer(player)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer ${
                        player.status === 'retained' || player.status === 'sold'
                          ? 'bg-[#F5B942]/15 border-[#F5B942]/40 text-[#F5B942]'
                          : 'bg-[#172338] hover:bg-[#1f2f4a] border border-[#21304d] text-slate-200'
                      }`}
                    >
                      <span>{player.isOverseas ? '✈️' : '🏏'}</span>
                      <span className="font-medium">{player.name}</span>
                      {player.soldPrice ? (
                        <span className="text-[10px] font-mono text-[#F5B942] tabular-nums">
                          {formatCrores(player.soldPrice)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          ₹{player.basePrice} Cr
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-between border-t border-[#21304d]/60">
                <span className="text-[11px] text-slate-500">Owner: {team.ownerName}</span>
                {isSelected ? (
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-[#20C997]">
                    <Check className="w-4 h-4" />
                    <span>Assigned to You</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectTeam(team)}
                    className="px-4 py-2 rounded-xl bg-[#172338] hover:bg-[#F5B942] text-slate-200 hover:text-[#080D1A] font-bold text-xs border border-[#21304d] hover:border-[#F5B942] transition-all cursor-pointer"
                  >
                    Select as My Franchise
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIRMATION DIALOG MODAL */}
      {teamToConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-franchise-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-[#080D1A] border-2 border-[#21304d] rounded-2xl p-6 shadow-2xl text-center">
            <TeamEmblem code={teamToConfirm.code} size="xl" className="mx-auto mb-4" />
            <h2 id="confirm-franchise-title" className="text-xl font-extrabold text-white font-heading">
              Confirm Franchise Selection
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Are you sure you want to take command of{' '}
              <strong className="text-[#F5B942]">{teamToConfirm.name}</strong>? You will manage their
              ₹{teamToConfirm.totalPurse} Cr purse and make all live auction bids on their behalf.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setTeamToConfirm(null)}
                className="w-1/2 py-2.5 rounded-xl bg-[#172338] hover:bg-[#1f2f4a] text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmTeamAssignment}
                className="w-1/2 py-2.5 rounded-xl bg-[#F5B942] hover:bg-[#ffc95c] text-[#080D1A] font-extrabold text-xs shadow transition-all cursor-pointer"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
