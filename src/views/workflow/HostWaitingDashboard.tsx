/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuction } from '../../context/AuctionContext';
import { TeamEmblem } from '../../components/TeamEmblem';
import { CheckCircle2, XCircle, Shield, Play, Users, Lock, Radio, Cpu } from 'lucide-react';

export const HostWaitingDashboard: React.FC<{ onLaunchRetention: () => void }> = ({
  onLaunchRetention,
}) => {
  const { activeRoom, teams, user, autoFillRemainingWithBots } = useAuction();

  if (!activeRoom) return null;

  const isHost = activeRoom.hostId === user.id;
  const assignedTeamCount = Object.keys(activeRoom.teamAssignments).length;

  // Readiness Checklist Items
  const checklist = [
    {
      label: 'All 10 Franchises Assigned',
      passed: assignedTeamCount === 10,
      details: `${assignedTeamCount} / 10 teams claimed`,
    },
    {
      label: 'No Duplicate Team Assignments',
      passed: new Set(Object.keys(activeRoom.teamAssignments)).size === assignedTeamCount,
      details: 'Strict 1-to-1 manager allocation',
    },
    {
      label: 'Purse Cap Initialized',
      passed: activeRoom.startingPurse === 120.0,
      details: '₹120.00 Cr budget per franchise',
    },
    {
      label: 'Tournament Format Set',
      passed: activeRoom.format === 'Mega Auction',
      details: 'IPL 2027 Mega Auction Engine',
    },
    {
      label: 'Host Administration Verified',
      passed: isHost,
      details: isHost ? 'You are the authorized host' : `Room host: Admin`,
    },
  ];

  const allReady = checklist.every((c) => c.passed);

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#10192B] border border-[#21304d] shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F5B942] mb-1">
              <span>STEP 5 OF 10</span>
              <span>·</span>
              <span>AUCTION LAUNCH CONTROLS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Room Readiness & Launch Protocol
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Verify tournament preconditions before advancing to the mandatory Squad Retention Phase.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#080D1A] border border-[#21304d] text-center min-w-[150px]">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
              Readiness Status
            </span>
            <span
              className={`text-sm font-black uppercase tracking-wider block ${
                allReady ? 'text-[#20C997]' : 'text-[#F5B942]'
              }`}
            >
              {allReady ? '10/10 READY TO START' : 'WAITING FOR 10 TEAMS'}
            </span>
          </div>
        </div>
      </div>

      {/* Checklist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Checklist */}
        <div className="p-6 rounded-3xl bg-[#10192B] border border-[#21304d] space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-heading">
            Pre-Auction Verification Matrix
          </h2>

          <div className="space-y-3">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#080D1A] border border-[#21304d] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  {item.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#20C997] shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <span className="block text-xs font-bold text-white">{item.label}</span>
                    <span className="text-[11px] text-slate-400">{item.details}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    item.passed ? 'bg-[#20C997]/20 text-[#20C997]' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.passed ? 'PASSED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Auto-Fill for Testing */}
          {isHost && assignedTeamCount < 10 && (
            <button
              onClick={autoFillRemainingWithBots}
              className="w-full py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/40 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Fill Remaining {10 - assignedTeamCount} Teams with AI Strategists</span>
            </button>
          )}
        </div>

        {/* Right: Team Allocation Overview */}
        <div className="p-6 rounded-3xl bg-[#10192B] border border-[#21304d] flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-heading mb-3">
              Franchise Manager Allocations ({assignedTeamCount}/10)
            </h2>

            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {teams.map((team) => {
                const assignment = activeRoom.teamAssignments[team.id];
                return (
                  <div
                    key={team.id}
                    className="p-2 rounded-xl bg-[#080D1A] border border-[#21304d] flex items-center gap-2 text-xs"
                  >
                    <TeamEmblem code={team.code} size="sm" />
                    <div className="min-w-0 flex-1">
                      <span className="block font-bold text-white truncate">{team.code}</span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {assignment ? assignment.userName : 'Awaiting Manager'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Start Auction Button */}
          <div className="pt-4 border-t border-[#21304d]">
            {isHost ? (
              <button
                onClick={onLaunchRetention}
                disabled={!allReady}
                className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  allReady
                    ? 'bg-gradient-to-r from-[#F5B942] to-[#e5a62a] text-[#080D1A] hover:brightness-110 active:scale-[0.98]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START RETENTION PHASE (ALL 10 MANAGERS)</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-[#080D1A] text-center text-xs text-slate-400">
                Waiting for room host to initiate the retention phase...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
