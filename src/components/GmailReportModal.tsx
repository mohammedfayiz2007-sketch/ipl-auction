/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import {
  sendEmailViaGmail,
  createDraftViaGmail,
  buildAuctionResultsReportHtml,
  hasGmailAccessToken,
} from '../lib/gmail';
import { requestGmailAuthorization } from '../lib/firebase';
import {
  Mail,
  Send,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface GmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipient?: string;
}

export const GmailReportModal: React.FC<GmailReportModalProps> = ({
  isOpen,
  onClose,
  defaultRecipient = '',
}) => {
  const { activeRoom, teams, players, user, signInGoogle } = useAuction();

  const [recipient, setRecipient] = useState<string>(
    defaultRecipient || user.email || ''
  );
  const [subjectOverride, setSubjectOverride] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Mandatory user confirmation step before mutating user email data
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<'send' | 'draft' | null>(null);

  if (!isOpen || !activeRoom) return null;

  const report = buildAuctionResultsReportHtml({
    room: activeRoom,
    teams,
    players,
    recipientName: user.name,
  });

  const finalSubject = subjectOverride.trim() || report.subject;
  const isAuthorized = hasGmailAccessToken();

  const handleInitiateAction = (action: 'send' | 'draft') => {
    if (!recipient.trim() || !recipient.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid recipient email address.' });
      return;
    }
    setPendingAction(action);
    setIsConfirmDialogOpen(true);
  };

  const handleExecuteConfirmedAction = async () => {
    setIsConfirmDialogOpen(false);
    if (!pendingAction) return;

    if (pendingAction === 'send') {
      setIsSending(true);
      setStatusMessage(null);
      const res = await sendEmailViaGmail({
        to: recipient.trim(),
        subject: finalSubject,
        htmlBody: report.html,
        textBody: report.text,
      });
      setIsSending(false);

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Auction ledger dispatched successfully via Gmail! (Message ID: ${res.messageId})`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to send email via Gmail.',
        });
      }
    } else if (pendingAction === 'draft') {
      setIsDrafting(true);
      setStatusMessage(null);
      const res = await createDraftViaGmail({
        to: recipient.trim(),
        subject: finalSubject,
        htmlBody: report.html,
        textBody: report.text,
      });
      setIsDrafting(false);

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Draft saved directly to your Gmail mailbox! (Draft ID: ${res.draftId})`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to create Gmail draft.',
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#10192B] border border-[#21304d] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#21304d] flex items-center justify-between bg-gradient-to-r from-[#10192B] via-[#172338] to-[#10192B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EA4335]/15 border border-[#EA4335]/30 flex items-center justify-center text-[#EA4335]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-heading flex items-center gap-2">
                <span>Dispatch Auction Ledger via Gmail</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EA4335]/20 text-[#EA4335] border border-[#EA4335]/30 uppercase">
                  Google Workspace
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Send official certified IPL 2027 auction reports directly from your connected Gmail.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Auth Status Notification */}
          {!isAuthorized ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-200 space-y-1">
                  <span className="font-bold text-amber-300 block">
                    Gmail Authorization Required
                  </span>
                  <span>
                    To send or draft emails directly through Google Workspace, sign in with Google to grant permission.
                  </span>
                </div>
              </div>
              <button
                onClick={async () => {
                  const res = await requestGmailAuthorization();
                  if (res.success) {
                    setStatusMessage({
                      type: 'success',
                      text: 'Gmail Workspace authorization granted successfully!',
                    });
                  } else {
                    setStatusMessage({
                      type: 'error',
                      text: res.error || 'Failed to authorize Gmail.',
                    });
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <span>Authorize Gmail</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#20C997]/10 border border-[#20C997]/30 flex items-center gap-2.5 text-xs text-[#20C997]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Gmail Workspace connection active. Ready to send certified auction ledgers.</span>
            </div>
          )}

          {/* Form Inputs */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Recipient Email Address *
              </label>
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="manager@franchise.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#080D1A] border border-[#21304d] text-white focus:outline-none focus:border-[#4388FF] transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                value={subjectOverride}
                onChange={(e) => setSubjectOverride(e.target.value)}
                placeholder={report.subject}
                className="w-full px-4 py-2.5 rounded-xl bg-[#080D1A] border border-[#21304d] text-white focus:outline-none focus:border-[#4388FF] transition-colors"
              />
            </div>

            {/* Email Contents Preview Toggle */}
            <div className="border border-[#21304d] rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setIsPreviewOpen((prev) => !prev)}
                className="w-full px-4 py-2.5 bg-[#172338] text-slate-300 font-semibold flex items-center justify-between text-left hover:bg-[#1f2f4a] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#F5B942]" />
                  <span>Preview Generated Report Email</span>
                </span>
                <span className="text-[11px] text-[#4388FF]">
                  {isPreviewOpen ? 'Hide Preview' : 'Show Preview'}
                </span>
              </button>

              {isPreviewOpen && (
                <div className="p-4 bg-[#080D1A] max-h-60 overflow-y-auto text-slate-300 text-[11px] font-mono leading-relaxed border-t border-[#21304d]">
                  <pre className="whitespace-pre-wrap">{report.text}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-[#20C997]/15 border border-[#20C997]/40 text-[#20C997]'
                  : 'bg-[#FF5263]/15 border border-[#FF5263]/40 text-[#FF5263]'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span className="flex-1">{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#080D1A] border-t border-[#21304d] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            Powered by Google Workspace Gmail REST API
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => handleInitiateAction('draft')}
              disabled={isDrafting || isSending || !isAuthorized}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#172338] hover:bg-[#1f2f4a] disabled:opacity-50 text-slate-200 border border-[#21304d] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isDrafting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>Save as Draft</span>
            </button>

            <button
              onClick={() => handleInitiateAction('send')}
              disabled={isDrafting || isSending || !isAuthorized}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#EA4335] hover:bg-[#d6382b] disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-[#EA4335]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send via Gmail</span>
            </button>
          </div>
        </div>

        {/* MANDATORY USER CONFIRMATION MODAL FOR DESTRUCTIVE/MUTATING WORKSPACE ACTIONS */}
        {isConfirmDialogOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm animate-in fade-in">
            <div className="max-w-md w-full bg-[#10192B] border-2 border-[#EA4335] rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EA4335]/20 text-[#EA4335] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-white font-heading">
                  Confirm Gmail {pendingAction === 'send' ? 'Dispatch' : 'Draft Creation'}
                </h4>
                <p className="text-xs text-slate-300 mt-2">
                  Are you sure you want to {pendingAction === 'send' ? 'send' : 'save a draft of'} the IPL Auction Arena report to <strong className="text-white">{recipient}</strong> with subject <strong className="text-white">"{finalSubject}"</strong>?
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsConfirmDialogOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#172338] text-slate-300 font-bold text-xs hover:bg-[#1f2f4a] border border-[#21304d] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteConfirmedAction}
                  className="px-5 py-2 rounded-xl bg-[#EA4335] text-white font-black text-xs hover:bg-[#d6382b] shadow-lg shadow-[#EA4335]/30 cursor-pointer"
                >
                  Yes, {pendingAction === 'send' ? 'Send Email' : 'Create Draft'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
