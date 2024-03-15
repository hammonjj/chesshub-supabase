import { Chess } from 'npm:chess.js'
import { parseGame } from "npm:@mliebelt/pgn-parser";
import { ProcessPgnRequest } from './types';

export async function analyzePgn(id: number, pgn: string): Promise<ProcessPgnRequest> {
  const chess = new Chess()
  chess.loadPgn(pgn, { sloppy: true });
  const moveHistory = chess.history({ verbose: true});

  console.log("Move History", moveHistory);

  const endingPhase = getEndingGamePhase(moveHistory[moveHistory.length - 1].after);
  console.log("Ending Phase", endingPhase);

  return {
    id,
    pgn, 
    endingPhase
  };
}

// Middlegame Starts when:
// - There are 10 or fewer major or minor pieces (initially 14) OR
// - The back rank is sparse
//  - Arbitrarily we'll say that of the 8 pieces, 5 have moved from their initial position
//  - Or maybe that of the 14 initial pieces, 9 have moved

//Endgame starts when there are 6 or fewer major or minor pieces
function getEndingGamePhase(fen: string): string {
  const pieceCount = countBackRankPieces(fen);

  if (isInEndgame(pieceCount)) {
    return 'endgame';
  }

  if (isInMiddlegame(pieceCount)) {
    return 'middlegame';
  }

  const chess = new Chess(fen);
  const whitePieces = ['a1', 'b1', 'c1', 'd1', 'f1', 'g1', 'h1'];
  const blackPieces = ['a8', 'b8', 'c8', 'd8', 'f8', 'g8', 'h8'];

  const whiteBackRank = getPieceCountFromRank(chess, '1', whitePieces);
  const blackBackRank = getPieceCountFromRank(chess, '8', blackPieces);

  if (whiteBackRank + blackBackRank > 8) {
    return 'middlegame';
  }

  return 'opening';
}

function countBackRankPieces(fen: string): number {
  return (fen.match(/r|n|b|q/gi) || []).length;
}

function isInEndgame(pieceCount: number): boolean {
  return pieceCount <= 6;
}

function isInMiddlegame(pieceCount: number): boolean {
  return pieceCount <= 10 && pieceCount > 6;
}

function getPieceCountFromRank(chess: any, rank: string, pieces: string[]): number {
  let count = 0;
  for (const piece of pieces) {
    // Not sure if Mr. GPT did this right
    //  - I'm pretty sure "get" takes the square as an argument and returns { type: 'p', color: 'b' }
    const square = chess.get(piece + rank);
    if (square) {
      count++;
    }
  }

  return count;
}