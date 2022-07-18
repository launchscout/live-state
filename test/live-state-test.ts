import { expect } from "@esm-bundle/chai";
import LiveState from '../src/live-state';
import { Channel } from 'phoenix';
import sinon from 'sinon';

describe('LiveState', () => {
  it('connects to a socket and channel', () => {
    const liveState = new LiveState("wss://foo.com", "stuff");
    const socketMock = sinon.mock(liveState.socket);
    socketMock.expects('connect').exactly(1);
    const stubChannel = sinon.createStubInstance(Channel, {
      join: sinon.stub().returns({
        receive: sinon.stub()
      }),
      on: sinon.stub()
    })
    socketMock.expects('channel').exactly(1).withArgs('stuff', {foo: 'bar'}).returns(stubChannel);
    liveState.connect({foo: 'bar'});
    socketMock.verify();
  });

  it('disconnects', () => {});
});