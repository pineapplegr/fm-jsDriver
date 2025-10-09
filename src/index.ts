/**
 * fm-jsdriver - A lightweight, type-safe JavaScript/TypeScript driver for FileMaker
 * 
 * Main entry point for the package
 */

// Export the main driver class
export { FMJSDriver, setup } from './FMJSDriver.js';

// Export all types for external use
export type {
  FMGofer,
  FieldMetaData,
  LayoutDefinition,
  FMSchema,
  SchemaRoot,
  FMJSDriverOptions,
  ScriptObject,
  ScriptInput,
  CreateDAPI,
  UpdateDAPI,
  GetDAPI,
  FindDAPI,
  ListDAPI,
  DeleteDAPI,
  JSDriverPayload,
  LayoutMethods,
  ExtractFields,
  LayoutProxy,
  FMJSDriverType
} from './types.js';

// Re-export for convenience
export { FMJSDriver as default } from './FMJSDriver.js';