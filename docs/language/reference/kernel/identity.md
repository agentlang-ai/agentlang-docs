# Identity

The `:Agentlang.Kernel.Identity` component contain definitions for managing "user-identities" in an Agentlang application.

```clojure
(entity :User
 {:Name {:type :String :optional true}
  :Password {:type :Password :optional true}
  :FirstName {:type :String :optional true}
  :LastName {:type :String :optional true}
  :Email {:type :Email :guid true}
  :UserData {:type :Map :optional true}})
```

The `:User` entity represents a user that can be authenticated by an Agentlang application and may be authorised to perform various actions on the business entities. The `:Email` attribute uniquely identifies the user in the system. The user may sign-in using the email-password combination or via a third-party authentication service like Google.

A new user signs-up with the application by calling the `POST /signup` API. The argument to this POST request will be an instance of
the `:SignUp` event.

```clojure
(event
 :SignUp
 {:User :User})
```

A sample invocation is shown below:


```
POST /signup
Content-Type: application/json


{
    "Agentlang.Kernel.Identity/SignUp": {
        "User": {
            "Agentlang.Kernel.Identity/User": {
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

The Agentlang runtime may be setup to execute some business-logic (like assigning permissions to the new user),
after each successful signup-request. The application can provide this logic in a dataflow attached to the `:PostSignUp` event.

```clojure
(event :PostSignUp
 {:SignupRequest :SignUp
  :SignupResult :Any})
```

The result of the signup operation will be available in `:SignupResult` - the format of this value depends on the authentication
backend used. Usually it will be a map with some information on the newly created user. The `:User` object that was passed to
the `/signup` request can be accessed as `:SignupRequest.User`. The following code-snippet shows how a dataflow may be
executed after signup to assign an [rbac](rbac) role to the new user:

```clojure
(dataflow :Agentlang.Kernel.Identity/PostSignUp
 {:Agentlang.Kernel.Rbac/RoleAssignment
  {:Role "guest-user" 
   :Assignee :Agentlang.Kernel.Identity/PostSignUp.SignupRequest.User.Email}})
```

After signing-up, the user may receive a confirmation email. The user can use the embedded-link in the email and confirm his account.
The user may also complete the confirmation process by directly calling the `POST /confirm-sign-up` API with an instance of the
`:ConfirmSignUp` event in the body.

```clojure
(event :ConfirmSignUp
 {:Username :Email
  :ConfirmationCode :String})
```

The `:ConfirmationCode` attribute must be set to the confirmation-code received in the email.

To login to the Agentlang application, the user can call the `POST /login` API with an object of the `:UserLogin` event in the
request body.

```clojure
(event :UserLogin 
 {:Username :String
  :Password :Password})
```

An example invocation will be,

```
POST /login
Content-Type: application/json

{"Agentlang.Kernel.Identity/UserLogin":
 {"Username": "joe@acme.com", "Password": "Abc@acme123"}}
```

The response will be a map with three important entries - `id-token`, `expires-in` and `refresh-token`. The user has to
send the `id-token` to authenticate requests on any application related api-endpoints. The token has to be passed as
the `Authorization: Bearer <token>` HTTP header. The id-token's  `expiry` will be specified as seconds. Before it expires,
the token maybe refreshed by calling the `POST /refresh-token` API with the following event object as argument:

```clojure
(event :RefreshToken
 {:RefreshToken :String})
```

The value of the `:RefreshToken` attribute must be set to the `refresh-token` received as part of the response to the 
`_login` request.

Other endpoints related to user-account management and their request-events are listed below:

1. Forgot password

`POST /forgot-password`

```clojure
(event :ForgotPassword
 {:Username :Email})
```

A confirmation-code will be send to the email. The user has to send this confirmation-code along with the new password
to the `POST /confirm-forgot-password` API. The request object is:

```clojure
(event :ConfirmForgotPassword
 {:Username :Email
  :ConfirmationCode :String
  :Password :String})
```

To resend the confirmation-code, use the `POST /resend-confirmation-code` API with the `:ResendConfirmationCode` event
as the request object.

```clojure
(event :ResendConfirmationCode
 {:Username :Email})
```

2. Change password

`POST /change-password`

```clojure
(event :ChangePassword
 {:AccessToken :String
  :CurrentPassword :String
  :NewPassword :String})
```
