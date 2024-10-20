'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ModalProviderProps {
  children: ReactNode;
}

export type ModalData = {
  contact: (contact: any) => unknown;
  user: any;
  plan?: any;
  addons?: any[]; // Changed AddOn[] to any[]
}

type ModalContextType = {
  data: ModalData;
  isOpen: boolean;
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => void;
  setClose: () => void;
}

const ModalContext = createContext<ModalContextType>({
  data: {
    contact: () => {},
    user: null,
  },
  isOpen: false,
  setOpen: () => {},
  setClose: () => {},
});

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ModalData>({
    contact: () => {},
    user: null,
  });
  const [showingModal, setShowingModal] = useState<React.ReactNode>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setOpen = async (modal: React.ReactNode, fetchData?: () => Promise<any>) => {
    if (modal) {
      if (fetchData) {
        setData(await fetchData());
      }
      setShowingModal(modal);
      setIsOpen(true);
    }
  };

  const setClose = () => {
    setIsOpen(false);
    setData({
      contact: () => {},
      user: null,
    });
  };

  if (!isMounted) return null;

  return (
    <ModalContext.Provider value={{ data, setOpen, setClose, isOpen }}>
      {children}
      {showingModal}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within the ModalProvider');
  }
  return context;
};

export default ModalProvider;
