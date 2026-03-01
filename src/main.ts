import { createDriver } from './index';

// Expose createDriver globally so FileMaker can call it via Execute JavaScript In Web Viewer
(window as any).createDriver = createDriver;
