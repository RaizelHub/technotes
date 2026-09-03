export interface SubnetResult {
  ip: string;
  prefix: number;
  ipClass: string;
  isPrivate: boolean;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  usableHosts: number;
  totalAddresses: number;
  binaryMask: string;
}

// Convert 32-bit int to dotted decimal string
function intToIp(int: number): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
}

// Convert dotted decimal string to 32-bit uint
function ipToInt(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
}

// Calculate subnet details
export function calculateSubnet(ipStr: string, prefix: number): SubnetResult | null {
  const cleanIp = ipStr.trim();
  const octets = cleanIp.split('.');
  if (octets.length !== 4) return null;

  for (const octet of octets) {
    const num = Number(octet);
    if (isNaN(num) || num < 0 || num > 255 || (octet.length > 1 && octet.startsWith('0'))) {
      return null;
    }
  }

  if (prefix < 0 || prefix > 32) return null;

  const ipNum = ipToInt(cleanIp);
  const maskNum = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const wildcardNum = ~maskNum >>> 0;

  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | wildcardNum) >>> 0;

  const totalAddresses = Math.pow(2, 32 - prefix);
  let usableHosts = 0;
  let firstUsableNum = networkNum;
  let lastUsableNum = broadcastNum;

  if (prefix === 31) {
    // RFC 3021: 2 usable hosts on point-to-point links
    usableHosts = 2;
    firstUsableNum = networkNum;
    lastUsableNum = broadcastNum;
  } else if (prefix === 32) {
    usableHosts = 1;
    firstUsableNum = networkNum;
    lastUsableNum = broadcastNum;
  } else {
    usableHosts = Math.max(0, totalAddresses - 2);
    firstUsableNum = (networkNum + 1) >>> 0;
    lastUsableNum = (broadcastNum - 1) >>> 0;
  }

  // Determine Class
  const firstOctet = parseInt(octets[0], 10);
  let ipClass = 'Unknown';
  if (firstOctet >= 1 && firstOctet <= 126) ipClass = 'Class A';
  else if (firstOctet === 127) ipClass = 'Loopback';
  else if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'Class B';
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'Class C';
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'Class D (Multicast)';
  else if (firstOctet >= 240 && firstOctet <= 255) ipClass = 'Class E (Experimental)';

  // RFC 1918 check
  let isPrivate = false;
  const secondOctet = parseInt(octets[1], 10);
  if (firstOctet === 10) isPrivate = true;
  else if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) isPrivate = true;
  else if (firstOctet === 192 && secondOctet === 168) isPrivate = true;

  // Binary mask representation
  const binaryMask = (maskNum >>> 0)
    .toString(2)
    .padStart(32, '0')
    .match(/.{1,8}/g)!
    .join('.');

  return {
    ip: cleanIp,
    prefix,
    ipClass,
    isPrivate,
    subnetMask: intToIp(maskNum),
    wildcardMask: intToIp(wildcardNum),
    networkAddress: intToIp(networkNum),
    broadcastAddress: intToIp(broadcastNum),
    firstUsableIp: intToIp(firstUsableNum),
    lastUsableIp: intToIp(lastUsableNum),
    usableHosts,
    totalAddresses,
    binaryMask,
  };
}

// Generate formatted HTML table for insertion into TipTap editor
export function generateSubnetHtml(res: SubnetResult): string {
  return `
    <h3>Subnet Calculation: ${res.ip}/${res.prefix}</h3>
    <pre><code>CIDR Prefix:        /${res.prefix}
Subnet Mask:        ${res.subnetMask}
Wildcard Mask:      ${res.wildcardMask}
Network Address:    ${res.networkAddress}
Broadcast Address:  ${res.broadcastAddress}
Usable Host Range:  ${res.firstUsableIp} - ${res.lastUsableIp}
Total Usable Hosts: ${res.usableHosts.toLocaleString()} (${res.totalAddresses} total addresses)
Classification:     ${res.ipClass} (${res.isPrivate ? 'RFC 1918 Private' : 'Public'})
Binary Mask:        ${res.binaryMask}</code></pre>
  `;
}
