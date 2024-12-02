import React, {
  useEffect,
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
  widths: number[];
  containerRef: RefObject<HTMLDivElement>;
  children: ReactNode;
}

const OverrideProvider: React.FC<OverrideProviderProps> = ({
  widths,
  containerRef,
  children,
}) => {
  const [privateWidths, setPrivateWdiths] = useState(widths);

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    setPrivateWdiths(widths);
  }, [widths]);

  return (
    <OverrideContext.Provider
      value={{
        widths: privateWidths,
        setWidths: setPrivateWdiths,
        isResizing,
        setIsResizing,
        containerRef,
      }}>
      {children}
    </OverrideContext.Provider>
  );
};

const useOverride = () => {
  return useContext(OverrideContext);
};

export { OverrideProvider, useOverride };
