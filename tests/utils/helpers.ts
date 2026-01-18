import { HomeAssistant, HassEntity } from '../../src/ha-types/home-assistant';

/**
 * Type for mock entity data (simplified version for tests)
 * Allows both string and number types for attributes to accommodate test scenarios
 */
interface MockEntityData {
  state: string;
  attributes?: Record<string, unknown>;
}

/**
 * Create a properly typed HassEntity from mock data
 */
function createMockEntity(entityId: string, data: MockEntityData): HassEntity {
  const baseAttributes: HassEntity['attributes'] = {
    ...data.attributes,
  };

  return {
    entity_id: entityId,
    state: data.state,
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    attributes: baseAttributes,
    context: {
      id: 'test-context-id',
      user_id: 'test-user',
    },
  };
}

/**
 * Minimal Home Assistant mock for tests
 * Creates a mock hass object with the given states
 */
export function mockHass(statesData: Record<string, MockEntityData>): HomeAssistant {
  const states: Record<string, HassEntity> = {};

  // Convert simplified mock data to full HassEntity objects
  for (const [entityId, data] of Object.entries(statesData)) {
    states[entityId] = createMockEntity(entityId, data);
  }

  return {
    states,
    entities: {},
    devices: {},
    areas: {},
    floors: {},
    callService: () => Promise.resolve(),
  };
}
