import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom React Hook managing real-time Server-Sent Events (SSE) notification stream.
 *
 * Features:
 * - Automatically connects when isLoggedIn is true.
 * - Authenticated with cookies via withCredentials: true.
 * - Exponential backoff reconnection with max delay capping.
 * - Listens for 'PAYMENT_SUCCESS' and celebratory toast notifications.
 * - Dispatches 'promptforge:payment_success' window event for deep component synchronization.
 * - Clean teardown on unmount or user logout.
 */
export default function useNotificationStream({ isLoggedIn, onPaymentSuccess } = {}) {
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Only establish connection if logged in
    if (!isLoggedIn) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      retryCountRef.current = 0;
      return;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const streamUrl = `${baseUrl}/notifications/stream`;

    function connect() {
      if (!isMountedRef.current || !isLoggedIn) return;

      // Close previous instance if open
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      try {
        const es = new EventSource(streamUrl, { withCredentials: true });
        eventSourceRef.current = es;

        es.onopen = () => {
          // Reset retry count on successful connection
          retryCountRef.current = 0;
        };

        const handlePaymentSuccessPayload = (data) => {
          const title = data.title || 'Prompt';
          const msg = data.message || `Payment verified! Full prompt and parameters for "${title}" are now unlocked.`;

          toast.success(msg, {
            duration: 6000,
            icon: '🎉',
          });

          if (typeof onPaymentSuccess === 'function') {
            onPaymentSuccess(data);
          }

          // Broadcast to window so active views (e.g. Prompt.jsx) can update immediately
          window.dispatchEvent(
            new CustomEvent('promptforge:payment_success', {
              detail: data,
            })
          );
        };

        // Listen for specific SSE named event 'PAYMENT_SUCCESS'
        es.addEventListener('PAYMENT_SUCCESS', (event) => {
          try {
            const data = JSON.parse(event.data);
            handlePaymentSuccessPayload(data);
          } catch (err) {
            console.error('Failed to parse PAYMENT_SUCCESS event data:', err);
          }
        });

        // Also listen on default message event as fallback
        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'PAYMENT_SUCCESS' || data.type === 'PAYMENT_SUCCESS') {
              handlePaymentSuccessPayload(data.data || data);
            }
          } catch {
            // Ignore non-json frames (e.g. plain pings)
          }
        };

        es.onerror = () => {
          if (!isMountedRef.current) return;
          // Clean up failing connection
          es.close();
          eventSourceRef.current = null;

          // Exponential backoff: 1s, 2s, 4s, 8s, 16s, capped at 30s
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
          retryCountRef.current += 1;

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && isLoggedIn) {
              connect();
            }
          }, backoffDelay);
        };
      } catch (err) {
        console.error('Failed to initialize EventSource:', err);
      }
    }

    connect();

    return () => {
      isMountedRef.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [isLoggedIn, onPaymentSuccess]);

  return {
    isConnected: Boolean(eventSourceRef.current && eventSourceRef.current.readyState === 1),
  };
}
