"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface Analytics {
  tickets: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
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

interface ChartData {
  ticketsByType: { name: string; value: number; color: string }[];
  ticketsByStatus: { name: string; value: number; color: string }[];
  revenueByStatus: { name: string; value: number; color: string }[];
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      console.log('🔍 Admin Analytics - Fetching analytics...');
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include',
      });
      const data = await response.json();

      console.log('🔍 Admin Analytics - Analytics response:', { 
        status: response.status, 
        ok: response.ok,
        hasData: !!data 
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Admin Analytics - Unauthorized, redirecting to login');
          router.push('/admin/login');
          return;
        }
        throw new Error(data.error || 'Failed to load analytics');
      }

      console.log('✅ Admin Analytics - Analytics loaded successfully');
      setAnalytics(data.analytics);
      
      // Prepare chart data
      const charts: ChartData = {
        ticketsByType: [
          { name: 'Early Bird', value: data.analytics.tickets.earlyBird, color: '#3b82f6' },
          { name: 'General', value: data.analytics.tickets.general, color: '#8b5cf6' }
        ],
        ticketsByStatus: [
          { name: 'Confirmed', value: data.analytics.tickets.confirmed, color: '#10b981' },
          { name: 'Pending', value: data.analytics.tickets.pending, color: '#f59e0b' },
          { name: 'Cancelled', value: data.analytics.tickets.cancelled, color: '#ef4444' }
        ],
        revenueByStatus: [
          { name: 'Successful', value: data.analytics.payments.successfulRevenue, color: '#10b981' },
          { name: 'Pending', value: data.analytics.payments.totalRevenue - data.analytics.payments.successfulRevenue, color: '#f59e0b' }
        ]
      };
      
      setChartData(charts);
    } catch (error) {
      console.error('Analytics error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8">
          <div className="mx-auto w-full max-w-md text-center">
            <p className="text-[var(--foreground-muted)]">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
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

  if (!analytics) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Analytics</h1>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
            <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest">
              Total Revenue
            </h3>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              GHS {analytics.payments.totalRevenue.toFixed(2)}
            </p>
          </div>

          <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
            <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest">
              Total Tickets
            </h3>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {analytics.tickets.total}
            </p>
          </div>

          <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
            <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest">
              Early Bird Tickets
            </h3>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {analytics.tickets.earlyBird}
            </p>
          </div>

          <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
            <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest">
              General Tickets
            </h3>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {analytics.tickets.general}
            </p>
          </div>
        </div>


        {/* Recent Activity */}
        <div className="ora-card border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.slice(0, 15).map((activity, index) => (
                <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {activity.description}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">
                      {new Date(activity.created_at).toLocaleDateString()} at{' '}
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activity.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    activity.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                    'bg-gray-500/10 text-gray-500'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--foreground-muted)] text-center py-8">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
