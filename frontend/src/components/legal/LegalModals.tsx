import React from 'react';
import { useLegal } from '@/contexts/LegalContext';
import { TermsModal } from './TermsModal';
import { PrivacyModal } from './PrivacyModal';

export const LegalModals: React.FC = () => {
  const {
    isTermsOpen,
    closeTerms,
    isPrivacyOpen,
    closePrivacy,
    termsAcceptCallback,
    privacyAcceptCallback,
  } = useLegal();

  const handleTermsAccept = () => {
    if (termsAcceptCallback) {
      termsAcceptCallback();
    }
    closeTerms();
  };

  const handlePrivacyAccept = () => {
    if (privacyAcceptCallback) {
      privacyAcceptCallback();
    }
    closePrivacy();
  };

  return (
    <>
      <TermsModal
        open={isTermsOpen}
        onOpenChange={closeTerms}
        onAccept={handleTermsAccept}
        showAcceptButton={!!termsAcceptCallback}
      />
      
      <PrivacyModal
        open={isPrivacyOpen}
        onOpenChange={closePrivacy}
        onAccept={handlePrivacyAccept}
        showAcceptButton={!!privacyAcceptCallback}
      />
    </>
  );
};
