import {
  FMSchema,
  FMJSDriverType,
  LayoutMethods,
  LayoutProxy,
  ExtractFields,
  ExtractMappedFields,
  ScriptObject,
  ScriptInput,
  CreateDAPI,
  UpdateDAPI,
  GetDAPI,
  FindDAPI,
  ListDAPI,
  DeleteDAPI,
  JSDriverPayload,
  DAPIResult,
  ParsedDAPIResult,
  LayoutDefinition
} from './types.js';
import defaultSchemaData from './fmSchema.json' assert { type: 'json' };
import FMGofer, { Option, FMGPromise } from 'fm-gofer';

/**
 * Utility function to parse DAPI result string and map field names
 */
function parseDAPIResult<TLayout extends LayoutDefinition>(
  resultString: string, 
  layout: TLayout
): ParsedDAPIResult<TLayout> {
  // Handle case where resultString might not be valid JSON (like in testing environment)
  let rawResult: any;
  try {
    rawResult = JSON.parse(resultString);
  } catch (error) {
    // If parsing fails, return a mock result for testing
    return {
      data: {
        messages: [{ code: "999", message: `Parse error: ${error}. Received: ${resultString}` }],
        response: {
          data: [],
          dataInfo: {
            database: "Unknown",
            foundCount: 0,
            layout: "Unknown",
            returnedCount: 0,
            table: "Unknown",
            totalRecordCount: 0
          }
        }
      },
      error: 999
    } as ParsedDAPIResult<TLayout>;
  }
  
  // The rawResult IS the DAPI result structure
  const dapiResult: DAPIResult = rawResult;
  
  // Ensure we have the expected structure
  if (!dapiResult || !dapiResult.data || !dapiResult.data.response || !dapiResult.data.response.data) {
    return {
      data: {
        messages: [{ code: "998", message: "Invalid DAPI response structure" }],
        response: {
          data: [],
          dataInfo: {
            database: "Unknown",
            foundCount: 0,
            layout: "Unknown",
            returnedCount: 0,
            table: "Unknown",
            totalRecordCount: 0
          }
        }
      },
      error: 998
    } as ParsedDAPIResult<TLayout>;
  }
  
  // Create field mapping from layout fields
  const fieldMapping = layout.fields;
  const reverseMapping: Record<string, string> = {};
  for (const [friendlyName, fieldName] of Object.entries(fieldMapping)) {
    reverseMapping[fieldName] = friendlyName;
  }
  
  // Map the data array with friendly field names at record level
  const mappedData = dapiResult.data.response.data.map(record => {
    const mappedRecord: any = {
      fieldData: record.fieldData,
      modId: record.modId,
      portalData: record.portalData,
      recordId: record.recordId
    };
    
    // Add friendly field accessors at the record level (not nested in fieldData)
    for (const [fieldName, value] of Object.entries(record.fieldData)) {
      const friendlyName = reverseMapping[fieldName];
      if (friendlyName) {
        mappedRecord[friendlyName] = value;
      }
    }
    
    return mappedRecord;
  });
  
  return {
    data: {
      messages: dapiResult.data.messages,
      response: {
        data: mappedData,
        dataInfo: dapiResult.data.response.dataInfo
      }
    },
    error: dapiResult.error
  } as ParsedDAPIResult<TLayout>;
}

/**
 * FMJSDriver - A lightweight, type-safe JavaScript/TypeScript driver for FileMaker
 * 
 * This driver provides a clean, typed interface to FileMaker layouts through fm-gofer.
 * It dynamically creates layout properties with CRUD methods and automatic JSON serialization.
 * 
 * @example
 * ```typescript
 * import { FMJSDriver } from "fm-jsdriver"
 * import fmSchema from "./fmSchema.json" assert { type: "json" }
 * 
 * const fm = new FMJSDriver(fmSchema)
 * fm.Contacts.create({ forename: "Alex" })
 * fm.Notes.find({ note: "hello" })
 * ```
 */
export class FMJSDriver<TSchema extends FMSchema> {
  private readonly layouts: TSchema['layouts'];

  /**
   * Creates a new FMJSDriver instance
   * 
   * @param schema - The fmSchema configuration object or SchemaRoot
   */
  constructor(schema: TSchema | { fmSchema: TSchema }) {
    // fm-gofer functions are imported and used directly
    
    // Handle schema structure
    if ('fmSchema' in schema) {
      this.layouts = schema.fmSchema.layouts;
    } else {
      this.layouts = schema.layouts;
    }

    // Dynamically create layout properties with their methods
    this.createLayoutProxies();
  }

  /**
   * Gets the default schema when none is provided
   */
  private getDefaultSchema(): TSchema {
    // Use the bundled default schema
    return (defaultSchemaData.fmSchema as unknown) as TSchema;
  }

  /**
   * Creates dynamic layout properties with CRUD methods
   * Each layout becomes a property on the driver instance
   */
  private createLayoutProxies(): void {
    Object.keys(this.layouts).forEach((layoutName) => {
      // Create layout methods object
      const layoutMethods: LayoutMethods<any, any> = {
        create: (fieldData, prescript?, script?) => this.performCreate(layoutName, fieldData, prescript, script),
        update: (recordId, fieldData, prescript?, script?) => this.performUpdate(layoutName, recordId, fieldData, prescript, script),
        get: (recordId, prescript?, script?) => this.performGet(layoutName, recordId, prescript, script),
        find: (query, options?, prescript?, script?) => this.performFind(layoutName, query, options, prescript, script),
        list: (options?, prescript?, script?) => this.performList(layoutName, options, prescript, script),
        delete: (recordId, prescript?, script?) => this.performDelete(layoutName, recordId, prescript, script),
        executeScript: (script) => this.performExecuteScript(script)
      };

      // Assign the methods to the layout property
      (this as any)[layoutName] = layoutMethods;
    });
  }

  /**
   * Performs a create operation on the specified layout
   */
  private async performCreate<T>(layoutName: string, fieldData: T, prescript?: ScriptInput<any>, script?: ScriptInput<any>): Promise<ParsedDAPIResult<any>> {
    const actualLayoutName = this.layouts[layoutName]?.layoutName || layoutName;
    const dapi: CreateDAPI<T> = {
      layouts: actualLayoutName,
      fieldData
    };

    const result = await this.executeJSDriver('create', dapi, prescript, script);
    return parseDAPIResult(result, this.layouts[layoutName]);
  }

  /**
   * Performs an update operation on the specified layout
   */
  private async performUpdate<T>(layoutName: string, recordId: string | number, fieldData: Partial<T>, prescript?: ScriptInput<any>, script?: ScriptInput<any>): Promise<ParsedDAPIResult<any>> {
    const actualLayoutName = this.layouts[layoutName]?.layoutName || layoutName;
    const dapi: UpdateDAPI<Partial<T>> = {
      layouts: actualLayoutName,
      recordId,
      fieldData
    };

    const result = await this.executeJSDriver('update', dapi, prescript, script);
    return parseDAPIResult(result, this.layouts[layoutName]);
  }

  /**
   * Performs a get operation to retrieve a single record
   */
  private async performGet(layoutName: string, recordId: string | number, prescript?: ScriptInput<any>, script?: ScriptInput<any>): Promise<ParsedDAPIResult<any>> {
    const actualLayoutName = this.layouts[layoutName]?.layoutName || layoutName;
    const dapi: GetDAPI = {
      layouts: actualLayoutName,
      recordId
    };

    const result = await this.executeJSDriver('get', dapi, prescript, script);
    return parseDAPIResult(result, this.layouts[layoutName]);
  }

  /**
   * Performs a find operation with query parameters
   */
  private async performFind<T>(layoutName: string, query: Partial<T>, options?: { offset?: number; limit?: number }, prescript?: ScriptInput<any>, script?: ScriptInput<any>): Promise<ParsedDAPIResult<any>> {
    const actualLayoutName = this.layouts[layoutName]?.layoutName || layoutName;
    const dapi: FindDAPI<T> = {
      layouts: actualLayoutName,
      query,
      ...options
    };

    const result = await this.executeJSDriver('find', dapi, prescript, script);
    return parseDAPIResult(result, this.layouts[layoutName]);
  }

  /**
   * Performs a list operation to retrieve multiple records
   */
  private async performList(layoutName: string, options?: { offset?: number; limit?: number }, prescript?: ScriptInput<any>, script?: ScriptInput<any>): Promise<ParsedDAPIResult<any>> {
    const actualLayoutName = this.layouts[layoutName]?.layoutName || layoutName;
    const dapi: ListDAPI = {
      layouts: actualLayoutName,
      ...options
    };

    const result = await this.executeJSDriver('list', dapi, prescript, script);
    return parseDAPIResult(result, this.layouts[layoutName]);
  }

  /**
   * Performs a delete operation on the specified record
   */
  private async performDelete(layoutName: string, recordId: string | number, prescript?: ScriptInput<any>, script?: ScriptInput<any>): Promise<ParsedDAPIResult<any>> {
    const actualLayoutName = this.layouts[layoutName]?.layoutName || layoutName;
    const dapi: DeleteDAPI = {
      layouts: actualLayoutName,
      recordId
    };

    const result = await this.executeJSDriver('delete', dapi, prescript, script);
    return parseDAPIResult(result, this.layouts[layoutName]);
  }

  /**
   * Executes a custom script without layout context
   */
  private async performExecuteScript(script: ScriptInput<any>): Promise<ParsedDAPIResult<any>> {
    const scriptObject = this.createScriptObject(script);
    const result = await FMGofer.PerformScriptWithOption(scriptObject.script, scriptObject.parameter, scriptObject.option as any);
    // For scripts without layout context, use a minimal layout definition
    const minimalLayout = { fields: {}, fieldMetaData: [] };
    return parseDAPIResult(result, minimalLayout);
  }

  /**
   * Core method that executes the jsDriver script with method and dapi payload
   * All CRUD operations are routed through this method
   */
  private executeJSDriver(method: string, dapi: any, prescript?: ScriptInput<any>, script?: ScriptInput<any>): FMGPromise {
    const payload: JSDriverPayload = {
      method,
      dapi
    };

    // Add script object if provided (for post-script)
    if (script) {
      payload.scriptObject = this.createScriptObject(script);
    }

    // Execute prescript if provided
    if (prescript) {
      const prescriptObject = this.createScriptObject(prescript);
      FMGofer.PerformScriptWithOption(prescriptObject.script, prescriptObject.parameter, prescriptObject.option as any);
    }

    // Execute main jsDriver script
    try {
      return FMGofer.PerformScriptWithOption('jsDriver', JSON.stringify(payload), Option.Default);
    } catch (error) {
      // Note: In a FileMaker environment, console may not be available
      // Consider using FileMaker's native logging or error handling instead
      if (typeof console !== 'undefined') {
        console.error(`FMJSDriver: Error executing jsDriver method '${method}':`, error);
      }
      throw error;
    }
  }

  /**
   * Helper method to create a ScriptObject from ScriptInput
   */
  private createScriptObject(scriptInput: ScriptInput<any>, defaultOption: number = 0): ScriptObject<any> {
    if (typeof scriptInput === 'string') {
      return {
        script: scriptInput,
        parameter: '',
        option: defaultOption
      };
    }
    return scriptInput;
  }

  /**
   * Returns the available layout names
   */
  getLayoutNames(): string[] {
    return Object.keys(this.layouts);
  }

  /**
   * Returns the field definitions for a specific layout
   */
  getLayoutFields(layoutName: string): Record<string, string> | undefined {
    return this.layouts[layoutName]?.fields;
  }

  /**
   * Validates if a layout exists in the schema
   */
  hasLayout(layoutName: string): boolean {
    return layoutName in this.layouts;
  }
}

/**
 * Sets up a properly typed FMJSDriver instance with IntelliSense support
 * Use this instead of the constructor for better TypeScript experience
 */
export function setup<T extends { fmSchema: FMSchema } | FMSchema>(schema: T): 
  T extends { fmSchema: infer S extends FMSchema } 
    ? FMJSDriver<S> & LayoutProxy<S>
    : T extends FMSchema 
      ? FMJSDriver<T> & LayoutProxy<T>
      : never {
  return new FMJSDriver(schema) as any;
}