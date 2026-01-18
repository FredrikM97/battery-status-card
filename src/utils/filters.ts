import { HomeAssistant } from '../ha-types/home-assistant';
import { FilterConfig } from '../types';
import { DynamicObject, NestedPropertyValue, ComparisonFunction } from '../types';

/**
 * Get nested property value from an object using dot notation
 * Example: getNestedValue(entity, "attributes.device_class") => "battery"
 */
function getNestedValue(obj: DynamicObject, path: string): NestedPropertyValue {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (typeof current === 'object' && current !== null) {
      return (current as DynamicObject)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Operator comparison functions - clean functional approach instead of switch statements
 * Makes it easy to add, modify, or test operators independently
 */
type OperatorMap = Record<string, ComparisonFunction>;

const createOperators = (): OperatorMap => ({
  '>': (actual, expected) => Number(actual) > Number(expected),
  '<': (actual, expected) => Number(actual) < Number(expected),
  '>=': (actual, expected) => Number(actual) >= Number(expected),
  '<=': (actual, expected) => Number(actual) <= Number(expected),
  '=': (actual, expected) => {
    // Handle wildcard matching
    if (typeof expected === 'string' && expected.includes('*')) {
      const regex = new RegExp('^' + expected.replace(/\*/g, '.*') + '$', 'i');
      return regex.test(String(actual));
    }
    return String(actual).toLowerCase() === String(expected).toLowerCase();
  },
  contains: (actual, expected) =>
    String(actual).toLowerCase().includes(String(expected).toLowerCase()),
  matches: (actual, expected) => {
    try {
      const regex = new RegExp(String(expected), 'i');
      return regex.test(String(actual));
    } catch (_e) {
      console.warn('Invalid regex pattern:', expected);
      return false;
    }
  },
  exists: (actual) => actual !== undefined && actual !== null,
  not_exists: (actual) => actual === undefined || actual === null,
});

// Singleton instance
const operators = createOperators();

/**
 * Evaluate a single filter condition against an entity
 * Uses operator map for cleaner, more maintainable code
 */
function evaluateFilter(hass: HomeAssistant, entityId: string, filter: FilterConfig): boolean {
  const entity = hass.states[entityId];
  if (!entity) return false;

  const value =
    filter.name === 'entity_id'
      ? entityId
      : getNestedValue(entity as unknown as DynamicObject, filter.name);
  const operator = operators[filter.operator];
  if (!operator) return false;
  return operator(value, filter.value);
}

/**
 * Filter entities based on include/exclude rules
 */
export function filterEntities(
  hass: HomeAssistant,
  entityIds: string[],
  includeFilters?: FilterConfig[],
  excludeFilters?: FilterConfig[]
): string[] {
  // Start with only entities that exist in hass.states
  let filtered = entityIds.filter((id) => hass.states[id] !== undefined);

  if (includeFilters && includeFilters.length > 0) {
    filtered = filtered.filter((entityId) =>
      includeFilters.some((filter) => evaluateFilter(hass, entityId, filter))
    );
  }

  if (excludeFilters && excludeFilters.length > 0) {
    filtered = filtered.filter(
      (entityId) => !excludeFilters.some((filter) => evaluateFilter(hass, entityId, filter))
    );
  }

  return filtered;
}

/**
 * Auto-discover battery entities from Home Assistant
 */
export function discoverBatteryEntities(hass: HomeAssistant): string[] {
  const entities: string[] = [];

  for (const entityId in hass.states) {
    const entity = hass.states[entityId];
    if (!entity) continue;

    if (entityId.startsWith('binary_sensor.')) continue;

    if (entity.attributes.device_class === 'battery') {
      entities.push(entityId);
      continue;
    }

    if (entityId.includes('battery')) {
      entities.push(entityId);
      continue;
    }

    if (entity.attributes.battery_level !== undefined || entity.attributes.battery !== undefined) {
      entities.push(entityId);
      continue;
    }
  }

  // Deduplicate by device - keep only one entity per device, preferring battery_level
  const seenDevices = new Set<string>();
  const deduped: string[] = [];

  for (const entityId of entities) {
    const entityReg = hass.entities?.[entityId];
    const deviceId = entityReg?.device_id;

    if (!deviceId) {
      // No device, always include
      deduped.push(entityId);
      continue;
    }

    if (seenDevices.has(deviceId)) {
      // Already have an entity for this device
      continue;
    }

    seenDevices.add(deviceId);
    deduped.push(entityId);
  }

  return deduped;
}
