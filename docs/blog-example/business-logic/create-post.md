# Create Post

# Expressing business logic

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

