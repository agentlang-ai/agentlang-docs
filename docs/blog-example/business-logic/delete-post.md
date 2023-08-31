# Add Authors

## Dataflow for adding new authors to a post

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
