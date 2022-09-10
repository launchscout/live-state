import { applyPatch } from 'json-joy/esm/json-patch';
import { Socket, Channel } from "phoenix";

export { LiveStateController } from "./livestate-controller";


export class LiveState {

  subscribers: Array<Function> = [];

  channel: Channel;
  socket: Socket;
  channelName: string;
  state: any;
  stateVersion: number;

  constructor(url, channelName) {
    this.channelName = channelName;
    this.socket = new Socket(url, { logger: ((kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }) });
  }

  connect(params) {
    this.socket.connect();
    this.channel = this.socket.channel(this.channelName, params);
    this.channel.join().receive("ok", () => console.log('joined'));
    this.channel.on("state:change", (state) => this.handleChange(state));
    this.channel.on("state:patch", (patch) => this.handlePatch(patch));
  }

  disconnect() {
    this.socket.disconnect();
  }

  subscribe(subscriber: Function) {
    this.subscribers.push(subscriber);
  }

  unsubscribe(subscriber) {
    this.subscribers = this.subscribers.filter(s => s !== subscriber);
  }

  handleChange({ state, version }) {
    this.state = state;
    this.stateVersion = version;
    this.notifySubscribers(this.state);
  }

  handlePatch({ patch, version }) {
    if (version === this.stateVersion + 1) {
      const { doc, res } = applyPatch(this.state, patch, { mutate: false });
      this.state = doc;
      this.stateVersion = version;
      this.notifySubscribers(this.state);
    } else {
      this.channel.push('lvs_refresh');
    }
  }

  notifySubscribers(state) {
    this.subscribers.forEach((subscriber) => subscriber(state));
  }

  pushEvent(eventName, payload) {
    this.channel.push(`lvs_evt:${eventName}`, payload);
  }

  pushCustomEvent(event: CustomEvent) {
    this.channel.push(`lvs_evt:${event.type}`, event.detail);
  }
}

export default LiveState;

