'use client';

import { ReactNode, useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  const initialize = useAppStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
};

export default Providers;
