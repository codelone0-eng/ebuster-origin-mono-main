import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CursorType } from './CursorSelector';

interface CursorContextType {
  cursorType: CursorType;
  setCursorType: (cursor: CursorType) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};

interface CursorProviderProps {
  children: ReactNode;
}

export const CursorProvider = ({ children }: CursorProviderProps) => {
  const [cursorType, setCursorType] = useState<CursorType>('default');

  // Load cursor preference from localStorage
  useEffect(() => {
    const savedCursor = localStorage.getItem('cursor-type') as CursorType;
    const validCursors: CursorType[] = ['default', 'custom'];
    if (savedCursor && validCursors.includes(savedCursor)) {
      setCursorType(savedCursor);
    }
  }, []);

  // Save cursor preference to localStorage
  const handleSetCursorType = (cursor: CursorType) => {
    setCursorType(cursor);
    localStorage.setItem('cursor-type', cursor);
  };

  return (
    <CursorContext.Provider value={{ cursorType, setCursorType: handleSetCursorType }}>
      {children}
    </CursorContext.Provider>
  );
};
