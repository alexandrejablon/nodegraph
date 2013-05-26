nodegraph
=========

A REST API for the Open Graph Protocol using Node.js and MongoDB.

The REST API implements the following methods:

`GET /api` - Returns the status of the API.  
`POST /api/check` - Checks the pages which are submitted via their URL for Open Graph tags.  
`POST /api/insert` - Inserts and updates a document in the MongoDB database.  
`POST /api/find` - Searches for some Open Graph objects from the MongoDB database.  
`GET /api/find_all` - Searches for all the Open Graph objects from the MongoDB database.  

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
curl -X GET http://yourhost:3000/api
```

####check - `POST /api/check`

Checks the pages which are submitted via their URL for Open Graph tags.

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

If you only need to update a document, just use the insert method with the URL of the updated document.

Although the `check` function returns the Open Graph information found at the URL, this function returns a mongoDB
document.

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
		"_id": DocumentId (),
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

This function searches for some Open Graph objects from the MongoDB database and returns them.

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

This function searches for all the Open Graph objects from the MongoDB database, and returns them.

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
    "find_all": {
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

####Examples using the files provided in the `/static` folder
Go to the `nodegraph` folder and enter the following command:

```
nodejs app.js
```
You can then test whether everything works fine using cURL and the following examples:
```
curl -X POST -d url=http://localhost:3000/static/hyperion.html http://localhost:3000/api/check
curl -X POST -d url=http://localhost:3000/static/dansimmons.html http://localhost:3000/api/check
```
```
curl -X POST -d url=http://localhost:3000/static/hyperion.html http://localhost:3000/api/insert
curl -X POST -d url=http://localhost:3000/static/dansimmons.html http://localhost:3000/api/insert
```
```
curl -X POST -H 'Content-Type: application/json' -d '{"og:title": "Hyperion"}' http://localhost:3000/api/find
curl -X POST -H 'Content-Type: application/json' -d '{"og:profile:first_name": "Dan", "og:profile:last_name": "Simmons"}' http://localhost:3000/api/find
```
```
curl -X GET http://localhost:3000/api/find_all
```
