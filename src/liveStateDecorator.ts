import connectElement, { ConnectOptions } from "./connectElement";
import LiveState from "./live-state";
import { registerContext } from 'wc-context';

export type LiveStateDecoratorOptions = {
  channelName?: string,
  url?: string,
  provide?: {
    scope: object,
    name: string | undefined
  },
  consume?: {
    scope: object,
    name: string | undefined
  }
} & ConnectOptions

const findLiveState = (element: any, options: LiveStateDecoratorOptions) => {
  if (options.provide) {
    const { scope, name } = options.provide;
    const liveState = scope[name] ? scope[name] : 
      scope[name] = buildLiveState(element, options);
    registerContext(scope, name, liveState)
    element.liveState = liveState;
  } else if (options.consume) {
    
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
    const superDisconnected = targetClass.prototype.disconnectedCallback;
    targetClass.prototype.disconnectedCallback = function() {
      superDisconnected.apply(this)
      this.liveState && this.liveState.disconnect();
    }
  }
}

export default liveState;
