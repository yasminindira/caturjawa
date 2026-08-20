const boardEl =
  document.getElementById("board");

const statusText =
  document.getElementById("statusText");

const gameMessage =
  document.getElementById("gameMessage");

const turnProgress =
  document.getElementById("turnProgress");

const blackCapturedEl =
  document.getElementById("blackCaptured");

const whiteCapturedEl =
  document.getElementById("whiteCaptured");

const blackScoreEl =
  document.getElementById("blackScore");

const whiteScoreEl =
  document.getElementById("whiteScore");

const historyEl =
  document.getElementById("history");

const blackNameEl =
  document.getElementById("blackName");

const modeTitle =
  document.getElementById("modeTitle");

const modeDescription =
  document.getElementById("modeDescription");

const resultModal =
  document.getElementById("resultModal");

const resultTitle =
  document.getElementById("resultTitle");

const resultText =
  document.getElementById("resultText");

const resultSymbol =
  document.getElementById("resultSymbol");


/* =========================
   SIMBOL BIDAK
========================= */

const symbols = {

  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙"
  },

  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟"
  }

};


const values = {

  pawn: 1,

  knight: 3,

  bishop: 3,

  rook: 5,

  queen: 9,

  king: 100

};


/* =========================
   POSISI AWAL
========================= */

const initialBoard = [

  [
    "black-rook",
    "black-knight",
    "black-bishop",
    "black-queen",
    "black-king",
    "black-bishop",
    "black-knight",
    "black-rook"
  ],

  [
    "black-pawn",
    "black-pawn",
    "black-pawn",
    "black-pawn",
    "black-pawn",
    "black-pawn",
    "black-pawn",
    "black-pawn"
  ],

  [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ],

  [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ],

  [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ],

  [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ],

  [
    "white-pawn",
    "white-pawn",
    "white-pawn",
    "white-pawn",
    "white-pawn",
    "white-pawn",
    "white-pawn",
    "white-pawn"
  ],

  [
    "white-rook",
    "white-knight",
    "white-bishop",
    "white-queen",
    "white-king",
    "white-bishop",
    "white-knight",
    "white-rook"
  ]

];


/* =========================
   VARIABLE GAME
========================= */

let board;

let turn;

let selected;

let captured;

let history;

let gameOver;

let mode = "ai";

let thinking = false;

let soundOn = true;

let lastMove = null;


/* =========================
   HELPER
========================= */

function colorOf(piece) {

  return piece
    ? piece.split("-")[0]
    : null;

}


function typeOf(piece) {

  return piece
    ? piece.split("-")[1]
    : null;

}


function cloneBoard(board) {

  return board.map(
    row => [...row]
  );

}


/* =========================
   RESET GAME
========================= */

function resetGame() {

  board =
    cloneBoard(initialBoard);

  turn = "white";

  selected = null;

  captured = {
    white: [],
    black: []
  };

  history = [];

  gameOver = false;

  thinking = false;

  lastMove = null;

  resultModal.classList.add(
    "hidden"
  );

  gameMessage.textContent =
    mode === "ai"
      ? "Pilih bidak putih untuk memulai."
      : "Pilih bidak untuk memulai.";

  render();

}


/* =========================
   RENDER BOARD
========================= */

function render() {

  boardEl.innerHTML = "";


  for (
    let row = 0;
    row < 8;
    row++
  ) {

    for (
      let col = 0;
      col < 8;
      col++
    ) {

      const square =
        document.createElement("div");


      square.className =
        `square ${
          (row + col) % 2 === 0
            ? "light"
            : "dark"
        }`;


      const piece =
        board[row][col];


      if (
        selected &&
        selected.r === row &&
        selected.c === col
      ) {

        square.classList.add(
          "selected"
        );

      }


      if (
        lastMove &&
        (
          (
            lastMove.fr === row &&
            lastMove.fc === col
          )
          ||
          (
            lastMove.tr === row &&
            lastMove.tc === col
          )
        )
      ) {

        square.classList.add(
          "last-move"
        );

      }


      if (
        selected &&
        isLegalMove(
          board,
          selected.r,
          selected.c,
          row,
          col,
          turn
        )
      ) {

        square.classList.add(
          piece
            ? "capture"
            : "legal"
        );

      }


      if (piece) {

        const pieceElement =
          document.createElement(
            "span"
          );


        pieceElement.className =
          `piece ${
            colorOf(piece)
          }-piece`;


        pieceElement.textContent =
          symbols[
            colorOf(piece)
          ][
            typeOf(piece)
          ];


        square.appendChild(
          pieceElement
        );

      }


      square.onclick = () =>
        clickSquare(row, col);


      boardEl.appendChild(
        square
      );

    }

  }


  whiteCapturedEl.textContent =
    captured.white
      .map(
        piece =>
          symbols.white[
            typeOf(piece)
          ]
      )
      .join(" ");


  blackCapturedEl.textContent =
    captured.black
      .map(
        piece =>
          symbols.black[
            typeOf(piece)
          ]
      )
      .join(" ");


  whiteScoreEl.textContent =
    captured.white.reduce(
      (total, piece) =>
        total + values[
          typeOf(piece)
        ],
      0
    );


  blackScoreEl.textContent =
    captured.black.reduce(
      (total, piece) =>
        total + values[
          typeOf(piece)
        ],
      0
    );


  statusText.textContent =
    gameOver
      ? "Selesai"
      : `Giliran ${
          turn === "white"
            ? "Putih"
            : "Hitam"
        }`;


  turnProgress.style.width =
    turn === "white"
      ? "50%"
      : "100%";


  if (history.length) {

    historyEl.innerHTML =
      history
        .map(
          (move, index) => `
            <div class="history-row">
              <span class="move-no">
                ${index + 1}.
              </span>

              <span>
                ${move}
              </span>
            </div>
          `
        )
        .join("");

  } else {

    historyEl.innerHTML =
      "Belum ada langkah.";

  }

}


/* =========================
   KLIK PAPAN
========================= */

function clickSquare(row, col) {

  if (
    gameOver ||
    thinking ||
    (
      mode === "ai" &&
      turn === "black"
    )
  ) {
    return;
  }


  const piece =
    board[row][col];


  if (selected) {

    if (
      isLegalMove(
        board,
        selected.r,
        selected.c,
        row,
        col,
        turn
      )
    ) {

      makeMove(
        selected.r,
        selected.c,
        row,
        col
      );

      return;

    }


    if (
      piece &&
      colorOf(piece) === turn
    ) {

      selected = {
        r: row,
        c: col
      };

      gameMessage.textContent =
        `${typeOf(piece)} dipilih. Pilih tujuan.`;

      render();

      return;

    }


    selected = null;

    gameMessage.textContent =
      "Gerakan tidak tersedia.";

    render();

    return;

  }


  if (
    piece &&
    colorOf(piece) === turn
  ) {

    selected = {
      r: row,
      c: col
    };

    gameMessage.textContent =
      "Pilih kotak tujuan.";

    render();

  }

}


/* =========================
   GERAKAN BIDAK
========================= */

function makeMove(
  fromRow,
  fromCol,
  toRow,
  toCol
) {

  const moving =
    board[fromRow][fromCol];

  const target =
    board[toRow][toCol];

  const mover = turn;


  if (target) {

    captured[
      colorOf(target)
    ].push(target);

  }


  board[toRow][toCol] =
    moving;


  board[fromRow][fromCol] =
    null;


  /* PROMOSI PAWN */

  if (
    typeOf(moving) === "pawn" &&
    (
      toRow === 0 ||
      toRow === 7
    )
  ) {

    board[toRow][toCol] =
      `${mover}-queen`;

  }


  lastMove = {

    fr: fromRow,

    fc: fromCol,

    tr: toRow,

    tc: toCol

  };


  const notation =

    `${symbols[mover][
      typeOf(moving)
    ]} ` +

    `${coord(
      fromRow,
      fromCol
    )}` +

    `${
      target
        ? " × "
        : " → "
    }` +

    `${coord(
      toRow,
      toCol
    )}`;


  history.push(
    notation
  );


  selected = null;


  playSound(
    target
      ? "capture"
      : "move"
  );


  /* RAJA TERTANGKAP */

  if (
    typeOf(target) === "king"
  ) {

    finish(mover);

    render();

    return;

  }


  turn =
    mover === "white"
      ? "black"
      : "white";


  gameMessage.textContent =
    `Giliran ${
      turn === "white"
        ? "Putih"
        : "Hitam"
    }.`;

  render();


  if (
    mode === "ai" &&
    turn === "black"
  ) {

    computerTurn();

  }

}


/* =========================
   COMPUTER AI
========================= */

function computerTurn() {

  thinking = true;

  gameMessage.textContent =
    "Komputer sedang berpikir…";

  render();


  setTimeout(() => {

    const moves =
      allMoves(
        board,
        "black"
      );


    if (!moves.length) {

      finish("white");

      return;

    }


    let bestMove =
      moves[0];

    let bestScore =
      -Infinity;


    for (
      const move of moves
    ) {

      const simulated =
        cloneBoard(board);


      const target =
        simulated[
          move.tr
        ][
          move.tc
        ];


      simulated[
        move.tr
      ][
        move.tc
      ] =
        simulated[
          move.fr
        ][
          move.fc
        ];


      simulated[
        move.fr
      ][
        move.fc
      ] = null;


      let score =
        target
          ? values[
              typeOf(target)
            ] * 10
          : 0;


      score +=
        Math.random() * 3;


      if (
        typeOf(target) === "king"
      ) {

        score = 9999;

      }


      if (
        score >
        bestScore
      ) {

        bestScore =
          score;

        bestMove =
          move;

      }

    }


    thinking = false;


    makeMove(
      bestMove.fr,
      bestMove.fc,
      bestMove.tr,
      bestMove.tc
    );


  }, 650);

}


/* =========================
   CHECK LEGAL MOVE
========================= */

function isLegalMove(
  board,
  fromRow,
  fromCol,
  toRow,
  toCol,
  color
) {

  const moving =
    board[fromRow][fromCol];

  const target =
    board[toRow][toCol];


  if (!moving) {
    return false;
  }


  if (
    colorOf(moving) !== color
  ) {

    return false;

  }


  if (
    target &&
    colorOf(target) === color
  ) {

    return false;

  }


  if (
    fromRow === toRow &&
    fromCol === toCol
  ) {

    return false;

  }


  const type =
    typeOf(moving);


  const dr =
    toRow - fromRow;

  const dc =
    toCol - fromCol;


  const absRow =
    Math.abs(dr);

  const absCol =
    Math.abs(dc);


  /* PAWN */

  if (
    type === "pawn"
  ) {

    const direction =
      color === "white"
        ? -1
        : 1;


    const startRow =
      color === "white"
        ? 6
        : 1;


    if (
      fromCol === toCol &&
      !target &&
      dr === direction
    ) {

      return true;

    }


    if (
      fromCol === toCol &&
      !target &&
      fromRow === startRow &&
      dr === 2 * direction &&
      !board[
        fromRow + direction
      ][fromCol]
    ) {

      return true;

    }


    return (
      absCol === 1 &&
      dr === direction &&
      target &&
      colorOf(target) !== color
    );

  }


  /* ROOK */

  if (
    type === "rook"
  ) {

    return (
      (
        dr === 0 ||
        dc === 0
      ) &&
      pathClear(
        board,
        fromRow,
        fromCol,
        toRow,
        toCol
      )
    );

  }


  /* BISHOP */

  if (
    type === "bishop"
  ) {

    return (
      absRow === absCol &&
      pathClear(
        board,
        fromRow,
        fromCol,
        toRow,
        toCol
      )
    );

  }


  /* QUEEN */

  if (
    type === "queen"
  ) {

    return (
      (
        dr === 0 ||
        dc === 0 ||
        absRow === absCol
      ) &&
      pathClear(
        board,
        fromRow,
        fromCol,
        toRow,
        toCol
      )
    );

  }


  /* KNIGHT */

  if (
    type === "knight"
  ) {

    return (
      (
        absRow === 2 &&
        absCol === 1
      )
      ||
      (
        absRow === 1 &&
        absCol === 2
      )
    );

  }


  /* KING */

  if (
    type === "king"
  ) {

    return (
      absRow <= 1 &&
      absCol <= 1
    );

  }


  return false;

}


/* =========================
   CEK JALUR
========================= */

function pathClear(
  board,
  fromRow,
  fromCol,
  toRow,
  toCol
) {

  const stepRow =
    Math.sign(
      toRow - fromRow
    );


  const stepCol =
    Math.sign(
      toCol - fromCol
    );


  let row =
    fromRow + stepRow;


  let col =
    fromCol + stepCol;


  while (
    row !== toRow ||
    col !== toCol
  ) {

    if (
      board[row][col]
    ) {

      return false;

    }


    row += stepRow;

    col += stepCol;

  }


  return true;

}


/* =========================
   SEMUA LANGKAH
========================= */

function allMoves(
  board,
  color
) {

  const moves = [];


  for (
    let row = 0;
    row < 8;
    row++
  ) {

    for (
      let col = 0;
      col < 8;
      col++
    ) {

      if (
        board[row][col] &&
        colorOf(
          board[row][col]
        ) === color
      ) {

        for (
          let toRow = 0;
          toRow < 8;
          toRow++
        ) {

          for (
            let toCol = 0;
            toCol < 8;
            toCol++
          ) {

            if (
              isLegalMove(
                board,
                row,
                col,
                toRow,
                toCol,
                color
              )
            ) {

              moves.push({

                fr: row,

                fc: col,

                tr: toRow,

                tc: toCol

              });

            }

          }

        }

      }

    }

  }


  return moves;

}


/* =========================
   KOORDINAT
========================= */

function coord(
  row,
  col
) {

  return (
    "abcdefgh"[col] +
    (8 - row)
  );

}


/* =========================
   MENANG
========================= */

function finish(
  winner
) {

  gameOver = true;

  thinking = false;


  gameMessage.textContent =
    `${winner === "white"
      ? "Putih"
      : "Hitam"
    } menang!`;


  resultSymbol.textContent =
    winner === "white"
      ? "♔"
      : "♚";


  resultTitle.textContent =
    `${winner === "white"
      ? "Putih"
      : "Hitam"
    } Menang!`;


  resultText.textContent =
    winner === "white"

      ? (
          mode === "ai"
            ? "Kamu berhasil mengalahkan komputer!"
            : "Strategi Putih berhasil."
        )

      : "Komputer memenangkan permainan.";


  setTimeout(() => {

    resultModal.classList.remove(
      "hidden"
    );

  }, 250);

}


/* =========================
   SOUND
========================= */

function playSound(
  type
) {

  if (!soundOn) {
    return;
  }


  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;


    const context =
      new AudioContext();


    const oscillator =
      context.createOscillator();


    const gain =
      context.createGain();


    oscillator.frequency.value =
      type === "capture"
        ? 220
        : 360;


    oscillator.type =
      "sine";


    gain.gain.value =
      0.035;


    oscillator.connect(
      gain
    );


    gain.connect(
      context.destination
    );


    oscillator.start();


    oscillator.stop(
      context.currentTime + 0.09
    );

  } catch (error) {

    console.log(
      "Audio tidak tersedia."
    );

  }

}


/* =========================
   MODE BUTTON
========================= */

document
  .querySelectorAll(".mode-btn")
  .forEach(button => {

    button.onclick = () => {

      mode =
        button.dataset.mode;


      document
        .querySelectorAll(
          ".mode-btn"
        )
        .forEach(
          btn =>
            btn.classList.toggle(
              "active",
              btn === button
            )
        );


      if (
        mode === "ai"
      ) {

        modeTitle.textContent =
          "Lawan Komputer";


        modeDescription.textContent =
          "Kamu bermain sebagai Putih. Komputer bermain sebagai Hitam.";


        blackNameEl.textContent =
          "Komputer";

      } else {

        modeTitle.textContent =
          "2 Pemain Lokal";


        modeDescription.textContent =
          "Mainkan Catur Jawa bergantian di satu perangkat.";


        blackNameEl.textContent =
          "Pemain 2";

      }


      resetGame();

    };

  });


/* =========================
   BUTTON
========================= */

document
  .getElementById(
    "newGameBtn"
  )
  .onclick =
  resetGame;


document
  .getElementById(
    "modalNewGame"
  )
  .onclick =
  resetGame;


document
  .getElementById(
    "clearHistory"
  )
  .onclick = () => {

    history = [];

    render();

  };


document
  .getElementById(
    "soundBtn"
  )
  .onclick = () => {

    soundOn =
      !soundOn;


    document
      .getElementById(
        "soundBtn"
      )
      .textContent =
      soundOn
        ? "🔊 Suara"
        : "🔇 Suara";

  };


/* =========================
   START
========================= */

resetGame();
