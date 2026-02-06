import { createContext, useContext, Dispatch, SetStateAction } from 'react';

interface DashboardViewContextType {
  activeView: 'employer' | 'candidate';
  setActiveView: Dispatch<SetStateAction<'employer' | 'candidate'>>;
  hasBothRoles: boolean;
}

export const DashboardViewContext = createContext<DashboardViewContextType | null>(null);

export function useDashboardView() {
  return useContext(DashboardViewContext);
}
