export declare function watchFilesForRestart(files: string[], restart: () => Promise<void>): Promise<void>;
type Cleaner = () => Promise<unknown> | unknown;
/**
 * Add a cleaner to handle side effects
 */
export declare const onBeforeRestart: (cleaner: Cleaner) => void;
export {};
