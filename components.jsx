'use strict';

var React = require('react/addons');
var _ = require('underscore');
var lib = require('./lib');
var cx = React.addons.classSet;
var last = lib.last;

var Cell = React.createClass({
  render: function() {
    var classes = {
      cookie: _.isEqual(this.props.cookie, this.props.myPos)
    };
    this.props.snakes.forEach((snake, snake_index) => {
      snake.forEach(segment => {
        if ( _.isEqual(segment, this.props.myPos) ) {
          classes['snake_' + snake_index] = true;
        }
      })
    })
    return <td className={cx(classes)} />;
  }
});

var Board = React.createClass({
  render: function() {
    var rows = [];
    for ( var i = 0; i < this.props.rows; i++ ) {
      var columns = [];
      for ( var j = 0; j < this.props.columns; j++ ) {
        columns.push(<Cell key={j} snakes={this.props.snakes} cookie={this.props.cookie} myPos={[j, i]}/>);
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
      snakes: [[[1,0], [2,0], [3,0], [4,0]],
               [[1,3], [2,3], [3,3], [4,3]]],
      directions: ['r', 'r'],
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
        <Board rows={this.state.rows} columns={this.state.columns} snakes={this.state.snakes} cookie={this.state.cookie}/>
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

    var snakes = this.state.snakes.map((snake, i) => {
      snake = lib.move(snake, this.state.directions[i]);
      if ( lib.isOverlapping(snake) || !lib.isOnBoard(last(snake), this.state.rows, this.state.columns) ) {
        this.setState({lost: true}, () => this.refs.restart.getDOMNode().focus());
        return this.state.snakes[i];  // the original snake
      }
      if ( _.isEqual(snake[snake.length-1], cookie) ) {
        snake = lib.move(snake, this.state.direction, true);
        this.state.cookie = null;
      }
      return snake;
    });
    this.setState({snakes: snakes}, () => {
      if (! this.state.cookie )
        this.setState({cookie: this.nextCookiePosition()});
    });
  },
  score: function() {
    return 0;
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
    
    if ( direction && lib.move(this.state.snakes[0], direction) ) {
      this.setState({directions: [direction, this.state.directions[1]]});
    } else {
      if ( event.which == 65 )  // w
        direction = 'l';
      else if ( event.which == 83 ) // s
        direction = 'd';
      else if ( event.which == 87 ) // w
        direction = 'u';
      else if ( event.which == 68 ) // d
        direction = 'r';

      if ( direction && lib.move(this.state.snakes[1], direction) ) {
        this.setState({directions: [this.state.directions[0], direction]});
      }
    }
    /*
     *if ( direction )
     *  this.tick();
     */
  },
  nextCookiePosition: function() {
    if ( this.state.snakes.map(i => i.length).reduce((a, b) => a + b, 0) == this.state.rows * this.state.columns ) {
      alert('There is no place for another cookie! You win!');
      this.setState({paused: true});
      return;
    }
    do {
      var cookie = [lib.randint(this.state.columns), lib.randint(this.state.rows)];
    } while ( _.some(this.state.snakes, (snake) => { _.some(snake, (i) => _.isEqual(i, cookie)) }) );
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
