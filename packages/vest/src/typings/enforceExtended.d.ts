import { EnforceExtendMap, IEnforceRules } from './vest';

interface ExtendedRules {
  isAlphanumeric: (...args: any) => IEnforceRules;
  isCreditCard: (...args: any) => IEnforceRules;
  isCurrency: (...args: any) => IEnforceRules;
  isEmail: (...args: any) => IEnforceRules;
  isIP: (...args: any) => IEnforceRules;
  isIdentityCard: (...args: any) => IEnforceRules;
  isJSON: (...args: any) => IEnforceRules;
  isLocale: (...args: any) => IEnforceRules;
  isMimeType: (...args: any) => IEnforceRules;
  isMobilePhone: (...args: any) => IEnforceRules;
  isPassportNumber: (...args: any) => IEnforceRules;
  isPostalCode: (...args: any) => IEnforceRules;
  isURL: (...args: any) => IEnforceRules;
}

declare function enforceExtended(
  value: any
): IEnforceRules<ExtendedRules> & EnforceExtendMap<ExtendedRules>;

export default enforceExtended;
