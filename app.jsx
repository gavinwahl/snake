'use strict';

var React = require('react/addons');
var Snake = require('./components').Snake;

require("./style.scss");

React.render(<Snake/>, document.getElementById('canvas'));
