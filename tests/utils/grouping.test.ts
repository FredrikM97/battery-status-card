import { describe, it, expect } from 'vitest';
import { applyCollapseThreshold, resolveGroups } from '../../src/utils/grouping';
import { mockHass } from './helpers';

describe('applyCollapseThreshold', () => {
  const hass = mockHass({
    'sensor.a': { state: '10', attributes: {} },
    'sensor.b': { state: '20', attributes: {} },
    'sensor.c': { state: '30', attributes: {} },
    'sensor.d': { state: '40', attributes: {} },
  });

  it('returns all visible when below threshold', () => {
    const { visible, collapsed } = applyCollapseThreshold(hass, ['sensor.a', 'sensor.b'], 5);
    expect(visible).toEqual(['sensor.a', 'sensor.b']);
    expect(collapsed).toBeUndefined();
  });

  it('returns all when threshold not set or zero', () => {
    const noThreshold = applyCollapseThreshold(hass, ['sensor.a', 'sensor.b']);
    expect(noThreshold.visible).toEqual(['sensor.a', 'sensor.b']);
    expect(noThreshold.collapsed).toBeUndefined();

    const zeroThreshold = applyCollapseThreshold(hass, ['sensor.a', 'sensor.b'], 0);
    expect(zeroThreshold.visible).toEqual(['sensor.a', 'sensor.b']);
    expect(zeroThreshold.collapsed).toBeUndefined();
  });

  it('collapses and reports min/max', () => {
    const { visible, collapsed } = applyCollapseThreshold(
      hass,
      ['sensor.a', 'sensor.b', 'sensor.c', 'sensor.d'],
      2
    );

    expect(visible).toEqual(['sensor.a', 'sensor.b']);
    expect(collapsed?.entities).toEqual(['sensor.c', 'sensor.d']);
    expect(collapsed?.min).toBe(30);
    expect(collapsed?.max).toBe(40);
    expect(collapsed?.count).toBe(2);
  });
});

describe('resolveGroups', () => {
  it('returns mapped group entities with names', () => {
    const hass = mockHass({
      'group.room': {
        state: 'on',
        attributes: { entity_id: ['sensor.a', 'sensor.b'], friendly_name: 'Room' },
      },
      'sensor.a': { state: '1', attributes: {} },
      'sensor.b': { state: '2', attributes: {} },
    });

    const map = resolveGroups(hass, [{ entity_id: 'group.room' }]);
    expect(map.get('Room')).toEqual(['sensor.a', 'sensor.b']);
  });
});
