/**
 * Core type definitions for fm-jsDriver
 * These types define the structure of requests and responses for FileMaker communication
 */

/**
 * Represents a FileMaker script to be executed
 * Can be either a string (script name) or an object with full script parameters
 */
export type ScriptInput = string | ScriptObject;

/**
 * Detailed script object with optional parameters and options
 */
export interface ScriptObject {
  script: string;
  parameter?: string;
  option?: number;
}

/**
 * Options for pagination and sorting in find and list operations
 */
export interface FindOptions {
  offset?: number;  // Starting record (1-based index)
  limit?: number;   // Maximum number of records to return
  sort?: SortSpecification[];  // Sort order for results
}

/**
 * Sort specification for FileMaker queries
 */
export interface SortSpecification {
  fieldName: string;
  sortOrder: 'ascend' | 'descend';
}

/**
 * FileMaker Data API request structure
 * Maps to the Execute Data API format expected by FileMaker
 */
export interface ExecuteDataAPIRequest {
  action?: 'read' | 'create' | 'update' | 'delete' | 'duplicate' | 'metaData';
  layouts?: string;
  recordId?: string | number;
  fieldData?: Record<string, any>;
  query?: Array<Record<string, string>>;
  offset?: number;
  limit?: number;
  sort?: SortSpecification[];
  dateformats?: number;
}

/**
 * Complete parameter structure passed to FileMaker via FMGofer.PerformScript
 */
export interface DriverParameter {
  prescript?: ScriptInput;
  dapi?: ExecuteDataAPIRequest;
  script?: ScriptInput;
}

/**
 * Field metadata from schema
 */
export interface FieldMeta {
  autoEnter?: boolean;
  notEmpty?: boolean;
  type?: string;
  displayType?: string;
  fourDigitYear?: boolean;
  global?: boolean;
  maxCharacters?: number;
  maxRepeat?: number;
  numeric?: boolean;
  repetitionEnd?: number;
  repetitionStart?: number;
  result?: string;
  timeOfDay?: boolean;
}

/**
 * Field definition in schema
 */
export interface FieldDefinition {
  _meta?: FieldMeta;
  type: string;
}

/**
 * Layout definition in schema
 */
export interface LayoutDefinition {
  fields: {
    [fieldName: string]: FieldDefinition;
  };
}

/**
 * Complete schema structure
 */
export interface FMSchema {
  fmSchema: {
    layouts: {
      [layoutName: string]: LayoutDefinition;
    };
  };
}

/**
 * FileMaker response structure
 */
export interface FMResponse {
  messages?: Array<{ code: string; message: string }>;
  response?: {
    recordId?: string;
    modId?: string;
    data?: any[];
    dataInfo?: {
      database: string;
      layout: string;
      table: string;
      totalRecordCount: number;
      foundCount: number;
      returnedCount: number;
    };
  };
  scriptResult?: string;
  scriptError?: string;
}

/**
 * Layout methods interface - defines all available operations for a layout
 */
export interface LayoutMethods<T> {
  create(fieldData: T, prescript?: ScriptInput, script?: ScriptInput): Promise<any>;
  update(recordId: string | number, fieldData: Partial<T>, prescript?: ScriptInput, script?: ScriptInput): Promise<any>;
  get(recordId: string | number, prescript?: ScriptInput, script?: ScriptInput): Promise<any>;
  find(query: Partial<T>, options?: FindOptions, prescript?: ScriptInput, script?: ScriptInput): Promise<any>;
  list(options?: FindOptions, prescript?: ScriptInput, script?: ScriptInput): Promise<any>;
  delete(recordId: string | number, prescript?: ScriptInput, script?: ScriptInput): Promise<any>;
}

/**
 * Driver interface with layout-specific methods
 */
export type Driver = {
  executeScript: (script: ScriptInput) => Promise<any>;
} & Record<string, LayoutMethods<any>>;
