import { Chess } from "npm:chess.js";
//import { parseGame } from "npm:@mliebelt/pgn-parser";
import { ProcessPgnRequest } from "./types.ts";

export function analyzePgn(
  id: number,
  pgn: string,
): ProcessPgnRequest {
  const chess = new Chess();
  chess.loadPgn(pgn, { sloppy: true });
  const moveHistory = chess.history({ verbose: true });

  console.log("Move History", moveHistory);

  const endingPhase = getEndingGamePhase(
    moveHistory[moveHistory.length - 1].after,
  );

  console.log("Ending Phase", endingPhase);

  return {
    id,
    endingPhase,
    endingFen: moveHistory[moveHistory.length - 1].after,
  };
}

// Middlegame Starts when:
// - There are 10 or fewer major or minor pieces (initially 14) OR
// - The back rank is sparse
//  - Arbitrarily we'll say that of the 8 pieces, 5 have moved from their initial position
//  - Or maybe that of the 14 initial pieces, 9 have moved

//Endgame starts when there are 6 or fewer major or minor pieces
function getEndingGamePhase(fen: string): string {
  console.log("FEN", fen);
  const pieceCount = countBackRankPieces(fen);
  console.log("Piece Count", pieceCount);
  if (isInEndgame(pieceCount)) {
    return "endgame";
  }

  if (isInMiddlegame(pieceCount, fen)) {
    return "middlegame";
  }

  return "opening";
}

function countBackRankPieces(fen: string): number {
  return (fen.match(/r|n|b|q/gi) || []).length;
}

function isInEndgame(pieceCount: number): boolean {
  return pieceCount <= 6;
}

function isInMiddlegame(pieceCount: number, fen: string): boolean {
  //I need to rethink this check - something about it doesn't feel right
  const chess = new Chess(fen);
  const whitePieces = ["a1", "b1", "c1", "d1", "f1", "g1", "h1"];
  const blackPieces = ["a8", "b8", "c8", "d8", "f8", "g8", "h8"];

  const whiteBackRank = getPieceCountFromRank(chess, "1", whitePieces);
  const blackBackRank = getPieceCountFromRank(chess, "8", blackPieces);
  console.log("White Back Rank", whiteBackRank);
  console.log("Black Back Rank", blackBackRank);

  if (whiteBackRank + blackBackRank < 9) {
    return true;
  }

  return pieceCount <= 10 && pieceCount > 6;
}

function getPieceCountFromRank(
  chess: any,
  rank: string,
  pieces: string[],
): number {
  // 1 & 8 -> Rook
  // 2 & 7 -> Knight
  // 3 & 6 -> Bishop
  // 4 -> Queen (or King if black)
  // 5 -> King  (or Queen if black)

  let count = 0;
  for (const piece of pieces) {
    // Not sure if Mr. GPT did this right
    //  - I'm pretty sure "get" takes the square as an argument and returns { type: 'p', color: 'b' }
    // UPDATE: It definitely isn't right, but I need to ponder a better way to do this
    const square = chess.get(piece + rank);
    if (square) {
      count++;
    }
  }

  return count;
}
