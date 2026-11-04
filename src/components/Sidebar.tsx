/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { ViewTab } from '../types/auction';
import {
  LayoutDashboard,
  Shield,
  Users,
  UserCheck,
  ArrowLeftRight,
  Gavel,
  History,
  Settings,
  PlusCircle,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { TeamEmblem } from './TeamEmblem';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentTab, setCurrentTab, user, teams, players, activeRoom } = useAuction();

  const userTeam = teams.find((t) => t.id === user.selectedTeamId);
  const remainingPurse = userTeam
    ? (userTeam.totalPurse - userTeam.spentPurse).toFixed(2)
    : '120.00';

  const menuItems: {
    tab: ViewTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    highlight?: boolean;
  }[] = [
    {
      tab: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      tab: 'auction',
      label: 'Live Auction Arena',
      icon: <Gavel className="w-4 h-4" />,
      badge: activeRoom?.status === 'LIVE_AUCTION' ? 'LIVE' : undefined,
      highlight: true,
    },
    {
      tab: 'teams',
      label: 'IPL Teams',
      icon: <Shield className="w-4 h-4" />,
      badge: '10',
    },
    {
      tab: 'players',
      label: 'Players Pool',
      icon: <Users className="w-4 h-4" />,
      badge: `${players.length}`,
    },
    {
      tab: 'retention',
      label: 'Retention & Release',
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      tab: 'trade',
      label: 'Trade Centre',
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      tab: 'rooms',
      label: 'Rooms (Create/Join)',
      icon: <PlusCircle className="w-4 h-4" />,
      badge: activeRoom?.code || undefined,
    },
    {
      tab: 'history',
      label: 'Auction History',
      icon: <History className="w-4 h-4" />,
    },
    {
      tab: 'settings',
      label: 'Settings & Rules',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleSelectTab = (tab: ViewTab) => {
    setCurrentTab(tab);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 z-50 lg:z-10 h-screen lg:h-[calc(100vh-61px)] w-64 bg-[#080D1A] border-r border-[#21304d] flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Current User Franchise Card */}
        <div>
          <div className="mb-4 p-3 rounded-xl bg-[#10192B] border border-[#21304d]">
            <div className="flex items-center gap-3">
              {userTeam ? (
                <TeamEmblem code={userTeam.code} size="md" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg">
                  🏏
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="block text-xs text-slate-400 font-medium truncate">
                  My Franchise
                </span>
                <span className="block text-sm font-bold text-white truncate">
                  {userTeam ? userTeam.name : 'Select Franchise'}
                </span>
                <span className="block text-xs font-mono text-[#20C997] font-semibold tabular-nums">
                  Purse: ₹{remainingPurse} Cr
                </span>
              </div>
            </div>
            <button
              onClick={() => handleSelectTab('teams')}
              className="mt-2.5 w-full py-1 text-[11px] font-semibold text-slate-300 hover:text-[#F5B942] bg-[#172338] hover:bg-[#1f2f4a] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Manage Squad</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => handleSelectTab(item.tab)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#172338] text-[#F5B942] font-semibold shadow-sm border border-[#F5B942]/30'
                      : item.highlight
                      ? 'text-white hover:bg-[#10192B] border border-transparent'
                      : 'text-slate-300 hover:text-white hover:bg-[#10192B] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`${
                        isActive
                          ? 'text-[#F5B942]'
                          : item.highlight
                          ? 'text-[#F5B942]'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        item.badge === 'LIVE'
                          ? 'bg-[#FF5263] text-white animate-pulse'
                          : 'bg-[#10192B] text-slate-300 border border-[#21304d]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Live Arena Room Status */}
        <div className="pt-4 border-t border-[#21304d]">
          {activeRoom && (
            <div className="p-2.5 rounded-xl bg-[#10192B] border border-[#21304d] text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-[#20C997] animate-pulse" />
                  Room: {activeRoom.code}
                </span>
                <span className="text-[10px] font-bold text-[#20C997] uppercase">Online</span>
              </div>
              <p className="text-slate-300 text-[11px] truncate font-medium">{activeRoom.name}</p>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>IPL Auction Arena 2027</span>
            <span>v2.7.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
