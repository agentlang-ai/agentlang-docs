# Comments

## A new kind of relationship for comments

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
