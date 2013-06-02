/*Copyright (c) 2013, Alexandre Jablon
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the copyright holder nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * app.js
 * 
 * Defines the application parameters and paths for queries
 */

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

// Static 404 error
app.all ('/static(/*)?', function(request, response) {
    response.send ("<html><head><title>404 - Not found</title></head><body><h1>404 - Not found</h1></body></html>", 404);
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
