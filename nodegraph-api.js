var xml2js = require ('xml2js');
var path = require ('path');
var fs = require ('fs');
var http = require ('http');
var url = require ('url');
var mongodb = require('mongodb');

var parser = new xml2js.Parser();

var mongo = require('mongodb');
var server;
var db;
var BSON = mongo.BSONPure;

function rest_check (request, response) {
    get_xml_from_url(request.body.url, function(error, xml_result) {
        if (error != true) {
            parse_xml (xml_result, function (error, json_result) {
                if (error != true) {
                    response.json ({
                        nodegraph: {
                            status: "OK",
                            check: {
                                status: "OK",
                                url: request.body.url,
                                rested: json_result,
                                errormsg: error
                            }
                        }
                    });
                } else {
                    response.json ({
                        nodegraph: {
                            status: "ERROR",
                            check: {
                                status: "ERROR",
                                url: request.body.url,
                                rested: json_result,
                                errormsg: error
                            }
                        }
                    });
                }
            });
        } else {
			response.json ({
				nodegraph: {
					status: "ERROR",
					check: {
						status: "ERROR",
						url: request.body.url,
						rested: json_result,
						errormsg: error
					}
				}
			});
        }
    });
}

function rest_insert (request, response) {
    get_xml_from_url(request.body.url, function(error, xml_result) {
        if (error != true) {
            parse_xml (xml_result, function (error, json_result) {
                if (error != true) {
					insert_from_json (json_result, function (error, mongo_result) {
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
							response.json ({
								nodegraph: {
									status: "ERROR",
									insert: {
										status: "ERROR",
										url: request.body.url,
										errmsg: "An error occured while trying to insert the document in the database.",
										operrmsg: error.message
									}
								}
							});
						}
					});
                } else {
                    response.json ({
                        nodegraph: {
                            status: "ERROR",
                            insert: {
                                status: "ERROR",
                                url: request.body.url,
                                errmsg: "An error occured while trying to parse content of the requested URL.",
                                operrmsg: error.message
                            }
                        }
                    });
                }
            });
        } else {
			response.json ({
				nodegraph: {
					status: "ERROR",
					insert: {
						status: "ERROR",
						url: request.body.url,
						errmsg: "An error occured while trying to get the requested URL."
					}
				}
			});
        }
    });
}

function rest_find (request, response) {
	db_start (function (error, db) {
		if (!error) {
			db.collection("ogObject", function(error, collection) {
				if (!error) {
					var og_find_json = request.body;
					collection.find(og_find_json).toArray(function(error, items) {
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
					});
				} else {
					response.json ({
						nodegraph: {
							status: "ERROR",
							find: {
								status: "ERROR",
								query: request.body,
							}
						}
					});
				}
			});
		} else {
			response.json ({
				nodegraph: {
					status: "ERROR",
					find: {
						status: "ERROR",
						query: request.body,
						errmsg: "An error occured while trying to start/access the database client."
					}
				}
			});
        }
	});
}

function rest_find_all (request, response) {
	db_start (function (error, db) {
		if (!error) {
			db.collection("ogObject", function(error, collection) {
				if (!error) {
					collection.find().toArray(function(error, items) {
						response.json ({
							nodegraph: {
								status: "OK",
								find_all: {
									status: "OK",
									rested: items
								}
							}
						});
					});
				} else {
					response.json ({
						nodegraph: {
							status: "ERROR",
							find_all: {
								status: "ERROR",
							}
						}
					});
				}
			});
		} else {
			response.json ({
				nodegraph: {
					status: "ERROR",
					find: {
						status: "ERROR",
						query: request.body,
						errmsg: "An error occured while trying to start/access the database client."
					}
				}
			});
        }
	});
}

function insert_from_json (json_object, callback) {
	db_start (function (error, db) {
		if (!error) {
			db.collection("ogObject", {strict:true}, function(error, collection) {
				if (!error) {
					collection.update({"og:url": json_object["og:url"]}, json_object, {safe:true, upsert:true}, function(error, result) {
						if (error) {
							callback (error, null);
						} else {
								collection.findOne({"og:url": json_object["og:url"]}, function(error, object_document) {
									callback (false, object_document);
								});
							}
					});
				} else {
					db.collection("ogObject", function(err, collection) {
						collection.insert(json_object, {safe:true}, function(err, result) {
							callback (false, result[0]);
						});
					});
				}
			});
		} else {
			response.json ({
				nodegraph: {
					status: "ERROR",
					find: {
						status: "ERROR",
						url: request.params.url,
						errmsg: "An error occured while trying to start/access the database client."
					}
				}
			});
		}
	});
}

function parse_xml (xml_string, callback) {
    parser.parseString(xml_string, function (error, ogRoot) {
        if (error == null) {
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
                            if (og_key_value["property"] != undefined && og_key_value["content"] != undefined && (og_key_value["property"].substr (0,3) == "og:" || og_key_value["property"].substr (0,3) == "ng:")) {
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
                        callback (false, ogData);
                    } else {
                        callback (true, {
                            nodegraph: {
                                status: "ERROR",
                                errmsg: "Unable to parse the XML file. Reason: no <meta> tag found !"
                            }
                        });
                    }
                } else {
                    callback (true, {
                        nodegraph: {
                            status: "ERROR",
                            errmsg: "Unable to parse the XML file. Reason: no <head> tag found !"
                        }
                    });
                }
            } else {
                callback (true, {
                    nodegraph: {
                        status: "ERROR",
                        errmsg: "Unable to parse the XML file. Reason: no <html> tag found !"
                    }
                });
            }
        } else {
            callback (true, {
                nodegraph: {
                    status: "ERROR",
                    ngerrmsg: "Unable to parse the XML file. Reason: the XML file contains errors.",
                    operrmsg: error.message
                }
            });
        }
    });
}

function get_xml_from_url (url_string, callback) {
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
            callback (false, chunk);
        });
    }).on('error', function(e) {
        callback (true, {
            nodegraph: {
                status: "ERROR",
                errmsg: "Unable to reach the requested URL."
            }
        });
    });
}

function db_start (callback) {
	if (server == undefined) {
		server = new mongo.Server('localhost', 27017, {auto_reconnect: true});
		db = new mongo.Db('nodegraphDB', server, {safe: true});
		db.open(function(error, db) {
				if(!error) {
					console.log("Connected to 'nodegraphDB' database");
					callback (false, db);
				} else {
					console.log (err.message, db);
					callback (err.message, db);
				}
			}
		);
	} else {
		callback (false, db);
	}
}

exports.rest_check = rest_check;
exports.rest_insert = rest_insert;
exports.rest_find = rest_find;
exports.rest_find_all = rest_find_all;
