"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';

interface Analytics {
  tickets: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    used: number;
    earlyBird: number;
    general: number;
  };
  payments: {
    total: number;
    successful: number;
    pending: number;
    failed: number;
    totalRevenue: number;
    successfulRevenue: number;
  };
  recentActivity: Array<{
    type: string;
    id: string;
    description: string;
    status: string;
    created_at: string;
  }>;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Add a small delay to ensure authentication cookie is available
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchAnalytics = async () => {
    try {
      console.log('🔍 Admin Dashboard - Fetching analytics...');
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include', // Ensure cookies are sent
      });
      const data = await response.json();

      console.log('🔍 Admin Dashboard - Analytics response:', { 
        status: response.status, 
        ok: response.ok,
        hasData: !!data 
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Admin Dashboard - Unauthorized, redirecting to login');
          router.push('/admin/login');
          return;
        }
        throw new Error(data.error || 'Failed to load analytics');
      }

      console.log('✅ Admin Dashboard - Analytics loaded successfully');
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Analytics error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-md text-center">
          <p className="text-[var(--foreground-muted)]">Loading dashboard...</p>
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

  if (!analytics) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Dashboard Overview</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
            <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest">
              Total Tickets
            </h3>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {analytics.tickets.total}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-[var(--foreground-muted)]">
              {analytics.tickets.confirmed} confirmed
            </p>
          </div>

          <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
            <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest">
              Revenue
            </h3>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              GHS {analytics.payments.successfulRevenue}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-[var(--foreground-muted)]">
              {analytics.payments.successful} successful payments
            </p>
          </div>

          <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
            <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest">
              Early Bird
            </h3>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {analytics.tickets.earlyBird}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-[var(--foreground-muted)]">
              tickets sold
            </p>
          </div>

          <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
            <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest">
              General
            </h3>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {analytics.tickets.general}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-[var(--foreground-muted)]">
              tickets sold
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity, index) => (
                <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {activity.description}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {new Date(activity.created_at).toLocaleDateString()} at{' '}
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    activity.status === 'confirmed' || activity.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : activity.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--foreground-muted)]">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
