import { describe, it, expect, vi } from 'vitest';
import { filterEntities } from '../../src/utils/filters';
import { FilterConfig } from '../../src/types';
import { mockHass } from './helpers';

describe('filterEntities', () => {
  describe('equality operator (=)', () => {
    it('should filter entities by exact string match', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '85',
          attributes: { device_class: 'battery', battery_level: 85 },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: { device_class: 'battery', battery_level: 50 },
        },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.device_class', operator: '=', value: 'battery' },
      ];

      const result = filterEntities(hass, ['sensor.battery_1', 'sensor.battery_2'], filters);
      expect(result).toHaveLength(2);
    });

    it('should support wildcard matching with = operator', () => {
      const hass = mockHass({
        'sensor.living_room_battery': {
          state: '85',
          attributes: { entity_id: 'sensor.living_room_battery' },
        },
        'sensor.bedroom_battery': {
          state: '50',
          attributes: { entity_id: 'sensor.bedroom_battery' },
        },
        'sensor.living_room_temperature': {
          state: '22',
          attributes: { entity_id: 'sensor.living_room_temperature' },
        },
      });

      const filters: FilterConfig[] = [
        { name: 'entity_id', operator: '=', value: 'sensor.living_room_*' },
      ];

      const result = filterEntities(
        hass,
        ['sensor.living_room_battery', 'sensor.bedroom_battery', 'sensor.living_room_temperature'],
        filters
      );
      expect(result).toEqual(['sensor.living_room_battery', 'sensor.living_room_temperature']);
    });

    it('should be case-insensitive for = operator', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '85',
          attributes: { device_class: 'Battery' },
        },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.device_class', operator: '=', value: 'battery' },
      ];

      const result = filterEntities(hass, ['sensor.battery_1'], filters);
      expect(result).toHaveLength(1);
    });
  });

  describe('comparison operators (>, <, >=, <=)', () => {
    it('should filter by greater than', () => {
      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { battery_level: 85 } },
        'sensor.battery_2': { state: '50', attributes: { battery_level: 50 } },
        'sensor.battery_3': { state: '25', attributes: { battery_level: 25 } },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.battery_level', operator: '>', value: '50' },
      ];

      const result = filterEntities(
        hass,
        ['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3'],
        filters
      );
      expect(result).toEqual(['sensor.battery_1']);
    });

    it('should filter by less than', () => {
      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { battery_level: 85 } },
        'sensor.battery_2': { state: '50', attributes: { battery_level: 50 } },
        'sensor.battery_3': { state: '25', attributes: { battery_level: 25 } },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.battery_level', operator: '<', value: '50' },
      ];

      const result = filterEntities(
        hass,
        ['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3'],
        filters
      );
      expect(result).toEqual(['sensor.battery_3']);
    });

    it('should filter by greater than or equal', () => {
      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { battery_level: 85 } },
        'sensor.battery_2': { state: '50', attributes: { battery_level: 50 } },
        'sensor.battery_3': { state: '25', attributes: { battery_level: 25 } },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.battery_level', operator: '>=', value: '50' },
      ];

      const result = filterEntities(
        hass,
        ['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3'],
        filters
      );
      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_2']);
    });

    it('should filter by less than or equal', () => {
      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { battery_level: 85 } },
        'sensor.battery_2': { state: '50', attributes: { battery_level: 50 } },
        'sensor.battery_3': { state: '25', attributes: { battery_level: 25 } },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.battery_level', operator: '<=', value: '50' },
      ];

      const result = filterEntities(
        hass,
        ['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3'],
        filters
      );
      expect(result).toEqual(['sensor.battery_2', 'sensor.battery_3']);
    });
  });

  describe('contains operator', () => {
    it('should filter entities containing a string', () => {
      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { friendly_name: 'Living Room Battery' } },
        'sensor.battery_2': { state: '50', attributes: { friendly_name: 'Bedroom Light' } },
        'sensor.battery_3': { state: '75', attributes: { friendly_name: 'Kitchen Battery' } },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.friendly_name', operator: 'contains', value: 'Battery' },
      ];

      const result = filterEntities(
        hass,
        ['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3'],
        filters
      );
      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_3']);
    });

    it('should be case-insensitive for contains operator', () => {
      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { friendly_name: 'living room battery' } },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.friendly_name', operator: 'contains', value: 'BATTERY' },
      ];

      const result = filterEntities(hass, ['sensor.battery_1'], filters);
      expect(result).toHaveLength(1);
    });
  });

  describe('matches operator (regex)', () => {
    it('should filter entities by regex pattern', () => {
      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { friendly_name: 'Living Room Battery' } },
        'sensor.battery_2': { state: '50', attributes: { friendly_name: 'Bedroom Light' } },
        'sensor.battery_3': { state: '75', attributes: { friendly_name: 'Kitchen Battery' } },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.friendly_name', operator: 'matches', value: '^(Living|Kitchen).*' },
      ];

      const result = filterEntities(
        hass,
        ['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3'],
        filters
      );
      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_3']);
    });

    it('should handle invalid regex gracefully', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { friendly_name: 'Living Room Battery' } },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.friendly_name', operator: 'matches', value: '[invalid(regex' },
      ];

      const result = filterEntities(hass, ['sensor.battery_1'], filters);
      expect(result).toHaveLength(0);

      warnSpy.mockRestore();
    });
  });

  describe('exists operator', () => {
    it('should filter entities where attribute exists', () => {
      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { battery_level: 85 } },
        'sensor.battery_2': { state: '50', attributes: {} },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.battery_level', operator: 'exists', value: undefined },
      ];

      const result = filterEntities(hass, ['sensor.battery_1', 'sensor.battery_2'], filters);
      expect(result).toEqual(['sensor.battery_1']);
    });
  });

  describe('not_exists operator', () => {
    it('should filter entities where attribute does not exist', () => {
      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { battery_level: 85 } },
        'sensor.battery_2': { state: '50', attributes: {} },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.battery_level', operator: 'not_exists', value: undefined },
      ];

      const result = filterEntities(hass, ['sensor.battery_1', 'sensor.battery_2'], filters);
      expect(result).toEqual(['sensor.battery_2']);
    });
  });

  describe('include filters', () => {
    it('should include only entities matching include filters', () => {
      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { device_class: 'battery' } },
        'sensor.temperature_1': { state: '22', attributes: { device_class: 'temperature' } },
        'sensor.battery_2': { state: '50', attributes: { device_class: 'battery' } },
      });

      const includeFilters: FilterConfig[] = [
        { name: 'attributes.device_class', operator: '=', value: 'battery' },
      ];

      const result = filterEntities(
        hass,
        ['sensor.battery_1', 'sensor.temperature_1', 'sensor.battery_2'],
        includeFilters
      );
      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_2']);
    });

    it('should include with OR logic (any filter matches)', () => {
      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { device_class: 'battery' } },
        'sensor.temperature_1': { state: '22', attributes: { device_class: 'temperature' } },
        'sensor.battery_2': { state: '50', attributes: { device_class: 'battery' } },
      });

      const includeFilters: FilterConfig[] = [
        { name: 'attributes.device_class', operator: '=', value: 'battery' },
        { name: 'attributes.device_class', operator: '=', value: 'temperature' },
      ];

      const result = filterEntities(
        hass,
        ['sensor.battery_1', 'sensor.temperature_1', 'sensor.battery_2'],
        includeFilters
      );
      expect(result).toEqual(['sensor.battery_1', 'sensor.temperature_1', 'sensor.battery_2']);
    });
  });

  describe('exclude filters', () => {
    it('should exclude entities matching exclude filters', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '85',
          attributes: { device_class: 'battery', battery_level: 85 },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: { device_class: 'battery', battery_level: 50 },
        },
        'sensor.battery_3': {
          state: '15',
          attributes: { device_class: 'battery', battery_level: 15 },
        },
      });

      const excludeFilters: FilterConfig[] = [
        { name: 'attributes.battery_level', operator: '<', value: '20' },
      ];

      const result = filterEntities(
        hass,
        ['sensor.battery_1', 'sensor.battery_2', 'sensor.battery_3'],
        undefined,
        excludeFilters
      );
      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_2']);
    });
  });

  describe('combined include and exclude filters', () => {
    it('should apply both include and exclude filters', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '85',
          attributes: { device_class: 'battery', battery_level: 85 },
        },
        'sensor.temperature_1': { state: '22', attributes: { device_class: 'temperature' } },
        'sensor.battery_2': {
          state: '50',
          attributes: { device_class: 'battery', battery_level: 50 },
        },
        'sensor.battery_3': {
          state: '15',
          attributes: { device_class: 'battery', battery_level: 15 },
        },
      });

      const includeFilters: FilterConfig[] = [
        { name: 'attributes.device_class', operator: '=', value: 'battery' },
      ];

      const excludeFilters: FilterConfig[] = [
        { name: 'attributes.battery_level', operator: '<', value: '20' },
      ];

      const result = filterEntities(
        hass,
        ['sensor.battery_1', 'sensor.temperature_1', 'sensor.battery_2', 'sensor.battery_3'],
        includeFilters,
        excludeFilters
      );
      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_2']);
    });
  });

  describe('nested property access', () => {
    it('should access deeply nested properties', () => {
      const hass = mockHass({
        'sensor.battery_1': {
          state: '85',
          attributes: {
            device_info: {
              manufacturer: 'Philips',
            },
          },
        },
        'sensor.battery_2': {
          state: '50',
          attributes: {
            device_info: {
              manufacturer: 'IKEA',
            },
          },
        },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.device_info.manufacturer', operator: '=', value: 'Philips' },
      ];

      const result = filterEntities(hass, ['sensor.battery_1', 'sensor.battery_2'], filters);
      expect(result).toEqual(['sensor.battery_1']);
    });
  });

  describe('edge cases', () => {
    it('should return empty array if no entities match', () => {
      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { device_class: 'battery' } },
      });

      const filters: FilterConfig[] = [
        { name: 'attributes.device_class', operator: '=', value: 'temperature' },
      ];

      const result = filterEntities(hass, ['sensor.battery_1'], filters);
      expect(result).toHaveLength(0);
    });

    it('should handle empty entity list', () => {
      const hass = mockHass({});

      const filters: FilterConfig[] = [
        { name: 'attributes.device_class', operator: '=', value: 'battery' },
      ];

      const result = filterEntities(hass, [], filters);
      expect(result).toHaveLength(0);
    });

    it('should handle non-existent entities', () => {
      const hass = mockHass({});

      const result = filterEntities(hass, ['sensor.battery_1'], []);
      expect(result).toHaveLength(0);
    });

    it('should return all entities if no filters are provided', () => {
      const hass = mockHass({
        'sensor.battery_1': { state: '85', attributes: { device_class: 'battery' } },
        'sensor.battery_2': { state: '50', attributes: { device_class: 'battery' } },
      });

      const result = filterEntities(hass, ['sensor.battery_1', 'sensor.battery_2']);
      expect(result).toEqual(['sensor.battery_1', 'sensor.battery_2']);
    });
  });
});
