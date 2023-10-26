# Quick Start

In this section, we will develop a more involved application in Fractl. We'll be designing the model for a blogging-service.
To start, create a directory to store the model files:

```shell
mkdir blog
```

We need a "project" file in the `blog` directory to capture some meta information about the model
we are developing. This project file in called `model.fractl`. Create this file as `blog/model.fractl`
with the following content:

```clojure
{:name :blog
 :version "0.0.1"
 :fractl-version "current"
 :components [:Blog.Core]}
```

The meta-data about the model is expressed as an edn-map of key-value pairs. There are three keys in the map -
   1. `:name` - the unique name of the model
   2. `:version` - the version of the model
   3. `:fractl-version` - the version of the Fractl runtime required to run the model
   4. `:components` - a list or vector of the components where the business objects of the model are defined

The blog model has just one component - `:Blog.Core`. Now we need to define this component.
The file in which we define the component has to be in a directory structure that matches
its name - so we create the file `blog/blog/core.fractl` with the following content:

```clojure
(component :Blog.Core)

(entity :BlogPost
 {:Name {:type :String
         :guid true}
  :Title :String
  :Content :String
  :PostedBy :Email
  :PostedOn :Now})
```

In the `:Blog.Core` component we have a single entity called `:BlogPost`. Its definition is self-explanatory - a blog-post is made up
of a title and content. It also captures information on who created the post and when. The `:Name` attribute requires some 
explanation - it's a string-value that must be unique for each blog-post - because it's used to uniquely identify a blog-post in the system.

Our basic blog-application is almost ready. Now we need to create a configuration file that will be used by Fractl
for running this application. Create the file `blog/config.edn` with the following settings:

```clojure
{:service {:port 8080}
 :store {:type :h2 :dbname "./data/blog"}}
```

This configuration will direct Fractl to start the blog-service on port `8080` and store its data
in the [H2](https://www.h2database.com/html/main.html) database file - `data/blog`.

At this stage, our project folder should look like:

```shell
/blog
  - config.edn
  - model.fractl
  - /blog
      - core.fractl
```

To test our application, run the following command from the root `blog` directory:

```shell
fractl run
```

If all goes well, the blog-service will start listening for incoming HTTP request on post `8080`. Let's try to create a blog entry:

```shell
curl -X POST http://localhost:8080/_e/Blog.Core/BlogPost \
  -H 'Content-Type: application/json' \
  -d '{"Blog.Core/BlogPost": {"Name": "post01", "Title": "Hello world", "Content": "This is my first post", "PostedBy": "mm@fractl.io"}}'
```

The service will allow us to interact with the entities defined in the model over a RESTful API. As the preceding command
shows, invoking `POST _e/Blog.Core/BlogPost` with a JSON encoded `:BlogPost` object will create and persist a new `:BlogPost`
instance in the system. A success response to the `POST` request will be,

```json
[{
	"status": "ok",
	"result": [{
		"type-*-tag-*-": "entity",
		"-*-type-*-": "Blog.Core/BlogPost",
		"Title": "Hello world",
		"Content": "This is my first post",
		"PostedBy": "mm@fractl.io",
		"PostedOn": "2023-09-19T13:23:40.755039609",
		"Name": "post01"
	}]
}]
```

Note that Fractl has filled-in the `:PostedOn` attribute with the current date-time value, which is what the `:Now` datatype is
supposed to do. We can use the value of the `:guid` attribute - `:Name` - to lookup, update or delete the blog-post instance.

Some REST API calls you may try on your own are listed below:

1. Lookup an instance by its globally-unique-identifier or `:guid`.

```shell
curl http://localhost:8080/_e/Blog.Core/BlogPost/pos01
```

2. Lookup all instances of an entity.

```shell
curl http://localhost:8080/_e/Blog.Core/BlogPost
```

3. Update an instance by its `:guid`.

```shell
curl -X PUT http://localhost:8080/_e/Blog.Core/BlogPost/post01 \
  -H 'Content-Type: application/json' \
  -d '{"Data": {"Title": "Hello, World", "PostedBy": "jj@fractl.io"}}'
```

4. Delete an instance by its `:guid`.

```shell
curl -X DELETE http://localhost:8080/_e/Blog.Core/BlogPost/post01
```

Now that we've tested the model, we are ready to make a build for release. For this, run the following command:


```shell
fractl build
```

This will create a standalone jar file of the blog-application in the `out` directory.
You may now launch this application using the Java virtual machine:


```shell
java -jar out/blog/target/blog-0.0.1-standalone.jar -c config.edn
```

In the [next step](tutorial.md) of this tutorial, we will add more features to the blog-application, and in that process,
explore Fractl in more depth.
