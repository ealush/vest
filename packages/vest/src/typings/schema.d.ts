declare function getFn(fieldName: string): string[];
declare function getFn(): { [fieldName: string]: string[] };

declare const schema: {
  (enforceSchema: any, body?: (...args: any[]) => void): (
    data: any
  ) => {
    hasErrors: (fieldName?: string) => boolean;
    hasWarnings: (fieldName?: string) => boolean;
    getErrors: typeof getFn;
    getWarnings: typeof getFn;
    tests: {
      [key: string]: {
        hasErrors: boolean;
        hasWarnings: boolean;
        warnings: string[];
        errors: string[];
      };
    };
  };

  skip: (namespace: string) => void;
  only: (namespace: string) => void;
};

export default schema;
