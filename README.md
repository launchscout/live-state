# live-state

This is a package to help you build embedded micro-front-end applications. It connects to
a server running [LiveState] and sends events and receives state (and possibly other events).

## LiveStateController

This is a Reactive Controller designed to manage state for a LitElement. It is constructed like so:

```
  private controller = new LiveStateController(this, {
    channel: 'comments:all',
    properties: ['comments'],
    events: {
      send: ['add_comment'],
      receive: ['comment_added']
    }
  });
```

The first argument is the host element, the second an Options object with he following properties:

* url - The websocket server to connect to. This can also be a host property or attribute.
* channel - The name of the Phoenix channel to connect to. This can also be a host property or attribute.
* properties - A list of properties managed by LiveState. These will be updated on the host element any time they change.
* events:
  * send - events to list to on host element and sent to the LiveState server. They are expected to be CustomEvents with a detail, which will be sent as the payload
  * receive - events that can be pushed from the LiveState server and will then be dispatched as a CustomEvent of the same name on the host element

  ## Example

  It's easiest to understand all this by example. Take a look at the following two projects:

  * https://github.com/gaslight/livestate-comments
  * https://github.com/gaslight/live_state_comments
