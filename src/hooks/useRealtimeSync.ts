import { useEffect } from 'react';
import { supabase } from '../app/client';
import { toast } from 'sonner';

export function useRealtimeSync(callbacks?: {
  onAlertInserted?: (alert: any) => void;
  onTrekInserted?: (trek: any) => void;
  onVitalsInserted?: (vitals: any) => void;
}) {
  useEffect(() => {
    // 1. Alerts subscription
    const alertsChannel = supabase
      .channel('public:alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          const newAlert = payload.new;
          // Loud visual warning toast as agreed
          toast.error(`🚨 System Alert: ${newAlert.alert_type} triggered and synced live!`, {
            duration: 5000,
          });
          if (callbacks?.onAlertInserted) {
             callbacks.onAlertInserted(newAlert);
          }
        }
      )
      .subscribe();

    // 2. Vitals logs subscription
    const vitalsChannel = supabase
      .channel('public:vitals_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vitals_logs' },
        (payload) => {
          if (callbacks?.onVitalsInserted) {
            callbacks.onVitalsInserted(payload.new);
          }
        }
      )
      .subscribe();

    // 3. Treks subscription
    const treksChannel = supabase
      .channel('public:treks')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'treks' },
        (payload) => {
          toast.info('🌿 A new trek was just started in the network.');
          if (callbacks?.onTrekInserted) {
            callbacks.onTrekInserted(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(vitalsChannel);
      supabase.removeChannel(treksChannel);
    };
  }, [callbacks]);
}
