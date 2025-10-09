/**
 * Type definitions for fm-jsdriver
 * Provides comprehensive typing for FileMaker schema and driver operations
 */

import { FMGPromise } from 'fm-gofer';

// fm-gofer interface definition
export interface FMGofer {
  PerformScriptWithOption(script: string, parameter: string, option: number): void;
}

// Schema type definitions - these will be inferred from fmSchema.json
export interface FieldMetaData {
  name: string;
  type: string;
  displayType?: string;
  result?: string;
  global?: boolean;
  autoEnter?: boolean;
  fourDigitYear?: boolean;
  maxRepeat?: number;
  maxCharacters?: number;
  notEmpty?: boolean;
  numeric?: boolean;
  timeOfDay?: boolean;
  repetitionStart?: number;
  repetitionEnd?: number;
}

export interface LayoutDefinition {
  fields: Record<string, string>;
  fieldMetaData: FieldMetaData[];
  layoutName?: string; // The actual layout name used in FileMaker
}

export interface FMSchema {
  layouts: Record<string, LayoutDefinition>;
  scripts?: string[];
}

export interface SchemaRoot {
  fmSchema: FMSchema;
}

// Driver configuration
export interface FMJSDriverOptions {
  gofer: FMGofer;
  schema?: SchemaRoot;  // Optional schema, uses default if not provided
}

// Script object types
export interface ScriptObject<TScriptNames extends string = string> {
  script: TScriptNames;
  parameter: string;
  option: number;
}

export type ScriptInput<TScriptNames extends string = string> = TScriptNames | ScriptObject<TScriptNames>;

// Data API payload types
export interface CreateDAPI<T> {
  layouts: string;
  fieldData: T;
}

export interface UpdateDAPI<T> {
  layouts: string;
  recordId: string | number;
  fieldData: T;
}

export interface GetDAPI {
  layouts: string;
  recordId: string | number;
}

export interface FindDAPI<T> {
  layouts: string;
  query: Partial<T>;
  offset?: number;
  limit?: number;
}

export interface ListDAPI {
  layouts: string;
  offset?: number;
  limit?: number;
}

export interface DeleteDAPI {
  layouts: string;
  recordId: string | number;
}

// Main payload structure for jsDriver script
export interface JSDriverPayload {
  method: string;
  dapi: CreateDAPI<any> | UpdateDAPI<any> | GetDAPI | FindDAPI<any> | ListDAPI | DeleteDAPI;
  scriptObject?: ScriptObject;
}

// Layout method definitions
export interface LayoutMethods<TFields, TScriptNames extends string = string> {
  create(fieldData: TFields, prescript?: ScriptInput<TScriptNames>, script?: ScriptInput<TScriptNames>): FMGPromise;
  update(recordId: string | number, fieldData: Partial<TFields>, prescript?: ScriptInput<TScriptNames>, script?: ScriptInput<TScriptNames>): FMGPromise;
  get(recordId: string | number, prescript?: ScriptInput<TScriptNames>, script?: ScriptInput<TScriptNames>): FMGPromise;
  find(query: Partial<TFields>, options?: { offset?: number; limit?: number }, prescript?: ScriptInput<TScriptNames>, script?: ScriptInput<TScriptNames>): FMGPromise;
  list(options?: { offset?: number; limit?: number }, prescript?: ScriptInput<TScriptNames>, script?: ScriptInput<TScriptNames>): FMGPromise;
  delete(recordId: string | number, prescript?: ScriptInput<TScriptNames>, script?: ScriptInput<TScriptNames>): FMGPromise;
  executeScript(script: ScriptInput<TScriptNames>): FMGPromise;
}

// Utility types for extracting field types from schema
export type ExtractFields<T extends LayoutDefinition> = {
  [K in keyof T['fields']]: string | number | boolean | null;
};

// Utility type for extracting script names from schema
export type ExtractScriptNames<T extends FMSchema> = 
  T['scripts'] extends readonly string[]
    ? T['scripts'][number]
    : string;

// Type for the dynamic layout properties
export type LayoutProxy<TSchema extends FMSchema> = {
  [K in keyof TSchema['layouts']]: LayoutMethods<ExtractFields<TSchema['layouts'][K]>, ExtractScriptNames<TSchema>>;
};

// Main driver type that combines all layouts
export type FMJSDriverType<TSchema extends FMSchema> = LayoutProxy<TSchema>;