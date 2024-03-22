export interface ProcessPgnResponse {
  gameId: number;
  analysis: PgnAnalysis;
}

export interface PgnAnalysis {
  endingFen: string;
  endingPhase: string;
}
