# Security & Access Control

Fractl allows role-based-access-control for an application to be expressed in a very declarative way. For instance,
if only managers are allowed to create new companies and employees are only allowed to view company-data, 
an appropriate `:rbac` spec could be added to the `:Company` entity definition:

```clojure
(entity :Acme.Core/Company
 {:Name {:type :String :guid true}
  :rbac [{:roles ["manager"] :allow [:create]}
         {:roles ["employee"] :allow [:read]}]})
```
When a user belonging to the "manager" role creates an instance of `:Company`, that user also becomes the *owner* of that
instance. A user may *read*, *update* or *delete* an entity-instance that it owns. The user may also assign new owners
or grant permissions on that instance to other users.

**Note** The role named `admin` is special - users belonging to that role can execute CRUD operations on all entities in the system. (In a sense, they become "superusers" of the system).

## Identity management

Users are represented by instances of the `:Fractl.Kernel.Identity/User` entity. New users are usually added to the application
through the `/_signup` API:

```shell
$ curl -X POST http://localhost:8080/_signup/ \
-H 'Content-Type: application/json' \
-d '{
    "Fractl.Kernel.Identity/SignUp": {
        "User": {
            "Fractl.Kernel.Identity/User": {
                "Name": "joe",
                "Password": "Ch7Sjj@123",
                "Email": "joe@acme.com",
                "FirstName": "Joe",
                "LastName": "Jay"
            }
        }
    }
}'

```
Once a user has signed-up, he/she may login to the application as,

```shell
$ curl -X POST http://localhost:8080/_login/ \
-H 'Content-Type: application/json' \
-d '{"Fractl.Kernel.Identity/UserLogin":
{"Username": "joe@acme.com", "Password": "Ch7Sjj@123"}}'
```

If the login succeeds, an auth-token is returned - which has to be added to each subsequent RESTful API call.

```shell
$ curl -X POST http://localhost:8080/_e/Acme.Core/Company \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer eyJr...' \
-d '{"Acme.Core/Company { .... }}'
```

## Assigning roles

When a user signs-up he/she may be assigned a default role, the most convenient way to do this is by implementing a dataflow for the
`:Fractl.Kernel.Identity/PostSignUp` event. The following example shows how a newly signed-up user is added to the "employee" role
by default:

```clojure
(dataflow :Fractl.Kernel.Identity/PostSignUp
 
 ;; Query the user by email.
 {:Fractl.Kernel.Identity/User
  {:Email? :Fractl.Kernel.Identity/PostSignUp.SignupRequest.User.Email}
  :as [:U]}

 ;; Add the user to the employee-role.
 {:Fractl.Kernel.Rbac/RoleAssignment
  {:Role "employee" :Assignee :U.Email}}

 ;; Return the user to complete the sign-up-process.
 :U)
```

A *superuser* may evaluate a custom dataflow to add a user to the "manager" role. Super-users and configuration related to
rbac is discussed in the section on [rbac-settings](#rbac-settings).

## RBAC on relationships

For `:contains` relationships, the default rbac rule is this - the user must be the owner of the parent-node to create the
relationship. For `:between` relationships, the default rule is that the user must be the owner of both nodes. It's possible
to override these rules by explicitly setting an `:rbac` spec for relationships.

For `:between` relationships some additional options are available. This is illustrated below:

```clojure
(relationship :Social/Friendship
 {:meta {:between [:Social/Person :Social/Person :as [:From :To]]}
  :rbac {:owner :From
         :assign {:ownership [:To :-> :From]}}})
```

The `:owner` setting means - the owner of the `:From` node can create the relationship - she need not be the owner
of `:To`. The `:assign` setting controls dynamic-assignment of ownership. Here, when an instance of the relationship
is created the owner of `:To` is added to the owners list of `:From`. This allows the owner of `:To` to perform additional
operations of `:From`, that was not possible when the relationship did not exist. This ownership assignment will be revoked when
the relationship instance is deleted from the system.

## RBAC settings

RBAC is enabled by the following simple setting in `config.edn`:

```clojure
{:rbac-enbled true}
```
A few environment variables need to be set so that the Fractl runtime can interact with the identity-backend, which defaults to
Amazon Cognito. These environment variables are:

```
* FRACTL_SUPERUSER_EMAIL - the email address of the superuser
* FRACTL_SUPERUSER_PASSWORD - the password of the superuser
* AWS_REGION - the aws region where cognito is configured, e.g us-west-2
* AWS_ACCESS_KEY - an access key obtained from AWS
* AWS_SECRET_KEY - a secret key obtained from AWS
* AWS_COGNITO_CLIENT_ID - client id for accessing the cognito pool
* AWS_COGNITO_USER_POOL_ID - cognito pool id
```

The superuser maybe manually configured in Cognito and setup with an appropriate password there.

