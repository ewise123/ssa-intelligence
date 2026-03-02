import { describe, it, expect } from 'vitest';
import { decodeAzureClientPrincipal } from './azure-auth.js';

const encode = (obj: unknown): string =>
  Buffer.from(JSON.stringify(obj)).toString('base64');

describe('decodeAzureClientPrincipal', () => {
  it('returns null for undefined input', () => {
    expect(decodeAzureClientPrincipal(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(decodeAzureClientPrincipal('')).toBeNull();
  });

  it('returns null for malformed base64', () => {
    expect(decodeAzureClientPrincipal('not-valid-base64!!!')).toBeNull();
  });

  it('returns null for valid base64 that is not JSON', () => {
    const value = Buffer.from('just a plain string').toString('base64');
    expect(decodeAzureClientPrincipal(value)).toBeNull();
  });

  it('returns null when claims array is missing', () => {
    expect(decodeAzureClientPrincipal(encode({ auth_typ: 'aad' }))).toBeNull();
  });

  it('returns null when claims array is empty', () => {
    expect(decodeAzureClientPrincipal(encode({ claims: [] }))).toBeNull();
  });

  it('returns null when no email claim is present', () => {
    const principal = {
      claims: [
        { typ: 'name', val: 'John Doe' },
        { typ: 'oid', val: 'abc-123' },
      ],
    };
    expect(decodeAzureClientPrincipal(encode(principal))).toBeNull();
  });

  it('decodes a valid principal with long-form email claim', () => {
    const principal = {
      auth_typ: 'aad',
      claims: [
        {
          typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          val: 'Alice@Example.com',
        },
        {
          typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
          val: 'Alice Smith',
        },
        {
          typ: 'http://schemas.microsoft.com/identity/claims/objectidentifier',
          val: 'oid-456',
        },
        {
          typ: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups',
          val: 'group-a',
        },
        {
          typ: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups',
          val: 'group-b',
        },
      ],
    };

    const result = decodeAzureClientPrincipal(encode(principal));
    expect(result).toEqual({
      email: 'alice@example.com',
      name: 'Alice Smith',
      objectId: 'oid-456',
      groups: ['group-a', 'group-b'],
    });
  });

  it('decodes a principal with short-form claim types', () => {
    const principal = {
      claims: [
        { typ: 'email', val: 'Bob@Corp.io' },
        { typ: 'name', val: 'Bob Jones' },
        { typ: 'oid', val: 'oid-789' },
        { typ: 'groups', val: 'team-x' },
      ],
    };

    const result = decodeAzureClientPrincipal(encode(principal));
    expect(result).toEqual({
      email: 'bob@corp.io',
      name: 'Bob Jones',
      objectId: 'oid-789',
      groups: ['team-x'],
    });
  });

  it('falls back through email claim type variants', () => {
    const principal = {
      claims: [
        { typ: 'preferred_username', val: 'Carol@Test.com' },
      ],
    };

    const result = decodeAzureClientPrincipal(encode(principal));
    expect(result).toEqual({
      email: 'carol@test.com',
      name: '',
      objectId: '',
      groups: [],
    });
  });

  it('falls back to UPN claim for email', () => {
    const principal = {
      claims: [
        {
          typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
          val: 'Dave@Org.com',
        },
      ],
    };

    const result = decodeAzureClientPrincipal(encode(principal));
    expect(result).toEqual({
      email: 'dave@org.com',
      name: '',
      objectId: '',
      groups: [],
    });
  });

  it('prefers long-form email claim over short-form', () => {
    const principal = {
      claims: [
        { typ: 'email', val: 'short@test.com' },
        {
          typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          val: 'Long@Test.com',
        },
      ],
    };

    const result = decodeAzureClientPrincipal(encode(principal));
    expect(result).not.toBeNull();
    expect(result!.email).toBe('long@test.com');
  });

  it('handles multiple group claims with the same type key', () => {
    const principal = {
      claims: [
        { typ: 'email', val: 'user@test.com' },
        { typ: 'groups', val: 'group-1' },
        { typ: 'groups', val: 'group-2' },
        { typ: 'groups', val: 'group-3' },
      ],
    };

    const result = decodeAzureClientPrincipal(encode(principal));
    expect(result).not.toBeNull();
    expect(result!.groups).toEqual(['group-1', 'group-2', 'group-3']);
  });

  it('skips claims with empty val', () => {
    const principal = {
      claims: [
        { typ: 'email', val: '' },
        { typ: 'preferred_username', val: 'fallback@test.com' },
      ],
    };

    const result = decodeAzureClientPrincipal(encode(principal));
    expect(result).not.toBeNull();
    expect(result!.email).toBe('fallback@test.com');
  });
});
