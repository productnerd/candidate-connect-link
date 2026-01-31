export type PracticeAnswer = {
  questionId: string;
  answer: string;
  flagged?: boolean;
};

export type PracticeResult = {
  score: number;
  percentage: number;
  timeTakenSeconds: number;
  completedAt: string;
};

export type PracticeSessionState = {
  id: string;
  testId: string;
  durationSeconds: number;
  startedAt: string; // ISO
  status: 'in_progress' | 'completed';
  currentIndex: number;
  timeRemaining: number;
  answers: PracticeAnswer[];
  result?: PracticeResult;
};

const keyFor = (id: string) => `practice_session:${id}`;

export function createPracticeSession(params: {
  id: string;
  testId: string;
  durationSeconds: number;
}): PracticeSessionState {
  const session: PracticeSessionState = {
    id: params.id,
    testId: params.testId,
    durationSeconds: params.durationSeconds,
    startedAt: new Date().toISOString(),
    status: 'in_progress',
    currentIndex: 0,
    timeRemaining: params.durationSeconds,
    answers: [],
  };

  sessionStorage.setItem(keyFor(params.id), JSON.stringify(session));
  return session;
}

export function loadPracticeSession(id: string): PracticeSessionState | null {
  const raw = sessionStorage.getItem(keyFor(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PracticeSessionState;
  } catch {
    return null;
  }
}

export function savePracticeSession(id: string, next: PracticeSessionState) {
  sessionStorage.setItem(keyFor(id), JSON.stringify(next));
}
