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
  getInitialState: function() {
    return {
      snake: [[1,0], [2,0], [3,0], [4,0]],
      direction: 'r',
      cookie: null,
      rows: 20,
      columns: 20,
      speed: 300,
      lost: false,
    };
  },
  render: function() {
    return (
      <div>
        <Board rows={this.state.rows} columns={this.state.columns} snake={this.state.snake} cookie={this.state.cookie}/>
        {this.state.lost ? <div className="lost">You lost. <button ref="restart" onClick={this.restart}>restart?</button></div> : null}
        <form>
          <input onChange={this.updateConfig} ref="speed" name="speed" value={this.state.speed} type="number" />
          <input onChange={this.updateConfig} ref="columns" name="columns" value={this.state.columns} type="number" />
          <input onChange={this.updateConfig} ref="rows" name="rows" value={this.state.rows} type="number" />
        </form>
      </div>
    );
  },
  tick: function() {
    clearTimeout(this.timeout);
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
    this.timeout = setTimeout(this.tick, this.state.speed);
  },
  componentDidMount: function() {
    this.tick();
    document.body.addEventListener('keydown', this.onKeyDown);
  },
  componentWillUnmount: function() {
    clearTimeout(this.timeout);
    document.body.removeEventListener('keydown', this.onKeyDown);
  },
  onKeyDown: function(event) {
    if ( this.state.lost )
      return;

    var direction = null;
    if ( event.which == 38 )
      direction = 'u';
    else if ( event.which == 37 )
      direction = 'l';
    else if ( event.which == 39 )
      direction = 'r';
    else if ( event.which == 40 )
      direction = 'd';

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
    this.setState(this.getInitialState(), this.tick);
  }
});

exports.Snake = Snake;
