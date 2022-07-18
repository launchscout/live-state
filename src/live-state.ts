import { Socket, Channel } from "phoenix";

export { LiveStateController } from "./livestate-controller";

export class LiveState {

  subscribers: Array<Function> = [];

  channel: Channel;
  socket: Socket;
  channelName: string;

  constructor(url, channelName) {
    this.channelName = channelName;
    this.socket = new Socket(url, { logger: ((kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }) });
  }

  connect(params) {
    this.socket.connect();
    this.channel = this.socket.channel(this.channelName, params);
    this.channel.join().receive("ok", () => console.log('joined'));
    this.channel.on("state:change", (state) => this.notifySubscribers(state));
  }

  subscribe(subscriber: Function) {
    this.subscribers.push(subscriber);
  }

  unsubscribe(subscriber) {
    this.subscribers = this.subscribers.filter(s => s !== subscriber);
  }

  notifySubscribers(state) {
    this.subscribers.forEach((subscriber) => subscriber(state));
  }

  pushEvent(event: CustomEvent) {
    this.channel.push(`lvs_evt:${event.type}`, event.detail);
  }
}

export default LiveState;

