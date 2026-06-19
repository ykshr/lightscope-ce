import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeCSSIdentifier(identifier: string): string {
  return identifier.replace(/[^a-zA-Z0-9-_]/g, '');
}

export function sanitizeCSSValue(value: string): string {
  return value.replace(/[<>{};]/g, '');
}
