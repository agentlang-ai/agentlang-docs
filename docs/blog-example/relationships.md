# Add relationships

### Establishing authorship

Any user who is registered with our blogging service should be able to create a blog post. A user may also be
a contributor to a post created by someone else. In more formal terms we can say that there is a *N-N relationship*
between the entities `User` and `Post`. This relationship can be expressed in fractl as:

```clojure
(relationship :PostAuthorship
 {:meta {:between [:User :Post]}})
```

You can think of the `relationship` construct as a special type of `entity`, with a `:meta` property where the
details of the relationship are captured. Here the specification just tells us that there is a relationship
*between* `User` and `Post`. (There is one more type of relationship that could be established between two
entities - we will learn about that later in this tutorial).

In addition to the `:meta` section, a `relationship` may also have attributes like an entity, but in the case of
`:PostAuthorship` we don't need that.

With the definition of the relationship, we need a more sophisticated API that `Upsert_Post` to create new blog entries.
This new API should get the author's email address as an input, make sure the user for that email exists and then create the
blog-post along with its relationship to that user. Let's proceed to understand the details of implementing this API.
