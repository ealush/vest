export type AccountType = 'personal' | 'business';

export type RegistrationData = {
  accountType: AccountType;
  companyName: string;
  confirmPassword: string;
  email: string;
  marketingOptIn: boolean;
  password: string;
  username: string;
};

export type RegistrationField = keyof RegistrationData;
export type RegistrationStep = 'account' | 'company';

export const emptyRegistration: RegistrationData = {
  accountType: 'personal',
  companyName: '',
  confirmPassword: '',
  email: '',
  marketingOptIn: false,
  password: '',
  username: '',
};
