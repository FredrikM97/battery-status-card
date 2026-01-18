import { describe, it, expect } from 'vitest';
import { discoverBatteryEntities } from '../../src/utils/filters';
import { mockHass } from './helpers';

describe('discoverBatteryEntities', () => {
  it('discovers entities with device_class battery', () => {
    const hass = mockHass({
      'sensor.device_1': {
        state: '85',
        attributes: { device_class: 'battery' },
      },
      'sensor.device_2': {
        state: '50',
        attributes: { device_class: 'temperature' },
      },
    });

    const result = discoverBatteryEntities(hass);
    expect(result).toContain('sensor.device_1');
    expect(result).not.toContain('sensor.device_2');
  });

  it('discovers entities with battery in entity_id', () => {
    const hass = mockHass({
      'sensor.room_battery': { state: '85', attributes: {} },
      'sensor.room_temp': { state: '22', attributes: {} },
    });

    const result = discoverBatteryEntities(hass);
    expect(result).toContain('sensor.room_battery');
    expect(result).not.toContain('sensor.room_temp');
  });

  it('discovers entities with battery_level attribute', () => {
    const hass = mockHass({
      'sensor.device_1': {
        state: '0',
        attributes: { battery_level: 85 },
      },
    });

    const result = discoverBatteryEntities(hass);
    expect(result).toContain('sensor.device_1');
  });

  it('skips binary_sensor entities', () => {
    const hass = mockHass({
      'binary_sensor.battery': { state: 'on', attributes: { device_class: 'battery' } },
      'sensor.battery': { state: '85', attributes: { device_class: 'battery' } },
    });

    const result = discoverBatteryEntities(hass);
    expect(result).not.toContain('binary_sensor.battery');
    expect(result).toContain('sensor.battery');
  });
});
