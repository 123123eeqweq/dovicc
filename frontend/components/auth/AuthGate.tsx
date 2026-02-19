'use client';

import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';

export function AuthGate() {
  const { user, intent, setIntent, checkAuth } = useAuth();
  const isOpen = intent !== null && user === null;

  const handleSuccess = async () => {
    await checkAuth();
    setIntent(null);
  };

  const handleClose = () => {
    setIntent(null);
  };

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
}
