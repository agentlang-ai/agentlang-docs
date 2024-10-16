# Workflow Planning Agents

The following program shows a slightly more sophisticated planner. There are two main entities in the model - `Issue` and `User`. `Issue` represents a bug or feature report and `User` represents a user in the system. There are certain workflows that needs to be triggered when an `Issue` or `User` is created. The   instruction for the `:Acme.Core/RequestHandler` agent below describes this workflow in plain English. An `Issue` or `User` creation request also comes into the system as an English sentence. The agent parses this sentence, identifies which workflow to run and then executes the relevant "code".

```clojure
(component :Acme.Core)

(entity
 :Acme.Core/Issue
 {:Title :String
  :Content :String
  :Date :Now
  :AssignedTo :Email
  :Label {:oneof ["bug" "feature" "maintenance"]}})

(entity
 :Acme.Core/User
 {:Email {:type :Email :guid true}
  :Name :String
  :Department :String})

(entity
 :Acme.Core/EmailMessage
 {:To :Email
  :Subject :String
  :Body :String})

(entity
 :Acme.Core/SystemAccount
 {:User :Email
  :Password :Password})

{:Agentlang.Core/Agent
 {:Name :Acme.Core/RequestHandler
  :Type :planner
  :UserInstruction (str "If the input is a request for creating an issue, then\n"
                        "  1. Create a new issue object.\n"
                        "  2. Send an email to the assigner of the issue with the issue title as subject and issue description as body.\n"
                        "If the input is a request for creating a user, then\n"
                        "  1. Create a new user object.\n"
                        "  2. Send a welcome email message to the new user.\n"
                        "  3. Provision a system-account with a temporary password for the user.\n")
  :Tools [:Acme.Core/Issue :Acme.Core/User :Acme.Core/EmailMessage :Acme.Core/SystemAccount]
  :Input :Acme.Core/InvokeRequestHandler}}
```

As you might have noticed, there's no code for "business logic" or workflows defined in the program. This is dynamically generated from the agent based on the incoming request, its user-instruction and the list of "tools" provided to it. Tools are basically entities and other schema definitions in a business model.

Example request:

```shell
curl --location --request POST 'http://localhost:8000/api/Acme.Core/InvokeRequestHandler' \
--header 'Content-Type: application/json' \
--data-raw '{"Acme.Core/InvokeRequestHandler": {"UserInstruction": "Create a user James with email james@acme.com in the sales department"}}'
```

Response:

```json
[
    {
        "status": "ok",
        "result": [
            {
                "User": "james@acme.com",
                "Password": "*********",
                "__Id__": "216fab5e-b60c-46fc-8d6a-487749f1a593"
            }
        ],
        "type": "Acme.Core/SystemAccount"
    }
]
```

You can send a few `GET` requests to verify that the objects required by the entire workflow is created. For instance, here's the email-message created for the user:

```shell
curl --location --request GET 'http://localhost:8000/api/Acme.Core/EmailMessage' \
--header 'Content-Type: application/json'
```

Response:

```json
[
    {
        "status": "ok",
        "result": [
            {
                "Body": "Welcome James! We are excited to have you on board.",
                "Subject": "Welcome to ACME",
                "To": "james@acme.com",
                "__Id__": "730dde3a-57ea-4c9f-b141-8b0227ee8c51"
            }
        ],
        "type": "Acme.Core/EmailMessage"
    }
]
```

```shell
curl --location --request POST 'http://localhost:8000/api/Acme.Core/InvokeRequestHandler' \
--header 'Content-Type: application/json' \
--data-raw '{"Acme.Core/InvokeRequestHandler": {"UserInstruction": "Create a new bug with title \"execution failing\" and body \"execution fails with arithmetic expression\". The issue should be assigned to kate@acme.com"}}'
```

Response:

```json
[
    {
        "status": "ok",
        "result": [
            {
                "To": "kate@acme.com",
                "Subject": "execution failing",
                "Body": "execution fails with arithmetic expression",
                "__Id__": "499eec19-7ccf-414c-a68a-9faa014a8615"
            }
        ],
        "type": "Acme.Core/EmailMessage"
    }
]
```