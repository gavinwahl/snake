'use strict';

var _ = require('underscore');

function move(snake, direction, lengthen) {
  // make a copy
  snake = snake.slice();

  var head = last(snake).slice();
  if ( direction == 'r' )
    head[0] += 1;
  else if ( direction == 'l' )
    head[0] -= 1;
  else if ( direction == 'd' )
    head[1] += 1;
  else if ( direction == 'u' )
    head[1] -= 1;
  if ( snake.length > 1 && _.isEqual(head, snake[snake.length - 2]) ) {
    // trying to turn on itself
    return null;
  }
  snake.push(head);

  if ( ! lengthen )
    snake.shift();

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
