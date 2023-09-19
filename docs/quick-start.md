# Quick Start

This short tutorial will help you get started programming in fractl.
It's assumed that you have already [installed](installation.md) fractl on your laptop or desktop.

**Fractl** allows you to generate a production ready application from a very high-level declarative "model".
In this section, we will design the basic model for a blogging-service. To start, create a
directory to store the model files:

```shell
$ mkdir blog
```

We need a "project" file in the `blog` directory to capture some meta information about the model
we are developing. In fractl this project file in called `model.fractl`. Create this file as `blog/model.fractl`
with the following content:

```clojure
{:name :blog
 :version "0.0.1"
 :components [:Blog.Core]}
```

The meta-data about the model is expressed as an edn-map of key-value pairs. There are three keys in the map -
   1. `:name` - the unique name of the model
   2. `:version` - the version of the model
   3. `:components` - a list or vector of the components where the business objects of the model are defined

The blog model has just one component - `:Blog.Core`. Now we need to define this component.
The file in which we define the component has to be in a directory structure that matches
its name - so we create the file `blog/blog/core.fractl` with the following content:

```clojure
(component :Blog.Core)

(entity :BlogPost
 {:Title :String
  :Content :String
  :PostedBy :Email
  :PostedOn :Now})
```

In the core-component we just define a single entity called `:BlogPost`. Its definition is self-explanatory - a blog-post is made up
of a title and content. It also captures information on who created the post and when.

Our basic blog-application is almost ready. Now we need to create a simple configuration file that will be used by fractl
for running this application. Create the file `blog/config.edn` with the following settings:

```clojure
{:service {:port 8080}
 :store {:type :h2 :dbname "./data/blog"}}
```

This configuration will direct fractl to start the blog-service on port `8080` and store its data in the file
`data/blog`.

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
$ fractl run
```

If all goes well, the blog-service will start listening for incoming HTTP request on post `8080`. Let's try to create a blog entry:

```shell
curl -X POST http://localhost:8080/_e/Blog.Core/BlogPost \
  -H 'Content-Type: application/json' \
  -d '{"Blog.Core/BlogPost": {"Title": "Hello world", "Content": "This is my first post", "PostedBy": "vijay@fractl.io"}}'
```

The service will allow us to interact with the entities defined in the model over a RESTful API. As the preceding command
shows, invoking `POST _e/Blog.Core/BlogPost` with a JSON encoded `:BlogPost` object will create and persist a new `:BlogPost`
instance in the system. A success response to the `POST` request will look like,

```json
[{
	"status": "ok",
	"result": [{
		"type-*-tag-*-": "entity",
		"-*-type-*-": "Blog.Core/BlogPost",
		"Title": "Hello world",
		"Content": "This is my first post",
		"PostedBy": "vijay@fractl.io",
		"PostedOn": "2023-09-19T13:23:40.755039609",
		"__Id__": "c2384118-c46d-4d05-8c41-00aad8d0cf99"
	}]
}]
```

Note that fractl has filled-in the `:PostedOn` attribute with the current date-time value, which is what the `:Now` datatype is
supposed to do. Also fractl has provided an auto-generated `:__Id__` attribute for the blog-post instance, to uniquely identify it.
We can use this Id to lookup, update or delete the blog-post instance.

Some REST API calls you may try on your own are listed below:

1. Lookup an instance by its unique-identifier

```shell
curl http://localhost:8080/_e/Blog.Core/BlogPost/c2384118-c46d-4d05-8c41-00aad8d0cf99
```

2. Lookup all instances of an entity

```shell
curl http://localhost:8080/_e/Blog.Core/BlogPost
```

3. Update an instance by its unique-identifier

```shell
curl -X PUT http://localhost:8080/_e/Blog.Core/BlogPost/c2384118-c46d-4d05-8c41-00aad8d0cf99 \
  -H 'Content-Type: application/json' \
  -d '{"Data": {"Title": "Hello, World", "PostedBy": "jj@fractl.io"}}'
```

4. Delete an instance by its unique-identifier

```shell
curl -X DELETE http://localhost:8080/_e/Blog.Core/BlogPost/c2384118-c46d-4d05-8c41-00aad8d0cf99
```

Now that we've tested the model, we are ready to make a build for release. For this, run the following command:


```shell
$ fractl build
```

This will create a standalone jar file of the blog-application in the `out` directory.
You may now launch this application using the Java virtual machine:


```shell
$ java -jar out/blog/target/blog-0.0.1-standalone.jar -c config.edn
```

You may now proceed to the more [advanced tutorial](blog-example/intro.md) where we will build a more
feature-rich blog-application and in that process, explore the fractl language in more depth.
