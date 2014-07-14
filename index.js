/**
 * The entry point of the npm module.
 */

var requirejs = require('requirejs');
var requireGrape = requirejs.config({
    context: 'grape-engine',
    baseUrl: __dirname + '/' + 'js/grape'
});
module.exports = requireGrape('main');