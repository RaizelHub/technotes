export interface CiscoSnippet {
  id: string;
  name: string;
  category: string;
  description: string;
  commands: string;
}

export const CISCO_SNIPPETS: CiscoSnippet[] = [
  {
    id: 'ssh_crypto',
    name: 'SSH v2 & Crypto Key Setup',
    category: 'Security & Management',
    description: 'Enables SSH v2 with RSA key and local credential authentication',
    commands: `Router# configure terminal
Router(config)# ip domain-name lab.local
Router(config)# crypto key generate rsa modulus 2048
Router(config)# ip ssh version 2
Router(config)# username admin privilege 15 secret Cisco123!

Router(config)# line vty 0 4
Router(config-line)# transport input ssh
Router(config-line)# login local
Router(config-line)# exec-timeout 10 0
Router(config-line)# exit`,
  },
  {
    id: 'router_on_a_stick',
    name: 'Router-on-a-Stick (802.1Q)',
    category: 'Routing',
    description: 'Configures subinterfaces for inter-VLAN routing',
    commands: `Router(config)# interface gigabitEthernet 0/0
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
Router(config-subif)# exit`,
  },
  {
    id: 'dhcp_server',
    name: 'IOS DHCP Server Pool',
    category: 'Services',
    description: 'Sets up local DHCP pool with excluded IPs, DNS, and gateway',
    commands: `Router(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.20
Router(config)# ip dhcp pool LAN-VLAN10
Router(dhcp-config)# network 192.168.10.0 255.255.255.0
Router(dhcp-config)# default-router 192.168.10.1
Router(dhcp-config)# dns-server 8.8.8.8 1.1.1.1
Router(dhcp-config)# domain-name lab.local
Router(dhcp-config)# lease 7
Router(dhcp-config)# exit`,
  },
  {
    id: 'named_acl',
    name: 'Standard & Extended ACLs',
    category: 'Security',
    description: 'Named ACL to permit web/SSH traffic and block unauthorized subnets',
    commands: `! Extended ACL (Filter near source)
Router(config)# ip access-list extended SECURE-INBOUND
Router(config-ext-nacl)# permit tcp 192.168.10.0 0.0.0.255 host 10.0.0.5 eq 443
Router(config-ext-nacl)# permit tcp 192.168.10.0 0.0.0.255 host 10.0.0.5 eq 22
Router(config-ext-nacl)# deny ip any any log
Router(config-ext-nacl)# exit

! Apply to interface
Router(config)# interface gigabitEthernet 0/1
Router(config-if)# ip access-group SECURE-INBOUND in
Router(config-if)# exit`,
  },
  {
    id: 'ospf_single_area',
    name: 'OSPFv2 Single-Area Setup',
    category: 'Routing',
    description: 'Dynamic OSPF area 0 routing with router ID and passive interfaces',
    commands: `Router(config)# router ospf 1
Router(config-router)# router-id 1.1.1.1
Router(config-router)# network 192.168.10.0 0.0.0.255 area 0
Router(config-router)# network 10.0.0.0 0.0.0.3 area 0
Router(config-router)# passive-interface gigabitEthernet 0/0
Router(config-router)# exit

! Verification
Router# show ip ospf neighbor
Router# show ip route ospf`,
  },
  {
    id: 'stp_portfast',
    name: 'Rapid PVST+ & PortFast',
    category: 'Switching',
    description: 'Optimizes spanning-tree convergence and protects edge ports',
    commands: `Switch(config)# spanning-tree mode rapid-pvst
Switch(config)# spanning-tree vlan 1,10,20 root primary

! Edge port protection
Switch(config)# interface range fa0/1 - 24
Switch(config-if-range)# spanning-tree portfast
Switch(config-if-range)# spanning-tree bpduguard enable
Switch(config-if-range)# exit

! Verification
Switch# show spanning-tree summary`,
  },
  {
    id: 'pat_nat_overload',
    name: 'NAT Overload (PAT)',
    category: 'Routing & NAT',
    description: 'Translates private inside IPs to a single public outside interface',
    commands: `! 1. Define inside & outside interfaces
Router(config)# interface gigabitEthernet 0/0
Router(config-if)# ip nat inside
Router(config-if)# exit

Router(config)# interface gigabitEthernet 0/1
Router(config-if)# ip nat outside
Router(config-if)# exit

! 2. Permit internal network in ACL
Router(config)# access-list 1 permit 192.168.10.0 0.0.0.255

! 3. Configure overload translation
Router(config)# ip nat inside source list 1 interface gigabitEthernet 0/1 overload

! Verification
Router# show ip nat translations`,
  },
  {
    id: 'etherchannel_lacp',
    name: 'LACP EtherChannel (Port-Channel)',
    category: 'Switching',
    description: 'Bundles multiple physical links into an 802.3ad active link aggregation',
    commands: `Switch(config)# interface range gigabitEthernet 0/1 - 2
Switch(config-if-range)# channel-group 1 mode active
Switch(config-if-range)# exit

! Configure virtual port-channel interface
Switch(config)# interface port-channel 1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan 10,20,30
Switch(config-if)# exit

! Verification
Switch# show etherchannel summary`,
  },
  {
    id: 'port_security',
    name: 'Switch Port Security',
    category: 'Security',
    description: 'Restricts switch access to specific MAC addresses with sticky learning',
    commands: `Switch(config)# interface fastEthernet 0/5
Switch(config-if)# switchport mode access
Switch(config-if)# switchport port-security
Switch(config-if)# switchport port-security maximum 2
Switch(config-if)# switchport port-security mac-address sticky
Switch(config-if)# switchport port-security violation restrict
Switch(config-if)# exit

! Verification
Switch# show port-security interface fa0/5`,
  },
];
