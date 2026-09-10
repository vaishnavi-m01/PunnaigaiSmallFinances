export const isValidIndianMobile = (mobile: string): boolean => {
  const cleaned = mobile.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
};

export const isValidOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isNotEmpty = (val: string): boolean => {
  return val.trim().length > 0;
};
