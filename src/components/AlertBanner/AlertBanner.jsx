/**
 * AlertBanner.jsx
 * Real-time alert notification system for FlowMind AI.
 *
 * Subscribes to venue alert events (crowd spikes, wait surges)
 * and displays dismissible toast notifications with ARIA live regions.
 *
 * Alerts auto-dismiss after 6 seconds.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { subscribeToAlerts } from '../../services/dataService';
import { X, AlertTriangle } from 'lucide-react';
import './AlertBanner.css';

const MAX_ALERTS = 3; // Maximum simultaneously visible toasts

const AlertBanner = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToAlerts((alert) => {
      const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
      const alertWithId = { ...alert, id };

      setAlerts(prev => {
        // Cap at MAX_ALERTS — remove oldest if needed
        const updated = [...prev, alertWithId].slice(-MAX_ALERTS);
        return updated;
      });

      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }, 6000);
    });

    return () => unsubscribe();
  }, []);

  const dismiss = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div
      className="alert-container"
      role="region"
      aria-label="Live venue alerts"
      aria-live="assertive"
      aria-atomic="false"
      aria-relevant="additions"
    >
      {alerts.map(alert => (
        <div
          key={alert.id}
          className="alert-toast"
          role="alert"
          aria-label={alert.message}
        >
          <AlertTriangle size={16} className="alert-icon" aria-hidden="true" />
          <span className="alert-msg">{alert.message}</span>
          <button
            className="alert-dismiss"
            onClick={() => dismiss(alert.id)}
            aria-label={`Dismiss alert: ${alert.message}`}
            title="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;
