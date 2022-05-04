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
          });
        } else if (squares[i] === 'O' && !this.state.xIsNext) {
          squares[i] = null;
          this.setState({
            history: history.concat([{
              squares: squares,
            }]),
            stepNumber: history.length,
            isReplace: true,
          });
        }
      } // insert replacement function
      else if (this.state.isReplace) {
        // insert X or O in an empty spot
        if (squares[i] === null) {
          squares[i] = this.state.xIsNext ? 'X' : 'O';

          this.setState({
            history: history.concat([{
              squares: squares,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            isReplace: false,
          });
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

    let status, mode = '';
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      if (this.state.stepNumber >= 6) {
        mode = 'CHORUS-LAPILLI';
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
          <div>{status}<br />{mode}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function replace() {

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