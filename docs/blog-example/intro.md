# Introduction

## Model structure

Fractl models are created as plain-text source files, usually with the extension `.fractl`.
You may store your fractl files anywhere on your file-system, but for this exercise let's assume
we are keeping our models under `~/fractl_tutorial`. 
Create the directory `~/fractl_tutorial/blog` - this will the place where we will put all our
fractl files that describe the blogging service. If you have worked in other programming languages
like Java, you may call the `blog` *project* directory. But in fractl, we will call this the `blog`
*model* directory.

You may use any text editor to edit fractl source files, but because fractl code is described in
[edn](https://github.com/edn-format/edn), it would be good to use an editor that understands this notation.

All models must have a `model.fractl` which provides a "build definition" for the model. This definition
will include the name of the model, its version, the components that make-up the model, any dependencies etc.
At a minimum, the `model.fractl` file should contain the model name and one core component. (A component is 
a `.fractl` file where the application is actually defined).

Using your text editor create the `~/fractl_tutorial/blog/model.fractl` file with the following content:

```clojure
{:name :Blog
 :components [:Blog.Core]}
```

Also create the component file `~/fractl_tutorial/blog/blog/core.fractl` as,

```clojure
(component :Blog.Core)
```
Now you may want to proceed to define the blogging service in the core component.
But before taking-up that serious task, it would help to understand the basic
constructs of the fractl language.
