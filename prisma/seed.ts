import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const DEFAULT_CATEGORIES = [
  'Technical Support',
  'Networking',
  'Cisco',
  'Windows',
  'Hardware',
  'Troubleshooting',
  'Packet Tracer',
  'Commands',
  'Questions',
];

export const SAMPLE_NOTES = [
  {
    title: 'Cisco VLAN Lab',
    categoryName: 'Cisco',
    isPinned: true,
    content: `
      <p>A VLAN allows us to logically separate devices on the same physical switch, reducing broadcast domains and improving network security.</p>
      <h2>Commands</h2>
      <pre><code>Switch# configure terminal
Switch(config)# vlan 10
Switch(config-vlan)# name Engineering
Switch(config-vlan)# exit
Switch(config)# vlan 20
Switch(config-vlan)# name Sales
Switch(config-vlan)# exit

! Assign ports to VLANs
Switch(config)# interface range fa0/1 - 10
Switch(config-if-range)# switchport mode access
Switch(config-if-range)# switchport access vlan 10
Switch(config-if-range)# exit

! Configure 802.1Q Trunk port to Router or distribution switch
Switch(config)# interface gigabitEthernet 0/1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan 10,20
Switch(config-if)# no shutdown
Switch(config-if)# end

! Verification
Switch# show vlan brief
Switch# show interfaces trunk
Switch# show mac address-table</code></pre>
      <h2>Things I need to review</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">Understand trunk ports and 802.1Q tag insertion</li>
        <li data-type="taskItem" data-checked="false">Practice Router-on-a-Stick subinterface encapsulation</li>
        <li data-type="taskItem" data-checked="false">Verify native VLAN mismatch error messages</li>
      </ul>
      <h2>What I learned</h2>
      <p>Trunk ports carry traffic for multiple VLANs by appending a 4-byte 802.1Q tag to standard Ethernet frames. The Native VLAN (default VLAN 1) frames remain untagged.</p>
    `,
  },
  {
    title: 'Cisco IOS Commands',
    categoryName: 'Commands',
    isPinned: true,
    content: `
      <p>Essential Cisco IOS command reference for initial device provisioning, interface setup, and operational verification.</p>
      <h2>Device Security & Basic Configuration</h2>
      <pre><code>Router> enable
Router# configure terminal
Router(config)# hostname R1-Branch
R1-Branch(config)# enable secret Cisco123!
R1-Branch(config)# service password-encryption
R1-Branch(config)# no ip domain-lookup

! Console line configuration
R1-Branch(config)# line console 0
R1-Branch(config-line)# password ConsolePass
R1-Branch(config-line)# login
R1-Branch(config-line)# logging synchronous
R1-Branch(config-line)# exec-timeout 5 0
R1-Branch(config-line)# exit</code></pre>
      <h2>Interface IP & Testing</h2>
      <pre><code>R1-Branch(config)# interface gigabitEthernet 0/0
R1-Branch(config-if)# description LAN Gateway - Department A
R1-Branch(config-if)# ip address 192.168.10.1 255.255.255.0
R1-Branch(config-if)# no shutdown
R1-Branch(config-if)# end

! Save running config
R1-Branch# copy running-config startup-config
R1-Branch# show ip interface brief
R1-Branch# show ip route</code></pre>
    `,
  },
  {
    title: 'Windows Network Troubleshooting',
    categoryName: 'Windows',
    isPinned: true,
    content: `
      <p>Systematic command-line process to isolate network connectivity problems on Windows workstations.</p>
      <h2>Troubleshooting Sequence</h2>
      <pre><code># 1. Check local IP, subnet mask, and default gateway
ipconfig /all

# 2. Test TCP/IP stack integrity
ping 127.0.0.1
ping ::1

# 3. Test gateway reachability (local network layer)
ping 192.168.1.1

# 4. Flush and inspect DNS resolver cache
ipconfig /flushdns
ipconfig /displaydns

# 5. Test name resolution
nslookup internal.corp.local
nslookup 8.8.8.8

# 6. Check active TCP connections and listening sockets
netstat -ano | findstr 443

# 7. Trace path to remote host to identify packet drops
tracert -d 8.8.8.8</code></pre>
      <h2>Common Symptoms & Fixes</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">169.254.x.x IP address: APIPA triggered because DHCP server is unreachable. Run &lt;code&gt;ipconfig /renew&lt;/code&gt;.</li>
        <li data-type="taskItem" data-checked="false">Duplicate IP conflict: Check Event Viewer System log for event ID 4199.</li>
        <li data-type="taskItem" data-checked="false">DNS timeout: Verify NIC DNS server addresses and test with public resolver.</li>
      </ul>
    `,
  },
  {
    title: 'IP Addressing Basics',
    categoryName: 'Networking',
    isPinned: false,
    content: `
      <p>Core IPv4 addressing concepts, classful boundaries, and RFC 1918 private address ranges.</p>
      <h2>IPv4 Address Classes</h2>
      <p>Class A: 1.0.0.0 – 126.255.255.255 (Default /8 mask: 255.0.0.0)</p>
      <p>Class B: 128.0.0.0 – 191.255.255.255 (Default /16 mask: 255.255.0.0)</p>
      <p>Class C: 192.0.0.0 – 223.255.255.255 (Default /24 mask: 255.255.255.0)</p>
      <p>Loopback: 127.0.0.0/8 (Used for self-testing protocol stack)</p>
      <h2>RFC 1918 Private Ranges</h2>
      <pre><code>10.0.0.0/8        (10.0.0.0 - 10.255.255.255)
172.16.0.0/12     (172.16.0.0 - 172.31.255.255)
192.168.0.0/16    (192.168.0.0 - 192.168.255.255)</code></pre>
      <blockquote>Private IP addresses cannot be routed across the public Internet and require Network Address Translation (NAT).</blockquote>
    `,
  },
  {
    title: 'Packet Tracer Lab #1',
    categoryName: 'Packet Tracer',
    isPinned: false,
    content: `
      <p>Router-on-a-Stick (ROAS) Inter-VLAN Routing configuration using a 2911 router and 2960 switch.</p>
      <h2>Topology Overview</h2>
      <p>Switch FastEthernet 0/24 connected to Router GigabitEthernet 0/0. Two VLANs: VLAN 10 (Sales) and VLAN 20 (Marketing).</p>
      <h2>Router Configuration (Subinterfaces)</h2>
      <pre><code>Router(config)# interface gigabitEthernet 0/0
Router(config-if)# no shutdown
Router(config-if)# exit

! Subinterface for VLAN 10
Router(config)# interface gigabitEthernet 0/0.10
Router(config-subif)# encapsulation dot1Q 10
Router(config-subif)# ip address 192.168.10.1 255.255.255.0
Router(config-subif)# exit

! Subinterface for VLAN 20
Router(config)# interface gigabitEthernet 0/0.20
Router(config-subif)# encapsulation dot1Q 20
Router(config-subif)# ip address 192.168.20.1 255.255.255.0
Router(config-subif)# exit</code></pre>
      <h2>What happened</h2>
      <p>PCs in VLAN 10 were initially unable to ping PCs in VLAN 20. The switch trunk port had not allowed the VLAN tags properly. Once <code>switchport mode trunk</code> was applied to Fa0/24, ICMP traffic passed immediately.</p>
    `,
  },
  {
    title: 'DHCP Notes',
    categoryName: 'Technical Support',
    isPinned: false,
    content: `
      <p>Dynamic Host Configuration Protocol operates via the four-step DORA process over UDP ports 67 (server) and 68 (client).</p>
      <h2>DORA Process</h2>
      <p><strong>D - Discover:</strong> Client broadcasts destination 255.255.255.255</p>
      <p><strong>O - Offer:</strong> DHCP Server offers IP, subnet mask, default gateway, lease duration</p>
      <p><strong>R - Request:</strong> Client formally requests the offered address</p>
      <p><strong>A - Acknowledge:</strong> Server confirms lease and commits binding</p>
      <h2>Cisco IOS DHCP Relay Agent</h2>
      <p>When clients and the DHCP server reside in different subnets, routers drop the broadcast. Use <code>ip helper-address</code>:</p>
      <pre><code>Router(config)# interface g0/0.10
Router(config-subif)# ip helper-address 192.168.100.50</code></pre>
    `,
  },
  {
    title: 'DNS Troubleshooting',
    categoryName: 'Troubleshooting',
    isPinned: false,
    content: `
      <p>Diagnostic notes for name resolution failures in enterprise environments.</p>
      <h2>Investigation Workflow</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">Test ping by IP address vs ping by hostname to isolate if DNS is the failure point</li>
        <li data-type="taskItem" data-checked="true">Verify local hosts file at C:\\Windows\\System32\\drivers\\etc\\hosts for stale entries</li>
        <li data-type="taskItem" data-checked="false">Use nslookup to query specific DNS servers</li>
      </ul>
      <pre><code># Test specific record types
nslookup -type=mx example.com
nslookup -type=ns example.com
nslookup -type=txt example.com 8.8.8.8</code></pre>
    `,
  },
  {
    title: 'Subnetting Practice',
    categoryName: 'Networking',
    isPinned: false,
    content: `
      <p>Quick reference calculation guide for CIDR notation and block sizes.</p>
      <h2>CIDR /24 to /30 Cheat Table</h2>
      <pre><code>Prefix | Subnet Mask       | Block Size | Usable Hosts
/24    | 255.255.255.0     | 256        | 254
/25    | 255.255.255.128   | 128        | 126
/26    | 255.255.255.192   | 64         | 62
/27    | 255.255.255.224   | 32         | 30
/28    | 255.255.255.240   | 16         | 14
/29    | 255.255.255.248   | 8          | 6
/30    | 255.255.255.252   | 4          | 2 (Point-to-Point WAN)</code></pre>
      <h2>Formula</h2>
      <p>Usable Hosts = 2^(32 - Prefix) - 2 (subtract network ID and broadcast address).</p>
    `,
  },
];

export async function seedCategoriesOnly() {
  console.log('Ensuring default categories exist...');
  for (const catName of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
  }
}

export async function clearAllNotes() {
  console.log('Removing all mockup/seed notes...');
  await prisma.note.deleteMany({});
  console.log('All notes successfully cleared from database.');
}

export async function seedSampleNotes() {
  console.log('Seeding sample technical notes...');
  const categoryMap = new Map<string, string>();
  for (const catName of DEFAULT_CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
    categoryMap.set(catName, category.id);
  }

  for (const sample of SAMPLE_NOTES) {
    const categoryId = categoryMap.get(sample.categoryName) || null;
    await prisma.note.create({
      data: {
        title: sample.title,
        content: sample.content.trim(),
        categoryId: categoryId,
        isPinned: sample.isPinned,
        isArchived: false,
      },
    });
  }
  console.log(`Created ${SAMPLE_NOTES.length} sample notes.`);
}

export async function seedDatabase() {
  await seedCategoriesOnly();
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  const isClear = process.argv.includes('--clear');
  const isSample = process.argv.includes('--sample');

  const action = isClear
    ? clearAllNotes()
    : isSample
    ? seedSampleNotes()
    : seedCategoriesOnly();

  action
    .catch((e) => {
      console.error('Database operation error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
