declare type exclusiveItem = string | string[];
export declare const only: (item: exclusiveItem) => void;
export declare const skip: (item: exclusiveItem) => void;
export declare const isExcluded: (fieldName: string) => boolean;
export {};
