/**
 * Simple action handler for battery card
 * Just handles tap to show more-info dialog
 */

import { DynamicObject } from '../types';

export interface ActionHandlerEvent extends CustomEvent {
  detail: {
    action: 'tap';
  };
}

/**
 * Fire a custom event
 */
export function fireEvent(node: HTMLElement | Window, type: string, detail?: DynamicObject): void {
  const event = new CustomEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    detail,
  });
  node.dispatchEvent(event);
}

/**
 * Show more-info dialog for an entity
 */
export function showMoreInfo(node: HTMLElement, entityId: string): void {
  fireEvent(node, 'hass-more-info', { entityId });
}

/**
 * Simple tap handler directive for Lit
 */
export const actionHandler = () => (element: HTMLElement) => {
  element.addEventListener('click', () => {
    const event = new CustomEvent('action', {
      bubbles: true,
      composed: true,
      detail: { action: 'tap' },
    }) as ActionHandlerEvent;
    element.dispatchEvent(event);
  });
};
