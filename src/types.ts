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

// Layout method definitions - now return properly typed DAPI results
export interface LayoutMethods<TLayout extends LayoutDefinition, TScriptNames extends string = string> {
  create(fieldData: ExtractMappedFields<TLayout>, prescript?: ScriptInput<TScriptNames>, script?: ScriptInput<TScriptNames>): Promise<ParsedDAPIResult<TLayout>>;
  update(recordId: string | number, fieldData: Partial<ExtractMappedFields<TLayout>>, prescript?: ScriptInput<TScriptNames>, script?: ScriptInput<TScriptNames>): Promise<ParsedDAPIResult<TLayout>>;
  get(recordId: string | number, prescript?: ScriptInput<TScriptNames>, script?: ScriptInput<TScriptNames>): Promise<ParsedDAPIResult<TLayout>>;
  find(query: Partial<ExtractMappedFields<TLayout>>, options?: { offset?: number; limit?: number }, prescript?: ScriptInput<TScriptNames>, script?: ScriptInput<TScriptNames>): Promise<ParsedDAPIResult<TLayout>>;
  list(options?: { offset?: number; limit?: number }, prescript?: ScriptInput<TScriptNames>, script?: ScriptInput<TScriptNames>): Promise<ParsedDAPIResult<TLayout>>;
  delete(recordId: string | number, prescript?: ScriptInput<TScriptNames>, script?: ScriptInput<TScriptNames>): Promise<ParsedDAPIResult<TLayout>>;
  executeScript(script: ScriptInput<TScriptNames>): Promise<ParsedDAPIResult<TLayout>>;
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
  [K in keyof TSchema['layouts']]: LayoutMethods<TSchema['layouts'][K], ExtractScriptNames<TSchema>>;
};

// DAPI Result Types
export interface DAPIMessage {
  code: string;
  message: string;
}

export interface DAPIDataInfo {
  database: string;
  foundCount: number;
  layout: string;
  returnedCount: number;
  table: string;
  totalRecordCount: number;
}

export interface DAPIRecord<TFieldData = Record<string, any>> {
  fieldData: TFieldData;
  modId: string;
  portalData: Record<string, any>;
  recordId: string;
}

export interface DAPIResponse<TFieldData = Record<string, any>> {
  data: DAPIRecord<TFieldData>[];
  dataInfo: DAPIDataInfo;
}

export interface DAPIData<TFieldData = Record<string, any>> {
  messages: DAPIMessage[];
  response: DAPIResponse<TFieldData>;
}

export interface DAPIResult<TFieldData = Record<string, any>> {
  data: DAPIData<TFieldData>;
  error: number;
}

// Utility type to create field data type from schema layout
export type ExtractFieldData<T extends LayoutDefinition> = {
  [K in T['fields'][keyof T['fields']]]: string;
};

// Utility type to create mapped field access from schema
export type ExtractMappedFields<T extends LayoutDefinition> = {
  [K in keyof T['fields']]: string;
};

// Type for parsing DAPI results with schema-aware field mapping
export type ParsedDAPIResult<TLayout extends LayoutDefinition> = {
  data: {
    messages: DAPIMessage[];
    response: {
      data: Array<{
        fieldData: ExtractFieldData<TLayout>;
        modId: string;
        portalData: Record<string, any>;
        recordId: string;
      } & ExtractMappedFields<TLayout>>;
      dataInfo: DAPIDataInfo;
    };
  };
  error: number;
};

// Main driver type that combines all layouts
export type FMJSDriverType<TSchema extends FMSchema> = LayoutProxy<TSchema>;