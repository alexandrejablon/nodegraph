var express = require ('express');
var api = require ("./nodegraph-api");

var app = express ();

app.set ('views', __dirname + '/views');
app.set ('view engine', 'jade');
app.use ("/public", express.static (__dirname + '/public'));
app.use(express.bodyParser());

app.get ('/', function(request, response) {
    response.render ('index', {title: 'nodegraph|home'});
});

app.get ('/api', function(request, response) {
    response.json ({nodegraph: {status: "OK"}});
});

app.post ('/api/check', api.rest_check);

app.post ('/api/insert', api.rest_insert);

app.post ('/api/find', api.rest_find);

app.get ('/api/find_all', api.rest_find_all);

app.get ('*', function(request, response){
    response.send ("Not found.", 404);
});

app.listen (3000);
console.log ('Listening on port 3000');
