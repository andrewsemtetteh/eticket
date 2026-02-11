"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface Ticket {
  id: string;
  ticket_id: string;
  type: string;
  quantity: number;
  price: number;
  status: string;
  created_at: string;
  users: {
    email: string;
    name: string;
    phone?: string;
  };
  payments?: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
  } | null;
}

interface TicketStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  earlyBird: number;
  general: number;
  totalRevenue: number;
  pendingRevenue: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  user_email: string;
  ticket_id?: string;
  amount?: number;
  status: string;
  created_at: string;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    earlyBirdPrice: 200,
    generalPrice: 300,
    earlyBirdLimit: 40,
    totalTicketLimit: 100,
    earlyBirdDate: '2026-03-15',
    earlyBirdTime: '23:59',
    earlyBirdMode: 'deadline', // 'deadline' or 'count'
    earlyBirdEnabled: true
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [statusFilter, typeFilter]);

  const fetchData = async () => {
    try {
      // Fetch tickets, stats, settings, and recent activity in parallel
      const [ticketsRes, analyticsRes, settingsRes] = await Promise.all([
        fetch(`/api/admin/tickets?${new URLSearchParams({ 
          ...(statusFilter && { status: statusFilter }),
          ...(typeFilter && { type: typeFilter })
        })}`),
        fetch('/api/admin/analytics'),
        fetch('/api/settings')
      ]);

      if (!ticketsRes.ok || !analyticsRes.ok) {
        if (ticketsRes.status === 401 || analyticsRes.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to load data');
      }

      const [ticketsData, analyticsData, settingsData] = await Promise.all([
        ticketsRes.json(),
        analyticsRes.json(),
        settingsRes.json()
      ]);

      setTickets(ticketsData.tickets);
      
      // Calculate ticket statistics
      const tickets = ticketsData.tickets;
      const ticketStats: TicketStats = {
        total: tickets.length,
        confirmed: tickets.filter((t: Ticket) => t.status === 'confirmed').length,
        pending: tickets.filter((t: Ticket) => t.status === 'pending').length,
        cancelled: tickets.filter((t: Ticket) => t.status === 'cancelled').length,
        earlyBird: tickets.filter((t: Ticket) => t.type === 'early_bird').length,
        general: tickets.filter((t: Ticket) => t.type === 'general').length,
        totalRevenue: tickets
          .filter((t: Ticket) => t.status === 'confirmed')
          .reduce((sum: number, t: Ticket) => sum + (t.price * t.quantity), 0),
        pendingRevenue: tickets
          .filter((t: Ticket) => t.status === 'pending')
          .reduce((sum: number, t: Ticket) => sum + (t.price * t.quantity), 0)
      };
      
      setStats(ticketStats);
      setRecentActivity(analyticsData.analytics?.recentActivity || []);

      // Load settings into edit values
      if (settingsData?.settings) {
        const s = settingsData.settings;
        // Parse early bird end date if it exists
        let earlyBirdDate = '2026-03-15';
        let earlyBirdTime = '23:59';
        if (s.early_bird_end_date) {
          try {
            const dateObj = new Date(s.early_bird_end_date);
            if (!isNaN(dateObj.getTime())) {
              earlyBirdDate = dateObj.toISOString().split('T')[0];
              earlyBirdTime = dateObj.toTimeString().slice(0, 5);
            }
          } catch {
            // Keep defaults
          }
        }
        
        setEditValues({
          earlyBirdPrice: Number(s.early_bird_price) || 200,
          generalPrice: Number(s.general_price) || 300,
          earlyBirdLimit: Number(s.early_bird_limit) || 40,
          totalTicketLimit: Number(s.total_ticket_limit) || 100,
          earlyBirdDate,
          earlyBirdTime,
          earlyBirdMode: s.early_bird_mode || 'deadline',
          earlyBirdEnabled: s.early_bird_enabled !== false
        });
      }
    } catch (error) {
      console.error('Data fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // TODO: Implement API call to save changes
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setEditValues({
      earlyBirdPrice: 200,
      generalPrice: 300,
      earlyBirdLimit: 40,
      totalTicketLimit: 100,
      earlyBirdDate: '2026-03-15',
      earlyBirdTime: '23:59',
      earlyBirdMode: 'deadline',
      earlyBirdEnabled: true
    });
    setIsEditing(false);
    setEditingField(null);
  };

  const handleFieldEdit = (field: string) => {
    setEditingField(field);
  };

  const handleFieldSave = async (field: string) => {
    try {
      // Validation: early bird limit cannot exceed total ticket limit
      if (field === 'earlyBirdLimit' && editValues.earlyBirdLimit > editValues.totalTicketLimit) {
        setError('Early bird limit cannot exceed total ticket limit');
        return;
      }
      
      // Validation: if changing total ticket limit, ensure early bird limit doesn't exceed it
      if (field === 'totalTicketLimit' && editValues.earlyBirdLimit > editValues.totalTicketLimit) {
        setError('Total ticket limit cannot be less than early bird limit');
        return;
      }

      // Map field names to API field names
      const fieldMap: Record<string, string> = {
        totalTicketLimit: 'total_ticket_limit',
        generalPrice: 'general_price',
        earlyBirdPrice: 'early_bird_price',
        earlyBirdLimit: 'early_bird_limit',
        earlyBirdMode: 'early_bird_mode',
        earlyBirdEnabled: 'early_bird_enabled',
        earlyBirdDeadline: 'early_bird_end_date',
      };

      let updateData: Record<string, any> = {};
      
      if (field === 'earlyBirdDeadline') {
        // Combine date and time for deadline
        updateData.early_bird_end_date = `${editValues.earlyBirdDate}T${editValues.earlyBirdTime}`;
      } else {
        const apiField = fieldMap[field];
        if (apiField) {
          updateData[apiField] = editValues[field as keyof typeof editValues];
        }
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to save setting');
      }

      setEditingField(null);
    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save');
    }
  };

  const handleFieldCancel = (field: string) => {
    // Reset specific field to original value
    setEditingField(null);
  };

  const formatDisplayDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`);
    return dateTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateEditValue = (field: string, value: string | number | boolean) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle toggle changes that should save immediately
  const handleToggleSave = async (field: string, value: boolean) => {
    updateEditValue(field, value);
    try {
      const fieldMap: Record<string, string> = {
        earlyBirdEnabled: 'early_bird_enabled',
      };
      const apiField = fieldMap[field];
      if (apiField) {
        const response = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [apiField]: value }),
        });
        if (!response.ok) {
          throw new Error('Failed to save setting');
        }
      }
    } catch (error) {
      console.error('Toggle save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save');
    }
  };

  // Handle mode changes that should save immediately
  const handleModeSave = async (value: string) => {
    updateEditValue('earlyBirdMode', value);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ early_bird_mode: value }),
      });
      if (!response.ok) {
        throw new Error('Failed to save setting');
      }
    } catch (error) {
      console.error('Mode save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save');
    }
  };


  if (loading) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-md text-center">
          <p className="text-[var(--foreground-muted)]">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-md text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="ora-btn inline-flex items-center justify-center rounded-[var(--radius)] bg-[var(--accent)] px-5 py-3.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent-hover)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Ticket Management</h1>
        </div>

        {/* Ticket Stats */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest">
                Total Ticket Limit
              </h3>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--accent)]">
                {editValues.totalTicketLimit}
              </p>
            </div>
            <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest">
                Early Bird Limit
              </h3>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--accent)]">
                {editValues.earlyBirdEnabled ? editValues.earlyBirdLimit : 0}
              </p>
              {!editValues.earlyBirdEnabled && (
                <p className="text-xs text-[var(--foreground-muted)]">Disabled</p>
              )}
            </div>
            <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest">
                Early Bird Price
              </h3>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--accent)]">
                {editValues.earlyBirdEnabled ? `GHS ${editValues.earlyBirdPrice}` : '-'}
              </p>
              {!editValues.earlyBirdEnabled && (
                <p className="text-xs text-[var(--foreground-muted)]">Disabled</p>
              )}
            </div>
            <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest">
                General Price
              </h3>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--accent)]">
                GHS {editValues.generalPrice}
              </p>
            </div>
          </div>
        )}

        {/* Ticket Management Sections */}
        <div className="space-y-4">
          {/* Total Ticket Limit and General Price - Two columns on larger devices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Ticket Limit */}
            <div className="border border-[var(--border)] bg-[var(--surface)] p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">Total Ticket Limit</h3>
                </div>
                {editingField !== 'totalTicketLimit' && (
                  <button
                    onClick={() => handleFieldEdit('totalTicketLimit')}
                    className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
              {editingField === 'totalTicketLimit' ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editValues.totalTicketLimit}
                    onChange={(e) => updateEditValue('totalTicketLimit', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFieldSave('totalTicketLimit')}
                      className="px-3 py-1 bg-[var(--accent)] text-[var(--background)] text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleFieldCancel('totalTicketLimit')}
                      className="px-3 py-1 border border-[var(--border)] text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-2xl font-bold text-[var(--foreground)]">{editValues.totalTicketLimit}</div>
              )}
            </div>

            {/* General Price */}
            <div className="border border-[var(--border)] bg-[var(--surface)] p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">General Price</h3>
                  <p className="text-xs text-[var(--foreground-muted)]">GHS</p>
                </div>
                {editingField !== 'generalPrice' && (
                  <button
                    onClick={() => handleFieldEdit('generalPrice')}
                    className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
              {editingField === 'generalPrice' ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editValues.generalPrice}
                    onChange={(e) => updateEditValue('generalPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFieldSave('generalPrice')}
                      className="px-3 py-1 bg-[var(--accent)] text-[var(--background)] text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleFieldCancel('generalPrice')}
                      className="px-3 py-1 border border-[var(--border)] text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-2xl font-bold text-[var(--foreground)]">{editValues.generalPrice}</div>
              )}
            </div>
          </div>

          {/* Early Bird Configuration */}
          <div className="border border-[var(--border)] bg-[var(--surface)] p-4 rounded-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--foreground)]">Early Bird Pricing</h3>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editValues.earlyBirdEnabled}
                  onChange={(e) => handleToggleSave('earlyBirdEnabled', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-[var(--foreground)]">
                  {editValues.earlyBirdEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            {editValues.earlyBirdEnabled && (
              <div className="space-y-4">
                {/* Early Bird Price */}
                <div className="border border-[var(--border)] p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-[var(--foreground)]">Early Bird Price</h4>
                      <p className="text-xs text-[var(--foreground-muted)]">GHS</p>
                    </div>
                    {editingField !== 'earlyBirdPrice' && (
                      <button
                        onClick={() => handleFieldEdit('earlyBirdPrice')}
                        className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {editingField === 'earlyBirdPrice' ? (
                    <div className="mt-2 space-y-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editValues.earlyBirdPrice}
                        onChange={(e) => updateEditValue('earlyBirdPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFieldSave('earlyBirdPrice')}
                          className="px-3 py-1 bg-[var(--accent)] text-[var(--background)] text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleFieldCancel('earlyBirdPrice')}
                          className="px-3 py-1 border border-[var(--border)] text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xl font-bold text-[var(--foreground)]">{editValues.earlyBirdPrice}</div>
                  )}
                </div>

                {/* Early Bird End Condition */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Early Bird Ends When
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="earlyBirdMode"
                        value="deadline"
                        checked={editValues.earlyBirdMode === 'deadline'}
                        onChange={(e) => handleModeSave(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-[var(--foreground)]">Date & Time Reached</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="earlyBirdMode"
                        value="count"
                        checked={editValues.earlyBirdMode === 'count'}
                        onChange={(e) => handleModeSave(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-[var(--foreground)]">Ticket Limit Reached</span>
                    </label>
                  </div>
                </div>

                {/* Configuration based on mode */}
                {editValues.earlyBirdMode === 'deadline' ? (
                  <div className="border border-[var(--border)] p-3 rounded-md">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-[var(--foreground)]">Early Bird Deadline</h4>
                      {editingField !== 'earlyBirdDeadline' && (
                        <button
                          onClick={() => handleFieldEdit('earlyBirdDeadline')}
                          className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {editingField === 'earlyBirdDeadline' ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-[var(--foreground)] mb-1">Date</label>
                            <input
                              type="date"
                              value={editValues.earlyBirdDate}
                              onChange={(e) => updateEditValue('earlyBirdDate', e.target.value)}
                              className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-[var(--foreground)] mb-1">Time</label>
                            <input
                              type="time"
                              value={editValues.earlyBirdTime}
                              onChange={(e) => updateEditValue('earlyBirdTime', e.target.value)}
                              className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFieldSave('earlyBirdDeadline')}
                            className="px-3 py-1 bg-[var(--accent)] text-[var(--background)] text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleFieldCancel('earlyBirdDeadline')}
                            className="px-3 py-1 border border-[var(--border)] text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--foreground)]">
                        {formatDisplayDateTime(editValues.earlyBirdDate, editValues.earlyBirdTime)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-[var(--border)] p-3 rounded-md">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-[var(--foreground)]">Early Bird Ticket Limit</h4>
                      {editingField !== 'earlyBirdLimit' && (
                        <button
                          onClick={() => handleFieldEdit('earlyBirdLimit')}
                          className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {editingField === 'earlyBirdLimit' ? (
                      <div className="space-y-3">
                        <div>
                          <input
                            type="number"
                            min="0"
                            max={editValues.totalTicketLimit}
                            step="1"
                            value={editValues.earlyBirdLimit}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              // Cap at total ticket limit
                              updateEditValue('earlyBirdLimit', Math.min(value, editValues.totalTicketLimit));
                            }}
                            className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md"
                          />
                          <p className="text-xs text-[var(--foreground-muted)] mt-1">
                            Max: {editValues.totalTicketLimit} (total ticket limit). After {editValues.earlyBirdLimit} tickets sold, remaining will be general price.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFieldSave('earlyBirdLimit')}
                            className="px-3 py-1 bg-[var(--accent)] text-[var(--background)] text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleFieldCancel('earlyBirdLimit')}
                            className="px-3 py-1 border border-[var(--border)] text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--foreground)]">
                        {editValues.earlyBirdLimit} tickets
                        <p className="text-xs text-[var(--foreground-muted)] mt-1">
                          After {editValues.earlyBirdLimit} tickets sold, remaining tickets will be general price
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!editValues.earlyBirdEnabled && (
              <p className="text-sm text-[var(--foreground-muted)]">
                Enable early bird pricing to offer discounted tickets
              </p>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ora-card border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] rounded-[var(--radius)]"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="ora-card border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] rounded-[var(--radius)]"
          >
            <option value="">All Types</option>
            <option value="early_bird">Early Bird</option>
            <option value="general">General</option>
          </select>
        </div>

        {/* Ticket Details Table - Read Only View */}
        <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-4">Ticket Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--surface-hover)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {tickets.length > 0 ? (
                  tickets.slice(0, 20).map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-[var(--surface-hover)]">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[var(--foreground)]">
                        {ticket.ticket_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--foreground)]">{ticket.users.name}</div>
                        <div className="text-xs text-[var(--foreground-muted)]">{ticket.users.email}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--foreground)]">
                        {ticket.users.phone || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--foreground)]">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          ticket.type === 'early_bird' 
                            ? 'bg-blue-500/10 text-blue-500' 
                            : 'bg-purple-500/10 text-purple-500'
                        }`}>
                          {ticket.type === 'early_bird' ? 'Early Bird' : 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--foreground)]">
                        {ticket.quantity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--foreground)]">
                        {ticket.payments ? `${ticket.payments.currency} ${ticket.payments.amount}` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          ticket.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                          ticket.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          ticket.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-[var(--foreground-muted)]">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-[var(--foreground-muted)]">
                        {new Date(ticket.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-[var(--foreground-muted)]">
                      No tickets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {tickets.length > 20 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-[var(--foreground-muted)]">
                Showing first 20 tickets. Total: {tickets.length} tickets.
              </p>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
