import isAlphanumeric, {
  locales as isAlphanumericLocales,
} from 'validator/es/lib/isAlphanumeric';
import isCreditCard from 'validator/es/lib/isCreditCard';
import isCurrency from 'validator/es/lib/isCurrency';
import isEmail from 'validator/es/lib/isEmail';
import isIP from 'validator/es/lib/isIP';
import isIdentityCard from 'validator/es/lib/isIdentityCard';
import isJSON from 'validator/es/lib/isJSON';
import isLocale from 'validator/es/lib/isLocale';
import isMimeType from 'validator/es/lib/isMimeType';
import isMobilePhone, {
  locales as isMobilePhoneLocales,
} from 'validator/es/lib/isMobilePhone';
import isPassportNumber from 'validator/es/lib/isPassportNumber';
import isPostalCode, {
  locales as isPostalCodeLocales,
} from 'validator/es/lib/isPostalCode';
import isURL from 'validator/es/lib/isURL';

export { isAlphanumericLocales, isMobilePhoneLocales, isPostalCodeLocales };

export default {
  isAlphanumeric,
  isCreditCard,
  isCurrency,
  isEmail,
  isIP,
  isIdentityCard,
  isJSON,
  isLocale,
  isMimeType,
  isMobilePhone,
  isPassportNumber,
  isPostalCode,
  isURL,
};
