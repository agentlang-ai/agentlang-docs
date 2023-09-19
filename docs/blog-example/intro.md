# Introduction

Let's continue our exploration of fractl by further developing the [blog-application](../quick-start.md). Currently, the
`:Blog.Core` component looks like this:

```clojure
(component :Blog.Core)

(entity :BlogPost
 {:Title :String
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

How can we express the idea that a blog-post is always created under a user? For this, we can make use of the
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
 {:Id :Identity
  :Title :String
  :Content :String
  :PostedOn :Now})

(relationship :PostsBy
 {:meta {:contains [:User :BlogPost]}})

```
Note that we have removed the `:PostedBy` attribute from `:BlogPost` and added an explicit identity attribute named `:Id`.
Its type `:Identity` stands for an auto-generated uuid-string. An explicit identity attribute is required for entities that
become child-nodes in a `:contains` relationship.

Let's test out our updated model. First delete the old data-file - `data/blog` - as the [schema](concepts/schema-migration.md)
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
-d '{"Blog.Core/BlogPost": {"Title": "hello, world", "Content": "My first post"}}'
```

Note the auto-generated `__path__` attribute in the blog-post instance - this uniquely encodes the hierarchy
that the instance belongs to.

3. Fetch all blog posts made by a user

```shell
$ curl http://localhost:8080/_e/Blog.Core/User/jj@fractl.io/PostsBy/BlogPost
```

4. Fetch an individual blog-post by path

```shell
$ curl http://localhost:8080/_e/Blog.Core/User/jj@fractl.io/PostsBy/BlogPost/e51406f6-d500-472c-98cd-9b46d6fcbebe
```

5. Update a blog-post by path

```shell

$ curl -X PUT http://localhost:8080/_e/Blog.Core/User/jj@fractl.io/PostsBy/BlogPost/e51406f6-d500-472c-98cd-9b46d6fcbebe \
-H 'Content-Type: application/json' \
-d '{"Data": {"Title": "hello, there"}}'
```

6. Delete a blog-post by path

```shell
$ curl -X DELETE http://localhost:8080/_e/Blog.Core/User/jj@fractl.io/PostsBy/BlogPost/e51406f6-d500-472c-98cd-9b46d6fcbebe
```

**Exercise 1** Add a new entity `:BlogComment` to represent comments on blog-posts. Connect comments and blog-posts through
a `:contains` relationship.

## Grouping blog-posts

 -- TODO -- add description.

```clojure
(entity :Category
 {:Name {:type :String :identity true}})

(relationship :BelongsTo
 {:meta {:between [:BlogPost :Category]}})
```

## RBAC

 -- TODO -- update the model with rbac.
 -- TODO -- custom dataflows to check user on blog-post-creation

## Querying data

 -- TODO -- queries with API endpoints and dataflows
