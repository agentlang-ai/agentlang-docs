# Modelling in 3-Steps

This document gives a short description of the basic steps involved in modelling a business application in Agentlang.
Please note that these steps are not design recipes, but are intended to show the common tasks involved in developing an Agentlang model. In practice, an Agentlang application evolves over many iterative cycles of design, experimentation, implementation and testing.

## Step 1 - Define Entities and Their Relationships

Entities are the "actors" involved in the business process. Entities do not exist in isolation, but are related to other entities in complex ways. Agentlang allow these relationships to be intuitively expressed in the model.

For example, in the model of a library, you can think of a few basic entities like the library itself, books and members. Books are contained in libraries. A member is related to a library through membership, and a member can checkout books. These concepts and their inter-relationships can be represented in Agentlang as:

```clojure
(component :Library.Core)

(entity :Library
 {:Name {:type :String :guid true}
  :Created :Now
  :Address :String})
  
(defn isbn? [s]
  (and (string? s)
       ;; isbn-format-check
	   ))

(entity :Book
 {:Title {:type :String :indexed true}
  :Authors {:listof :String :indexed true}
  :ISBN {:check isbn? :guid true}})

(relationship :Books
 {:meta {:contains [:Library :Book]
         :globally-unique true}})

;; The :globally-unique flag will mark :Book.ISBN as
;; unique both locally (within the relationship :Books)
;; and globally.

(entity :Member
 {:Email {:type :Email :id true}
  :Id :Identity
  :Name :String
  :Address :String})

;; A :Member with the same :Email can become
;; members of different libraries, because :Email
;; is defined as `:id` (not `:guid`). The `:Id` attribute
;; will act as a :Member's globally-unique-identifier.

(relationship :Membership
 {:meta {:contains [:Library :Member]}})
 
(relationship :Checkout
 {:meta {:between [:Member :Book]}})
```

## Step 2 - Implement Custom Business Logic

If you load the above model into Agentlang, you can immediately perform CRUD operations on the entities and their relationships. You have a scalable, REST API enabled "library" service ready in so few lines of code! But when you reach the book checkout process you notice that a few more checks must be in place - before we could create an instance of `:Checkout` we need to make sure that the `:Member` has a `:Membership` in the `:Library` and the `:Book` is available for checkout.

Business logic like these are expressed as `dataflow`s which are triggered by `event`s. For our custom checkout rules, we define the following event and attach a dataflow to it:

```clojure
(event :BookCheckout
 {:LibraryName :String
  :MemberEmail :Email
  :ISBN :String})

(dataflow :BookCheckout
 ;; Lookup the :Library and make sure the :Member
 ;; and the :Book are related to it.
 {:Library {:Name? :BookCheckout.LibraryName} :as [:L]}
 {:Member? {} :-> [[:Membership? :L :BookCheckout.MemberEmail]] :as [:M]}
 {:Book? {} :-> [[:Books? :L :BookCheckout.ISBN]] :as [:B]} 
 [:try
  ;; If the book is already checked-out, return that info.
  {:Checkout {:Book? :B.ISBN}}
  ;; otherwise, create a checkout for the user.
  :not-found {:Checkout {:Member :M.Id :Book :B.ISBN}}])
```

## Step 3 - Make the Model Secure

The next step is to tighten the security of the application. Continuing on our "library" app example, imagine that we want only two types of users to access and manipulate the entities. The first class of users belong to the "admin" role. An admin can create instances of `:Library` and add/delete books and members. The second class of users belong to the "member" role. A member has read permission on libraries and can perform checkouts.

Let's update our model to support these authorization rules. We update the `:Library` entity as follows:

```clojure
(entity :Library
 {:Name {:type :String :guid true}
  :Created :Now
  :Address :String
  :rbac [{:roles ["admin"] :allow [:create]}
         {:roles ["member"] :allow [:read]}]})
```

We don't have to specify RBAC explicitly for `:Book` or `:Member` as they are contained by `:Library`, the authorization-rules are inherited by them. (The spec for role "admin" is also superfluous, because users belonging to the "admin" role always have CRUD permissions on all business-objects, we are being explicit here for illustrative purpose only. In a real application, you'll want to define a more specific role like "library-admin" and use the generic "admin" role more sparingly.)

When an admin creates a `:Member`, we would like to enable authentication and authorization for the new member. This is usually done in a dataflow attached to the [:Agentlang.Kernel.Identity/PostSignUp](language/reference/rbac#identity-management) event. In this example, we achieve this by a special dataflow that's setup to run after the `:Member` creation:

```clojure
(dataflow [:after :create :Member]
 {:Agentlang.Kernel.Identity/User
  {:Email :Instance.Email
   :Name :Instance.Name
   :Password "Member@lib123"
   :FirstName :Instance.Name
   :LastName :Instance.Name}}
 {:Agentlang.Kernel.Rbac/RoleAssignment
  {:Role "member"
   :Assignee :Instance.Email}})
```

We also have to update the `:rbac` spec for the `:Checkout` relationship, so that members can perform checkouts:

```clojure
(relationship :Checkout
  {:meta {:between [:Member :Book]}
   :rbac [{:roles ["member"] :allow [:create]}]})
```

Note that only the `:create` permission is specified. This allows a member to create a `:Checkout` and **own** it. A member can read, update and delete the checkouts that he owns, but will not be able to access checkouts created by other users.

Also note that with authentication enabled, the `:MemberEmail` attribute is no longer necessary in the `:BookCheckout` event. This information can be accessed from the `:EventContext` of the event, which has access to the logged-in user's email.

```clojure
(event :BookCheckout
 {:LibraryName :String
  :ISBN :String})

(dataflow :BookCheckout
 ;; Lookup the :Library and make sure the :Member
 ;; and the :Book are related to it.
 {:Library {:Name? :BookCheckout.LibraryName} :as [:L]}
 {:Member? {} :-> [[:Membership? :L :BookCheckout.EventContext.User]] :as [:M]}
 {:Book? {} :-> [[:Books? :L :BookCheckout.ISBN]] :as [:B]} 
 [:try
  ;; If the book is already checked-out, return that info.
  {:Checkout {:Book? :B.ISBN}}
  ;; otherwise, create a checkout for the user.
  :not-found {:Checkout {:Member :M.Id :Book :B.ISBN}}])
```

Finally, we can setup an admin user during application-initialization:

```clojure
(dataflow
 :Agentlang.Kernel.Lang/AppInit
 {:Agentlang.Kernel.Identity/User
  {:Email "admin@library.com"
   :Name "Admin"
   :Password "Admin@lib123"
   :FirstName "Admin"
   :LastName "Admin"}}
 {:Agentlang.Kernel.Rbac/RoleAssignment
  {:Role "admin"
   :Assignee "admin@library.com"}})
```

**Note** For more information on enabling authentication and authorization in a model, please see the [RBAC reference](language/reference/rbac).
