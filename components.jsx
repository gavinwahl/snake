'use strict';

var React = require('react/addons');
var _ = require('underscore');
var lib = require('./lib');
var cx = React.addons.classSet;
var last = lib.last;

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
    var isRelated = last(this.props.snake)[0] == this.props.myPos[0] ||
                    last(this.props.snake)[1] == this.props.myPos[1];
    return <td className={cx({active: isActive, cookie: isCookie, related: isRelated})}/>;
  },
  shouldComponentUpdate: function(nextProps) {
          // old end of the snake
    return _.isEqual(this.props.myPos, this.props.snake[0]) ||
          // shares row or column with new or old head of snake
          this.props.myPos[0] == last(this.props.snake)[0] ||
          this.props.myPos[1] == last(this.props.snake)[1] ||
          this.props.myPos[0] == last(nextProps.snake)[0] ||
          this.props.myPos[1] == last(nextProps.snake)[1] ||
          // new or old cookie
          _.isEqual(this.props.myPos, this.props.cookie) ||
          _.isEqual(this.props.myPos, nextProps.cookie) ||
          // Heuristic for resetting the board. Checks for 'normal' moves, where the
          // second-to-last snake section because the last.
          (!_.isEqual(last(this.props.snake), last(nextProps.snake)) && !_.isEqual(this.props.snake[1], nextProps.snake[0]) && !_.isEqual(this.props.snake[0], nextProps.snake[0])) ||
      false;
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
      highScore: 0,
    });
  },
  render: function() {
    return (
      <div>
        <Board rows={this.state.rows} columns={this.state.columns} snake={this.state.snake} cookie={this.state.cookie}/>
        {this.state.lost ? <div className="lost">You lost. <button ref="restart" onClick={this.restart}>restart?</button></div> : null}
        {this.state.paused ? <div>paused. spacebar to unpause.</div> : <div>playing. spacebar to pause.</div>}
        <p>Score: {this.score()}. High score: {this.state.highScore}</p>
        <p>Feel free to leave the page in the middle of your game. It will still be here when you get back.</p>
        <form>
          <p>Settings</p>
          <label>Speed (lower is faster)<input onChange={this.updateConfig} ref="speed" name="speed" value={this.state.speed} type="number" /></label>
          <label>Columns<input onChange={this.updateConfig} ref="columns" name="columns" value={this.state.columns} type="number" min="3" max="50"/></label>
          <label>Rows<input onChange={this.updateConfig} ref="rows" name="rows" value={this.state.rows} type="number" min="3" max="50"/></label>
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
      cookie = this.nextCookiePosition();
    else
      cookie = this.state.cookie;

    snake = lib.move(this.state.snake, this.state.direction);
    if ( lib.isOverlapping(snake) || !lib.isOnBoard(last(snake), this.state.rows, this.state.columns) ) {
      this.setState({lost: true}, () => this.refs.restart.getDOMNode().focus());
      return;
    }
    if ( _.isEqual(snake[snake.length-1], cookie) ) {
      snake = lib.move(this.state.snake, this.state.direction, true);
      this.setState({
        snake: snake
      }, () => {
        // we can't calculate these until state has actually updated to
        // reflect the new snake.
        this.setState({
          highScore: _.max([this.state.highScore, this.score()]),
          cookie: this.nextCookiePosition(),
        })
      });
    }

    this.setState({snake: snake}, () => {
      if (! this.state.cookie )
        this.setState({cookie: this.nextCookiePosition()});
    });
  },
  score: function() {
    return this.state.snake.length;
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
  nextCookiePosition: function() {
    if ( this.state.snake.length == this.state.rows * this.state.columns ) {
      alert('There is no place for another cookie! You win!');
      this.setState({paused: true});
      return;
    }
    do {
      var cookie = [lib.randint(this.state.columns), lib.randint(this.state.rows)];
    } while ( _.some(this.state.snake, (i) => _.isEqual(i, cookie)) );
    return cookie;
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
    this.setState(this.getInitialSnake(), () => { this.forceUpdate(); this.tick(); });
  }
});

exports.Snake = Snake;
