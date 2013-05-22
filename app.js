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
    response.json ({nodegraph: {status: "OK"}});
});

// Enabling the route for the /api/check function
app.post ('/api/check', api.rest_check);

// Enabling the route for the /api/insert function
app.post ('/api/insert', api.rest_insert);

// Enabling the route for the /api/find function
app.post ('/api/find', api.rest_find);

// Enabling the route for /api/find_all function
app.get ('/api/find_all', api.rest_find_all);

// Default landing error code
app.all ('*', function(request, response){
    response.send ("Not found.", 404);
});

// User custom parameters
var app_port = 3000

app.listen (app_port);
console.log ('Nodegraph API application listening on port '+app_port);
