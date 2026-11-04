/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { WorkflowStep } from '../types/auction';
import { Check, ChevronRight } from 'lucide-react';

interface StepMeta {
  key: WorkflowStep;
  number: number;
  label: string;
  shortLabel: string;
}

const WORKFLOW_STEPS: StepMeta[] = [
  { key: 'LOGIN', number: 1, label: 'Login & Verification', shortLabel: '1. Login' },
  { key: 'ROOM_SELECT', number: 2, label: 'Create / Join Room', shortLabel: '2. Room' },
  { key: 'ROOM_LOBBY', number: 3, label: 'Lobby & Sharing', shortLabel: '3. Lobby' },
  { key: 'TEAM_SELECTION', number: 4, label: 'Franchise Allocation', shortLabel: '4. Team Pick' },
  { key: 'READY_CHECK', number: 5, label: '10 Teams Ready', shortLabel: '5. 10 Ready' },
  { key: 'RETENTION_DASHBOARD', number: 6, label: 'Retention Desk', shortLabel: '6. Retentions' },
  { key: 'RETENTION_CONFIRMATION', number: 7, label: 'Retention Lock', shortLabel: '7. Lock' },
  { key: 'AUCTION_READY', number: 8, label: 'Final Pool Ready', shortLabel: '8. Pool' },
  { key: 'LIVE_AUCTION', number: 9, label: 'Live Mega Auction', shortLabel: '9. Live Bid' },
  { key: 'AUCTION_RESULTS', number: 10, label: 'Final Tournament Results', shortLabel: '10. Results' },
];

export const WorkflowBreadcrumbBar: React.FC = () => {
  const { workflowStep, setWorkflowStep, activeRoom } = useAuction();

  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.key === workflowStep);
  const activeStep = WORKFLOW_STEPS[currentIndex] || WORKFLOW_STEPS[0];

  return (
    <div className="w-full bg-[#0d1527] border-b border-[#21304d] px-4 py-2.5 overflow-x-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-w-[760px]">
        {/* Step indicator pills */}
        <div className="flex items-center gap-1.5 flex-1">
          {WORKFLOW_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isUpcoming = index > currentIndex;

            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-[#F5B942] text-[#080D1A] font-extrabold shadow-sm shadow-[#F5B942]/30 ring-1 ring-[#F5B942]'
                      : isCompleted
                      ? 'bg-[#172338] text-[#20C997] hover:bg-[#1e2f49]'
                      : 'bg-transparent text-slate-500 opacity-60'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-[#080D1A] text-[#F5B942]'
                        : isCompleted
                        ? 'bg-[#20C997]/20 text-[#20C997]'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : step.number}
                  </span>
                  <span>{step.shortLabel}</span>
                </div>

                {index < WORKFLOW_STEPS.length - 1 && (
                  <ChevronRight
                    className={`w-3 h-3 shrink-0 ${
                      isCompleted ? 'text-[#20C997]/50' : 'text-slate-600'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Phase Badge */}
        {activeRoom && (
          <div className="hidden lg:flex items-center gap-2 shrink-0 pl-3 border-l border-[#21304d]">
            <span className="text-[11px] text-slate-400">War Room:</span>
            <span className="px-2 py-0.5 rounded bg-[#10192B] border border-[#21304d] text-xs font-mono font-bold text-[#F5B942]">
              {activeRoom.code}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
