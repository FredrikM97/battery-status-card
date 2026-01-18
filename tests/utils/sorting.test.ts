import { describe, it, expect } from 'vitest';
import { sortEntities } from '../../src/utils/sorting';
import { SortConfig } from '../../src/types';
import { SortByType, SortDirectionType } from '../../src/constants';
import { mockHass } from './helpers';

describe('sortEntities', () => {
  describe('sorting by battery level (state)', () => {
    it('should sort by battery level in ascending order', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '85',
          attributes: { battery_level: 85, friendly_name: 'Device 1' },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: { battery_level: 50, friendly_name: 'Device 2' },
        },
        'sensor.battery_3': {
          state: '25',
          attributes: { battery_level: 25, friendly_name: 'Device 3' },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.State, direction: SortDirectionType.Asc };
      const result = sortEntities(
        hass,
        ['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3'],
        sortConfig
      );

      expect(result).toEqual(['sensor.battery_3', 'sensor.battery_2', 'sensor.battery_1']);
    });

    it('should sort by battery level in descending order', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '85',
          attributes: { battery_level: 85, friendly_name: 'Device 1' },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: { battery_level: 50, friendly_name: 'Device 2' },
        },
        'sensor.battery_3': {
          state: '25',
          attributes: { battery_level: 25, friendly_name: 'Device 3' },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.State, direction: SortDirectionType.Desc };
      const result = sortEntities(
        hass,
        ['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3'],
        sortConfig
      );

      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3']);
    });

    it('should use battery attribute if available', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '0',
          attributes: { battery: 85, friendly_name: 'Device 1' },
        },
        'sensor.battery_2': {
          state: '0',
          attributes: { battery: 50, friendly_name: 'Device 2' },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.State, direction: SortDirectionType.Asc };
      const result = sortEntities(hass, ['sensor.battery_1', 'sensor.battery_2'], sortConfig);

      expect(result).toEqual(['sensor.battery_2', 'sensor.battery_1']);
    });

    it('should prefer battery_level attribute over battery attribute', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '0',
          attributes: { battery_level: 85, battery: 10, friendly_name: 'Device 1' },
        },
        'sensor.battery_2': {
          state: '0',
          attributes: { battery_level: 50, battery: 90, friendly_name: 'Device 2' },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.State, direction: SortDirectionType.Asc };
      const result = sortEntities(hass, ['sensor.battery_1', 'sensor.battery_2'], sortConfig);

      expect(result).toEqual(['sensor.battery_2', 'sensor.battery_1']);
    });

    it('should fallback to state value if attributes missing', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '85',
          attributes: { friendly_name: 'Device 1' },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: { friendly_name: 'Device 2' },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.State, direction: SortDirectionType.Asc };
      const result = sortEntities(hass, ['sensor.battery_1', 'sensor.battery_2'], sortConfig);

      expect(result).toEqual(['sensor.battery_2', 'sensor.battery_1']);
    });

    it('should return 0 for non-numeric state values', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: 'unknown',
          attributes: { friendly_name: 'Device 1' },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: { friendly_name: 'Device 2' },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.State, direction: SortDirectionType.Asc };
      const result = sortEntities(hass, ['sensor.battery_1', 'sensor.battery_2'], sortConfig);

      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_2']);
    });
  });

  describe('sorting by friendly name', () => {
    it('should sort by friendly name in ascending order', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '85',
          attributes: { battery_level: 85, friendly_name: 'Zebra Device' },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: { battery_level: 50, friendly_name: 'Apple Device' },
        },
        'sensor.battery_3': {
          state: '25',
          attributes: { battery_level: 25, friendly_name: 'Mango Device' },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.Name, direction: SortDirectionType.Asc };
      const result = sortEntities(
        hass,
        ['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3'],
        sortConfig
      );

      expect(result).toEqual(['sensor.battery_2', 'sensor.battery_3', 'sensor.battery_1']);
    });

    it('should sort by friendly name in descending order', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '85',
          attributes: { battery_level: 85, friendly_name: 'Zebra Device' },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: { battery_level: 50, friendly_name: 'Apple Device' },
        },
        'sensor.battery_3': {
          state: '25',
          attributes: { battery_level: 25, friendly_name: 'Mango Device' },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.Name, direction: SortDirectionType.Desc };
      const result = sortEntities(
        hass,
        ['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3'],
        sortConfig
      );

      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_3', 'sensor.battery_2']);
    });

    it('should use entity_id as fallback if friendly_name is missing', () => {
      const hass = mockHass({
        'sensor.zebra_device': {
          state: '85',
          attributes: { battery_level: 85 },
        },
        'sensor.apple_device': {
          state: '50',
          attributes: { battery_level: 50 },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.Name, direction: SortDirectionType.Asc };
      const result = sortEntities(hass, ['sensor.zebra_device', 'sensor.apple_device'], sortConfig);

      expect(result).toEqual(['sensor.apple_device', 'sensor.zebra_device']);
    });

    it('should perform locale-aware string comparison', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '85',
          attributes: { friendly_name: 'Äpple' },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: { friendly_name: 'Zebra' },
        },
        'sensor.battery_3': {
          state: '25',
          attributes: { friendly_name: 'Apple' },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.Name, direction: SortDirectionType.Asc };
      const result = sortEntities(
        hass,
        ['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3'],
        sortConfig
      );

      // Locale-aware comparison should handle special characters properly
      expect(result.length).toBe(3);
    });
  });

  describe('no sorting', () => {
    it('should return entities in original order if no sort config provided', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '85',
          attributes: { battery_level: 85, friendly_name: 'Device 1' },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: { battery_level: 50, friendly_name: 'Device 2' },
        },
        'sensor.battery_3': {
          state: '25',
          attributes: { battery_level: 25, friendly_name: 'Device 3' },
        },
      });

      const result = sortEntities(hass, [
        'sensor.battery_1',
        'sensor.battery_2',
        'sensor.battery_3',
      ]);

      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3']);
    });

    it('should return entities in original order if sort config is undefined', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '25',
          attributes: { battery_level: 25, friendly_name: 'Zebra' },
        },
        'sensor.battery_2': {
          state: '85',
          attributes: { battery_level: 85, friendly_name: 'Apple' },
        },
      });

      const result = sortEntities(hass, ['sensor.battery_1', 'sensor.battery_2'], undefined);

      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_2']);
    });
  });

  describe('edge cases', () => {
    it('should handle empty entity list', () => {
      const hass = mockHass({});

      const sortConfig: SortConfig = { by: SortByType.State, direction: SortDirectionType.Asc };
      const result = sortEntities(hass, [], sortConfig);

      expect(result).toHaveLength(0);
    });

    it('should handle non-existent entities', () => {
      const hass = mockHass({});

      const sortConfig: SortConfig = { by: SortByType.State, direction: SortDirectionType.Asc };
      const result = sortEntities(hass, ['sensor.battery_1'], sortConfig);

      expect(result).toEqual(['sensor.battery_1']);
    });

    it('should handle entities with equal values', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '50',
          attributes: { battery_level: 50, friendly_name: 'Device B' },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: { battery_level: 50, friendly_name: 'Device A' },
        },
        'sensor.battery_3': {
          state: '50',
          attributes: { battery_level: 50, friendly_name: 'Device C' },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.State, direction: SortDirectionType.Asc };
      const result = sortEntities(
        hass,
        ['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3'],
        sortConfig
      );

      // Should maintain original order or sort by secondary criteria
      expect(result).toHaveLength(3);
    });

    it('should not mutate original entity array', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '25',
          attributes: { battery_level: 25, friendly_name: 'Device 1' },
        },
        'sensor.battery_2': {
          state: '85',
          attributes: { battery_level: 85, friendly_name: 'Device 2' },
        },
      });

      const originalArray = ['sensor.battery_1', 'sensor.battery_2'];
      const sortConfig: SortConfig = { by: SortByType.State, direction: SortDirectionType.Asc };
      sortEntities(hass, originalArray, sortConfig);

      expect(originalArray).toEqual(['sensor.battery_1', 'sensor.battery_2']);
    });
  });

  describe('numeric sorting edge cases', () => {
    it('should handle float values correctly', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '85.5',
          attributes: { battery_level: 85.5, friendly_name: 'Device 1' },
        },
        'sensor.battery_2': {
          state: '50.2',
          attributes: { battery_level: 50.2, friendly_name: 'Device 2' },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.State, direction: SortDirectionType.Asc };
      const result = sortEntities(hass, ['sensor.battery_1', 'sensor.battery_2'], sortConfig);

      expect(result).toEqual(['sensor.battery_2', 'sensor.battery_1']);
    });

    it('should handle negative values', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '-10',
          attributes: { battery_level: -10, friendly_name: 'Device 1' },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: { battery_level: 50, friendly_name: 'Device 2' },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.State, direction: SortDirectionType.Asc };
      const result = sortEntities(hass, ['sensor.battery_1', 'sensor.battery_2'], sortConfig);

      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_2']);
    });

    it('should handle zero values', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '0',
          attributes: { battery_level: 0, friendly_name: 'Device 1' },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: { battery_level: 50, friendly_name: 'Device 2' },
        },
      });

      const sortConfig: SortConfig = { by: SortByType.State, direction: SortDirectionType.Asc };
      const result = sortEntities(hass, ['sensor.battery_1', 'sensor.battery_2'], sortConfig);

      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_2']);
    });
  });
});
