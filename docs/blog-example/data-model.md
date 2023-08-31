# Data model

## Expressing the data model

High-level descriptions of a problem-domain usually starts with its data model - this will include
the main "actors" of the domain and the relationships between them. Formally, the actors are called
*entities*. 

When we think about the blogging domain, there are two main entities - users and the blog-posts they make.
We may also have the comments on blog-posts as a third entity. Let's first see how these entities could be
represented in fractl. Later we will look at how the relationships between then could be modeled.

We shall start with the definition of the user entity:

```clojure
(entity :User
 {:FirstName :Kernel/String
  :LastName :Kernel/String
  :Email :Kernel/Email})
```

This `entity` definition prescribes that a user consists of three *attributes* - 
first-name, last-name and an email address. An attribute must have a type-specification
which controls the values that may be assigned to that attribute. For instance, the
type-specification for the `:FirstName` attribute is `:Kernel/String` which means only
a string value could be assigned to a user's first-name. (`:Kernel` is a component predefined
by fractl which provide some general attribute and entity definitions). Similarly, the user's
`:Email` attribute is assigned the type `:Kernel/Email` which will ensure that all values assigned
conforms to the pattern of a valid email address.

In addition to the basic type-specification, the domain-modeler may add more constraints to an
attribute. For instance, if the email assigned to each user must act as a unique-identifier,
the definition of the entity should be updated as follows:

```clojure
(entity :User
 {:FirstName :Kernel/String
  :LastName :Kernel/String
  :Email {:type :Kernel/Email
          :identity true}})
```
### Complex attributes

There are two basic entities remaining to be defined in our blog-model. These are to represent
the blog posts and comments. The definition of the blog-post entity is given below:

```clojure
(entity :Post
 {:Title :Kernel/String
  :Body :Kernel/String
  :CreatedAt :Kernel/DateTime})
```

The `:Kernel/DateTime` type is used to represent a data-time value in the
[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format (e.g `2023-01-17T12:41:15.3739`).
We would like this attribute to be filled in automatically by the creation-time of the post. We would also like the post
to have an auto-assigned unique identifier, preferably a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier).

First, let's define a custom attribute of type `:Kernel/DateTime` which always defaults to the current system date-time value.

```clojure
(attribute :Now
 {:type :Kernel/DateTime
  :default now})
```

The default value of the `:Now` attribute is created by the function `now` - which is a lower-level
Clojure function exported by fractl (from the `fractl.lang.datetime` namespace).
Each time an instance of the `:Now` type is created, the `now` function will be called (with zero arguments).
The value returned by this function will be the current system date-time, which will be assigned to the attribute.

In similar fashion, we can solve the auto-id generation problem:

```clojure
(attribute :AutoId
 {:type :Kernel/UUID
  :default uuid-string
  :identity true})
```

`uuid-string` is a function defined in fractl's `fractl.util` namespace. It returns a new UUID, each time it is called.

The updated `:Post` entity definition is,

```clojure
(entity :Post
 {:Id :AutoId
  :Title :Kernel/String
  :Body :Kernel/String
  :CreatedAt :Now})
```

There's still a problem with this definition - both `:Title` and `:Body` are string values of arbitrary length.
We want these attributes to have lower and upper bounds - a blog title should be between 3 and 50 characters and
the blog content should have 5-250 characters. These constraints could be expressed as Clojure functions and added
to the attribute definitions. The final specification of the `:Post` entity is shown below:

```clojure
(def sr string-in-range?)
(def blog-post-title? (partial sr 3 50))
(def blog-post-body? (partial sr 5 250))

(entity
 :Post
 {:Id :AutoId
  :Title {:check blog-post-title?}
  :Body {:check blog-post-body?}
  :CreatedAt :Now})
```
The blog-comment entity will have a similar definition.

Note that the component declaration needs to be updated with appropriate Clojure
imports so that functions like `now` and `string-in-range?` are available for the
component to use. Here is our complete `:Blog.Core` component definition:

```clojure
(component :Blog.Core
 {:clj-import '[(:use [fractl.util]
                      [fractl.lang.string]
                      [fractl.lang.datetime])]})

(entity :User
 {:FirstName :Kernel/String
  :LastName :Kernel/String
  :Email {:type :Kernel/Email
          :identity true}})

(attribute :Now
 {:type :Kernel/DateTime
  :default now})

(attribute :AutoId
 {:type :Kernel/UUID
  :default uuid-string
  :identity true})

(def sr string-in-range?)

(def blog-post-title? (partial sr 3 50))
(def blog-post-body? (partial sr 5 250))

(entity :Post
 {:Id :AutoId
  :Title {:check blog-post-title?}
  :Body {:check blog-post-body?}
  :CreatedAt :Now})

(def blog-comment-title? blog-post-title?)
(def blog-comment-body? (partial sr 3 100))

(entity :Comment
 {:Id :AutoId
  :Title {:check blog-comment-title?}
  :Body {:check blog-comment-body?}
  :CreatedAt :Now})
```
