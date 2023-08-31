# Create Post

When we define entities and relationships we are designing the *data-model* of the application.
We also need to define the *behaviour* of the application under various circumstances. This behaviour
is also know an *business logic*, which basically tells how the application responds to external stimulants
or *events*. For example, "order-received" is an event for an inventory application. It needs to a specific
sequence of steps in response to that event - check if the requested item exists in the stock, the delivery date
and destination can be serviced and so on. If the checks pass, a "place-order" events should be generated, which
will trigger further processing. If the checks fail, an appropriate an "order-denied" event may be created.

So the point is, an application is made active via events that trigger business logic, which in turn manipulate
instances of entities and relationships.

When we define an entity in fractl, events required for basic data manipulation are automatically
generated for us. `Upsert_Post`, `Lookup_User` etc are all examples of such auto-generated events.
The business logic attached to an event is known as a *dataflow* - because it consumes and produces
values as defined by the data-model.

Dataflows are expressed as sequences of *data-patterns*. The following code snippet shows how
an event and an associated dataflow could be defined for creating a new blog post with proper relationships
to an author.

```clojure
(event :CreatePost
 {:UserEmail :Kernel/Email
  :PostTitle :Kernel/String
  :PostBody :Kernel/String})

(dataflow :CreatePost
 ;; Lookup the user by email,
 ;; if user exists - bind to the name :U
 ;; else return not-found
 {:User
  {:Email? :CreatePost.UserEmail}
 :as :U}

 ;; Create a new blog-post with the user :U as author
 {:Post
  {:Title :CreatePost.PostTitle
   :Body :CreatePost.PostBody}
  :-> [{:PostAuthorship {}} :U]})
```

An `event` is defined just the same way an `entity` is defined - it has a name and a map of attributes.
Once an `event` is defined, a dataflow may be attached to it - this is what the declaration `(dataflow :CreatePost ...)`
is doing. There are two patterns in this dataflow - the first one is a query or a lookup pattern, which looks-up a
`:User` instance whose email attribute matches the value of `:CreatePost`'s `:UserEmail` attribute. If such a user exists,
it is loaded and bound to the name `:U`. Patterns further down the dataflow can refer to this user via the name `:U`.
(For example, `:U.FirstName` will return the first-name of the user. If no binding is made by the query pattern, the complete name
of the entity will have to be used, as in `:User.FirstName`. The short names established by the `:as` binding is therefore known
as an *alias*). If a user with the given email cannot be found, the dataflow will terminate and return a `not-found` error.

The next pattern creates a new instance of the `:Post` entity. The same pattern also connects this instance to the user
(bound to the alias `:U`) via a new instance of the `:PostAuthorship` relationship.

With this dataflow, the blog service gets a new endpoint `CreatePost` that ensures only a registered user can create a
new blog post. Let's try this new API.

```shell
$ curl -X POST 'http://localhost:8080/_e/Blog.Core/CreatePost' -H 'Content-Type: application/json' -d '{"Blog.Core/CreatePost": {"UserEmail": "qbeck@blog.org", "PostTitle": "first post", "PostBody": "hello, world"}}'

# => [{"status":"ok","result":{"type-*-tag-*-":"entity","-*-type-*-":["Blog.Core","Post"],"Title":"first post","Body":"hello, world","Id":"c86a495f-a865-4409-8977-91919dce98a8","CreatedAt":"2023-01-18T14:45:27.518772","->":[{"type-*-tag-*-":"entity","-*-type-*-":["Blog.Core","PostAuthorship"],"User":"qbeck@blog.org","Post":"c86a495f-a865-4409-8977-91919dce98a8","__Id__":"8b0a8150-3b1d-4fba-b69b-b15d78c69682"}]},"message":null}]
```

See what response you will get if you use a non-existing `UserEmail`, like `nemo@acme.com`.

### Updating and deleting posts

Just as a blog-post is created in the context of a `User`, we want post updates and deletes to happen in the context of a `User`
who is in an "authorship" relation to the post. First let's look at the dataflow for updating a post.

```clojure
(dataflow :UpdatePost
 {:Post
  {:Id? :UpdatePost.PostId
   :Title :UpdatePost.NewTitle
   :Body :UpdatePost.NewBody}
  :-> [:PostAuthorship? {:User {:Email? :UpdatePost.UserEmail}}]})
```

The `:UpdatePost` dataflow has only a single pattern - it queries the `Post` instance by `Id` and sets its `Title`
and `Body` to the new values. The `Post` is loaded only if a `PostAuthorship` relation exists between the `Post`
and the user identified by `UpdatePost.UserEmail`.

(Note that we did not explicitly define the event `UpdatePost` - the schema for this event will automatically inferred
by the fractl compiler from the attribute references used in the dataflow.)

Here is an example session with `UpdatePost`, assuming that the `Id` of the `Post` we created is `62d94e2b-bb71-40aa-8108-d2089cc078cc`:

```shell
$ curl -X POST 'http://localhost:8080/_e/Blog.Core/UpdatePost' -H 'Content-Type: application/json' -d '{"Blog.Core/UpdatePost": {"UserEmail": "qbeck@blog.org", "NewTitle": "My first post", "NewBody": "hello, world!", "PostId": "62d94e2b-bb71-40aa-8108-d2089cc078cc"}}'

# => [{"status":"ok","result":[{"transition":{"from":{"type-*-tag-*-":"entity","-*-type-*-":["Blog.Core","Post"],"Body":"hello, world","CreatedAt":"2023-01-18T15:06:27.982918","Id":"62d94e2b-bb71-40aa-8108-d2089cc078cc","Title":"first post"},"to":{"type-*-tag-*-":"entity","-*-type-*-":["Blog.Core","Post"],"Body":"hello, world!","CreatedAt":"2023-01-18T15:06:27.982918","Id":"62d94e2b-bb71-40aa-8108-d2089cc078cc","Title":"My first post"}}}],"message":null}]
```

**Exercise 1**: Use the `Lookup_Post` API to make sure the `Post` has the new title and body set.
**Exercise 2**: Write a new `LookupPost` dataflow that queries the `Post` in the context of its author.

To delete an instance from its persistent store, fractl uses the `:delete` command. The second argument to this
command is a pattern that identifies the instance(s) to delete. For example, the following pattern deletes a `User` by `Email`:

```clojure
[:delete :User {:Email "abc@acme.com"}]
```

To delete a node in a *between* relationship, the relationship instance itself is deleted, with the search pattern being
a "path" to the node to be deleted. This gives us the following dataflow to delete a `Post` authored by a particular user:

```clojure
(dataflow :DeletePost
 [:delete :PostAuthorship [:-> {:User {:Email? :DeletePost.UserEmail}}
                               {:Post {:Id? :DeletePost.PostId}}]])
```

If the `Post` identified by `DeletePost.PostId` is authored by `DeletePost.UserEmail`, then the `PostAuthorship` relation
between the `Post` and the `User` is deleted, along with the `Post` instance itself.

Here is how we use the `DeletePost` event:

```shell
$ curl -X POST 'http://localhost:8080/_e/Blog.Core/DeletePost' -H 'Content-Type: application/json' -d '{"Blog.Core/DeletePost": {"UserEmail": "qbeck@blog.org", "PostId": "62d94e2b-bb71-40aa-8108-d2089cc078cc"}}'

# => [{"status":"ok","result":[{"type-*-tag-*-":"entity","-*-type-*-":["Blog.Core","PostAuthorship"],"Post":"62d94e2b-bb71-40aa-8108-d2089cc078cc","User":"qbeck@blog.org","__Id__":"793054fb-5e1c-4e01-ad08-c9d93bde0ac2"}],"message":null}]
```

**Exercise 2**: Use the `LookupPost` event to check if the `Post` is deleted.

### Adding new authors to a post

An author may decide to have other users as co-authors on a blog-post. The co-authors can edit and manage the blog post for which
they have co-authorship. To handle this scenario, all we need to do is write a new dataflow which will create a `PostAuthorship`
relation between the new user and the blog-post. The definition of this dataflow is given below:

```clojure
(dataflow :AddAuthor
 ;; Check if the user claiming to be the original author
 ;; has an existing authorship claim on the post
 {:Post {:Id? :AddAuthor.PostId}
  :-> [:PostAuthorship? {:User {:Email? :AddAuthor.OriginalAuthorEmail}}]
  :as :P}

 ;; Load the new-author from store
 {:User {:Email? :AddAuthor.NewAuthorEmail} :as :NewAuthor}

 ;; Create an authorship relation between the post and the new author
 {:Post {:Id? :P.Id}
  :-> [{:PostAuthorship {}} :NewAuthor]})
```

**Exercise 3**: For an existing blog-post, add a new author by calling `AddAuthor`. Verify that the
new author can edit the blog-post (invoke `UpdatePost` for this).

In a real-world scenario, only the original author of the blog-post (i.e owner of the post) should be allowed
to add a new author. These kind of "access-control" rules are supported in fractl and is covered in the
[Advanced Topics](/docs/blog-example/adv_topics.md) document.

### A new kind of relationship for comments

One important concept missing from our blogging service is the ability to handle comments.
We have defined an entity to represent comments but have not yet decided how they are mapped to
specific blog-posts. Comments always appear in the context of a blog-post, as its children - We can
think of comments as being "contained" by a blog-post. This concept can be expressed in fractl
with a `:contains` relationship.

```clojure
(relationship :CommentOf
 {:meta {:contains [:Post :Comment]}})
```

Once a `:contains` relationship is established, the child entity (`Comment`) can only be created in the context
of a parent entity,  i.e `Post`. (This might look similar to how we created the `:between` relationship for authors,
but both node-entities of a `:between` relationship may be created and queried independently).

We also need a `:between` relationship to keep track of comment-authors:

```clojure
(relationship
 :CommentAuthorship
 {:meta {:between [:User :Comment]}})
```

```clojure
(dataflow :CreateComment
 {:Post {:Id? :CreateComment.PostId} :as :P}
 {:User {:Email? :CreateComment.UserEmail} :as :U}
 {:Comment
  {:Title :CreateComment.Title
   :Body :CreateComment.Body}
  :-> [[{:CommentOf {}} :P]
       [{:CommentAuthorship {}} :U]]})
```
All comments relevant to a `Post`, that were created after a particular date-time, can be fetched as shown below:

```clojure
(dataflow :FetchComments
 {:Comment {:CreatedAt? [:>= :FetchComments.CreatedAt]}
  :-> [:CommentOf? {:Post {:Id? :FetchComments.PostId}}]})
```

## Next steps

In this tutorial we have just scratched the surface of what is possible in fractl.
Some of the advanced features that you will need as you develop real-world applications in
fractl are:

 - Role-based access control
 - Configuring the persistent-layer (database) and other aspects of the service
 - Custom rules for dataflow-pattern evaluation
 - Models as libraries - managing dependencies
 - Deploying the application for scale

These issues will be covered in the [Advanced Topics](/docs/blog-example/adv_topics.md) guide.
A complete coverage of the pattern-language is available in the [Dataflow section of Language Reference](/docs/language/business-logic/dataflow.md).

## Source listing

#### The model specification

```clojure
;; blog/model.fractl
{:name :Blog
 :components [:Blog.Core]}
```

#### Blog component

```clojure
;; blog/blog/core.fractl
(component
 :Blog.Core
 {:clj-import '[(:use [fractl.util]
                      [fractl.lang.string]
                      [fractl.lang.datetime])]})

(entity
 :User
 {:FirstName :Kernel/String
  :LastName :Kernel/String
  :Email {:type :Kernel/Email
          :identity true}})

(attribute
 :Now
 {:type :Kernel/DateTime
  :default now})

(attribute
 :AutoId
 {:type :Kernel/UUID
  :default uuid-string
  :identity true})

(def sr string-in-range?)

(def blog-post-title? (partial sr 3 50))
(def blog-post-body? (partial sr 5 250))

(entity
 :Post
 {:Id :AutoId
  :Title {:check blog-post-title?}
  :Body {:check blog-post-body?}
  :CreatedAt :Now})

(relationship
 :PostAuthorship
 {:meta {:between [:User :Post]}})

(event
 :CreatePost
 {:UserEmail :Kernel/Email
  :PostTitle :Kernel/String
  :PostBody :Kernel/String})

(dataflow
 :CreatePost
 ;; Lookup the user by email,
 ;; if user exists - bind to the name :U
 ;; else return not-found
 {:User
  {:Email? :CreatePost.UserEmail}
 :as :U}

 ;; Create a new blog-post with the user :U as author
 {:Post
  {:Title :CreatePost.PostTitle
   :Body :CreatePost.PostBody}
  :-> [{:PostAuthorship {}} :U]})

(dataflow :UpdatePost
 {:Post
  {:Id? :UpdatePost.PostId
   :Title :UpdatePost.NewTitle
   :Body :UpdatePost.NewBody}
  :-> [:PostAuthorship? {:User {:Email? :UpdatePost.UserEmail}}]})

(dataflow
 :DeletePost
 [:delete :PostAuthorship
  [:->
   {:User {:Email? :DeletePost.UserEmail}}
   {:Post {:Id? :DeletePost.PostId}}]])

(dataflow :AddAuthor
 {:Post {:Id? :AddAuthor.PostId}
  :-> [:PostAuthorship? {:User {:Email? :AddAuthor.OriginalAuthorEmail}}]
  :as :P}
 {:User {:Email? :AddAuthor.NewAuthorEmail} :as :NewAuthor}
 {:Post {:Id? :P.Id}
  :-> [{:PostAuthorship {}} :NewAuthor]})

(def blog-comment-title? blog-post-title?)
(def blog-comment-body? (partial sr 3 100))

(entity
 :Comment
 {:Id :AutoId
  :Title {:check blog-comment-title?}
  :Body {:check blog-comment-body?}
  :CreatedAt :Now})

(relationship
 :CommentAuthorship
 {:meta {:between [:User :Comment]}})

(relationship
 :CommentOf
 {:meta {:contains [:Post :Comment]}})

(dataflow
 :CreateComment
 {:Post {:Id? :CreateComment.PostId} :as :P}
 {:User {:Email? :CreateComment.UserEmail} :as :U}
 {:Comment
  {:Title :CreateComment.Title
   :Body :CreateComment.Body}
  :-> [[{:CommentOf {}} :P]
       [{:CommentAuthorship {}} :U]]})

(dataflow :FetchComments
 {:Comment {:CreatedAt? [:>= :FetchComments.CreatedAt]}
  :-> [:CommentOf? {:Post {:Id? :FetchComments.PostId}}]})
```
