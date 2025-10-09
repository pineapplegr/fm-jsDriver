import { FMSchema, LayoutProxy } from './types.js';
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
export declare class FMJSDriver<TSchema extends FMSchema> {
    private readonly layouts;
    /**
     * Creates a new FMJSDriver instance
     *
     * @param schema - The fmSchema configuration object or SchemaRoot
     */
    constructor(schema: TSchema | {
        fmSchema: TSchema;
    });
    /**
     * Gets the default schema when none is provided
     */
    private getDefaultSchema;
    /**
     * Creates dynamic layout properties with CRUD methods
     * Each layout becomes a property on the driver instance
     */
    private createLayoutProxies;
    /**
     * Performs a create operation on the specified layout
     */
    private performCreate;
    /**
     * Performs an update operation on the specified layout
     */
    private performUpdate;
    /**
     * Performs a get operation to retrieve a single record
     */
    private performGet;
    /**
     * Performs a find operation with query parameters
     */
    private performFind;
    /**
     * Performs a list operation to retrieve multiple records
     */
    private performList;
    /**
     * Performs a delete operation on the specified record
     */
    private performDelete;
    /**
     * Executes a custom script without layout context
     */
    private performExecuteScript;
    /**
     * Core method that executes the jsDriver script with method and dapi payload
     * All CRUD operations are routed through this method
     */
    private executeJSDriver;
    /**
     * Helper method to create a ScriptObject from ScriptInput
     */
    private createScriptObject;
    /**
     * Returns the available layout names
     */
    getLayoutNames(): string[];
    /**
     * Returns the field definitions for a specific layout
     */
    getLayoutFields(layoutName: string): Record<string, string> | undefined;
    /**
     * Validates if a layout exists in the schema
     */
    hasLayout(layoutName: string): boolean;
}
/**
 * Sets up a properly typed FMJSDriver instance with IntelliSense support
 * Use this instead of the constructor for better TypeScript experience
 */
export declare function setup<T extends {
    fmSchema: FMSchema;
} | FMSchema>(schema: T): T extends {
    fmSchema: infer S extends FMSchema;
} ? FMJSDriver<S> & LayoutProxy<S> : T extends FMSchema ? FMJSDriver<T> & LayoutProxy<T> : never;
//# sourceMappingURL=FMJSDriver.d.ts.map