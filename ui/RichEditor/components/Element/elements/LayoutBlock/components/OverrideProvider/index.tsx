import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  RefObject,
} from 'react';

interface OverrideContextType {
  widths: number[];
  setWidths: (widths: number[]) => void;
  isResizing: boolean;
  setIsResizing: (isResizing: boolean) => void;
  containerRef: RefObject<HTMLDivElement>;
}

const OverrideContext = createContext<OverrideContextType | null>(null);

interface OverrideProviderProps {
  initialWidths: number[];
  containerRef: RefObject<HTMLDivElement>;
  children: ReactNode;
}

const OverrideProvider: React.FC<OverrideProviderProps> = ({
  initialWidths,
  containerRef,
  children,
}) => {
  const [widths, setWidths] = useState<number[]>(initialWidths);

  const [isResizing, setIsResizing] = useState(false);

  return (
    <OverrideContext.Provider
      value={{ widths, setWidths, isResizing, setIsResizing, containerRef }}>
      {children}
    </OverrideContext.Provider>
  );
};

const useOverride = () => {
  return useContext(OverrideContext);
};

export { OverrideProvider, useOverride };
