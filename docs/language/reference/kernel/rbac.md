# RBAC

The `:Agentlang.Kernel.Rbac` component defines entities and events required for managing role-based-access-control in
Agentlang applications. The main entities in this component are - `:Privilege`, `:PrivilegeAssignment`, `:Role` and `:RoleAssignment`.

An instance of `:Privilege` defines a set of operations permissible on a resource and a `:Role` may be assigned those privileges.
For example, the following patterns create a role called "manager" and gives it read-write permissions on the `:Employee` entity:

```clojure
{:Agentlang.Kernel.Rbac/Role 
 {:Name "manager"}}

{:Agentlang.Kernel.Rbac/Privilege
 {:Name "priv-for-employee"
  :Actions [:read :update]
  :Resource :Acme/Employee}}

{:Agentlang.Kernel.Rbac/PrivilegeAssignment
 {:Role "manager"
  :Privilege "priv-for-employee"}}
```

The full-list of possible `:Actions` is - `[:read :create :update :delete]`.

Once a role is assigned privileges, it may be assigned to one or more users in the system.

```clojure
{:Agentlang.Kernel.Rbac/RoleAssignment
 {:Role "manager" :Assignee "joe@acme.com"}}
```

A role-assignment may be revoked simply by deleting the `:RoleAssignment` instance:

```clojure
[:delete :Agentlang.Kernel.Rbac/RoleAssignment 
 {:Role "manager" :Assignee "joe@acme.com"}]
```

## Ownership and instance-privileges

When a user creates an instance of an entity, that user becomes the *owner* of that instance, which means
the user can perform any crud operations on that instance or it children (via `:contains` relationships).
The owner may add a new user as co-owner of the instance:

```clojure
{:Agentlang.Kernel.Rbac/OwnershipAssignment
 {:Resource :Acme/Employee
  :ResourceId "employee-id-1"
  :Assignee "mary@acme.com"}}
```

A user may also be assigned only specific permissions on an instance:

```clojure
{:Agentlang.Kernel.Rbac/InstancePrivilegeAssignment
 {:Actions [:read]
  :Resource :Acme/Employee
  :ResourceId "employee-id-1"
  :Assignee "mary@acme.com"}}
```

For more information on RBAC, please see the [Security & Access Control](/docs/language/reference/rbac) documentation.
