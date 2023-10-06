# Advanced Tutorial

Let's continue our exploration of fractl by further developing the [blog-application](quick-start.md). Currently, the
`:Blog.Core` component looks like this:

```clojure
(component :Blog.Core)

(entity :BlogPost
 {:Name {:type :String :identity true}
  :Title :String
  :Content :String
  :PostedBy :Email
  :PostedOn :Now})
```

As of now, anyone can create blog-posts. Let's fix this issue in multiple steps - first we shall introduce the concept
of a "user" to the application:

```clojure
(entity :User
 {:Email {:type :Email :identity true}
  :FirstName :String
  :LastName :String
  :MemberSince :Now})
```

To express the idea that a blog-post is always created under a user, we make use of the
`:contains` [relationship](language/data-model/relationship.md):

```clojure
(relationship :PostsBy
  {:meta {:contains [:User :BlogPost]}})
```

`:PostsBy` establishes a hierarchical relationship between a `:User` and the blog-posts that he/she creates. This means,
the `:PostedBy` attribute of `:BlogPost` has now become superfluous and can be removed. the core-component is now,

```clojure
(component :Blog.Core)

(entity :User
 {:Email {:type :Email :identity true}
  :FirstName :String
  :LastName :String
  :MemberSince :Now})

(entity :BlogPost
 {:Name {:type :String :identity true}
  :Title :String
  :Content :String
  :PostedOn :Now})

(relationship :PostsBy
 {:meta {:contains [:User :BlogPost]}})

```
Note that we have removed the `:PostedBy` attribute from `:BlogPost`. Also keep in mind that, when the `:contains` relationship
is defined, the meaning of `:identity` in `:BlogPost.Name` also changes - it's no longer a global property but a property
applied in the context of the parent `:User`. In other words, two users can both create a blog-post with
the name `"post01"` under them, but only once.

Let's test our updated model. First delete the old data-file - `data/blog` - as the [schema](concepts/schema-migration.md)
for our model has changed. Then start the application by running the `fractl run` command and try the following requests.

1. Create a couple of users

```shell
$ curl -X POST http://localhost:8080/_e/Blog.Core/User \
-H 'Content-Type: application/json' \
-d '{"Blog.Core/User": {"Email": "jj@fractl.io", "FirstName": "James", "LastName": "Jay"}}

$ curl -X POST http://localhost:8080/_e/Blog.Core/User \
-H 'Content-Type: application/json' \
-d '{"Blog.Core/User": {"Email": "mm@fractl.io", "FirstName": "Madhu", "LastName": "M"}}'
```

2. Create blog posts under individual users

```shell
$ curl -X POST http://localhost:8080/_e/Blog.Core/User/jj@fractl.io/PostsBy/BlogPost \
-H 'Content-Type: application/json' \
-d '{"Blog.Core/BlogPost": {"Name": "post01", "Title": "hello, world", "Content": "My first post"}}'
```

In the response, note the auto-generated `__path__` attribute in the blog-post instance that encodes the route to the
blog-post from the user. Also note the system generated globally-unique identifier for the blog-post, under the attribute
named `:__Id__`.

3. Fetch all blog posts made by a user

```shell
$ curl http://localhost:8080/_e/Blog.Core/User/jj@fractl.io/PostsBy/BlogPost
```

4. Fetch an individual blog-post by path

```shell
$ curl http://localhost:8080/_e/Blog.Core/User/jj@fractl.io/PostsBy/BlogPost/post01
```

5. Update a blog-post by path

```shell

$ curl -X PUT http://localhost:8080/_e/Blog.Core/User/jj@fractl.io/PostsBy/BlogPost/post01 \
-H 'Content-Type: application/json' \
-d '{"Data": {"Title": "hello, there"}}'
```

6. Delete a blog-post by path

```shell
$ curl -X DELETE http://localhost:8080/_e/Blog.Core/User/jj@fractl.io/PostsBy/BlogPost/post01
```

**Exercise 1** Add a new entity `:BlogComment` to represent comments on blog-posts. Connect comments and blog-posts through
a `:contains` relationship.

## Grouping blog-posts

A common feature required by bloggers is the ability to categorize blog posts. There could be a set of categories that
come predefined - like "technology", "travel" etc. Users should be able to create their own categories as well. A category
can be represented by the entity shown below:

```clojure
(entity :Category
 {:Name {:type :String :identity true}})
```

A new category can be created as:

```shell
$ curl -X POST http://localhost:8080/_e/Blog.Core/Category \
-H 'Content-Type: application/json' \
-d '{"Blog.Core/Category": {"Name": "Programming"}}'
```

How can we add a blog-post to a category? This operation could be viewed as a `:between` relationship in fractl - this is a
simple link that connects two instances forming a flat-graph (rather than a hierarchy as established by a `:contains` relationship).
This relationship can be defined as:

```clojure
(relationship :BelongsTo
 {:meta {:between [:BlogPost :Category]}})
```

A `:between` relationship is stored in the system just like an entity instance - so it may be created directly using a `POST`
request.

```clojure
$ curl -X POST http://localhost:8080/_e/Blog.Core/BelongsTo \
-H 'Content-Type: application/json' \
-d '{"Blog.Core/BelongsTo": {"BlogPost": "2da0f682-c0f3-456b-b177-c45c19fe74eb", "Category": "Programming"}}'
```

Note that the `:BlogPost` attribute of `:BelongsTo` must be the globally-unique attribute of the `:BlogPost` entity. Here it will
be the value of the `:BlogPost.__Id__` attribute.

All blog-posts that belongs to a particular category maybe listed by a `GET` request:

```shell
$ curl  http://localhost:8080/_e/Blog.Core/Category/Programming/BelongsTo/BlogPost
```

## Querying data

In this section we'll look at a few more examples of querying data.

The following request will return all blog-posts by the user `jj@fractl.io` with the title `"hello, world"`.

```shell
curl http://localhost:8080/_e/Blog.Core/User/jj@fractl.io/PostsBy/BlogPost?Title=hello%2C%20world
```
What if we want to fetch all blog-posts whose title starts with the string `"hello"`? For this we need to add
a user-defined query to the model. Custom queries and business logic is added to a fractl program by way of
[**dataflows**](concepts/declarative-dataflow). A dataflow is attached to an **event**, which is a data structure
similar to entities. When an instance of the event is created, the attached dataflow is executed. So for our requirement,
we define the following event and dataflow:

```clojure
(event :LookupPosts
 {:Title :String})

(dataflow :LookupPosts
 {:BlogPost
  {:Title? [:like :LookupPosts.Title]}})
```

The dataflow contains a single pattern - a query on the `:Title` attribute of `:BlogPost`.
All blog-posts whose title starts with the string specified in `:LookupPosts.Title` will be returned.
To invoke a dataflow, we send an event instance to the service over an HTTP POST:

```shell
$ curl -X POST http://localhost:8080/_e/Blog.Core/LookupPosts \
-H 'Content-Type: application/json' \
-d '{"Blog.Core/LookupPosts": {"Title": "hello%"}}'
```
Note that the value passed to `:Title` ends with the wildcard character `%` - this is because
we want to match all titles that starts with the characters "hello".

We have reached the end of our whirlwind tour of fractl. There's a lot of ground left to cover - please
continue your journey by reading about the core [concepts](concepts/intro.md) of fractl and
the [language reference](language/overview.md).
