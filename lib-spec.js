lib = require('./lib');

describe('move', function() {
  it('single cell', function() {
    expect(lib.move([[1,1]], 'r')).toEqual([[2,1]]);
    expect(lib.move([[1,1]], 'l')).toEqual([[0,1]]);
    expect(lib.move([[1,1]], 'd')).toEqual([[1,2]]);
    expect(lib.move([[1,1]], 'u')).toEqual([[1,0]]);
  });
  it('two cells linear', function() {
    expect(lib.move([[1, 1], [1, 2]], 'd')).toEqual([[1, 2], [1, 3]]);
    expect(lib.move([[1, 1], [2, 1]], 'r')).toEqual([[2, 1], [3, 1]])
  });
  it('two cells change direction', function() {
    expect(lib.move([[1, 1], [1, 2]], 'r')).toEqual([[1, 2], [2, 2]]);
    expect(lib.move([[1, 1], [1, 2]], 'l')).toEqual([[1, 2], [0, 2]]);
    expect(lib.move([[1, 1], [2, 1]], 'd')).toEqual([[2, 1], [2, 2]]);
    expect(lib.move([[1, 1], [2, 1]], 'u')).toEqual([[2, 1], [2, 0]]);
  });
  it('returns null when turned inside-out', function() {
    expect(lib.move([[1, 1], [1, 2]], 'u')).toEqual(null);
    expect(lib.move([[1, 2], [1, 1]], 'd')).toEqual(null);
    expect(lib.move([[1, 1], [2, 1]], 'l')).toEqual(null);
    expect(lib.move([[2, 1], [1, 1]], 'r')).toEqual(null);
  });
  it('lengthen', function() {
    expect(lib.move([[1,1]], 'r', true)).toEqual([[1,1], [2,1]]);
  });
});

describe('isOverlapping', function() {
  it('works', function() {
    expect(lib.isOverlapping([[1,1], [1,2]])).toEqual(false);
    expect(lib.isOverlapping([[1,1], [1,1]])).toEqual(true);
  });
});

describe('isOnBoard', function() {
  it('works', function() {
    expect(lib.isOnBoard([1,1], 10, 20)).toEqual(true)
    expect(lib.isOnBoard([20,1], 10, 20)).toEqual(false)
    expect(lib.isOnBoard([1,10], 10, 20)).toEqual(false)
  });
});
