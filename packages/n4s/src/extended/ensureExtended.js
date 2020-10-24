import ensure from 'ensure';
import rules, {
  isAlphanumericLocales,
  isMobilePhoneLocales,
  isPostalCodeLocales,
} from 'rulesExtended';

ensure.extend(rules);

export default Object.assign(ensure, {
  isAlphanumericLocales,
  isMobilePhoneLocales,
  isPostalCodeLocales,
});
