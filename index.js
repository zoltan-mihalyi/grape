/**
 * The entry point of the npm module.
 */

var requirejs = require('requirejs');
requirejs.config({
    baseUrl: __dirname + '/' + 'js/grape'
});
module.exports = requirejs('main');