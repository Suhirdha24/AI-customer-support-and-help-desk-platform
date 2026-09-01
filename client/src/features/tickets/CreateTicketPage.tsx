import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { toast } from '../../store/useToastStore.js';
import { Category, Attachment } from '../../types/index.js';
import { Sparkles, Upload, X, FileText, ArrowLeft, Send } from 'lucide-react';

export const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get('/admin/categories').then((res) => {
      if (res.data.success && res.data.data.length > 0) {
        setCategories(res.data.data);
        setCategoryId(res.data.data[0].id);
      }
    });
  }, []);

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
        toast.success('Files uploaded successfully');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'File upload failed. Max file size is 10MB.');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error('Please provide a ticket subject and description.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiClient.post('/tickets', {
        subject,
        description,
        categoryId: categoryId || undefined,
        priority,
        attachments,
      });

      if (res.data.success) {
        toast.success(`Ticket ${res.data.data.ticketNumber} created successfully!`);
        navigate(`/customer/tickets/${res.data.data.id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit support ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top breadcrumb */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tickets</span>
        </button>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create New Support Ticket
        </h2>
        <p className="text-sm text-slate-500">
          Describe your issue in detail. Our automated AI triage will analyze sentiment and priority instantly.
        </p>
      </div>

      {/* AI Notice Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2 bg-indigo-600 rounded-xl text-white shrink-0 shadow-sm shadow-indigo-500/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
            Automated AI Intelligent Triage Active
          </h4>
          <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">
            Your inquiry is automatically processed with category inference, sentiment classification, and contextual knowledge base grounding.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-subtle">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Subject Line *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Production Webhook Failures with HTTP 504 Timeout"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="LOW">Low - General inquiry</option>
                <option value="MEDIUM">Medium - Non-critical bug</option>
                <option value="HIGH">High - Major feature impaired</option>
                <option value="URGENT">Urgent - Complete service disruption</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide step-by-step reproduction details, error logs, and business impact..."
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all leading-relaxed font-normal"
            />
          </div>

          {/* Attachments Section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              File Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <label className="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                <span>Upload files or drag and drop</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf,.log,.txt,.json,.csv"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, PDF, TXT, LOG up to 10MB each</p>
              {uploading && <p className="text-xs text-indigo-600 font-semibold mt-2 animate-pulse">Uploading files...</p>}
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="max-w-[160px] truncate">{att.fileName}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Ticket</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
