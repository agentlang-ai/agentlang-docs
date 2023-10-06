# Installation

Clone the [fractl](https://github.com/fractl-io/fractl) repository. From the checkout directory, run the `install.sh` script to install fractl to a directory of your choice. Add it to the `PATH` environment variable so the `fractl` command is available system-wide.

**Note** In directory names, please replace `myhome` with the name of your home directory.

```shell
$ cd /myhome/projects/fractl
$ ./install.sh /myhome/programs
$ export PATH=$PATH:/myhome/program/fractl-<version>
```

## hello, world

To make sure everything works fine, let's create a very simple fractl program. Fractl programs are known as models,
because they are very high-level descriptions of the problem being solved. Let's create a place for our models:


```shell
$ mkdir /myhome/fractl-models
```

Our fractl application is very simple - it returns the message "hello, world". It's overkill to use a
modelling language like fractl to write a hello-world app, but that's good enough to test our installation and to
familiarize ourselves to the basic developer workflow in fractl.

Create the directory `/myhome/fractl-models/hello` and add a file named `model.fractl` there.
The contents of this file is shown below:

```clojure
; model.fractl

{:name :Hello
 :components [:Hello.Core]
 :fractl-version "current"}
```

All fractl models must contain a `model.fractl` file to capture some basic information about the project.
Two entries that must be provided here are the name of the model and the version of fractl required to build and run it.
The fractl-version could be very specific like `"0.4.5"` or the string `"current"` - which basically tries to run the model
using the active fractl runtime.

A model is made up of components, and there must be at least one component. The model's data structures and business logic
are defined in its components. The `:Hello` model contains a single component named `:Hello.Core`. To define it, first create
the directory `/myhome/fractl-models/hello/hello` and add the following `core.fractl` file there:

```clojure
; hello/core.fractl

(component :Hello.Core)

(record :Message
 {:Value :String})

(dataflow :SayHello
 {:Message {:Value "hello, world"}})
```

Now we can run and test the model. From the `/myhome/fractl-models/hello` directory, execute the following command:

```shell
$ fractl run
```

You may now test the application using as HTTP post request,

```shell
$ curl --location --request POST 'http://localhost:8080/_e/Hello.Core/SayHello' \
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

We may now proceed to build a standalone Java application from the `:Hello` model.
For this, run the fractl build command from the `/myhome/fractl-models/hello` directory.

```shell
$ fractl build
```

Once the build is over, you'll find a standalone jar file under `./out/hello/target`.
The file name will be `hello-0.0.1-standalone.jar`. You can now run the application as:

```shell
$ cd ./out/hello
$ java -jar target/hello-0.0.1-standalone.jar -c config.edn
```

You can use the previous HTTP POST request to make sure the application is working fine.

With fractl setup and working properly, you can now explore it further by proceeding to the [Quick start](quick-start) guide.
