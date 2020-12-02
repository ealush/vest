declare function getFn(fieldName: string): string[];
declare function getFn(): { [fieldName: string]: string[] };

declare function schema(
  enforceSchema: any
): (
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

export default schema;
