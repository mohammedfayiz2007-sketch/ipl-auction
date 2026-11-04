/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { TeamEmblem } from './TeamEmblem';
import { Volume2, VolumeX, Sun, Moon, Radio, Menu, X, User, LogIn, LogOut, Check, Mail } from 'lucide-react';
import { ViewTab } from '../types/auction';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
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
    signInGoogle,
    signOutAccount,
    setIsGmailModalOpen,
  } = useAuction();

  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);

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

  const handleSignIn = async () => {
    await signInGoogle();
    setIsAuthMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOutAccount();
    setIsAuthMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080D1A]/95 dark:bg-[#080D1A]/95 backdrop-blur border-b border-[#21304d] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5B942] to-[#D19B20] flex items-center justify-center text-[#080D1A] font-extrabold text-sm shadow-md shadow-[#F5B942]/20">
              🏏
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg lg:text-xl tracking-tight text-white group-hover:text-[#F5B942] transition-colors whitespace-nowrap">
                IPL ARENA <span className="text-[#F5B942]">2027</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = currentTab === link.tab;
            return (
              <button
                key={link.tab}
                onClick={() => setCurrentTab(link.tab)}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive
                    ? 'border-[#F5B942] text-[#F5B942] font-semibold'
                    : 'border-transparent text-slate-300 hover:text-white'
                }`}
              >
                {link.isLive && (
                  <span className="inline-flex items-center justify-center text-xs text-[#FF5263] animate-pulse">
                    <Radio className="w-3.5 h-3.5" />
                  </span>
                )}
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Utilities */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* User Franchise Quick Pill */}
          {userTeam && (
            <button
              onClick={() => setCurrentTab('teams')}
              className="hidden sm:flex items-center gap-2 bg-[#10192B] border border-[#21304d] hover:border-[#F5B942]/50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Click to switch franchise"
            >
              <TeamEmblem code={userTeam.code} size="sm" />
              <div className="text-left text-xs leading-none">
                <span className="block font-bold text-white">{userTeam.code}</span>
                <span className="font-mono text-[11px] text-[#20C997] tabular-nums">
                  ₹{remainingPurse} Cr
                </span>
              </div>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundMuted ? 'Unmute auction sound effects' : 'Mute auction sound effects'}
            className="p-2 rounded-lg bg-[#10192B] border border-[#21304d] text-slate-300 hover:text-white hover:bg-[#172338] transition-colors cursor-pointer"
            title={soundMuted ? 'Sound Muted' : 'Sound Enabled'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-[#FF5263]" /> : <Volume2 className="w-4 h-4 text-[#20C997]" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light and dark mode"
            className="p-2 rounded-lg bg-[#10192B] border border-[#21304d] text-slate-300 hover:text-white hover:bg-[#172338] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F5B942]" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>

          {/* Gmail Workspace Dispatch Button */}
          {activeRoom && (
            <button
              onClick={() => setIsGmailModalOpen(true)}
              aria-label="Dispatch auction ledger via Gmail"
              className="p-2 rounded-lg bg-[#10192B] border border-[#EA4335]/40 text-[#EA4335] hover:bg-[#EA4335]/15 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Dispatch Official Report via Gmail (Google Workspace)"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden xl:inline text-xs font-bold text-slate-200">Gmail</span>
            </button>
          )}

          {/* User Authentication Menu Button */}
          <div className="relative">
            <button
              onClick={() => setIsAuthMenuOpen(!isAuthMenuOpen)}
              className="p-2 rounded-lg bg-[#10192B] border border-[#21304d] text-slate-300 hover:text-white hover:bg-[#172338] transition-colors cursor-pointer flex items-center gap-1.5"
              title={user.isAuthenticated ? `Signed in as ${user.name}` : 'Sign In'}
            >
              <User className={`w-4 h-4 ${user.isAuthenticated ? 'text-[#20C997]' : 'text-slate-400'}`} />
            </button>

            {/* Auth Dropdown */}
            {isAuthMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#080D1A] border border-[#21304d] p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="pb-2.5 mb-2.5 border-b border-[#21304d]">
                  <span className="block text-xs font-bold text-white truncate">{user.name}</span>
                  <span className="block text-[11px] text-slate-400 truncate">{user.email}</span>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#20C997]">
                    <Check className="w-3 h-3" />
                    <span>{user.isAuthenticated ? 'Session Verified' : 'Local Director Mode'}</span>
                  </div>
                </div>

                {/* Quick Gmail action */}
                {activeRoom && (
                  <div className="pb-2.5 mb-2.5 border-b border-[#21304d]">
                    <button
                      onClick={() => {
                        setIsAuthMenuOpen(false);
                        setIsGmailModalOpen(true);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-[#172338] hover:bg-[#1f2f4a] text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#EA4335]" />
                      <span>Email Auction Ledger (Gmail)</span>
                    </button>
                  </div>
                )}

                {user.isAuthenticated ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full py-1.5 px-3 rounded-xl bg-[#172338] hover:bg-[#FF5263] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="w-full py-2 px-3 rounded-xl bg-[#F5B942] hover:bg-[#ffc95c] text-[#080D1A] text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Google</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Enter Auction Arena CTA */}
          <button
            onClick={() => setCurrentTab('auction')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#080D1A] bg-[#F5B942] hover:bg-[#ffc95c] rounded-lg shadow-sm shadow-[#F5B942]/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#080D1A]" />
            <span>Auction Arena</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg bg-[#10192B] border border-[#21304d] text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
