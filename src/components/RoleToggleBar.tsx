import { Dispatch, SetStateAction } from 'react';

interface RoleToggleProps {
  activeView: 'employer' | 'candidate';
  setActiveView: Dispatch<SetStateAction<'employer' | 'candidate'>>;
}

export function RoleToggleBar({ activeView, setActiveView }: RoleToggleProps) {
  return (
    <div className="flex justify-center py-3 bg-muted/30 border-b">
      <div className="flex items-center rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-1">
        <button
          onClick={() => setActiveView('employer')}
          className={`px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeView === 'employer'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
          }`}
        >
          Business
        </button>
        <button
          onClick={() => setActiveView('candidate')}
          className={`px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeView === 'candidate'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
          }`}
        >
          Candidate
        </button>
      </div>
    </div>
  );
}
