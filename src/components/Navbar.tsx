/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { TeamEmblem } from './TeamEmblem';
import {
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Crown,
  Radio,
} from 'lucide-react';
import { ViewTab } from '../types/auction';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const {
    currentTab,
    setCurrentTab,
    theme,
    toggleTheme,
    soundMuted,
    toggleSound,
    user,
    teams,
    activeRoom,
  } = useAuction();

  const userTeam = teams.find((t) => t.id === user.selectedTeamId);
  const remainingPurse = userTeam ? (userTeam.totalPurse - userTeam.spentPurse).toFixed(2) : '120.00';

  const navLinks: { tab: ViewTab; label: string; isLive?: boolean }[] = [
    { tab: 'landing', label: 'Home' },
    { tab: 'auction', label: 'Live Arena', isLive: activeRoom?.status === 'LIVE_AUCTION' },
    { tab: 'teams', label: 'Franchises' },
    { tab: 'players', label: 'Player Pool' },
    { tab: 'retention', label: 'Retention Desk' },
    { tab: 'trade', label: 'Trade Centre' },
    { tab: 'history', label: 'Records' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#090D1B]/95 backdrop-blur-md border-b border-[#E2E8F4] dark:border-[#202944] px-4 lg:px-8 py-3 transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
        {/* Brand Wordmark & Luxury Crest */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-3 text-left group cursor-pointer focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A78BFA] via-[#7C3AED] to-[#171D35] p-0.5 shadow-md shadow-[#A78BFA]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090D1B] rounded-[10px] flex items-center justify-center text-[#E8BD68]">
                <Crown className="w-5 h-5 text-[#E8BD68]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-[#00D6D0] leading-none">
                  OBSIDIAN ROYAL
                </span>
              </div>
              <span className="font-heading font-black text-lg lg:text-xl tracking-tight text-[#0C1222] dark:text-[#F5F4FF] group-hover:text-[#A78BFA] transition-colors whitespace-nowrap block mt-0.5">
                IPL ARENA <span className="text-[#E8BD68]">2027</span>
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-semibold tracking-wide">
          {navLinks.map((link) => {
            const isActive = currentTab === link.tab;
            return (
              <button
                key={link.tab}
                onClick={() => setCurrentTab(link.tab)}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive
                    ? 'border-[#7C3AED] dark:border-[#A78BFA] text-[#7C3AED] dark:text-[#A78BFA] font-bold'
                    : 'border-transparent text-[#4A5568] dark:text-[#A5A9C3] hover:text-[#0C1222] dark:hover:text-white'
                }`}
              >
                {link.isLive && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-[#00D6D0]/15 text-[#00D6D0] text-[10px] font-black uppercase">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>LIVE</span>
                  </span>
                )}
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* User Franchise Quick Pill */}
          {userTeam && (
            <button
              onClick={() => setCurrentTab('teams')}
              className="hidden sm:flex items-center gap-2 bg-[#F0F4FA] dark:bg-[#11182B] border border-[#D8DFEE] dark:border-[#202944] hover:border-[#A78BFA]/50 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
              title="Click to view or switch franchise"
            >
              <TeamEmblem code={userTeam.code} size="xs" />
              <div className="text-left leading-none">
                <span className="block font-bold text-xs text-[#0C1222] dark:text-white">
                  {userTeam.code}
                </span>
                <span className="font-mono text-[11px] font-bold text-[#20C997] tabular-nums">
                  ₹{remainingPurse} Cr
                </span>
              </div>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundMuted ? 'Unmute auction sound effects' : 'Mute auction sound effects'}
            className="p-2 rounded-xl bg-[#F0F4FA] dark:bg-[#11182B] border border-[#D8DFEE] dark:border-[#202944] text-[#4A5568] dark:text-[#A5A9C3] hover:text-[#0C1222] dark:hover:text-white hover:bg-[#E2E8F4] dark:hover:bg-[#171D35] transition-colors cursor-pointer"
            title={soundMuted ? 'Sound Muted' : 'Sound Enabled'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-[#FF5C75]" /> : <Volume2 className="w-4 h-4 text-[#20C997]" />}
          </button>

          {/* Theme Toggle (Light / Obsidian Royal Dark) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light and dark mode"
            className="p-2 rounded-xl bg-[#F0F4FA] dark:bg-[#11182B] border border-[#D8DFEE] dark:border-[#202944] text-[#4A5568] dark:text-[#A5A9C3] hover:text-[#0C1222] dark:hover:text-white hover:bg-[#E2E8F4] dark:hover:bg-[#171D35] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Obsidian Royal Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#E8BD68]" /> : <Moon className="w-4 h-4 text-[#7C3AED]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
