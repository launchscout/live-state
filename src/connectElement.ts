import LiveState from "./live-state";

export type ConnectOptions = {
  properties?: Array<string>;
  attributes?: Array<string>;
  events?: {
    send?: Array<string>,
    receive?: Array<string>
  },
  connectParams?: object
}

const connectElement = (liveState: LiveState, el: HTMLElement, { properties, attributes, events, connectParams }: ConnectOptions) => {
  liveState.connect(connectParams);
  liveState.subscribe((state: any) => {
    properties?.forEach((prop) => {
      el[prop] = state[prop];
    });
    attributes?.forEach((attr) => {
      el.setAttribute(attr, state[attr]);
    });
  });
  events?.send?.forEach((eventName) => {
    el.addEventListener(eventName, (customEvent: CustomEvent) => liveState.pushCustomEvent(customEvent));
  });
  events?.receive?.forEach((eventName) => {
    liveState.channel.on(eventName, (event) => {
      el.dispatchEvent(new CustomEvent(eventName, { detail: event }));
    });
  })
}

export default connectElement;