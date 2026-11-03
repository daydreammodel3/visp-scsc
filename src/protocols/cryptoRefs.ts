import type { DocRef } from './types';

/** NIST などの RFC 以外の規格 */
export const FIPS197 = { label: 'FIPS 197', title: 'Advanced Encryption Standard (AES)', url: 'https://csrc.nist.gov/pubs/fips/197/final' };
export const FIPS46 = { label: 'FIPS 46-3', title: 'Data Encryption Standard (DES)（2005 年廃止）', url: 'https://csrc.nist.gov/pubs/fips/46-3/final' };
export const SP800_67 = { label: 'NIST SP 800-67 Rev. 2', title: 'Recommendation for the Triple Data Encryption Algorithm (TDEA) Block Cipher', url: 'https://csrc.nist.gov/pubs/sp/800/67/r2/final' };
export const SP800_131A = { label: 'NIST SP 800-131A Rev. 2', title: 'Transitioning the Use of Cryptographic Algorithms and Key Lengths', url: 'https://csrc.nist.gov/pubs/sp/800/131/a/r2/final' };
export const FIPS203 = { label: 'FIPS 203', title: 'Module-Lattice-Based Key-Encapsulation Mechanism Standard (ML-KEM)', url: 'https://csrc.nist.gov/pubs/fips/203/final' };
export const FIPS204 = { label: 'FIPS 204', title: 'Module-Lattice-Based Digital Signature Standard (ML-DSA)', url: 'https://csrc.nist.gov/pubs/fips/204/final' };
export const FIPS205 = { label: 'FIPS 205', title: 'Stateless Hash-Based Digital Signature Standard (SLH-DSA)', url: 'https://csrc.nist.gov/pubs/fips/205/final' };
export const HYBRID_DRAFT = { label: 'draft-ietf-tls-ecdhe-mlkem', title: 'Post-quantum hybrid ECDHE-MLKEM Key Agreement for TLSv1.3（IETF ドラフト）', url: 'https://datatracker.ietf.org/doc/draft-ietf-tls-ecdhe-mlkem/' };
export const SWEET32: DocRef = { label: 'Sweet32', url: 'https://sweet32.info/' };

export const ref = (d: { label: string; url: string }, section?: string): DocRef => ({
  label: section ? `${d.label} ${section}` : d.label,
  url: d.url,
});
