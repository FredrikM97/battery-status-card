import {
  SECONDARY_INFO_OPTIONS,
  SORT_OPTIONS,
  SORT_DIRECTIONS,
  COLOR_MODES,
  FILTER_OPERATORS,
  FILTER_PRESET_OPTIONS,
} from './constants';

export function generateConfigFormSchema(): {
  schema: unknown[];
  computeLabel: (s?: { name?: string }) => string | undefined;
  computeHelper: (s?: { name?: string }) => string | undefined;
} {
  return {
    schema: [
      { name: 'title', selector: { text: {} } },
      {
        type: 'grid',
        name: 'layout_threshold_round',
        schema: [
          { name: 'collapse_threshold', selector: { number: { min: 0, step: 1 } }, default: 10 },
          {
            name: 'round',
            selector: { number: { min: 0, max: 10, step: 1, mode: 'box' } },
            default: 0,
          },
        ],
      },
      {
        type: 'grid',
        name: 'layout_display_toggles',
        schema: [
          { name: 'show_charging', selector: { boolean: {} }, default: true },
          { name: 'show_secondary_info', selector: { boolean: {} }, default: false },
        ],
      },
      {
        name: 'secondary_info',
        visible: (config: { show_secondary_info?: boolean }) =>
          config.show_secondary_info !== false,
        selector: {
          select: { options: SECONDARY_INFO_OPTIONS, multiple: true, reorder: true },
        },
      },
      {
        name: 'filter_presets',
        selector: {
          select: { options: FILTER_PRESET_OPTIONS, multiple: true, reorder: true },
        },
      },
      {
        type: 'array',
        name: 'include',
        schema: [
          { name: 'name', selector: { text: {} } },
          {
            name: 'operator',
            selector: { select: { options: FILTER_OPERATORS, mode: 'dropdown' } },
          },
          { name: 'value', selector: { text: {} } },
        ],
      },
      {
        type: 'array',
        name: 'exclude',
        schema: [
          { name: 'name', selector: { text: {} } },
          {
            name: 'operator',
            selector: { select: { options: FILTER_OPERATORS, mode: 'dropdown' } },
          },
          { name: 'value', selector: { text: {} } },
        ],
      },
      {
        type: 'grid',
        name: 'sort',
        schema: [
          {
            name: 'by',
            selector: {
              select: {
                options: SORT_OPTIONS,
                mode: 'dropdown',
              },
            },
          },
          {
            name: 'direction',
            selector: {
              select: {
                options: SORT_DIRECTIONS,
                mode: 'dropdown',
              },
            },
          },
        ],
      },
      {
        name: 'colors',
        selector: {
          object: {
            schema: [
              {
                name: 'mode',
                selector: {
                  select: {
                    options: COLOR_MODES,
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'thresholds',
                selector: {
                  object: {
                    type: 'array',
                    name: 'thresholds',
                    schema: [
                      {
                        type: 'grid',
                        name: 'threshold_item',
                        columns: 2,
                        schema: [
                          {
                            name: 'value',
                            selector: { number: { min: 0, max: 100, step: 1 } },
                          },
                          {
                            name: 'color',
                            selector: { color_rgb: {} },
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      },
    ],
    computeLabel: (schema) => {
      const name = schema?.name;
      if (!name) {
        console.warn('battery-status-card: missing schema name in computeLabel', schema);
        return '';
      }
      // Handle threshold item labels
      if (name === 'value') {
        return 'Battery Level (%)';
      }
      if (name === 'color') {
        return 'Color';
      }
      if (name === 'threshold') {
        return 'Threshold';
      }
      switch (name) {
        case 'title':
          return 'Card Title';
        case 'collapse_threshold':
          return 'Collapse Threshold';
        case 'show_charging':
          return 'Show Charging Indicator';
        case 'show_secondary_info':
          return 'Show Secondary Info';
        case 'secondary_info':
          return 'Secondary Info Items';
        case 'round':
          return 'Round Battery Level';
        case 'filter_presets':
          return 'Filter Presets';
        case 'colors':
          return 'Color Configuration';
        case 'mode':
          return 'Color Mode';
        case 'thresholds':
          return 'Color Thresholds';
        case 'sort':
          return 'Sorting';
        case 'include':
          return 'Include Filters';
        case 'exclude':
          return 'Exclude Filters';
        default:
          return '';
      }
    },
    computeHelper: (schema) => {
      const name = schema?.name;
      if (!name) {
        console.warn('battery-status-card: missing schema name in computeHelper', schema);
        return undefined;
      }

      // Handle 'value' differently based on context (thresholds vs filters)
      if (name === 'value') {
        return 'Value to compare against (leave empty for exists/not_exists)';
      }

      switch (name) {
        case 'collapse_threshold':
          return 'Number of entities to show before collapsing the rest';
        case 'show_secondary_info':
          return 'Displays secondary info such as area, floor, last changed';
        case 'filter_presets':
          return 'Quick presets to include/exclude common battery entities';
        case 'include':
          return 'Filter by entity property (e.g., entity_id, state, attributes.device_class). Use operators: = (equals), > (greater), < (less), >= (>=), <= (<=), contains, matches (regex), exists, not_exists';
        case 'exclude':
          return 'Same as include filters. Entities matching these will be hidden';
        case 'secondary_info':
          return 'Select one or more secondary info items to display';
        case 'round':
          return 'Decimal precision when rounding battery level';
        case 'colors':
          return 'Choose color mode: Gradient (smooth color transition) or Threshold (discrete colors at specific battery levels)';
        case 'mode':
          return 'Gradient: smooth color transition | Threshold: discrete colors at percentages';
        case 'thresholds':
          return 'Add battery level thresholds. Each threshold sets what color to show at that battery percentage';
        case 'color':
          return 'Color at this level';
        case 'threshold_item':
          return '';
        case 'name':
          return 'Property to filter (e.g., entity_id, state, attributes.device_class)';
        case 'operator':
          return 'Comparison operator (= wildcard match, >, <, >=, <=, contains, matches regex, exists, not_exists)';
        default:
          return undefined;
      }
    },
  };
}
