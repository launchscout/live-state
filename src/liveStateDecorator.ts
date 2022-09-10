import connectElement, { ConnectOptions } from "./connectElement";
import LiveState from "./live-state";

export type LiveStateDecoratorOptions = {
  channelName?: string,
  url?: string,
  shared?: boolean,
} & ConnectOptions

const findLiveState = (element: any, options: LiveStateDecoratorOptions) => {
  if (options.shared) {
    element.liveState = window['__liveState'] ? window['__liveState'] : 
      window['__liveState'] = buildLiveState(element, options);
  } else {
    element.liveState = buildLiveState(element, options)
  }
  return element.liveState;
}

const buildLiveState = (element: any, options: LiveStateDecoratorOptions) => {
  return new LiveState(options.url || element.url, options.channelName || element.channelName);
}

const liveState = (options: LiveStateDecoratorOptions) => {
  return (targetClass: Function) => {
    const superConnected = targetClass.prototype.connectedCallback;
    targetClass.prototype.connectedCallback = function () {
      superConnected.apply(this);
      connectElement(findLiveState(this, options), this, options as any);
    }
  }
}

export default liveState;
