export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const TEMPLATES: TemplateItem[] = [
  {
    id: 'cisco_lab',
    name: 'Cisco Lab',
    description: 'Lab topology, objectives, CLI commands, and review checklist',
    content: `
      <h2>Objective</h2>
      <p>Describe the goal of this lab session (e.g., configure OSPF area 0 across two routers)...</p>

      <h2>Topology & Addressing</h2>
      <p>Router 1 Fa0/0: 192.168.1.1/24 &lt;--&gt; Router 2 Fa0/0: 192.168.1.2/24</p>

      <h2>Commands Used</h2>
      <pre><code>Router# configure terminal
Router(config)# interface gigabitEthernet 0/0
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# no shutdown
Router(config-if)# exit

! Verification
Router# show ip interface brief
Router# show ip route</code></pre>

      <h2>What Happened</h2>
      <p>Observations and behavioral results during test execution...</p>

      <h2>Problem Encountered</h2>
      <p>Any routing failure, encapsulation error, or duplex mismatch...</p>

      <h2>Solution</h2>
      <p>The step or configuration command that resolved the issue...</p>

      <h2>What I Learned</h2>
      <p>Key technical takeaways from this lab...</p>

      <h2>Things to Review</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false">Review command syntax and options</li>
        <li data-type="taskItem" data-checked="false">Test edge case topology in Cisco Packet Tracer</li>
      </ul>
    `,
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Structured problem analysis, symptoms, testing, and root cause',
    content: `
      <h2>Problem Description</h2>
      <p>Concise summary of the failure or error condition...</p>

      <h2>Symptoms</h2>
      <p>What is the user or device experiencing? Error codes, LED status, drop counters...</p>

      <h2>Possible Causes</h2>
      <ul>
        <li>Physical layer disconnection or bad cable</li>
        <li>Subnet mask or gateway misconfiguration</li>
        <li>Firewall or Access Control List (ACL) rule blocking traffic</li>
      </ul>

      <h2>Tests Performed</h2>
      <pre><code># Test local stack
ping 127.0.0.1

# Test gateway
ping 192.168.1.1

# Trace route
tracert -d 8.8.8.8</code></pre>

      <h2>Solution</h2>
      <p>Detailed steps taken to restore service...</p>

      <h2>Root Cause</h2>
      <p>Underlying cause of the incident and preventive measures...</p>

      <h2>What I Learned</h2>
      <p>Lesson to remember for similar future support tickets...</p>
    `,
  },
  {
    id: 'networking_concept',
    name: 'Networking Concept',
    description: 'Protocol explanation, mechanics, packet flow, and command verification',
    content: `
      <h2>Definition</h2>
      <p>Clear definition of the protocol, standard, or networking mechanism...</p>

      <h2>How It Works</h2>
      <p>Step-by-step description of the operational process or packet handshake...</p>

      <h2>Example Scenario</h2>
      <p>Real-world application in a campus LAN or enterprise WAN...</p>

      <h2>Key Commands</h2>
      <pre><code>Switch# show cdp neighbors detail
Switch# show ip arp</code></pre>

      <h2>Things to Remember</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false">Default port numbers and transport protocol (TCP/UDP)</li>
        <li data-type="taskItem" data-checked="false">Header structure and standard RFC</li>
      </ul>
    `,
  },
  {
    id: 'general_note',
    name: 'General Note',
    description: 'Clean learning note with key takeaways and follow-up questions',
    content: `
      <h2>What I Learned</h2>
      <p>Key technical takeaways from study session...</p>

      <h2>Notes & Key Points</h2>
      <ul>
        <li>Important concept note 1</li>
        <li>Important concept note 2</li>
      </ul>

      <h2>Questions & Follow-Up</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false">Question to research or test in Packet Tracer</li>
      </ul>
    `,
  },
];
