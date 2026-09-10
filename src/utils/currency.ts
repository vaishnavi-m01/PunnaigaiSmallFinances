

export const formatINR = (amount: number | string | undefined | null, includeSymbol: boolean = true): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return includeSymbol ? '₹ 0' : '0';
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formatted = absNum.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

  const prefix = isNegative ? '- ' : '';
  return includeSymbol ? `${prefix}₹ ${formatted}` : `${prefix}${formatted}`;
};

export const parseINR = (formatted: string): number => {
  const cleaned = formatted.replace(/[₹\s,]/g, '');
  return parseFloat(cleaned) || 0;
};

export const formatLakhs = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹ ${(amount / 100000).toFixed(2)} Lakhs`;
  }
  return formatINR(amount);
};
