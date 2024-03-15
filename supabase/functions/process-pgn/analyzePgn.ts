import { Chess } from 'npm:chess.js'

export async function analyzePgn(pgn: string): Promise<void> {
  const chess = new Chess()
  chess.loadPgn(pgn, { sloppy: true });
  const moveHistory = chess.history({ verbose: true});

  console.log("Move History", moveHistory);

  const finalMove = moveHistory[moveHistory.length - 1];
  const finalPosition = finalMove.after;

  //Check to see what phase the game is in
  return pgn;
}

function getEndingGamePhase(game: Chess): string {
  // Middlegame Starts when:
  // - There are 10 or fewer major or minor pieces (initially 14) OR
  // - The back rank is sparse
  //  - Arbitrarily we'll say that of the 8 pieces, 5 have moved from their initial position

  //Let's start by checking the backrank. This will be tedious since pieces can shuffle around,
  //so simply checking for being empty is not enough.
  let backRankPieces = 0;
  //First advance to the last move of the game
  //  - If I can't manually advance the moves, then I'll need to load the final FEN

  //White's Pieces
  const a1Square = game.get('a1'); // example return-> { type: 'p', color: 'b' }
  const b1Square = game.get('b1');
  const c1Square = game.get('c1');
  const d1Square = game.get('d1');
  const e1Square = game.get('e1');
  const f1Square = game.get('f1');
  const g1Square = game.get('g1');
  const h1Square = game.get('h1');

  //Black's Pieces
  const a8Square = game.get('a8');
  const b8Square = game.get('b8');
  const c8Square = game.get('c8');
  const d8Square = game.get('d8');
  const e8Square = game.get('e8');
  const f8Square = game.get('f8');
  const g8Square = game.get('g8');
  const h8Square = game.get('h8');
  
  )

  //Endgame starts when there are 6 or fewer major or minor pieces

}