import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LegalContextType {
  // Terms Modal
  isTermsOpen: boolean;
  openTerms: () => void;
  closeTerms: () => void;
  
  // Privacy Modal
  isPrivacyOpen: boolean;
  openPrivacy: () => void;
  closePrivacy: () => void;
  
  // Modal with Accept functionality
  openTermsWithAccept: (onAccept: () => void) => void;
  openPrivacyWithAccept: (onAccept: () => void) => void;
  
  // Internal state for accept callbacks
  termsAcceptCallback?: () => void;
  privacyAcceptCallback?: () => void;
}

const LegalContext = createContext<LegalContextType | undefined>(undefined);

interface LegalProviderProps {
  children: ReactNode;
}

export const LegalProvider: React.FC<LegalProviderProps> = ({ children }) => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [termsAcceptCallback, setTermsAcceptCallback] = useState<(() => void) | undefined>();
  const [privacyAcceptCallback, setPrivacyAcceptCallback] = useState<(() => void) | undefined>();

  const openTerms = () => {
    setTermsAcceptCallback(undefined);
    setIsTermsOpen(true);
  };

  const closeTerms = () => {
    setIsTermsOpen(false);
    setTermsAcceptCallback(undefined);
  };

  const openPrivacy = () => {
    setPrivacyAcceptCallback(undefined);
    setIsPrivacyOpen(true);
  };

  const closePrivacy = () => {
    setIsPrivacyOpen(false);
    setPrivacyAcceptCallback(undefined);
  };

  const openTermsWithAccept = (onAccept: () => void) => {
    setTermsAcceptCallback(() => onAccept);
    setIsTermsOpen(true);
  };

  const openPrivacyWithAccept = (onAccept: () => void) => {
    setPrivacyAcceptCallback(() => onAccept);
    setIsPrivacyOpen(true);
  };

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
    <LegalContext.Provider
      value={{
        isTermsOpen,
        openTerms,
        closeTerms,
        isPrivacyOpen,
        openPrivacy,
        closePrivacy,
        openTermsWithAccept,
        openPrivacyWithAccept,
        termsAcceptCallback,
        privacyAcceptCallback,
      }}
    >
      {children}
    </LegalContext.Provider>
  );
};

export const useLegal = (): LegalContextType => {
  const context = useContext(LegalContext);
  if (!context) {
    throw new Error('useLegal must be used within a LegalProvider');
  }
  return context;
};

// Hook for easy access to specific modals
export const useLegalModals = () => {
  const { openTerms, openPrivacy, openTermsWithAccept, openPrivacyWithAccept } = useLegal();
  
  return {
    showTerms: openTerms,
    showPrivacy: openPrivacy,
    showTermsWithAccept: openTermsWithAccept,
    showPrivacyWithAccept: openPrivacyWithAccept,
  };
};
