/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { TeamEmblem } from '../../components/TeamEmblem';
import {
  Copy,
  Share2,
  Check,
  Users,
  Shield,
  ArrowRight,
  QrCode,
  Radio,
  Cpu,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const RoomLobbyView: React.FC<{ onNavigateToTeamSelect: () => void }> = ({
  onNavigateToTeamSelect,
}) => {
  const { activeRoom, teams, user, autoFillRemainingWithBots } = useAuction();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!activeRoom) return null;

  const isHost = activeRoom.hostId === user.id;
  const roomUrl = window.location.origin + '?room=' + activeRoom.code;

  // Count assigned teams
  const assignedTeamCount = Object.keys(activeRoom.teamAssignments).length;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `🏏 Join my IPL Mega Auction 2027 War Room!\n\nRoom Name: ${activeRoom.name}\nRoom Code: ${activeRoom.code}\n\nJoin link: ${roomUrl}`
  )}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Lobby Hero & Sharing Strip */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#10192B] via-[#172338] to-[#10192B] border-2 border-[#F5B942]/40 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#20C997] mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#20C997] animate-pulse" />
              <span>ROOM LOBBY ACTIVE · MULTIPLAYER SYNCHRONIZED</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
              {activeRoom.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Season: <strong className="text-white">IPL 2027 Simulation</strong> · Format:{' '}
              <strong className="text-white">Mega Auction (₹{activeRoom.startingPurse} Cr Purse)</strong>
            </p>
          </div>

          {/* Room Code Showcase */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#080D1A] p-4 rounded-2xl border border-[#21304d]">
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Official Room Code
              </span>
              <span className="text-3xl font-black font-mono text-[#F5B942] tracking-widest block">
                {activeRoom.code}
              </span>
            </div>

            {/* QR Code Vector Representation */}
            <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#080D1A]" fill="currentColor">
                <rect x="10" y="10" width="30" height="30" rx="4" />
                <rect x="18" y="18" width="14" height="14" fill="white" />
                <rect x="60" y="10" width="30" height="30" rx="4" />
                <rect x="68" y="18" width="14" height="14" fill="white" />
                <rect x="10" y="60" width="30" height="30" rx="4" />
                <rect x="18" y="68" width="14" height="14" fill="white" />
                <rect x="50" y="50" width="12" height="12" />
                <rect x="70" y="55" width="10" height="10" />
                <rect x="55" y="75" width="12" height="12" />
                <rect x="75" y="75" width="15" height="15" />
              </svg>
            </div>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="pt-4 border-t border-[#21304d] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-[#172338] hover:bg-[#1f2f4a] text-slate-200 text-xs font-bold border border-[#21304d] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#F5B942]" />
              <span>{copiedCode ? 'Room Code Copied!' : 'Copy Room Code'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-[#172338] hover:bg-[#1f2f4a] text-slate-200 text-xs font-bold border border-[#21304d] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{copiedLink ? 'Link Copied!' : 'Copy Invitation Link'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-md inline-flex items-center"
            >
              <span>📱 Share on WhatsApp</span>
            </a>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-[#F5B942]">
              Participants Joined: {activeRoom.participants.length} / 10
            </span>
          </div>
        </div>
      </div>

      {/* WAITING LIST: ALL 10 IPL TEAMS STATUS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#10192B] border border-[#21304d] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white font-heading flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#F5B942]" />
              <span>Franchise Waiting List & Reservation Status</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Teams Selected: <strong className="text-white font-mono">{assignedTeamCount} / 10</strong>.
              All 10 teams must be assigned before the host can launch the auction.
            </p>
          </div>

          {/* Primary Action to Select Team */}
          <button
            onClick={onNavigateToTeamSelect}
            className="px-5 py-3 rounded-xl bg-[#F5B942] hover:bg-[#ffc95c] text-[#080D1A] font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Select Your Team</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 10 Teams List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {teams.map((team) => {
            const assignment = activeRoom.teamAssignments[team.id];
            const isAssigned = Boolean(assignment);
            const isMyTeam = assignment?.userId === user.id;

            return (
              <div
                key={team.id}
                className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all ${
                  isMyTeam
                    ? 'bg-[#172338] border-[#F5B942] ring-1 ring-[#F5B942]/30'
                    : isAssigned
                    ? 'bg-[#080D1A] border-slate-700'
                    : 'bg-[#080D1A]/60 border-[#21304d]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <TeamEmblem code={team.code} size="md" />
                  <div className="min-w-0">
                    <span className="block text-sm font-bold text-white truncate">
                      {team.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Purse: ₹{team.totalPurse.toFixed(2)} Cr
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isMyTeam ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#F5B942] text-[#080D1A] uppercase tracking-wide">
                      Selected By You
                    </span>
                  ) : isAssigned ? (
                    <div className="text-right">
                      <span className="block text-xs font-bold text-slate-300">
                        {assignment.isBot ? '🤖 ' + assignment.userName : '👤 ' + assignment.userName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium uppercase">
                        Reserved
                      </span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#172338] text-[#20C997] border border-[#20C997]/30">
                      Available
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Host AI Auto-fill helper (Allows solo or small groups to test full 10-team auction) */}
        {isHost && assignedTeamCount < 10 && (
          <div className="p-4 rounded-2xl bg-[#080D1A] border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white block">
                Testing or playing with fewer than 10 human participants?
              </span>
              <span className="text-[11px] text-slate-400">
                You can auto-fill vacant franchises with BCCI Intelligence Bots to satisfy the 10/10 rule.
              </span>
            </div>

            <button
              onClick={autoFillRemainingWithBots}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Auto-Fill Vacant with Bots</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
