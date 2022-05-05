import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button 
      className="square" 
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square 
        value={this.props.squares[i]} 
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      xIsNext: true,
      stepNumber: 0,
      isReplace: false,
      replaceThisLine: [],
      centerPiece: null,
      counter: 0,
      illegal: false,
      previous: -1,
    };
  }

  handleClick(i) {
    // Only place 3 pieces for each side
    if (this.state.stepNumber < 6) {
      const history = this.state.history.slice(0,
        this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if (calculateWinner(squares) || squares[i]) {
        return;
      }

      squares[i] = this.state.xIsNext ? 'X' : 'O';

      if (i === 4) {
        this.setState({
          centerPiece: this.state.xIsNext ? 'X' : 'O',
        });
      }

      this.setState({
        history: history.concat([{
          squares: squares,
        }]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      });
    } else {
      const history = this.state.history.slice(0,
        this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if (calculateWinner(squares)) {
        return;
      }

      // delete selected node, next step should be to replace the node in a new position
      if (squares[i] !== null && !this.state.isReplace) {
        // delete X or O at the appropriate time
        if (squares[i] === 'X' && this.state.xIsNext) {
            squares[i] = null;
          
          this.setState({
            history: history.concat([{
              squares: squares,
            }]),
            stepNumber: history.length,
            isReplace: true,
            replaceThisLine: lineToReplace(i),
            previous: i,
            illegal: false,
          });
          if (i === 4) {
            this.setState({
              centerPiece: null,
            });
          }
        } else if (squares[i] === 'O' && !this.state.xIsNext) {
          squares[i] = null;
          this.setState({
            history: history.concat([{
              squares: squares,
            }]),
            stepNumber: history.length,
            isReplace: true,
            replaceThisLine: lineToReplace(i),
            previous: i,
            illegal: false,
          });
          if (i === 4) {
            this.setState({
              centerPiece: null,
            });
          }
        }
      } // insert replacement function
      else if (this.state.isReplace) {
        // insert X or O in an empty spot
        if (squares[i] === null) {
          if (this.state.replaceThisLine.includes(i)) {
            squares[i] = this.state.xIsNext ? 'X' : 'O';

            this.setState({
              history: history.concat([{
                squares: squares,
              }]),
              stepNumber: history.length,
              xIsNext: !this.state.xIsNext,
              isReplace: false,
            });

            let count = this.state.counter;
            if (!calculateWinner(current.squares)) {
              setTimeout(() => {}, 5000);
              if ((squares[4] === (this.state.xIsNext ? 'X' : 'O'))) {
                if (count >= 1 && !calculateWinner(squares)) {
                  squares[i] = null;
                  squares[this.state.previous] = this.state.xIsNext ? 'X' : 'O';
                  this.setState({
                    xIsNext: this.state.xIsNext,
                    illegal: true,
                  })
                }
                count++;
              } else if (squares[4] !== null) {
                count++;
              } else if (squares[4] === null) {
                count = 0;
              }
              this.setState({
                counter: count,
              });
            }

            if (i === 4) {
              this.setState({
                centerPiece: this.state.xIsNext ? 'X' : 'O',
              });
            }
          }
        }
      }
    }
  } 
  
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>
              {desc}
            </button>
          </li>
        );
    });

    let status, mode = '', centerStatus;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      if (this.state.stepNumber >= 6) {
        mode = 'CHORUS-LAPILLI';
        if (this.state.illegal) {
          centerStatus = 'ILLEGAL MOVE!'; 
        } else if (this.state.centerPiece !== null) {
          centerStatus = 'Player ' + this.state.centerPiece + ': move your piece is in the center!';
        } else {
          centerStatus = '';
        }
      }
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}<br />{mode}<br />{centerStatus}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function lineToReplace(i) {
  const lines = [
    [1, 3, 4],
    [0, 2, 3, 4, 5],
    [1, 4, 5],
    [0, 1, 4, 6, 7],
    [0, 1, 2, 3, 5, 6, 7, 8],
    [1, 2, 4, 7, 8],
    [3, 4, 7],
    [3, 4, 5, 6, 8],
    [4, 5, 7]
  ];
  return lines[i];
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);