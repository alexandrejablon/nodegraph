//
// app.js
//
// Defines the application parameters and paths for queries
//

// Using Express, a web application framework and module for node.js
// This module is not a built-in module (see package.json for more
// information)
var express = require ('express');

// Using the api
var api = require ("./nodegraph-api");

// Creating the app
var app = express ();

// Setting the views folder
app.set ('views', __dirname + '/views');

// Using the jade engine as rendering engine
app.set ('view engine', 'jade');

// Defining a static folder for the .html pages used as examples
app.use ("/static", express.static (__dirname + '/static'));

// Middleware used to get POST queries running
app.use(express.bodyParser());

// Setting up the home page
app.get ('/', function(request, response) {
    response.render ('index', {title: 'nodegraph|home'});
});

// Enabling GET method for the /api function
app.get ('/api', function(request, response) {
    response.json ({"nodegraph": {status: "OK"}});
});
// Landing error code for method not allowed
app.all ('/api', function(request, response){
    _send_error (request, response, 405);
});

// Enabling the route for the /api/check function
app.post ('/api/check', api.rest_check);
// Landing error code for method not allowed
app.all ('/api/check', function(request, response) {
    _send_error (request, response, 405);
});

// Enabling the route for the /api/insert function
app.post ('/api/insert', api.rest_insert);
// Landing error code for method not allowed
app.all ('/api/insert', function(request, response) {
    _send_error (request, response, 405);
});

// Enabling the route for the /api/find function
app.post ('/api/find', api.rest_find);
// Landing error code for method not allowed
app.all ('/api/find', function(request, response) {
    _send_error (request, response, 405);
});

// Enabling the route for /api/find_all function
app.get ('/api/find_all', api.rest_find_all);
// Landing error code for method not allowed
app.all ('/api/find_all', function(request, response) {
    _send_error (request, response, 405);
});

// Default landing error code
app.all ('*', function(request, response) {
    _send_error (request, response, 404);
});

// Returns a standard HTTP error
function _send_error (request, response, error_code) {
	response.json (
				{
					"nodegraph": {
						"status": "ERROR",
						"url": request.url,
						"method": request.method,
						"error_code": error_code
					}
				}, error_code);
}

// User custom parameters
var app_port = 3000

app.listen (app_port);
console.log ('Nodegraph API application listening on port '+app_port);
