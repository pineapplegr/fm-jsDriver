/**
 * fm-jsDriver: Type-safe FileMaker driver for webviewer communication
 * Main driver implementation using fm-gofer for FileMaker script execution
 */
import { FMSchema, Driver } from './types';
/**
 * Creates the main driver with layout-specific methods
 */
export declare function createDriver(schema: FMSchema): Driver;
export * from './types';
export * from './schema';
export { generateTypeScriptFromSchema } from './generator';
//# sourceMappingURL=index.d.ts.map