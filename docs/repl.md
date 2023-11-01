# REPL

Fractl supports a REPL environment. REPL is the language shell in which users can evaluate language definitions and dataflow patterns. Using a REPL accelerates development by allowing users to explore and fine-tune small snippets of code, instead of wrangling with the entire stack.

## Assumptions

This makes an assumption that you have already setup a fractl project and now want to start REPL to connect to it.
Also, we will be using `H2 database` which is used by Fractl REPL the default db store.

## Quickstart

Start a project's REPL by using Fractl CLI (For this example, we are being consistent and using `Blog` app from [quick-start](quick-start.md)):

It is recommended that the REPL be started from the root of the model folder (where `model.fractl` file resides)

```shell
fractl repl <project>
```

An alternative is to start the REPL from any directory with a model name as the argument. The CLI will search for the model in `FRACTL_MODEL_PATHS` directories and use it.
```shell
export FRACTL_MODEL_PATHS=<path-containing-fractl-models>
fractl repl <project>
```

This is will start fractl repl for `Blog` app. By default, this will start without any logs.
If you want to have logs support for the REPL, you have to enable with `:with-logs` option.

```shell
fractl repl :with-logs blog
```

Now let us begin, we know when you created a project, you would already have created a component but, even if you didn't let's start by creating a Blog component.

```clojure
(component :Blog.Core)
```

Creating a new entity for `Blog` called `User` with attributes: `Name`,`Password`, `FirstName`, `LastName` and `Email`:

```clojure
(entity
 :Blog.Core/User
 {:Name {:type :String :optional true}
  :Password {:type :Password :optional true}
  :FirstName {:type :String :optional true}
  :LastName {:type :String :optional true}
  :Email {:type :Email :guid true}})
```

This should return `:Blog.Core/User` after entity has been interned.

Creating another entity Comment with `Id`, `Title`, `Body` and `CreatedAt` attributes. For `Id` let's use `Identity` type from Fractl and for `CreatedAt` use, `Now` which gives the current date-time.

```clojure
(entity
 :Blog.Core/Comment
 {:Id :Identity
  :Title :String
  :Body :String
  :CreatedAt :Now})
```

Let's create `relationship` between `User` and `Comment` so, that we can define logic later that only `User` can create comments.

```clojure
(relationship
 :Blog.Core/CommentAuthorship
 {:meta {:between [:Blog.Core/User :Blog.Core/Comment],
         :cascade-on-delete true}})
```

Okay, till now we used to do simple declarations now, let's use fun part of evaluator directly from REPL and create instances of entities and later evaluate `dataflow`.

```clojure
{:Blog.Core/User {:Email "john@email.com"}}
```

To create a entity instance we use the above structure while for dataflow/event, we can directly invoke as we will see below.

If you received, something similar to following output, congratulations, you have directly `eval`ed from REPL.

```clojure
({:type-*-tag-*- :entity,
  :-*-type-*- [:Blog.Core :User],
  :Email "john@email.com",
  :Password
  "_fractlbsh__:JDJhJDEwJEFhVy85aUl3MjdXTVc5QzMzbjBhYS5NTXJZLjgueTdLc2pSQzZNUFR4dWQ2dWU3dWtHUmxL"})
```

The above output mentions, you have created an instance of `Blog.Core/User` entity along with data provided.

Similarly, we can create instance of `Blog.Core/Comment`. We don't need to provide `Id` and `CreatedAt` attributes as, these are set by default from Fractl.

```clojure
{:Blog.Core/Comment {:Title "Hey!" :Body "This is a comment message."}}
```

This will return us following output from Fractl.

```clojure
({:type-*-tag-*- :entity,
  :-*-type-*- [:Blog.Core :Comment],
  :Title "Hey!",
  :Body "This is a comment message.",
  :Id "022c9304-69bf-44aa-a157-24427ed574ca",
  :CreatedAt "2023-10-31T13:06:42.73771"})
```

Now, let's create `Post` entity so, we can move towards creating `event` and `dataflow`.

```clojure
(entity
 :Blog.Core/Post
 {:Id :Identity
  :Title :String
  :Body :String
  :CreatedAt :Now})
```

Let's make sure, Post can only be created by User. Let's create relationship called `PostAuthorship`.

```clojure
(relationship
 :Blog.Core/PostAuthorship
 {:meta {:between [:Blog.Core/User :Blog.Core/Post],
         :cascade-on-delete true}})
```

Now, create event `CreatePost`.

```clojure
(event
 :Blog.Core/CreatePost
 {:UserEmail :Email
  :Title {:type :String}
  :Body {:type :String}})
```

Also, create dataflow `CreatePost` for the event.

```clojure
(dataflow
 :Blog.Core/CreatePost
 {:Blog.Core/User {:Email? :Blog.Core/CreatePost.UserEmail}, :as [:U]}
 {:Blog.Core/Post {:Title :Blog.Core/CreatePost.Title,
                   :Body :Blog.Core/CreatePost.Body},
  :-> [[{:Blog.Core/PostAuthorship {}} :U]]})
```

Now, let's evaluate the dataflow `CreatePost` with instance data directly from REPL:

```clojure
{:Blog.Core/CreatePost {:UserEmail "john@email.com" :Title "A new post" :Body "This is a post"}}
```

We should see output like this:

```clojure
[{:type-*-tag-*- :entity,
  :-*-type-*- [:Blog.Core :Post],
  :Title "A new post",
  :Body "This is a post",
  :Id "e9284489-ec06-41a9-ae37-32f0f1a02179",
  :CreatedAt "2023-11-01T14:06:30.838564"}
 nil]
```

Awesome! Now you are able to do these kinds of operations directly from REPL which will help you experiment and visualize
the language more.

Have fun with journey and keep on experiment and when you're done, you can close the REPL with "process quit" command on shell
which is "Ctrl-C".
