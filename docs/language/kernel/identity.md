# Identity

The `:Fractl.Kernel.Identity` component contain definitions for managing "user-identities" in a Fractl application.

```clojure
(entity :User
 {:Name {:type :String :optional true}
  :Password {:type :Password :optional true}
  :FirstName {:type :String :optional true}
  :LastName {:type :String :optional true}
  :Email {:type :Email :guid true}
  :UserData {:type :Map :optional true}})
```

The `:User` entity represents a user that login to an application. The `:Email` attribute uniquely identifies the user
in the system. The user may sign-in using the email-password combination or via a third-party authentication service like Google.

A new user signs-up with the application by calling the `POST /_signup` API. The argument to this POST request will be an instance of
the `:SignUp` event.

```clojure
(event
 :SignUp
 {:User :User})
```

As sample invocation is shown below:


```
POST /_signup
Content-Type: application/json


{
    "Fractl.Kernel.Identity/SignUp": {
        "User": {
            "Fractl.Kernel.Identity/User": {
                "Name": "Joe",
                "Password": "Abc@acme123",
                "Email": "joe@acme.com",
                "FirstName": "J",
                "LastName": "Joe"
            }
        }
    }
}
```

The Fractl runtime may be asked to run some business-logic (like assigning some special permission to the new user),
after each successful signup-request. The application can provide this logic in a dataflow attached to the `:PostSignUp` event.

```clojure
(event :PostSignUp
 {:SignupRequest :SignUp
  :SignupResult :Any})
```

The result of the signup operation will be available in `:SignupResult` - the format of this value depends on the authentication
backend used. Usually it will be a map with some information on the newly created user. The `:User` object that was passed to
the `/_signup` request can be accessed as `:SignupRequest.User`. The following code-snippet shows how a dataflow may be
executed after signup to assign an [rbac](rbac) role to the new user:

```clojure
(dataflow :Fractl.Kernel.Identity/PostSignUp
 {:Fractl.Kernel.Rbac/RoleAssignment
  {:Role "guest-user" 
   :Assignee :Fractl.Kernel.Identity/PostSignUp.SignupRequest.User.Email}})
```

After signing-up, the user may receive a confirmation email. The user can use the embedded-link in the email and confirm his account.
The user may also complete the confirmation process by directly calling the `POST _confirm-sign-up` endpoint with an instance of the
`:ConfirmSignUp` event in the body.

```clojure
(event :ConfirmSignUp
 {:Username :Email
  :ConfirmationCode :String})
```

The `:ConfirmationCode` attribute must be set to the confirmation-code received in the email.

To login to the Fractl application, the user can call the `POST /_login` endpoint with an object of the `:UserLogin` event in the
request body.

```clojure
(event :UserLogin 
 {:Username :String
  :Password :Password})
```

An example invocation will be,

```
POST /_login
Content-Type: application/json

{"Fractl.Kernel.Identity/UserLogin":
 {"Username": "joe@acme.com", "Password": "Abc@acme123"}}
```

The response will be a map with three important entries - `access-token`, `expires-in` and `refresh-token`. The user has to 
send the `access-token` to authenticate requests on any application related api-endpoints. The token has to be passed as 
the `Authorization: Bearer <token>` HTTP header. The access-token's  `expiry` will be specified as seconds. Before it expires, 
the token maybe refreshed by calling the `POST /_refresh-token` API with the following event object as argument:

```clojure
(event :RefreshToken
 {:RefreshToken :String})
```

The value of the `:RefreshToken` attribute must be set to the `refresh-token` received as part of the response to the 
`_login` request.

Other endpoints related to user-account management and their request-events are listed below:

1. Forgot password

`POST /_forgot-password`

```clojure
(event :ForgotPassword
 {:Username :Email})
```

A confirmation-code will be send to the email. The user has to send this confirmation-code along with the new password
to the `POST /_confirm-forgot-password` endpoint. The request object is:

```clojure
(event :ConfirmForgotPassword
 {:Username :Email
  :ConfirmationCode :String
  :Password :String})
```

To resend the confirmation-code, use the `POST /_resend-confirmation-code` endpoint with the `:ResendConfirmationCode` event
as the request object.

```clojure
(event :ResendConfirmationCode
 {:Username :Email})
```

2. Change password

`POST /_change-password`

```clojure
(event :ChangePassword
 {:AccessToken :String
  :CurrentPassword :String
  :NewPassword :String})
```
