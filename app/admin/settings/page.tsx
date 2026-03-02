"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface EventSettings {
  id: string;
  early_bird_price: number;
  general_price: number;
  early_bird_limit: number;
  early_bird_end_date: string;
  total_ticket_limit: number;
  event_date: string;
  event_title: string;
  event_time?: string;
  venue_name?: string;
  venue_address?: string;
  admin_email_1?: string;
  admin_email_2?: string;
  admin_email_3?: string;
  early_bird_mode?: string;
  early_bird_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    event_title: '',
    event_date: '',
    event_time: '',
    venue_name: '',
    venue_address: '',
    admin_email_1: '',
    admin_email_2: '',
    admin_email_3: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log('🔍 Admin Settings - Fetching settings...');
      const response = await fetch('/api/settings', {
        credentials: 'include'
      });
      
      console.log('🔍 Admin Settings - Response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('🔍 Admin Settings - Response data:', data);
      } catch (jsonError) {
        console.error('❌ Admin Settings - Failed to parse JSON:', jsonError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.log('❌ Admin Settings - Response not OK:', { status: response.status, error: data.error });
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error(data.error || `Server error (${response.status})`);
      }

      console.log('✅ Admin Settings - Settings loaded successfully');
      setSettings(data.settings);
      setEditValues({
        event_title: data.settings.event_title || '',
        event_date: data.settings.event_date || '',
        event_time: data.settings.event_time || '5:00 PM',
        venue_name: data.settings.venue_name || 'Oraduku Event Center',
        venue_address: data.settings.venue_address || 'Accra, Ghana',
        admin_email_1: data.settings.admin_email_1 || '',
        admin_email_2: data.settings.admin_email_2 || '',
        admin_email_3: data.settings.admin_email_3 || ''
      });
    } catch (error) {
      console.error('❌ Admin Settings - Fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          early_bird_price: settings.early_bird_price,
          general_price: settings.general_price,
          early_bird_limit: settings.early_bird_limit,
          early_bird_end_date: settings.early_bird_end_date,
          total_ticket_limit: settings.total_ticket_limit,
          event_date: settings.event_date,
          event_title: settings.event_title,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setSettings(data.settings);
      setSuccess('Settings updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (field: keyof EventSettings, value: string | number) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleFieldEdit = (field: string) => {
    setEditingField(field);
  };

  const handleFieldSave = async (field: string) => {
    if (!settings) return;
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          [field]: editValues[field as keyof typeof editValues]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update setting');
      }

      setSettings(data.settings);
      setEditingField(null);
      setSuccess(`${field.replace('_', ' ')} updated successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update setting');
    }
  };

  const handleFieldCancel = (field: string) => {
    if (!settings) return;
    setEditValues({
      ...editValues,
      [field]: settings[field as keyof EventSettings] as string
    });
    setEditingField(null);
  };

  const updateEditValue = (field: string, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8">
          <div className="mx-auto w-full max-w-md text-center">
            <p className="text-[var(--foreground-muted)]">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !settings) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Settings</h1>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[var(--radius)]">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-[var(--radius)]">
            <p className="text-sm text-green-500">{success}</p>
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Event Information */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
            {/* Event Title */}
            <div className="border border-[var(--border)] bg-[var(--surface)] p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">Event Title</h3>
                </div>
                {editingField !== 'event_title' && (
                  <button
                    onClick={() => handleFieldEdit('event_title')}
                    className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
              {editingField === 'event_title' ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={editValues.event_title}
                    onChange={(e) => updateEditValue('event_title', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFieldSave('event_title')}
                      className="px-3 py-1 bg-[var(--accent)] text-[var(--background)] text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleFieldCancel('event_title')}
                      className="px-3 py-1 border border-[var(--border)] text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-2xl font-bold text-[var(--accent)]">{editValues.event_title || 'Sitting with the Silence After the Noise'}</div>
              )}
            </div>

            {/* Event Date */}
            <div className="border border-[var(--border)] bg-[var(--surface)] p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">Event Date</h3>
                </div>
                {editingField !== 'event_date' && (
                  <button
                    onClick={() => handleFieldEdit('event_date')}
                    className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
              {editingField === 'event_date' ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="date"
                    value={editValues.event_date}
                    onChange={(e) => updateEditValue('event_date', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFieldSave('event_date')}
                      className="px-3 py-1 bg-[var(--accent)] text-[var(--background)] text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleFieldCancel('event_date')}
                      className="px-3 py-1 border border-[var(--border)] text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-2xl font-bold text-[var(--accent)]">{editValues.event_date || 'April 25, 2026'}</div>
              )}
            </div>
          </div>

          {/* Venue Information */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
            {/* Venue Name */}
            <div className="border border-[var(--border)] bg-[var(--surface)] p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">Venue Name</h3>
                </div>
                {editingField !== 'venue_name' && (
                  <button
                    onClick={() => handleFieldEdit('venue_name')}
                    className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
              {editingField === 'venue_name' ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={editValues.venue_name}
                    onChange={(e) => updateEditValue('venue_name', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFieldSave('venue_name')}
                      className="px-3 py-1 bg-[var(--accent)] text-[var(--background)] text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleFieldCancel('venue_name')}
                      className="px-3 py-1 border border-[var(--border)] text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xl font-bold text-[var(--accent)]">{editValues.venue_name || 'Oraduku Event Center'}</div>
              )}
            </div>

            {/* Venue Address */}
            <div className="border border-[var(--border)] bg-[var(--surface)] p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">Venue Address</h3>
                </div>
                {editingField !== 'venue_address' && (
                  <button
                    onClick={() => handleFieldEdit('venue_address')}
                    className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
              {editingField === 'venue_address' ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={editValues.venue_address}
                    onChange={(e) => updateEditValue('venue_address', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFieldSave('venue_address')}
                      className="px-3 py-1 bg-[var(--accent)] text-[var(--background)] text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleFieldCancel('venue_address')}
                      className="px-3 py-1 border border-[var(--border)] text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xl font-bold text-[var(--accent)]">{editValues.venue_address || 'Accra, Ghana'}</div>
              )}
            </div>
          </div>

          {/* Admin Email Notifications */}
          <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-4">Admin Email Notifications</h2>
            <p className="text-sm text-[var(--foreground-muted)] mb-4">These emails will receive ticket purchase notifications</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Admin Email 1 */}
              <div className="border border-[var(--border)] bg-[var(--background)] p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-[var(--foreground-muted)] uppercase">Admin 1</h3>
                  {editingField !== 'admin_email_1' && (
                    <button
                      onClick={() => handleFieldEdit('admin_email_1')}
                      className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
                {editingField === 'admin_email_1' ? (
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={editValues.admin_email_1}
                      onChange={(e) => updateEditValue('admin_email_1', e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full px-2 py-1 text-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] rounded-md"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleFieldSave('admin_email_1')} className="px-2 py-1 bg-[var(--accent)] text-[var(--background)] text-xs">Save</button>
                      <button onClick={() => handleFieldCancel('admin_email_1')} className="px-2 py-1 border border-[var(--border)] text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--foreground)] truncate">{editValues.admin_email_1 || 'Not set'}</p>
                )}
              </div>

              {/* Admin Email 2 */}
              <div className="border border-[var(--border)] bg-[var(--background)] p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-[var(--foreground-muted)] uppercase">Admin 2</h3>
                  {editingField !== 'admin_email_2' && (
                    <button
                      onClick={() => handleFieldEdit('admin_email_2')}
                      className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
                {editingField === 'admin_email_2' ? (
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={editValues.admin_email_2}
                      onChange={(e) => updateEditValue('admin_email_2', e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full px-2 py-1 text-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] rounded-md"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleFieldSave('admin_email_2')} className="px-2 py-1 bg-[var(--accent)] text-[var(--background)] text-xs">Save</button>
                      <button onClick={() => handleFieldCancel('admin_email_2')} className="px-2 py-1 border border-[var(--border)] text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--foreground)] truncate">{editValues.admin_email_2 || 'Not set'}</p>
                )}
              </div>

              {/* Admin Email 3 */}
              <div className="border border-[var(--border)] bg-[var(--background)] p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-[var(--foreground-muted)] uppercase">Admin 3</h3>
                  {editingField !== 'admin_email_3' && (
                    <button
                      onClick={() => handleFieldEdit('admin_email_3')}
                      className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
                {editingField === 'admin_email_3' ? (
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={editValues.admin_email_3}
                      onChange={(e) => updateEditValue('admin_email_3', e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full px-2 py-1 text-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] rounded-md"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleFieldSave('admin_email_3')} className="px-2 py-1 bg-[var(--accent)] text-[var(--background)] text-xs">Save</button>
                      <button onClick={() => handleFieldCancel('admin_email_3')} className="px-2 py-1 border border-[var(--border)] text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--foreground)] truncate">{editValues.admin_email_3 || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          {/* System Management */}
          <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-4">System Management</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  System Status
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-[var(--foreground)]">Online & Operational</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Last Updated
                </label>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {settings ? new Date(settings.updated_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <h3 className="text-md font-medium text-[var(--foreground)] mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => window.open('/admin/tickets', '_blank')}
                  className="ora-btn rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  View Tickets
                </button>
                <button
                  type="button"
                  onClick={() => window.open('/admin/analytics', '_blank')}
                  className="ora-btn rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  View Analytics
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to refresh the page? Any unsaved changes will be lost.')) {
                      window.location.reload();
                    }
                  }}
                  className="ora-btn rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          {/* Administrative Controls */}
          <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-4">Administrative Controls</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-[var(--radius)] border border-[var(--border)]">
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">Event Registration</h3>
                  <p className="text-xs text-[var(--foreground-muted)]">Allow new ticket purchases</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-500">Active</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-[var(--radius)] border border-[var(--border)]">
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">Early Bird Sales</h3>
                  <p className="text-xs text-[var(--foreground-muted)]">Special pricing until deadline</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-500">Available</span>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-[var(--radius)] border border-[var(--border)]">
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">Payment Processing</h3>
                  <p className="text-xs text-[var(--foreground-muted)]">Paystack integration status</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-500">Connected</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </AdminLayout>
  );
}
