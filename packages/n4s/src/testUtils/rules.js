export function goodBooleanRule(bool) {
  return bool;
}

export function goodObjectRule(bool) {
  return {
    pass: bool,
    message: 'What did you do Carl!?',
  };
}

export function goodObjectMessageRule(bool) {
  return {
    pass: bool,
  };
}

export function goodObjectMessageFunctionRule(bool) {
  return {
    pass: bool,
    message: () => `I passed with ${bool}`,
  };
}

export function badObjectRule() {
  return { message: 'Something went wrong' };
}

export function nullRule() {
  return null;
}
