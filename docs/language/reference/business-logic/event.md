# Event

An `event` is a record used to trigger dataflows. Events can be injected into the system by external clients
or may be created by patterns in a dataflow. When an event instance enters the system, 
the dataflow attached to that event is evaluated. The event-instance will be replaced by the result of this
evaluation. We will learn more about event-based patterns in the [dataflow](dataflow) section.

## Event Context

All events will have a system-defined attribute called `:EventContext` whose value will be a generic map.
If authentication is enabled for the application. `:EventContext` for all events will contain the key `:User`
which will contain the logged-in username. This value is filled-in by the REST API layer.
