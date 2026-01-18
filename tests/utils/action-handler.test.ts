import { describe, it, expect, vi } from 'vitest';
import { fireEvent, showMoreInfo, actionHandler } from '../../src/utils/action-handler';

const createNode = () => {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
};

describe('action-handler', () => {
  it('fireEvent dispatches bubbling event with detail', () => {
    const node = createNode();
    const listener = vi.fn();
    node.addEventListener('test-event', listener as EventListener);

    fireEvent(node, 'test-event', { value: 1 });

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0]?.[0] as CustomEvent;
    expect(event).toBeDefined();
    expect(event.detail).toEqual({ value: 1 });
    expect(event.bubbles).toBe(true);
  });

  it('showMoreInfo dispatches hass-more-info', () => {
    const node = createNode();
    const listener = vi.fn();
    node.addEventListener('hass-more-info', listener as EventListener);

    showMoreInfo(node, 'sensor.demo');

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0]?.[0] as CustomEvent;
    expect(event).toBeDefined();
    expect(event.detail).toEqual({ entityId: 'sensor.demo' });
  });

  it('actionHandler emits action event on click', () => {
    const node = createNode();
    const handler = actionHandler();
    handler(node);

    const listener = vi.fn();
    node.addEventListener('action', listener as EventListener);

    node.click();

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0]?.[0] as CustomEvent;
    expect(event).toBeDefined();
    expect(event.detail).toEqual({ action: 'tap' });
  });
});
