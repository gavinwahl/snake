'use strict';

var _ = require('underscore');

function move(snake, direction, lengthen) {
  snake = snake.slice();

  var first = snake[0];

  if ( snake.length > 1 )
    var previous = snake[snake.length - 2];

  for ( var i = 0; i < snake.length - 1; i++ ) {
    snake[i] = snake[i+1].slice();
  }
  snake[snake.length - 1] = last(snake).slice();

  if ( direction == 'r' )
    last(snake)[0] += 1;
  else if ( direction == 'l' )
    last(snake)[0] -= 1;
  else if ( direction == 'd' )
    last(snake)[1] += 1;
  else if ( direction == 'u' )
    last(snake)[1] -= 1;

  if ( snake.length > 1 && _.isEqual(last(snake), previous) ) {
    return null;
  }
  if ( lengthen )
    snake.unshift(first);
  return snake;
}

function randint(n) {
  return Math.floor(n * Math.random());
}

function isOverlapping(snake) {
  for ( var i = 0; i < snake.length - 1; i++ ) {
    if ( _.isEqual(snake[i], last(snake)) )
      return true;
  }
  return false;
}

function isOnBoard(pos, rows, columns) {
  return !(pos[0] < 0 || pos[0] >= columns || pos[1] < 0 || pos[1] >= rows);
}

function last(ary) {
  return ary[ary.length - 1];
}

exports.move = move;
exports.randint = randint;
exports.isOverlapping = isOverlapping;
exports.isOnBoard = isOnBoard;
exports.last = last;
