"use client";

import { useState, useEffect } from 'react';

interface CacheInvalidatorProps {
  onCacheInvalidated?: () => void;
}

export default function CacheInvalidator({ onCacheInvalidated }: CacheInvalidatorProps) {
  const [lastInvalidation, setLastInvalidation] = useState<Date | null>(null);

  useEffect(() => {
    const handleAdminUpdate = (event: CustomEvent) => {
      console.log('🔄 CacheInvalidator - Admin update detected:', event.detail);
      invalidateCache();
    };

    const handleTicketDataUpdate = (event: CustomEvent) => {
      console.log('🔄 CacheInvalidator - Ticket data updated:', event.detail);
      setLastInvalidation(new Date());
      onCacheInvalidated?.();
    };

    // Listen for admin update events
    window.addEventListener('admin-settings-updated', handleAdminUpdate as EventListener);
    window.addEventListener('ticket-data-updated', handleTicketDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('admin-settings-updated', handleAdminUpdate as EventListener);
      window.removeEventListener('ticket-data-updated', handleTicketDataUpdate as EventListener);
    };
  }, [onCacheInvalidated]);

  const invalidateCache = async () => {
    try {
      // Call cache invalidation API
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invalidate-cache' })
      });

      if (response.ok) {
        setLastInvalidation(new Date());
        onCacheInvalidated?.();
        console.log('🔄 CacheInvalidator - Cache invalidated successfully');
      }
    } catch (error) {
      console.error('🔄 CacheInvalidator - Failed to invalidate cache:', error);
    }
  };

  // This component is invisible - it just handles cache coordination
  return null;
}
