# REPL

After a quick tour of language, you've realized, Fractl has language structure like Clojure and it is also built on Clojure.
So, a question might have arose, "If we have leveraged Clojure, shouldn't we also get LISP's awesome REPL?"
And Yes! Fractl has REPL features so you can use the REPL to do all language operations and also, use external library
and experiment with that on REPL.

## Assumptions

This makes an assumption that you have already setup a fractl project and now want to start REPL to connect to it.
Also, we will be using `H2 database` which is by default used by Fractl for db store.
Additionally, this tutorial assumes you have set, `FRACTL_MODEL_PATHS` properly on the shell, e.g:

```shell
export FRACTL_MODEL_PATHS=<path-containing-fractl-models>
```

## Quickstart

Start a project's REPL by using Fractl CLI(For this example, we are being consistent and using `Blog` app from [quick-start](quick-start.md)):

```shell
fractl repl <project>
fractl repl blog
```

Now let us begin, we know when you created a project, you would already have created a component but, even if you didn't let's start by creating a Blog component.

```clojure
(component :Blog.Core {})
```

This creates a component with no clj-imports i.e. clojure library imports, if you want to require some imports, you can add it via:

```clojure
(component
 :Blog.Core
 {:clj-import (quote
               [(:require
                 [fractl.util :as u]
                 [fractl.lang.string :as fs]
                 [fractl.lang.datetime :as dt])])})
```

In the above snippet, we have imported fractl's excellent datetime and string library to assist on our development(useful when we are writing it into file and compiling from fractl.).

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

Creating another entity Comment with `Id`, `Title`, `Body` and `CreatedAt` attributes. For `Id` let's use fractl's `uuid-string` generating internal function and also, use the `datetime` function.

```clojure
(entity
 :Blog.Core/Comment
 {:Id {:type :UUID
       :default fractl.util/uuid-string
       :id true
       :indexed true}
  :Title {:type :String}
  :Body {:type :String}
  :CreatedAt {:type :DateTime :default fractl.lang.datetime/now}})
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
(fractl.evaluator/safe-eval-pattern {:Blog.Core/User {:Name "John Doe" :Password "Thisispassword12$" :FirstName "John" :LastName "Doe" :Email "john@email.com"}})
```

If you received, something similar to following output, congratulations, you have directly `eval`ed from REPL.

```clojure
({:type-*-tag-*- :entity,
  :-*-type-*- [:Blog.Core :User],
  :Name "John Doe",
  :Password
  "_fractlbsh__:JDJhJDEwJEFhVy85aUl3MjdXTVc5QzMzbjBhYS5KRU5QY0V3TTRXM2h1YlZ6THhXWlUzc0h5LjNsQm5X",
  :FirstName "John",
  :LastName "Doe",
  :Email "john@email.com"})
```

The above output mentions, you have created an instance of `Blog.Core/User` entity along with data provided.

Similarly, we can create instance of `Blog.Core/Comment`. We don't need to provide `Id` and `CreatedAt` attributes as, these are set by default from Fractl.

```clojure
(fractl.evaluator/safe-eval-pattern {:Blog.Core/Comment {:Title "Hey!" :Body "This is a comment message."}})
```

This will return us following output from Fractl.

```clojure
({:type-*-tag-*- :entity,
  :-*-type-*- [:Blog.Core :Comment],
  :Title "Hey!",
  :Body "This is a comment message.",
  :Id "9887d8f3-7e53-4e93-a92d-88678a5903ae",
  :CreatedAt "2023-10-30T17:26:34.69044",
  :__path__ "path://___/dd44afaf-fb16-4789-bc62-81dcdcd16251",
  :__Id__ "369f52e5-4394-4254-b6ff-9813343eba16"})
```

Now, let's create `Post` entity so, we can move towards creating `event` and `dataflow`.

```clojure
(entity
 :Blog.Core/Post
 {:Id {:type :UUID :default fractl.util/uuid-string, :guid true}
  :Title {:type :String}
  :Body {:type :String}
  :CreatedAt {:type :DateTime :default fractl.lang.datetime/now}
  :meta {:Order nil}
  :rbac ()})
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
 {:Blog.Core/User {:Email? :Blog.Core/CreatePost.UserEmail}, :as :U}
 {:Blog.Core/Post {:Title :Blog.Core/CreatePost.Title,
                   :Body :Blog.Core/CreatePost.Body},
  :-> [[{:Blog.Core/PostAuthorship {}} :U]]})
```

Now, let's evaluate the dataflow `CreatePost` with instance data directly from REPL:

```clojure
(fractl.evaluator/safe-eval-pattern {:Blog.Core/CreatePost {:UserEmail "john@email.com" :Title "A new post" :Body "This is a post"}})
```
