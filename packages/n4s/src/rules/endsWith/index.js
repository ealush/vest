function endsWith(value, arg1) {
    return typeof value === 'string' && typeof arg1 === 'string' && value.endsWith(arg1);
}

endsWith.negativeForm = 'isNotEndsWith';

export default endsWith;
