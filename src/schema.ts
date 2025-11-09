/**
 * Schema loading and processing utilities
 * Handles validation and extraction of metadata from fmSchema.json
 */

import { FMSchema, LayoutDefinition, FieldDefinition } from './types';

/**
 * Validates that a schema has the correct structure
 */
export function validateSchema(schema: any): schema is FMSchema {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema must be an object');
  }

  if (!schema.fmSchema || typeof schema.fmSchema !== 'object') {
    throw new Error('Schema must contain a "fmSchema" property');
  }

  if (!schema.fmSchema.layouts || typeof schema.fmSchema.layouts !== 'object') {
    throw new Error('Schema must contain "fmSchema.layouts" object');
  }

  return true;
}

/**
 * Gets all layout names from the schema
 */
export function getLayoutNames(schema: FMSchema): string[] {
  return Object.keys(schema.fmSchema.layouts);
}

/**
 * Gets the layout definition for a specific layout
 */
export function getLayoutDefinition(schema: FMSchema, layoutName: string): LayoutDefinition {
  const layout = schema.fmSchema.layouts[layoutName];
  if (!layout) {
    throw new Error(`Layout "${layoutName}" not found in schema`);
  }
  return layout;
}

/**
 * Gets all field names for a layout
 */
export function getFieldNames(layout: LayoutDefinition): string[] {
  return Object.keys(layout.fields);
}

/**
 * Identifies primary key fields (fields with autoEnter: true and notEmpty: true)
 */
export function getPrimaryKeyFields(layout: LayoutDefinition): string[] {
  const fields = layout.fields;
  return Object.keys(fields).filter(fieldName => {
    const field = fields[fieldName];
    return field._meta?.autoEnter === true && field._meta?.notEmpty === true;
  });
}

/**
 * Gets required fields (fields with notEmpty: true but not autoEnter)
 */
export function getRequiredFields(layout: LayoutDefinition): string[] {
  const fields = layout.fields;
  return Object.keys(fields).filter(fieldName => {
    const field = fields[fieldName];
    return field._meta?.notEmpty === true && field._meta?.autoEnter !== true;
  });
}

/**
 * Checks if a field is required
 */
export function isFieldRequired(field: FieldDefinition): boolean {
  return field._meta?.notEmpty === true && field._meta?.autoEnter !== true;
}

/**
 * Checks if a field is auto-entered (like primary keys)
 */
export function isFieldAutoEnter(field: FieldDefinition): boolean {
  return field._meta?.autoEnter === true;
}

/**
 * Validates that field data contains all required fields
 */
export function validateFieldData(layout: LayoutDefinition, fieldData: Record<string, any>): void {
  const requiredFields = getRequiredFields(layout);
  const missingFields = requiredFields.filter(field => !(field in fieldData));

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Converts TypeScript type to FileMaker field type
 */
export function getFieldType(field: FieldDefinition): string {
  return field.type || 'string';
}
