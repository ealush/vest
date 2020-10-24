import enforce from 'enforce';
import rules, {
  isAlphanumericLocales,
  isMobilePhoneLocales,
  isPostalCodeLocales,
} from 'rulesExtended';

enforce.extend(rules);

export default Object.assign(enforce, {
  isAlphanumericLocales,
  isMobilePhoneLocales,
  isPostalCodeLocales,
});
