import { describe, it, expect } from 'vitest';
import { generateConfigFormSchema } from '../src/config-form';
import { SECONDARY_INFO_OPTIONS } from '../src/constants';

describe('config-form', () => {
  describe('generateConfigFormSchema', () => {
    it('should return a valid schema object', () => {
      const result = generateConfigFormSchema();

      expect(result).toHaveProperty('schema');
      expect(result).toHaveProperty('computeLabel');
      expect(result).toHaveProperty('computeHelper');
      expect(Array.isArray(result.schema)).toBe(true);
    });

    it('should include secondary_info multi-select selector', () => {
      const result = generateConfigFormSchema();
      const secondaryInfoField = result.schema.find(
        (field) => (field as { name?: string }).name === 'secondary_info'
      ) as {
        name: string;
        selector: { select: { multiple: boolean; reorder: boolean; options: unknown } };
        visible?: (config: Record<string, unknown>) => boolean;
      };

      expect(secondaryInfoField).toBeDefined();
      expect(secondaryInfoField.selector).toBeDefined();
      expect(secondaryInfoField.selector.select).toBeDefined();
      expect(secondaryInfoField.selector.select.multiple).toBe(true);
      expect(secondaryInfoField.selector.select.reorder).toBe(true);
      expect(secondaryInfoField.selector.select.options).toEqual(SECONDARY_INFO_OPTIONS);
    });

    it('should configure secondary_info with conditional visibility', () => {
      const result = generateConfigFormSchema();
      const secondaryInfoField = result.schema.find(
        (field) => (field as { name?: string }).name === 'secondary_info'
      ) as { visible?: (config: Record<string, unknown>) => boolean } | undefined;

      expect(secondaryInfoField?.visible).toBeDefined();
      expect(typeof secondaryInfoField?.visible).toBe('function');

      // Test visibility logic
      expect(secondaryInfoField?.visible?.({ show_secondary_info: true })).toBe(true);
      expect(secondaryInfoField?.visible?.({ show_secondary_info: false })).toBe(false);
      expect(secondaryInfoField?.visible?.({})).toBe(true); // Default should be visible
    });

    it('should include all required form fields', () => {
      const result = generateConfigFormSchema();
      const fieldNames = result.schema
        .map((field) => (field as { name?: string }).name)
        .filter((name): name is string => Boolean(name));

      expect(fieldNames).toContain('title');
      expect(fieldNames).toContain('secondary_info');
      expect(fieldNames).toContain('filter_presets');
      expect(fieldNames).toContain('sort');
      expect(fieldNames).toContain('colors');

      // These are in grids, so they're nested
      expect(fieldNames).toContain('layout_threshold_round');
      expect(fieldNames).toContain('layout_display_toggles');
    });

    it('should have computeLabel function that handles all fields', () => {
      const result = generateConfigFormSchema();

      expect(result.computeLabel({ name: 'title' })).toBe('Card Title');
      expect(result.computeLabel({ name: 'secondary_info' })).toBe('Secondary Info Items');
      expect(result.computeLabel({ name: 'collapse_threshold' })).toBe('Collapse Threshold');
      expect(result.computeLabel({ name: 'show_charging' })).toBe('Show Charging Indicator');
      expect(result.computeLabel({ name: 'show_secondary_info' })).toBe('Show Secondary Info');
    });

    it('should have computeHelper function that provides help text', () => {
      const result = generateConfigFormSchema();

      expect(result.computeHelper({ name: 'secondary_info' })).toBe(
        'Select one or more secondary info items to display'
      );
      expect(result.computeHelper({ name: 'collapse_threshold' })).toBe(
        'Number of entities to show before collapsing the rest'
      );
      expect(result.computeHelper({ name: 'round' })).toBe(
        'Decimal precision when rounding battery level'
      );
    });

    it('should handle missing schema name gracefully', () => {
      const result = generateConfigFormSchema();

      expect(result.computeLabel({})).toBe('');
      expect(result.computeLabel(undefined)).toBe('');
      expect(result.computeHelper({})).toBeUndefined();
      expect(result.computeHelper(undefined)).toBeUndefined();
    });

    it('should include grid layouts for compact display', () => {
      const result = generateConfigFormSchema();
      const gridFields = result.schema.filter(
        (field) => (field as { type?: string }).type === 'grid'
      );

      expect(gridFields.length).toBeGreaterThan(0);

      // Check threshold/round grid
      const thresholdRoundGrid = gridFields.find(
        (field) => (field as { name?: string }).name === 'layout_threshold_round'
      ) as { schema?: unknown[] } | undefined;
      expect(thresholdRoundGrid).toBeDefined();
      expect(thresholdRoundGrid?.schema).toBeDefined();

      // Check display toggles grid
      const displayTogglesGrid = gridFields.find(
        (field) => (field as { name?: string }).name === 'layout_display_toggles'
      ) as { schema?: unknown[] } | undefined;
      expect(displayTogglesGrid).toBeDefined();
      expect(displayTogglesGrid?.schema).toBeDefined();
    });

    it('should validate nested fields in grids are accessible', () => {
      const result = generateConfigFormSchema();

      // Find grid fields and check their nested schema
      const thresholdRoundGrid = result.schema.find(
        (field) => (field as { name?: string }).name === 'layout_threshold_round'
      ) as { schema: unknown[] };
      const nestedFields = thresholdRoundGrid.schema.map((f) => (f as { name?: string }).name);
      expect(nestedFields).toContain('collapse_threshold');
      expect(nestedFields).toContain('round');

      const displayTogglesGrid = result.schema.find(
        (field) => (field as { name?: string }).name === 'layout_display_toggles'
      ) as { schema: unknown[] };
      const toggleFields = displayTogglesGrid.schema.map((f) => (f as { name?: string }).name);
      expect(toggleFields).toContain('show_charging');
      expect(toggleFields).toContain('show_secondary_info');
    });

    it('should include filter arrays with proper structure', () => {
      const result = generateConfigFormSchema();
      const includeField = result.schema.find(
        (field) => (field as { name?: string }).name === 'include'
      ) as { type?: string; schema?: unknown[] } | undefined;
      const excludeField = result.schema.find(
        (field) => (field as { name?: string }).name === 'exclude'
      ) as { type?: string; schema?: unknown[] } | undefined;

      expect(includeField).toBeDefined();
      expect(includeField?.type).toBe('array');
      expect(excludeField).toBeDefined();
      expect(excludeField?.type).toBe('array');

      // Both should have name, operator, value fields
      expect(includeField?.schema?.length).toBe(3);
      expect(excludeField?.schema?.length).toBe(3);
    });
  });
});
