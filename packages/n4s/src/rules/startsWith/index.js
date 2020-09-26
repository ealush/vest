function startsWith(value, arg1) {
    return typeof value === 'string' && typeof arg1 === 'string' && value.startsWith(arg1);
}

startsWith.negativeForm = 'doesNotStartWith';

export default startsWith;
