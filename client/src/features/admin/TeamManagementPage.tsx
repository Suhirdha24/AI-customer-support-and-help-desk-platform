import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { toast } from '../../store/useToastStore.js';
import { Modal } from '../../components/Modal.js';
import { SkeletonTable } from '../../components/SkeletonLoader.js';
import { Team, User } from '../../types/index.js';
import { Plus, Briefcase } from 'lucide-react';

export const TeamManagementPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leadId, setLeadId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const [tRes, aRes] = await Promise.all([
        apiClient.get('/admin/teams'),
        apiClient.get('/admin/agents'),
      ]);
      if (tRes.data.success) setTeams(tRes.data.data);
      if (aRes.data.success) setAgents(aRes.data.data);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const res = await apiClient.post('/admin/teams', {
        name,
        description,
        leadId: leadId || undefined,
      });
      if (res.data.success) {
        toast.success('Team created successfully');
        setShowModal(false);
        setName('');
        setDescription('');
        setLeadId('');
        fetchTeams();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to create team');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Organization</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Support Teams & Routing
          </h2>
          <p className="text-sm text-slate-500">
            Configure specialized tier teams (Billing, Infrastructure, Enterprise).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Team</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle">
        {loading ? (
          <SkeletonTable rows={3} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Team Name</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Team Lead</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 text-xs flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      <span>{team.name}</span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">{team.description || '—'}</td>
                    <td className="py-4 px-6 text-xs text-slate-700 font-medium">
                      {team.leadId?.name || 'Unassigned'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Support Team">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Team Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Infrastructure Tier 2"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the team's scope..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Team Lead</label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">No Lead Assigned</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
