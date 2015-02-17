'use strict';

var React = require('react/addons');
var _ = require('underscore');
var lib = require('./lib');
var cx = React.addons.classSet;

var Cell = React.createClass({
  render: function() {
    var isActive = false;
    var isCookie = false;
    for ( var k = 0; k < this.props.snake.length; k++ ) {
      isActive |= _.isEqual(this.props.snake[k], this.props.myPos);
      isCookie |= _.isEqual(this.props.cookie, this.props.myPos);
    }
    // Related cells share a row or column with the head of the snake. To make
    // it easier to see when you're aligned with the cookie.
    var isRelated = this.props.snake[this.props.snake.length - 1][0] == this.props.myPos[0] ||
                    this.props.snake[this.props.snake.length - 1][1] == this.props.myPos[1];
    return <td className={cx({active: isActive, cookie: isCookie, related: isRelated})}/>;
  }
});

var Board = React.createClass({
  render: function() {
    var rows = [];
    for ( var i = 0; i < this.props.rows; i++ ) {
      var columns = [];
      for ( var j = 0; j < this.props.columns; j++ ) {
        columns.push(<Cell key={j} snake={this.props.snake} cookie={this.props.cookie} myPos={[j, i]}/>);
      }
      rows.push(<tr key={i}>{columns}</tr>);
    }

    return (
      <table><tbody>{rows}</tbody></table>
    );
  }
});

var Snake = React.createClass({
  getInitialSnake: function() {
    return {
      snake: [[1,0], [2,0], [3,0], [4,0]],
      direction: 'r',
      cookie: null,
      lost: false,
      paused: false
    };
  },
  getInitialState: function() {
    return _.extend(this.getInitialSnake(), {
      rows: 20,
      columns: 20,
      speed: 300,
    });
  },
  render: function() {
    return (
      <div>
        <Board rows={this.state.rows} columns={this.state.columns} snake={this.state.snake} cookie={this.state.cookie}/>
        {this.state.lost ? <div className="lost">You lost. <button ref="restart" onClick={this.restart}>restart?</button></div> : null}
        {this.state.paused ? <div>paused. spacebar to unpause.</div> : <div>playing. spacebar to pause.</div>}
        <p>Score: {this.state.snake.length}</p>
        <p>Feel free to leave the page in the middle of your game. It will still be here when you get back.</p>
        <form>
          <p>Settings</p>
          <label>Speed (lower is faster)<input onChange={this.updateConfig} ref="speed" name="speed" value={this.state.speed} type="number" /></label>
          <label>Columns<input onChange={this.updateConfig} ref="columns" name="columns" value={this.state.columns} type="number" /></label>
          <label>Rows<input onChange={this.updateConfig} ref="rows" name="rows" value={this.state.rows} type="number" /></label>
        </form>
      </div>
    );
  },
  tick: function() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.tick, this.state.speed);
    if ( this.state.paused || this.state.lost )
      return;

    var cookie, snake;
    if ( ! this.state.cookie )
      // TODO: make sure this is not overlapping the snake
      cookie = this.randomPosition();
    else
      cookie = this.state.cookie;

    snake = lib.move(this.state.snake, this.state.direction);
    if ( lib.isOverlapping(snake) || !lib.isOnBoard(snake[snake.length - 1], this.state.rows, this.state.columns) ) {
      this.setState({lost: true}, () => this.refs.restart.getDOMNode().focus());
      return;
    }
    if ( _.isEqual(snake[snake.length-1], cookie) ) {
      cookie = this.randomPosition();
      snake = lib.move(this.state.snake, this.state.direction, true);
    }

    this.setState({
      snake: snake,
      cookie: cookie,
    });
  },
  componentDidMount: function() {
    this.tick();
    document.body.addEventListener('keydown', this.onKeyDown);
  },
  componentWillUnmount: function() {
    clearTimeout(this.timeout);
    document.body.removeEventListener('keydown', this.onKeyDown);
  },
  componentDidUpdate: function() {
    localStorage.snakeState = JSON.stringify(this.state);
  },
  componentWillMount: function() {
    if ( localStorage.snakeState )
      this.setState(JSON.parse(localStorage.snakeState));
  },
  onKeyDown: function(event) {
    if ( this.state.lost )
      return;

    if ( event.which == 32 ) { // space
      this.setState({paused: !this.state.paused});
      return;
    } else if ( this.state.paused ) {
      return;
    }

    var direction = null;
    if ( event.which == 37 || event.which == 72 ) // h
      direction = 'l';
    else if ( event.which == 40 || event.which == 74 ) // j
      direction = 'd';
    else if ( event.which == 38 || event.which == 75 ) // k
      direction = 'u';
    else if ( event.which == 39 || event.which == 76 ) // l
      direction = 'r';

    if ( direction && lib.move(this.state.snake, direction) ) {
      this.setState({direction: direction});
      this.tick();
    }
  },
  randomPosition: function() {
    return [lib.randint(this.state.columns), lib.randint(this.state.rows)];
  },
  updateConfig: function(ev) {
    ev.stopPropagation();
    this.setState({
      speed: this.refs.speed.getDOMNode().value,
      rows: this.refs.rows.getDOMNode().value,
      columns: this.refs.columns.getDOMNode().value,
    });
  },
  restart: function() {
    this.setState(this.getInitialSnake(), this.tick);
  }
});

exports.Snake = Snake;
