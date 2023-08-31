# Source code

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
