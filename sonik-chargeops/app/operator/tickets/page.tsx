'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Topbar } from '@/components/Topbar';
import { DataTable } from '@/components/tables/DataTable';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/ui/Badges';
import { apiGetTickets, apiUpdateTicket } from '@/lib/api';
import { ServiceTicket } from '@/types';
import { LifeBuoy, Zap, X, Check, Edit3, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [offset, setOffset] = useState(0);

  // Edit / Triage Modal
  const [editingTicket, setEditingTicket] = useState<ServiceTicket | null>(null);
  const [editStatus, setEditStatus] = useState<string>('InProgress');
  const [editPriority, setEditPriority] = useState<string>('High');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const toast = useToast();

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGetTickets({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        limit: 10,
        offset,
      });
      setTickets(res.tickets);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch service tickets');
      toast.error('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, priorityFilter, offset, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleOpenEdit = (ticket: ServiceTicket) => {
    setEditingTicket(ticket);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority);
    setUpdateError(null);
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      await apiUpdateTicket(editingTicket.ticket_id, {
        status: editStatus,
        priority: editPriority,
      });

      toast.success(
        'Ticket Updated',
        `Ticket #${editingTicket.ticket_id} status changed to ${editStatus}.`
      );
      setEditingTicket(null);
      fetchTickets();
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update ticket');
      toast.error('Update Failed', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'InProgress' },
    { label: 'Resolved', value: 'Resolved' },
    { label: 'Closed', value: 'Closed' },
  ];

  const priorityOptions = [
    { label: 'All Priorities', value: '' },
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
  ];

  const columns = [
    {
      header: 'Ticket ID',
      accessor: 'ticket_id',
      render: (row: ServiceTicket) => (
        <span className="font-mono text-xs font-semibold text-brand-blue">
          TCK-{String(row.ticket_id).padStart(4, '0')}
        </span>
      ),
    },
    {
      header: 'Hardware Target',
      accessor: 'charger_id',
      render: (row: ServiceTicket) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800 font-medium">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>CHG-{String(row.charger_id).padStart(3, '0')}</span>
        </div>
      ),
    },
    {
      header: 'Category & Issue Description',
      render: (row: ServiceTicket) => (
        <div className="max-w-md">
          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 mb-1">
            {row.category}
          </span>
          <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
            {row.description}
          </p>
        </div>
      ),
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row: ServiceTicket) => <TicketPriorityBadge priority={row.priority} />,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: ServiceTicket) => <TicketStatusBadge status={row.status} />,
    },
    {
      header: 'Reported',
      accessor: 'created_at',
      render: (row: ServiceTicket) => (
        <span className="text-xs text-slate-500">
          {new Date(row.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      header: 'Triage Action',
      render: (row: ServiceTicket) => (
        <button
          onClick={() => handleOpenEdit(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-brand-blue hover:text-white transition-all shadow-sm"
        >
          <Edit3 className="w-3 h-3" />
          <span>Triage</span>
        </button>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="Service Ticket Management"
        subtitle="Hardware maintenance requests, firmware diagnostics, and field ticket resolution"
        onOpenSidebar={() => {}}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-card">
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterDropdown
              label="Status"
              options={statusOptions}
              selectedValue={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setOffset(0);
              }}
            />

            <FilterDropdown
              label="Priority"
              options={priorityOptions}
              selectedValue={priorityFilter}
              onChange={(val) => {
                setPriorityFilter(val);
                setOffset(0);
              }}
            />

            {(statusFilter || priorityFilter) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setPriorityFilter('');
                  setOffset(0);
                }}
                className="text-xs text-brand-blue hover:underline font-medium px-2 py-1"
              >
                Clear Filters
              </button>
            )}
          </div>

          <button
            onClick={fetchTickets}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tickets Table */}
        <DataTable
          columns={columns}
          data={tickets}
          isLoading={isLoading}
          error={error}
          onRetry={fetchTickets}
          pagination={pagination}
          onPageChange={(newOffset) => setOffset(newOffset)}
          emptyTitle="No Service Tickets Found"
          emptyDescription="No tickets match the selected filters."
        />

        {/* Edit / Triage Modal */}
        {editingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-dropdown border border-slate-200 max-w-md w-full overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <LifeBuoy className="w-5 h-5 text-brand-blue" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Triage Ticket #{editingTicket.ticket_id}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Target: CHG-{String(editingTicket.charger_id).padStart(3, '0')} &bull; Category: {editingTicket.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingTicket(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTicket} className="p-5 space-y-4">
                {updateError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>{updateError}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900 mb-0.5">Reported Issue:</p>
                  <p className="leading-relaxed">{editingTicket.description}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                    Resolution Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  >
                    <option value="Open">Open (Pending Inspection)</option>
                    <option value="InProgress">In Progress (Field Tech Dispatched)</option>
                    <option value="Resolved">Resolved (Repairs Verified)</option>
                    <option value="Closed">Closed (Archived)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                    Priority Escalation
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical (Immediate Hazard)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTicket(null)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-blue text-white hover:bg-brand-blue-hover shadow-sm transition-all disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Update Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
