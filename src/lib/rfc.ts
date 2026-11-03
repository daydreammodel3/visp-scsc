import type { RfcRef } from '../protocols/types';

export function rfcUrl(ref: RfcRef): string {
  const base = `https://www.rfc-editor.org/rfc/rfc${ref.rfc}`;
  if (!ref.section) return base;
  const anchor = /^[A-Z]\b|^[A-Z]\./.test(ref.section)
    ? `appendix-${ref.section}`
    : `section-${ref.section}`;
  return `${base}#${anchor}`;
}

export function rfcLabel(ref: RfcRef): string {
  if (ref.label) return `RFC ${ref.rfc} ${ref.label}`;
  if (!ref.section) return `RFC ${ref.rfc}`;
  return /^[A-Z]/.test(ref.section)
    ? `RFC ${ref.rfc} Appendix ${ref.section}`
    : `RFC ${ref.rfc} §${ref.section}`;
}
