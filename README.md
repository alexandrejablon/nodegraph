nodegraph
=========

A REST API for the OpenGraph Protocol using Node.js and MongoDB.

The REST API implements the following methods:

`GET /api` - Returns the status of the API.  
`POST /api/check` - Checks the pages which are submitted via their URL for OpenGraph tags.  
`POST /api/insert` - Inserts a document in the MongoDB database.  
`POST /api/find` - Searches for some OpenGraph objects from the MongoDB database.  
`GET /api/find_all` - Searches for all the OpenGraph objects from the MongoDB database.  

##REST functions

####api - `GET /api`

Returns the status of the API.

####Description
```
url:		http://yourhost:3000/api
method:		GET
returns:
{
  "nodegraph": {
    "status": "OK"
  }
}
```

#####How-to example with cURL
```
curl -i -X GET http://yourhost:3000/api
```

####check - `POST /api/check`

Checks the pages which are submitted via their URL for OpenGraph tags.

The information will be fetched from the above mentioned URL, the meta tags of prefix "og" will be extracted,
and returned in the form of a JSON object.

#####Parameters
`url` - the URL of the page.

#####Description
```
url:		http://yourhost:3000/api/check
method:		POST
parameters:	url
sample response:
{
  "nodegraph": {
    "status": "OK",
    "check": {
      "status": "OK",
      "url": "http://example.org/page.html",
      "rested": {
        "og:title": "Page Title",
        "og:type": "website",
        "og:url": "http://example.org/page.html",
        "og:image": "http://example.org/welcome.png",
      }
    }
  }
}
```

#####How-to example with cURL
```
curl -X POST -d url=http://example.org/page.html http://yourhost:3000/api/check
```

####insert - `POST /api/insert`

This function is responsible for inserting a document in the MongoDB database.

The information will be fetched from the above mentioned URL, the meta tags of prefix "og" will be extracted,
and stored in the MongoDB database, and returned in the form of a similar JSON object.

#####Parameters
`url` - the URL of the page.

#####Description
```
url:		http://yourhost:3000/api/insert
method:		POST
parameters:	url
sample response:
{
  "nodegraph": {
    "status": "OK",
    "insert": {
      "status": "OK",
      "url": "http://example.org/page.html",
      "rested": {
        "og:title": "Page Title",
        "og:type": "website",
        "og:url": "http://example.org/page.html",
        "og:image": "http://example.org/welcome.png",
      }
    }
  }
}
```

#####How-to example with cURL
```
curl -X POST -d url=http://example.org/page.html http://yourhost:3000/api/insert
```

####find - `POST /api/find`

This function searches for some OpenGraph objects from the MongoDB database and returns them.

The information will be fetched from the above mentioned URL, the meta tags of prefix "og" will be extracted,
and stored in the MongoDB database, and returned in the form of a similar JSON object.

#####Parameters
`data` - a JSON structure that describes a MongoDB document query.

#####Description
```
url:			http://yourhost:3000/api/find
method:			POST
content-type:	application/json
sample data:
{
  "og:title": "Page Title"
}
sample response:
{
  "nodegraph": {
    "status": "OK",
    "find": {
      "status": "OK",
      "query": {
        "og:title": "Page Title",
      },
      "rested": [
        {
          "_id": DocumentId (),
          "og:title": "Page Title",
          "og:type": "website",
          "og:url": "http://example.org/page.html",
		  "og:image": "http://example.org/welcome.png",
        }
      ]
    }
  }
}
```

#####How-to example with cURL
```
curl -X POST -H 'Content-Type: application/json' -d '{"og:title": "Page Title"}' http://yourhost:3000/api/find
```


####find_all - `GET /api/find_all`

This function searches for all the OpenGraph objects from the MongoDB database, and returns them.

The information will be fetched from the above mentioned URL, the meta tags of prefix "og" will be extracted,
and stored in the MongoDB database, and returned in the form of a similar JSON object.

#####Parameters
`data` - a JSON structure that describes a MongoDB document query.

#####Description
```
url:			http://yourhost:3000/api/find_all
method:			POST
content-type:	application/json
sample data:
{
  "og:title": "Page Title"
}
sample response:
{
  "nodegraph": {
    "status": "OK",
    "find": {
      "status": "OK",
      "rested": [
        {
          "_id": DocumentId (),
          "og:title": "Page Title",
          "og:type": "website",
          "og:url": "http://example.org/page.html",
		  "og:image": "http://example.org/welcome.png",
        },
		{
          "_id": DocumentId (),
          "og:title": "Page #2 Title",
          "og:type": "website",
          "og:url": "http://example.org/page2.html",
		  "og:image": "http://example.org/welcome2.png",
        }
      ]
    }
  }
}
```

#####How-to example with cURL
```
curl -X GET http://yourhost:3000/api/find_all
```
