import defaultSchemaData from './fmSchema.json' assert { type: 'json' };
import FMGofer, { Option } from 'fm-gofer';
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
export class FMJSDriver {
    layouts;
    /**
     * Creates a new FMJSDriver instance
     *
     * @param schema - The fmSchema configuration object or SchemaRoot
     */
    constructor(schema) {
        // fm-gofer functions are imported and used directly
        // Handle schema structure
        if ('fmSchema' in schema) {
            this.layouts = schema.fmSchema.layouts;
        }
        else {
            this.layouts = schema.layouts;
        }
        // Dynamically create layout properties with their methods
        this.createLayoutProxies();
    }
    /**
     * Gets the default schema when none is provided
     */
    getDefaultSchema() {
        // Use the bundled default schema
        return defaultSchemaData.fmSchema;
    }
    /**
     * Creates dynamic layout properties with CRUD methods
     * Each layout becomes a property on the driver instance
     */
    createLayoutProxies() {
        Object.keys(this.layouts).forEach((layoutName) => {
            // Create layout methods object
            const layoutMethods = {
                create: (fieldData, prescript, script) => this.performCreate(layoutName, fieldData, prescript, script),
                update: (recordId, fieldData, prescript, script) => this.performUpdate(layoutName, recordId, fieldData, prescript, script),
                get: (recordId, prescript, script) => this.performGet(layoutName, recordId, prescript, script),
                find: (query, options, prescript, script) => this.performFind(layoutName, query, options, prescript, script),
                list: (options, prescript, script) => this.performList(layoutName, options, prescript, script),
                delete: (recordId, prescript, script) => this.performDelete(layoutName, recordId, prescript, script),
                executeScript: (script) => this.performExecuteScript(script)
            };
            // Assign the methods to the layout property
            this[layoutName] = layoutMethods;
        });
    }
    /**
     * Performs a create operation on the specified layout
     */
    performCreate(layoutName, fieldData, prescript, script) {
        const actualLayoutName = this.layouts[layoutName]?.layoutName || layoutName;
        const dapi = {
            layouts: actualLayoutName,
            fieldData
        };
        return this.executeJSDriver('create', dapi, prescript, script);
    }
    /**
     * Performs an update operation on the specified layout
     */
    performUpdate(layoutName, recordId, fieldData, prescript, script) {
        const actualLayoutName = this.layouts[layoutName]?.layoutName || layoutName;
        const dapi = {
            layouts: actualLayoutName,
            recordId,
            fieldData
        };
        return this.executeJSDriver('update', dapi, prescript, script);
    }
    /**
     * Performs a get operation to retrieve a single record
     */
    performGet(layoutName, recordId, prescript, script) {
        const actualLayoutName = this.layouts[layoutName]?.layoutName || layoutName;
        const dapi = {
            layouts: actualLayoutName,
            recordId
        };
        return this.executeJSDriver('get', dapi, prescript, script);
    }
    /**
     * Performs a find operation with query parameters
     */
    performFind(layoutName, query, options, prescript, script) {
        const actualLayoutName = this.layouts[layoutName]?.layoutName || layoutName;
        const dapi = {
            layouts: actualLayoutName,
            query,
            ...options
        };
        return this.executeJSDriver('find', dapi, prescript, script);
    }
    /**
     * Performs a list operation to retrieve multiple records
     */
    performList(layoutName, options, prescript, script) {
        const actualLayoutName = this.layouts[layoutName]?.layoutName || layoutName;
        const dapi = {
            layouts: actualLayoutName,
            ...options
        };
        return this.executeJSDriver('list', dapi, prescript, script);
    }
    /**
     * Performs a delete operation on the specified record
     */
    performDelete(layoutName, recordId, prescript, script) {
        const actualLayoutName = this.layouts[layoutName]?.layoutName || layoutName;
        const dapi = {
            layouts: actualLayoutName,
            recordId
        };
        return this.executeJSDriver('delete', dapi, prescript, script);
    }
    /**
     * Executes a custom script without layout context
     */
    performExecuteScript(script) {
        const scriptObject = this.createScriptObject(script);
        return FMGofer.PerformScriptWithOption(scriptObject.script, scriptObject.parameter, scriptObject.option);
    }
    /**
     * Core method that executes the jsDriver script with method and dapi payload
     * All CRUD operations are routed through this method
     */
    executeJSDriver(method, dapi, prescript, script) {
        const payload = {
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
            FMGofer.PerformScriptWithOption(prescriptObject.script, prescriptObject.parameter, prescriptObject.option);
        }
        // Execute main jsDriver script
        try {
            return FMGofer.PerformScriptWithOption('jsDriver', JSON.stringify(payload), Option.Default);
        }
        catch (error) {
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
    createScriptObject(scriptInput, defaultOption = 0) {
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
    getLayoutNames() {
        return Object.keys(this.layouts);
    }
    /**
     * Returns the field definitions for a specific layout
     */
    getLayoutFields(layoutName) {
        return this.layouts[layoutName]?.fields;
    }
    /**
     * Validates if a layout exists in the schema
     */
    hasLayout(layoutName) {
        return layoutName in this.layouts;
    }
}
/**
 * Sets up a properly typed FMJSDriver instance with IntelliSense support
 * Use this instead of the constructor for better TypeScript experience
 */
export function setup(schema) {
    return new FMJSDriver(schema);
}
