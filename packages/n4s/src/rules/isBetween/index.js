import gte from '../greaterThanOrEquals';
import lte from'../lessThanOrEquals';

function isBetween(value, min, max) {
    return gte(value, min) && lte(value, max);
}

isBetween.negativeForm = 'isNotBetween';

export default isBetween;
