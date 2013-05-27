//
// nodegraph-api.js
//
// Defines the methods for the API itself
//

// The app uses a couple modules and drivers
//
// Generates and manipulates json objects from XML
// This module is not a built-in module (see package.json for more
// information)
var xml2js = require ('xml2js');

// The HTTP module is used to get a XML document from a URL
var http = require ('http');

// URL module for URL resolution and parsing
var url = require ('url');

// Native MongoDB driver for Node.js
var mongodb = require('mongodb');

// Creating a few objects to manipulate corresponding data
// Creates a parser object for XML parsing jobs
var JSONparser = new xml2js.Parser();

// Creates structure for MongoDB operations
var mongo = require('mongodb');
var server;
var db;

// Start of the functions for the REST API
//
// Checks the resource at the specified URL for Open Graph metadata
function rest_check (request, response) {
    _get_xml(request.body.url, function(error, xml_result) {
        if (!error) {
            _parse_xml (xml_result, function (error, json_result) {
                if (!error) {
                    response.json ({
                        nodegraph: {
                            status: "OK",
                            check: {
                                status: "OK",
                                url: request.body.url,
                                rested: json_result
                            }
                        }
                    });
                } else {
                    console.error (error);
                    _send_error (request, response, "check", error, request.body.url);
                }
            });
        } else {
            console.error (error);
            _send_error (request, response, "check", error, request.body.url);
        }
    });
}

// Gets the XML tags at the target URL, parses them, and inserts them in the Database
function rest_insert (request, response) {
    _get_xml (request.body.url, function(error, xml_result) {
        if (!error) {
            _parse_xml (xml_result, function (error, json_result) {
                if (!error) {
                    _insert_document (json_result, function (error, mongo_result) {
                        if (!error) {
                            response.json ({
                                nodegraph: {
                                    status: "OK",
                                    insert: {
                                        status: "OK",
                                        url: request.body.url,
                                        rested: mongo_result
                                    }
                                }
                            });
                        } else {
                            console.error (error);
                            _send_error (request, response, "insert", ["An error occured while trying to insert the document in the database.", error], request.body.url);
                        }
                    });
                } else {
                    console.error (error);
                    _send_error (request, response, "insert", ["An error occured while trying to parse content of the requested URL.", error], request.body.url);
                }
            });
        } else {
            console.error (error);
            _send_error (request, response, "insert", "An error occured while trying to get the requested URL.", request.body.url);
        }
    });
}

// Returns a JSON object containing the results of the query
function rest_find (request, response) {
    _db_start (function (error, db) {
        if (!error) {
            db.collection("ogObject", function(error, collection) {
                if (!error) {
                    collection.find(request.body).toArray(function(error, items) {
                        if (!error) {
                            response.json ({
                                nodegraph: {
                                    status: "OK",
                                    find: {
                                        status: "OK",
                                        query: request.body,
                                        rested: items
                                    }
                                }
                            });
                        } else {
                            console.log (error);
                            _send_error (request, response, "find", error, request.body);
                        }
                    });
                } else {
                    console.error (error);
                    _send_error (request, response, "find", error, request.body);
                }
            });
        } else {
            console.error (error);
            _send_error (request, response, "find", error, request.body);
        }
    });
}

// Returns all the objects in the database
function rest_find_all (request, response) {
    _db_start (function (error, db) {
        if (!error) {
            db.collection("ogObject", function(error, collection) {
                if (!error) {
                    collection.find().toArray(function(error, items) {
                        if (!error) {
                            response.json ({
                                nodegraph: {
                                    status: "OK",
                                    find_all: {
                                        status: "OK",
                                        rested: items
                                    }
                                }
                            });
                        } else {
                            console.error (error);
                            _send_error (request, response, "find_all", error, null);
                        }
                    });
                } else {
                    console.error (error);
                    _send_error (request, response, "find_all", error, null);
                }
            });
        } else {
            console.error (error);
            _send_error (request, response, "find_all", error, null);
        }
    });
}


// Start of some functions used by the REST API
//
// Create standard error response
function _send_error (request, response, _function, error_msg, query) {
    var json_response = {
        nodegraph: {
            "status": "ERROR",
        }
    }
    json_response ["nodegraph"] [_function] = {
        "status": "ERROR",
        "query": query,
        "error": error_msg
    };
    response.json (json_response);
}

// Gets the XML at the specified url
function _get_xml (url_string, callback) {
    parsed_url = url.parse (url_string);
    options = {
        hostname: parsed_url['hostname'],
        port: parseInt(parsed_url['port']),
        path: parsed_url['path'],
        method: 'GET'
    };
    http.get(options, function(results) {
        results.setEncoding('utf8');
        results.on('data', function (chunk) {
            callback (null, chunk);
        });
    }).on('error', function(error) {
        console.error (error);
        callback (error, null);
    });
}

// Parses the XML file into a JSON object
function _parse_xml (xml_string, callback) {
    JSONparser.parseString(xml_string, function (error, ogRoot) {
        if (!error) {
            var ogHtml;
            var ogHead;
            if (ogRoot.html != undefined) {
                if (ogRoot.html instanceof Array) {
                    ogHtml = ogRoot.html[0];
                } else {
                    ogHtml = ogRoot.html;
                }
                if (ogHtml.head != undefined) {
                    if (ogHtml.head instanceof Array) {
                        ogHead = ogHtml.head[0];
                    } else {
                        ogHead = ogHtml.head;
                    }
                    if (ogHead.meta != undefined) {
                        ogMeta = ogHead.meta;
                        var ogData = {};
                        for (var n=0; n<ogMeta.length; n++) {
                            og_key_value = ogMeta[n]['$'];
                            if (og_key_value["property"] != undefined && og_key_value["content"] != undefined && (og_key_value["property"].substr (0,3) == "og:")) {
                                if (ogData[og_key_value["property"]] != undefined) {
                                    if (ogData[og_key_value["property"]] instanceof Array) {
                                        ogData[og_key_value["property"]].push (og_key_value["content"]);
                                    } else {
                                        ogData[og_key_value["property"]] = [ogData[og_key_value["property"]], og_key_value["content"]];
                                    }
                                } else {
                                    ogData[og_key_value["property"]] = og_key_value["content"];
                                }
                            }
                        }
                        if ((ogData ["og:title"] == undefined) || (ogData ["og:type"] == undefined) || (ogData ["og:url"] == undefined) || (ogData ["og:image"] == undefined)){
                            console.error ("Some of the required properties for the Open Graph Protocol are not found.");
                            callback ("Some of the required properties for the Open Graph Protocol are not found.");
                        } else {
                            callback (null, ogData);
                        }
                    } else {
                        console.error ("Unable to parse the XML file, no <meta> tag found.");
                        callback ("Unable to parse the XML file, no <meta> tag found.", null);
                    }
                } else {
                    console.error ("Unable to parse the XML file, no <head> tag found.");
                    callback ("Unable to parse the XML file, no <head> tag found.", null);
                }
            } else {
                console.error ("Unable to parse the XML file, no <html> tag found.");
                callback ("Unable to parse the XML file, no <html> tag found.", null);
            }
        } else {
            console.error (["Unable to parse the XML file. Reason: the XML file contains errors.", error.message]);
            callback (["Unable to parse the XML file. Reason: the XML file contains errors.", error.message], null);
        }
    });
}

function _insert_document (json_object, callback) {
    _db_start (function (error, db) {
        if (!error) {
            db.collection("ogObject", {strict:true}, function(error, collection) {
                if (!error) {
                    collection.update({"og:url": json_object["og:url"]}, json_object, {safe:true, upsert:true}, function(error, result) {
                        if (!error) {
                            collection.findOne({"og:url": json_object["og:url"]}, function(error, object_document) {
                                callback (null, object_document);
                            });
                        } else {
                            callback (error, null);
                        }
                    });
                } else {
                    db.collection("ogObject", function(err, collection) {
                        collection.insert(json_object, {safe:true}, function(err, result) {
                            callback (null, result[0]);
                        });
                    });
                }
            });
        } else {
            callback (error, null);
        }
    });
}

// Starts the MongoDB database client, using the native MongoDB driver
// for Node.js
function _db_start (callback) {
    if (server == undefined) {
        server = new mongo.Server('localhost', 27017, {auto_reconnect: true});
        db = new mongo.Db('nodegraphDB', server, {safe: true});
        db.open(function(error, db) {
            if(!error) {
                console.log ("Connected to 'nodegraphDB' database");
                callback (null, db);
            } else {
                console.error (["An error occured while trying to start/access the database client.", error], db);
                callback (["An error occured while trying to start/access the database client.", error], db);
            }
        });
    } else {
        callback (null, db);
    }
}

// Exports defined functions so they can be used by the server
exports.rest_check = rest_check;
exports.rest_insert = rest_insert;
exports.rest_find = rest_find;
exports.rest_find_all = rest_find_all;
