export type HistoryEntry = {
  id: string;
  malaNumber: number;
  completedAt: string;
};

export type CounterState = {
  count: number;
  completedMalas: number;
  history: HistoryEntry[];
};
