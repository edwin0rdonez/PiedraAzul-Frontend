export interface PasswordStrength {
  score: number;
  label: 'Débil' | 'Media' | 'Fuerte';
}

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) {
    score += 1;
  }
  if (/[A-Z]/.test(password)) {
    score += 1;
  }
  if (/[0-9]/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  if (score >= 4) {
    return { score, label: 'Fuerte' };
  }
  if (score >= 2) {
    return { score, label: 'Media' };
  }
  return { score, label: 'Débil' };
}
