import ipaddr from 'ipaddr.js';

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal',
  'metadata',
]);

/**
 * Rejects:
 *  - non http(s) protocols
 *  - literal IPs in any non-unicast range (loopback, private, link-local, …)
 *  - well-known internal hostnames
 *
 * Throws an Error with a user-friendly message on rejection.
 */
export function assertSafeUrl(raw: string): void {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('Invalid URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http and https URLs are allowed');
  }

  const host = url.hostname.toLowerCase().replace(/\.$/, '');

  if (BLOCKED_HOSTNAMES.has(host)) {
    throw new Error('Hostname is not allowed');
  }

  // If the hostname is literally an IP, classify it.
  let addr: ipaddr.IPv4 | ipaddr.IPv6 | null = null;
  try {
    addr = ipaddr.parse(host);
  } catch {
    /* not an IP literal → normal domain name, allow */
  }

  if (addr) {
    if (addr.kind() === 'ipv6' && (addr as ipaddr.IPv6).isIPv4MappedAddress()) {
      addr = (addr as ipaddr.IPv6).toIPv4Address();
    }
    if (addr.range() !== 'unicast') {
      throw new Error('Private or reserved IP addresses are not allowed');
    }
  }
}
