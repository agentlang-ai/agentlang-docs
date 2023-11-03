# REPL

Fractl supports a REPL environment. REPL is the language shell in which users can evaluate language definitions and dataflow patterns. Using the REPL accelerates development by allowing users to explore and fine-tune small snippets of code, instead of wrangling with the entire stack.

## Getting Started

For this tutorial, we will use the `Blog` application from the [Quick Start](quick-start.md)) guide.
Use the following commands to launch the REPL from the `blog` model directory:

```shell
cd ~/fractl-models/blog
fractl repl
```

This will land you in the prompt:

```shell
blog>
```

From this prompt you can type-in and evaluate Fractl patterns and have the results printed back. For instance, the following session
shows how to create a user and add a new blog-post under that user. (The response from the Fractl evaluator is shown as comments,
some responses are left-out):

```clojure
blog> {:Blog.Core/User
       {:Email "mat@blog.com"
	    :FirstName "Mat"
		:LastName "K"}}

; ({:type-*-tag-*- :entity,
;   :-*-type-*- [:Blog.Core :User],
;   :Email "mat@blog.com",
;   :FirstName "Mat",
;   :LastName "K",
;   :MemberSince "2023-11-03T14:39:38.667403411"})

blog> {:Blog.Core/User
       {:Email? "mat@blog.com"}
	   :as [:U]}
; response will be same as above

blog> {:Blog.Core/BlogPost
       {:Name "post01"
	    :Title "My first post"
		:Content "hello, world"}
	   :-> [[:Blog.Core/PostsBy :U]]}

; {:type-*-tag-*- :entity,
;  :-*-type-*- [:Blog.Core :BlogPost],
;  :Name "post01",
;  :Title "My first post",
;  :Content "hello, world",
;  :__path__
;  "path://Blog.Core$User/mat@blog.com/Blog.Core$PostsBy/Blog.Core$BlogPost/post01",
;  :Id "7df7edcb-9f81-4e0d-85a9-7af62592db9d",
;   :PostedOn "2023-11-03T14:40:37.583122517"}
```

You can type in `?` at the prompt to get some useful information about the Fractl runtime - like its version, the names of the loaded components etc. Type `:quit` to exit the REPL.

You can start the REPL from any directory, if you set the `FRACTL_MODEL_PATHS` environment variable to point to the root directories that contain Fractl models.

```shell
cd /home/me/work
export FRACTL_MODEL_PATHS=/home/me/fractl-models
fractl repl blog
```

By default the REPL runs without logging support. Only relevant error or warning messages are printed to the standard-output.
To enable full logging, start the REPL with the `:with-logs` option:

```shell
fractl repl :with-logs blog
```

## A Complete Live Session

Let's see how we can use the REPL to interactively develop a complete Fractl application. As this is an illustration, the application is a really simple one - a personal TODO-list manager. The app allows to create TODO-list entries, update their status and also keep notes attached to the todo-items. Let's fire-up the REPL and create the model!

```shell
cd ~/fractl-models
fractl repl
```

As we are not running from a particular model directory, you should see the following generic-prompt:

```shell
fractl>
```

The first step is to define the component:

```clojure
fractl> (component :Todo.Core)
; :Todo.Core
todo>
```

Notice how the prompt has changed to the newly defined model-name. Now let's create an entity to represent the todo-entry:

```clojure
todo> (entity :Todo.Core/Task
       {:Id {:type :Int :guid true}
	    :Title :String
	    :Created :Now
		:Status {:oneof ["in-progress" "done"]
		         :default "in-progress"}})
```

Create a couple of tasks:

```clojure
todo> {:Todo.Core/Task {:Id 1 :Title "buy groceries"}}
todo> {:Todo.Core/Task {:Id 2 :Title "prepare sales presentation"}}
```

List pending tasks:

```clojure
todo> {:Todo.Core/Task {:Status? "in-progress"}}
```

It'll be usefull to have dataflows to list pending tasks and also to mark tasks as done:

```clojure
todo> (dataflow :Todo.Core/ListPending
        {:Todo.Core/Task {:Status? "in-progress"}})
todo> (dataflow :Todo.Core/MarkDone
        {:Todo.Core/Task {:Id? :Todo.Core/MarkDone.Task :Status "done"}})
```

Mark the first task as done:

```clojure
todo> {:Todo.Core/MarkDone {:Task 1}}
```

A facility to manage notes under each task:

```clojure
todo> (entity :Todo.Core/Note
       {:No {:type :Int :id true}
	    :Content :String})
todo> (relationship :Todo.Core/Notes
       {:meta {:contains [:Todo.Core/Task :Todo.Core/Note]}})
```

Add a note to the second task:

```clojure
todo> {:Todo.Core/Task {:Id? 2} :as [:T]}
todo> {:Todo.Core/Note {:No 1 :Content "to be completed this week"}
       :-> [[:Todo.Core/Notes :T]]}
```

Now the model is complete and tested - you can generate a model that you can build an deploy using the `dump` command:

```clojure
(dump :Todo.Core)
```

You'll find the model files under the `todo` directory. You can use the REPL to make changes to the component or add new
components to the model - just call `dump` to persist your change to the file-system.
