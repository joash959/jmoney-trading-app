import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { parseFunctionError } from '../lib/functionError';
import { useAuth } from '../contexts/AuthContext';

/** Shared "connect your PrimeXBT account" flow - drives PrimeXBTConnectModal
 * from anywhere in the app that gates a feature behind premium tier. */
export function usePrimeXBTConnect() {
  const { refreshProfile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const handleConnect = async () => {
    if (!clientId.trim()) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const { data, error } = await supabase.functions.invoke(
      'primexbt-verify',
      { body: { action: 'verify', brokerId: clientId.trim() } }
    );

    setLoading(false);

    if (error) {
      setErrorMessage(await parseFunctionError(error));
      return;
    }
    if (!data?.found) {
      setErrorMessage(
        "We couldn't find that PrimeXBT client ID. Double-check it's your 7-digit client ID, not your MT5 account number."
      );
      return;
    }
    if (data.funded) {
      setSuccessMessage(
        data.upgraded
          ? 'Account verified and funded — premium unlocked! 🎉'
          : 'Account verified and funded.'
      );
      refreshProfile();
    } else {
      setSuccessMessage(
        'Account found, but not yet funded. Fund your account (minimum R500) to unlock premium features.'
      );
    }
  };

  return {
    visible,
    open,
    close,
    clientId,
    setClientId,
    handleConnect,
    loading,
    successMessage,
    errorMessage,
  };
}
