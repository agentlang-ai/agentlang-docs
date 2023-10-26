# Installation

Download the [Fractl CLI tool](https://raw.githubusercontent.com/fractl-io/fractl-releases/87fe3632fca9cf1e9bdd4b2655ed89fed345d6ae/fractl) and copy it to a location known to your system search-path, for e.g `/usr/local/bin` or `/usr/bin`.

## hello, world

To make sure everything works fine, let's create a very simple Fractl program. Fractl programs are known as models,
because they are very high-level descriptions of the problem being solved. First let's create a place to keep our models:


```shell
mkdir ~/fractl-models
```

Our first Fractl model going to be very simple - it returns the message "hello, world". It's overkill to use a
modelling language like Fractl to write a hello-world app, but that's good enough to test our installation and to
familiarize ourselves with the basic developer workflow.

Create the directory `~/fractl-models/hello` and add a file named `model.fractl` there.
The contents of this file is shown below:

```clojure
{:name :Hello
 :components [:Hello.Core]
 :fractl-version "current"}
```

All Fractl models must contain a `model.fractl` file to capture some basic information about the project.
Two entries that must be provided here are the name of the model and the version of Fractl required to build and run it.
The Fractl-version could be very specific like `"0.4.6"` or the string `"current"` - which basically tries to run the model
using the active Fractl runtime.

A model is made up of components. The model's data structures and business logic are defined in its components.
The `:Hello` model contains a single component named `:Hello.Core`. To define it, first create
the directory `~/fractl-models/hello/hello` and add the following `core.fractl` file there:

```clojure
(component :Hello.Core)

(record :Message
 {:Value :String})

(dataflow :SayHello
 {:Message {:Value "hello, world"}})
```

Now we can run and test the model. From `~/fractl-models/hello` execute the following command:

```shell
fractl run
```

You may now test the application using as HTTP post request,

```shell
curl --location --request POST 'http://localhost:8080/_e/Hello.Core/SayHello' \
--header 'Content-Type: application/json' \
--data-raw '{"Hello.Core/SayHello": {}}'
```

You should see the following response:

```javascript
[
  {
    "status": "ok",
    "result": [
      {
        "type-*-tag-*-": "record",
        "-*-type-*-": [
          "Hello.Core",
          "Message"
        ],
        "Value": "hello, world"
      }
    ],
    "message": null
  }
]
```

> **Note** To redirect application logs to a file, you should set the `JDK_JAVA_OPTIONS` environment variable as,
>
>  ```shell
>  export JDK_JAVA_OPTIONS=-Dlogback.configurationFile=~/fractl/logback.xml
>  ```

You can now proceed to build a standalone Java application from the `:Hello` model.
For this, run the fractl build command:

```shell
fractl build
```

Once the build is over, you'll find a standalone jar file under `./out/hello/target`.
The file name will be `hello-0.0.1-standalone.jar`. You can run this using the Java runtime.

```shell
cd ./out/hello
java -jar target/hello-0.0.1-standalone.jar -c config.edn
```

You can use the previous HTTP POST request to make sure the application is working fine.

With Fractl setup and working properly, you can now explore it further by proceeding to the [Quick start](quick-start) guide.
