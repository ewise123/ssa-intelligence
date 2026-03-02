/**
 * Azure Easy Auth (Entra ID) principal decoder.
 *
 * Azure App Service injects X-MS-CLIENT-PRINCIPAL as a base64-encoded JSON
 * object containing identity claims. This module decodes that header and
 * extracts the fields the auth middleware needs (email, name, groups, oid).
 *
 * Returns null on any failure so the caller can fall through to other
 * auth header strategies (e.g. oauth2-proxy).
 */

export interface AzurePrincipal {
  email: string;
  name: string;
  objectId: string;
  groups: string[];
}

interface AzureClaim {
  typ: string;
  val: string;
}

interface AzureClientPrincipal {
  auth_typ?: string;
  claims?: AzureClaim[];
  name_typ?: string;
  role_typ?: string;
}

// Entra ID uses multiple claim type URIs depending on tenant configuration.
// We check all known variants in priority order.
const EMAIL_CLAIM_TYPES = [
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  'preferred_username',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
  'email',
  'upn',
];

const NAME_CLAIM_TYPES = [
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  'name',
];

const GROUP_CLAIM_TYPES = [
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups',
  'groups',
];

const OBJECT_ID_CLAIM_TYPES = [
  'http://schemas.microsoft.com/identity/claims/objectidentifier',
  'oid',
];

/**
 * Find the first claim value matching any of the given type URIs.
 */
const findClaim = (claims: AzureClaim[], types: string[]): string | undefined => {
  for (const typ of types) {
    const claim = claims.find((c) => c.typ === typ);
    if (claim?.val) return claim.val;
  }
  return undefined;
};

/**
 * Find all claim values matching any of the given type URIs.
 */
const findAllClaims = (claims: AzureClaim[], types: string[]): string[] => {
  const values: string[] = [];
  for (const claim of claims) {
    if (types.includes(claim.typ) && claim.val) {
      values.push(claim.val);
    }
  }
  return values;
};

/**
 * Decode the base64 X-MS-CLIENT-PRINCIPAL header value into a structured
 * AzurePrincipal. Returns null if the header is absent, malformed, or
 * doesn't contain an email claim.
 */
export const decodeAzureClientPrincipal = (
  headerValue: string | undefined
): AzurePrincipal | null => {
  if (!headerValue) return null;

  try {
    const json = Buffer.from(headerValue, 'base64').toString('utf-8');
    const principal: AzureClientPrincipal = JSON.parse(json);

    if (!Array.isArray(principal.claims) || principal.claims.length === 0) {
      return null;
    }

    const email = findClaim(principal.claims, EMAIL_CLAIM_TYPES);
    if (!email) return null;

    const name = findClaim(principal.claims, NAME_CLAIM_TYPES) ?? '';
    const objectId = findClaim(principal.claims, OBJECT_ID_CLAIM_TYPES) ?? '';
    const groups = findAllClaims(principal.claims, GROUP_CLAIM_TYPES);

    return {
      email: email.toLowerCase(),
      name,
      objectId,
      groups,
    };
  } catch {
    return null;
  }
};
