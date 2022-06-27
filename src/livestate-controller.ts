import {LitElement, ReactiveController, ReactiveControllerHost} from 'lit';
import LiveState from './live-state';

type Options = {
  url?: string,
  channel?: string,
  events?: {
    send: Array<string>,
    receive: Array<string>
  }
}

export class LiveStateController implements ReactiveController {

  host: LitElement;

  liveState: LiveState;

  options: Options;

  state: any;

  constructor(host: LitElement, options: Options) {
    this.host = host;
    this.options = options;
    host.addController(this)
  }

  hostConnected() {
    this.liveState = new LiveState((this.host as any).url || this.options.url, this.options.channel);
    this.liveState.subscribe((state: any) => {
      this.state = state;
      this.host.requestUpdate();
    });
    this.options.events?.send.forEach((eventName) => {
      this.host.addEventListener(eventName, (customEvent: CustomEvent) => this.liveState.pushEvent(customEvent));
    });
    this.options.events?.receive.forEach((eventName) => {
      this.liveState.channel.on(eventName, (event) => {
        this.host.dispatchEvent(new CustomEvent(eventName, {detail: event}));
      });
    })
  }

  hostDisconnected() {

  }
}
