import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { toast } from '../../store/useToastStore.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { PriorityBadge } from '../../components/PriorityBadge.js';
import { Modal } from '../../components/Modal.js';
import { Ticket, TicketMessage, Attachment, User, TicketStatus, TicketPriority } from '../../types/index.js';
import {
  ArrowLeft,
  Send,
  Lock,
  MessageSquare,
  Sparkles,
  Paperclip,
  Check,
  Star,
  Download,
  Bot,
  UserCheck,
  RotateCcw,
  X,
} from 'lucide-react';


export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  // AI state
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSummaryModal, setAiSummaryModal] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  const [suggestedReply, setSuggestedReply] = useState<any>(null);
  const [suggestingReply, setSuggestingReply] = useState(false);

  // Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchTicketDetails = async () => {
    try {
      const [tktRes, msgRes] = await Promise.all([
        apiClient.get(`/tickets/${id}`),
        apiClient.get(`/tickets/${id}/messages`),
      ]);

      if (tktRes.data.success) {
        setTicket(tktRes.data.data);
      }
      if (msgRes.data.success) {
        setMessages(msgRes.data.data);
      }

      // Check feedback if resolved/closed
      try {
        const fbRes = await apiClient.get(`/feedback/tickets/${id}`);
        if (fbRes.data.success) {
          setExistingFeedback(fbRes.data.data);
        }
      } catch {
        // feedback may not exist yet
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
    if (user?.role === 'ADMIN' || user?.role === 'AGENT') {
      apiClient.get('/admin/agents').then((res) => {
        if (res.data.success) setAgents(res.data.data);
      });
    }
  }, [id]);

  // Handle status update
  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      const res = await apiClient.patch(`/tickets/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setTicket(res.data.data);
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Invalid status transition.');
    }
  };

  // Handle priority update
  const handlePriorityChange = async (newPriority: TicketPriority) => {
    try {
      const res = await apiClient.patch(`/tickets/${id}/priority`, { priority: newPriority });
      if (res.data.success) {
        setTicket(res.data.data);
        toast.success(`Priority updated to ${newPriority}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update priority.');
    }
  };

  // Handle claim
  const handleClaim = async () => {
    try {
      const res = await apiClient.post(`/tickets/${id}/claim`);
      if (res.data.success) {
        setTicket(res.data.data);
        toast.success('You have claimed this ticket.');
        fetchTicketDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to claim ticket.');
    }
  };

  // Handle assign agent
  const handleAssignAgent = async (agentId: string) => {
    try {
      const res = await apiClient.post(`/tickets/${id}/assign`, { agentId });
      if (res.data.success) {
        setTicket(res.data.data);
        toast.success('Ticket assigned successfully.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to assign ticket.');
    }
  };

  // File upload for message
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      setUploading(true);
      const res = await apiClient.post('/tickets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setAttachments((prev) => [...prev, ...res.data.data]);
        toast.success('Attachment uploaded');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Send message or internal note
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && attachments.length === 0) return;

    try {
      setSending(true);
      const res = await apiClient.post(`/tickets/${id}/messages`, {
        message: replyText,
        isInternalNote: user?.role !== 'CUSTOMER' ? isInternalNote : false,
        attachments,
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setReplyText('');
        setAttachments([]);
        setIsInternalNote(false);
        toast.success(isInternalNote ? 'Internal note added' : 'Reply sent');
        fetchTicketDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  // Trigger AI Classification
  const handleTriggerAI = async () => {
    try {
      setAiAnalyzing(true);
      const res = await apiClient.post(`/ai/tickets/${id}/analyze`);
      if (res.data.success) {
        toast.success('AI classification completed');
        fetchTicketDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'AI analysis failed');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Generate AI Summary
  const handleGenerateSummary = async () => {
    try {
      setAiSummaryLoading(true);
      setAiSummaryModal(true);
      const res = await apiClient.post(`/ai/tickets/${id}/summarize`);
      if (res.data.success) {
        setAiSummary(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to generate AI summary');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // Suggest AI Reply (RAG Grounded)
  const handleSuggestReply = async () => {
    try {
      setSuggestingReply(true);
      const res = await apiClient.post(`/ai/tickets/${id}/suggest-reply`);
      if (res.data.success) {
        setSuggestedReply(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to generate suggested reply');
    } finally {
      setSuggestingReply(false);
    }
  };

  // Human accepts AI suggestion into reply textarea
  const acceptSuggestedReply = () => {
    if (suggestedReply?.replyText) {
      setReplyText(suggestedReply.replyText);
      setIsInternalNote(false);
      setSuggestedReply(null);
      toast.info('AI reply copied to reply box. Please review and edit before sending.');
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingFeedback(true);
      const res = await apiClient.post(`/feedback/tickets/${id}`, {
        rating,
        feedback: feedbackComment,
      });
      if (res.data.success) {
        setExistingFeedback(res.data.data);
        toast.success('Thank you for your feedback!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading || !ticket) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Permitted status transitions according to TicketStateMachine
  const getNextPermittedStatuses = (curr: TicketStatus): TicketStatus[] => {
    switch (curr) {
      case 'OPEN':
        return ['ASSIGNED', 'IN_PROGRESS', 'CLOSED'];
      case 'ASSIGNED':
        return ['IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'];
      case 'IN_PROGRESS':
        return ['WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'];
      case 'WAITING_FOR_CUSTOMER':
        return ['IN_PROGRESS', 'RESOLVED', 'CLOSED'];
      case 'RESOLVED':
        return ['CLOSED', 'REOPENED'];
      case 'REOPENED':
        return ['IN_PROGRESS', 'RESOLVED', 'CLOSED'];
      case 'CLOSED':
        return ['REOPENED'];
      default:
        return [];
    }
  };

  const nextStatuses = getNextPermittedStatuses(ticket.status);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {ticket.ticketNumber}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1 leading-snug">
              {ticket.subject}
            </h2>
          </div>
        </div>

        {/* Quick action bar */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {user?.role !== 'CUSTOMER' && (
            <button
              onClick={handleGenerateSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Summary</span>
            </button>
          )}

          {user?.role !== 'CUSTOMER' && !ticket.assignedAgentId && (
            <button
              onClick={handleClaim}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Claim Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left conversation thread, Right property sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Thread & Reply */}
        <div className="lg:col-span-2 space-y-6">
          {/* Opening Ticket Problem Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    ticket.customerId?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.customerId?.name || 'Customer')}&background=6366f1&color=fff`
                  }
                  alt={ticket.customerId?.name}
                  className="w-9 h-9 rounded-full object-cover border"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{ticket.customerId?.name}</h4>
                  <p className="text-xs text-slate-400">
                    Opened on {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border">
                Initial Inquiry
              </span>
            </div>

            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Messages Thread */}
          <div className="space-y-4">
            {messages.map((msg) => {
              const isInternal = msg.type === 'INTERNAL_NOTE';
              const isAgent = msg.authorRole === 'AGENT' || msg.authorRole === 'ADMIN';

              return (
                <div
                  key={msg.id}
                  className={`rounded-2xl p-5 border transition-all ${
                    isInternal
                      ? 'bg-amber-50/70 border-amber-200 ring-1 ring-amber-300/40 shadow-sm'
                      : isAgent
                      ? 'bg-white border-slate-200 shadow-subtle'
                      : 'bg-indigo-50/40 border-indigo-100'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100/80">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          msg.authorId?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.authorId?.name || 'User')}&background=4f46e5&color=fff`
                        }
                        alt={msg.authorId?.name}
                        className="w-7 h-7 rounded-full object-cover border"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 mr-2">
                          {msg.authorId?.name || 'Support Representative'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            msg.authorRole === 'ADMIN'
                              ? 'bg-rose-100 text-rose-700'
                              : msg.authorRole === 'AGENT'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {msg.authorRole}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isInternal && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300">
                          <Lock className="w-3 h-3" />
                          <span>Internal Note (Private)</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
                    {msg.message}
                  </div>

                  {/* Attachments inside message */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      {msg.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={`/api/tickets/${ticket.id}/attachments/${att.storageKey}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>{att.fileName}</span>
                          <span className="text-[10px] text-slate-400">({Math.round(att.size / 1024)} KB)</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Suggested Reply Box (Human-in-the-Loop) for Agents */}
          {suggestedReply && (
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border-2 border-indigo-200 rounded-2xl p-5 shadow-card animate-slide-in">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>AI Suggested Response (Grounding Active)</span>
                </div>
                <button
                  onClick={() => setSuggestedReply(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-white rounded-xl border border-indigo-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4 font-normal shadow-subtle">
                {suggestedReply.replyText}
              </div>

              {suggestedReply.groundingArticles && suggestedReply.groundingArticles.length > 0 && (
                <div className="mb-4 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 mr-2">Referenced Knowledge Base Articles:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {suggestedReply.groundingArticles.map((art: any, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-medium">
                        {art.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-indigo-100/60">
                <p className="text-[11px] text-slate-500 italic">
                  Human-in-the-loop: Review and approve reply before it reaches the customer.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSuggestReply}
                    disabled={suggestingReply}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={acceptSuggestedReply}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept to Reply Box</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reply Composition Box */}
          {ticket.status !== 'CLOSED' ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
              {/* Agent mode switcher: Customer Reply vs Internal Note */}
              {user?.role !== 'CUSTOMER' && (
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsInternalNote(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !isInternalNote
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Public Reply to Customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInternalNote(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isInternalNote
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Internal Note (Agents Only)</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    isInternalNote
                      ? 'Add private internal note (visible strictly to agents and admins)...'
                      : 'Type your message to the customer...'
                  }
                  required
                  className={`w-full p-4 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-1 transition-all ${
                    isInternalNote
                      ? 'bg-amber-50/40 border border-amber-200 focus:border-amber-400 focus:ring-amber-400'
                      : 'bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />

                {/* Uploaded attachments preview */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 border text-xs text-slate-700 font-medium"
                      >
                        <Paperclip className="w-3 h-3 text-indigo-500" />
                        <span className="max-w-[140px] truncate">{att.fileName}</span>
                        <button
                          type="button"
                          onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                      <Paperclip className="w-4 h-4" />
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.pdf,.log,.txt,.json,.csv"
                      />
                    </label>
                    {uploading && <span className="text-xs text-indigo-600 animate-pulse">Uploading...</span>}

                    {/* AI Suggest Reply Trigger */}
                    {user?.role !== 'CUSTOMER' && (
                      <button
                        type="button"
                        onClick={handleSuggestReply}
                        disabled={suggestingReply}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{suggestingReply ? 'Generating Suggestion...' : 'Suggest Reply with AI'}</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={sending || (!replyText.trim() && attachments.length === 0)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 ${
                      isInternalNote
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {sending ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isInternalNote ? 'Save Internal Note' : 'Send Reply'}</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs text-slate-500 font-medium">
              This ticket is CLOSED. To continue the inquiry, an agent or admin can reopen it.
            </div>
          )}

          {/* Customer CSAT Rating Block (Only for Customer on Resolved/Closed tickets) */}
          {user?.role === 'CUSTOMER' && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>How did we do? Support Experience Feedback</span>
              </h3>

              {existingFeedback ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1 text-amber-500 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= existingFeedback.rating ? 'fill-amber-500' : 'text-slate-300'}`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      ({existingFeedback.rating} / 5 Stars)
                    </span>
                  </div>
                  {existingFeedback.feedback && (
                    <p className="text-xs text-slate-600 italic">"{existingFeedback.feedback}"</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2">
                    Feedback submitted on {new Date(existingFeedback.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Your feedback helps us continuously improve our response times and support quality.
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:text-amber-500 transition-transform hover:scale-110"
                      >
                        <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-500' : 'text-slate-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">{rating} of 5 Stars</span>
                  </div>

                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Optional feedback comment on agent helpfulness or resolution..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Ticket Metadata & AI Insights */}
        <div className="space-y-6">
          {/* Status & Priority Control Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Ticket Properties
            </h3>

            {/* Status Transition Control */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                Current Status
              </label>
              <div className="mb-2">
                <StatusBadge status={ticket.status} />
              </div>

              {user?.role !== 'CUSTOMER' && nextStatuses.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Allowed State Transitions:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {nextStatuses.map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                      >
                        → {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Priority Control */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                Priority
              </label>
              {user?.role !== 'CUSTOMER' ? (
                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              ) : (
                <PriorityBadge priority={ticket.priority} />
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                Category
              </label>
              <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg inline-block">
                {ticket.categoryId?.name || 'General Inquiry'}
              </span>
            </div>

            {/* Assignee Control */}
            {user?.role !== 'CUSTOMER' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Assigned Agent
                </label>
                <select
                  value={ticket.assignedAgentId?.id || ''}
                  onChange={(e) => handleAssignAgent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* AI Analysis Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Ticket Intelligence</span>
              </h3>
              {user?.role !== 'CUSTOMER' && (
                <button
                  onClick={handleTriggerAI}
                  disabled={aiAnalyzing}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{aiAnalyzing ? 'Analyzing...' : 'Re-classify'}</span>
                </button>
              )}
            </div>

            {ticket.aiAnalysisId ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Confidence</span>
                    <p className="text-base font-extrabold text-indigo-600 mt-0.5">
                      {Math.round(ticket.aiAnalysisId.confidence * 100)}%
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Sentiment</span>
                    <p
                      className={`text-xs font-extrabold mt-1 ${
                        ticket.aiAnalysisId.sentiment === 'NEGATIVE'
                          ? 'text-rose-600'
                          : ticket.aiAnalysisId.sentiment === 'POSITIVE'
                          ? 'text-emerald-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {ticket.aiAnalysisId.sentiment}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Predicted Category</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{ticket.aiAnalysisId.category}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">AI Reasoning</span>
                  <p className="text-xs text-slate-600 leading-relaxed mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {ticket.aiAnalysisId.reason}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400">
                <p>AI classification queued or in progress.</p>
                {user?.role !== 'CUSTOMER' && (
                  <button
                    onClick={handleTriggerAI}
                    disabled={aiAnalyzing}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    Run AI Analysis Now
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Customer Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Customer Information
            </h3>
            <div className="flex items-center gap-3">
              <img
                src={
                  ticket.customerId?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.customerId?.name || 'Customer')}&background=6366f1&color=fff`
                }
                alt={ticket.customerId?.name}
                className="w-10 h-10 rounded-full object-cover border"
              />
              <div>
                <p className="text-sm font-bold text-slate-800">{ticket.customerId?.name}</p>
                <p className="text-xs text-slate-400">{ticket.customerId?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Structured Summary Modal */}
      <Modal
        isOpen={aiSummaryModal}
        onClose={() => setAiSummaryModal(false)}
        title="AI Ticket Incident Summary"
      >
        {aiSummaryLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Extracting incident timeline and actions...</p>
          </div>
        ) : aiSummary ? (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Key Issues</span>
              <p className="text-xs font-medium text-slate-800 mt-1">{aiSummary.keyIssues}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Customer Requests</span>
              <p className="text-xs font-medium text-slate-800 mt-1">{aiSummary.customerRequests}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Actions Taken So Far</span>
              <p className="text-xs font-medium text-slate-800 mt-1">{aiSummary.actionsTaken}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Pending Actions</span>
              <p className="text-xs font-medium text-slate-800 mt-1">{aiSummary.pendingActions}</p>
            </div>

            <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-100">
              <span className="text-[10px] font-bold uppercase text-indigo-900">Recommended Next Step</span>
              <p className="text-xs font-bold text-indigo-700 mt-1">{aiSummary.nextStep}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Failed to load summary.</p>
        )}
      </Modal>
    </div>
  );
};
