import { expect } from "@esm-bundle/chai";
import LiveState, { connectElement } from '../src/live-state';
import { Channel } from 'phoenix';
import sinon from 'sinon';
import { html, LitElement } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { fixture } from '@open-wc/testing';

@customElement('test-element')
class TestElement extends LitElement {
  @property() foo: string;
  @state() bar: string;

  render() {
    return html`<div>${this.foo} ${this.bar}</div>`
  }
}

describe('LiveState', () => {
  let socketMock, liveState, stubChannel;
  beforeEach(() => {
    liveState = new LiveState("wss://foo.com", "stuff");
    socketMock = sinon.mock(liveState.socket);
    stubChannel = sinon.createStubInstance(Channel, {
      join: sinon.stub().returns({
        receive: sinon.stub()
      }),
      on: sinon.spy(),
      push: sinon.spy()
    });
  });

  it('connects to a socket and channel', () => {
    socketMock.expects('connect').exactly(1);
    socketMock.expects('channel').exactly(1).withArgs('stuff', { foo: 'bar' }).returns(stubChannel);
    liveState.connect({ foo: 'bar' });
    socketMock.verify();
  });

  it('notifies subscribers', () => {
    socketMock.expects('connect').exactly(1);
    socketMock.expects('channel').exactly(1).withArgs('stuff', { foo: 'bar' }).returns(stubChannel);
    liveState.connect({ foo: 'bar' });
    let state = { foo: 'bar' };
    liveState.subscribe(({ foo }) => state.foo = foo);
    expect(liveState.channel.on.callCount).to.equal(1)
    const onArgs = liveState.channel.on.getCall(0).args;
    expect(onArgs[0]).to.equal("state:change")
    const onHandler = onArgs[1];
    onHandler({ foo: 'wuzzle' });
    expect(state.foo).to.equal('wuzzle');
    socketMock.verify();
  });

  it('disconnects', () => {
    socketMock.expects('disconnect').exactly(1)
    liveState.disconnect();
    socketMock.verify();
  });

  it('pushes custom events over the channel', () => {
    socketMock.expects('connect').exactly(1);
    socketMock.expects('channel').exactly(1).withArgs('stuff').returns(stubChannel);
    liveState.connect();
    liveState.pushEvent(new CustomEvent('sumpinhappend', { detail: { foo: 'bar' } }));
    const pushCall = liveState.channel.push.getCall(0);
    expect(pushCall.args[0]).to.equal('lvs_evt:sumpinhappend');
    expect(pushCall.args[1]).to.deep.equal({ foo: 'bar' });
  });

  describe('connectElement', () => {
    beforeEach(() => {
      socketMock.expects('connect').exactly(1);
      socketMock.expects('channel').exactly(1).withArgs('stuff').returns(stubChannel);
      liveState.connect();
    });

    it('updates on state changes', async () => {
      const el: TestElement = await fixture('<test-element></test-element>');
      connectElement(liveState, el, {
        properties: ['bar'],
        attributes: ['foo']
      });
      const stateChange = liveState.channel.on.getCall(0).args[1];
      stateChange({ foo: 'wuzzle', bar: 'wizzle' });
      await el.updateComplete;
      expect(el.bar).to.equal('wizzle');
      expect(el.shadowRoot.innerHTML).to.contain('wizzle');
      expect(el.getAttribute('foo')).to.equal('wuzzle');
      expect(el.shadowRoot.innerHTML).to.contain('wuzzle');
    });

    it('sends events', async () => {
      const el: TestElement = await fixture('<test-element></test-element>');
      connectElement(liveState, el, {
        properties: ['bar'],
        attributes: ['foo'],
        events: {
          send: ['sayHi']
        }
      });
      el.dispatchEvent(new CustomEvent('sayHi', { detail: { greeting: 'wazzaap' } }));
      const pushCall = liveState.channel.push.getCall(0);
      expect(pushCall.args[0]).to.equal('lvs_evt:sayHi');
      expect(pushCall.args[1]).to.deep.equal({ greeting: 'wazzaap' });
    });
  });

});