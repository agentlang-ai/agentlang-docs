# Test data model

# Building and running the model

The model can be compiled by running the following command from `~/fractl_tutorial`:

```shell
$ fractl --build blog
```

The output of the build command will go to the `~/fractl_tutorial/out` directory.
The build process will translate the model to a Clojure project and generate a
standalone jar file from it, which can be executed as:

```shell
$ cd out/blog
$ java -jar target/blog-0.0.1-standalone.jar -c config.edn
```

The preceding command will start an HTTP server on port 8080 and expose an API
that allows us to perform CRUD operations on all the entities defined in the blog model.
The following session demonstrates how to perform these operations on the `:User` entity.

```shell
# Create a new user
$ curl -X POST 'http://localhost:8080/_e/Blog.Core/Upsert_User' -H 'Content-Type: application/json' -d '{"Blog.Core/Upsert_User": {"Instance": {"Blog.Core/User": {"FirstName": "Q", "LastName": "Beck", "Email": "qbeck@blog.org"}}}}'

# => [{"status":"ok","result":[{"type-*-tag-*-":"entity","-*-type-*-":"Blog.Core/User","FirstName":"Q","LastName":"Beck","Email":"qbeck@blog.org"}],"message":null}]

# Lookup user by email
$ curl -X POST 'http://localhost:8080/_e/Blog.Core/Lookup_User' -H 'Content-Type: application/json' -d '{"Blog.Core/Lookup_User": {"Email": "qbeck@blog.org"}}'

# => [{"status":"ok","result":[{"type-*-tag-*-":"entity","-*-type-*-":["Blog.Core","User"],"Email":"qbeck@blog.org","FirstName":"Q","LastName":"Beck"}],"message":null}]

# Delete user by email
$ curl -X POST 'http://localhost:8080/_e/Blog.Core/Delete_User' -H 'Content-Type: application/json' -d '{"Blog.Core/Delete_User": {"Email": "qbeck@blog.org"}}'

# => [{"status":"ok","result":[{"type-*-tag-*-":"entity","-*-type-*-":["Blog.Core","User"],"Email":"qbeck@blog.org","FirstName":"Q","LastName":"Beck"}],"message":null}]

$ curl -X POST 'http://localhost:8080/_e/Blog.Core/Lookup_User' -H 'Content-Type: application/json' -d '{"Blog.Core/Lookup_User": {"Email": "qbeck@blog.org"}}'

# => [{"status":"not-found","result":["Blog.Core","User"],"message":null}]
```

You may want to try creating a new blog post using the `Upsert_Post` API endpoint. It has the same usage-pattern as
`Upsert_User`, as shown below:

```shell
$ curl -X POST 'http://localhost:8080/_e/Blog.Core/Upsert_Post' -H 'Content-Type: application/json' -d '{"Blog.Core/Upsert_Post": {"Instance": {"Blog.Core/Post": {"Title": "first post", "Body": "hello, world"}}}}'

# => [{"status":"ok","result":[{"type-*-tag-*-":"entity","-*-type-*-":"Blog.Core/Post","Title":"first post","Body":"hello, world","Id":"09b6f15f-97c0-4e9b-88d9-53935d2d1311","CreatedAt":"2023-01-18T12:02:20.579941"}],"message":null}]
```

You might've noticed in the response that the `Id` and `CreatedAt` attributes were filled-in automatically 
by fractl, as per their default value-specification.

You may also have noticed one serious defect in the way blog posts are modeled - they do not capture details of the
person who authored the post. We will solve this problem in the next section.
