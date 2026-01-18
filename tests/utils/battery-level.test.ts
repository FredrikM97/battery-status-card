import { describe, it, expect } from 'vitest';
import { getBatteryLevel } from '../../src/utils/battery-level';
import { mockHass } from './helpers';

describe('getBatteryLevel', () => {
  it('prefers battery_level attribute over others', () => {
    const hass = mockHass({
      'sensor.device': {
        state: '5',
        attributes: { battery_level: '42', battery: 10 },
      },
    });

    expect(getBatteryLevel(hass, 'sensor.device')).toBe(42);
  });

  it('falls back to battery attribute', () => {
    const hass = mockHass({
      'sensor.device': {
        state: '5',
        attributes: { battery: '15' },
      },
    });

    expect(getBatteryLevel(hass, 'sensor.device')).toBe(15);
  });

  it('uses numeric state when no attributes exist', () => {
    const hass = mockHass({
      'sensor.device': {
        state: '77',
        attributes: {},
      },
    });

    expect(getBatteryLevel(hass, 'sensor.device')).toBe(77);
  });

  it('returns 0 for missing entity or non-numeric values', () => {
    const hass = mockHass({
      'sensor.device': {
        state: 'unknown',
        attributes: { battery_level: 'n/a', battery: 'n/a' },
      },
    });

    expect(getBatteryLevel(hass, 'sensor.device')).toBe(0);
    expect(getBatteryLevel(hass, 'sensor.missing')).toBe(0);
  });
});
