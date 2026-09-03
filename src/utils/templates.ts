import { NoteType, Track } from '../types';

export interface TemplateItem {
  id: string;
  name: string;
  track: Track;
  description: string;
  defaultType: NoteType;
  content: string;
}

export const TEMPLATES: TemplateItem[] = [
  // --- IT & Networking Templates ---
  {
    id: 'cisco_lab',
    name: 'Cisco Lab',
    track: 'IT & Networking',
    description: 'Topology, commands, testing, root cause & review checklist',
    defaultType: 'lab',
    content: `
      <h2>Objective</h2>
      <p>Describe the purpose of this lab exercise...</p>

      <h2>Topology</h2>
      <p><em>Paste topology diagram screenshot here or describe connections (e.g., R1 G0/0 &lt;--&gt; SW1 Fa0/1)...</em></p>

      <h2>Configuration</h2>
      <p>Key setup details, VLAN IDs, subnet assignments, and routing areas...</p>

      <h2>Commands Used</h2>
      <pre><code>Router# configure terminal
Router(config)# interface gigabitEthernet 0/0
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# no shutdown
Router(config-if)# exit

! Verification
Router# show ip interface brief
Router# show ip route</code></pre>

      <h2>Testing</h2>
      <p>Ping tests, traceroutes, or packet inspection in Packet Tracer simulation mode...</p>

      <h2>Problem Encountered</h2>
      <p>Any routing failure, port-security violation, duplex mismatch, or encapsulation error...</p>

      <h2>Troubleshooting</h2>
      <p>Steps taken to isolate and diagnose the issue...</p>

      <h2>Solution</h2>
      <p>Configuration adjustments or fixes applied...</p>

      <h2>Root Cause</h2>
      <p>Why the problem occurred (e.g. missing encapsulation dot1Q, wrong subnet mask)...</p>

      <h2>What I Learned</h2>
      <p>Core networking concepts reinforced during this lab...</p>

      <h2>Things to Review</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false"><div>Verify command syntax and alternate parameters</div></li>
        <li data-type="taskItem" data-checked="false"><div>Rebuild topology from scratch without notes</div></li>
        <li data-type="taskItem" data-checked="false"><div>Test failover or redundant link behavior</div></li>
      </ul>
    `,
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting Journal',
    track: 'IT & Networking',
    description: 'Symptoms, possible causes, checklist, solution & root cause',
    defaultType: 'troubleshooting',
    content: `
      <h2>Symptoms</h2>
      <p>What is the user or network experiencing? (Error messages, LED indicators, timeouts)...</p>

      <h2>Possible Causes</h2>
      <ul>
        <li>Physical layer issue (bad cable, down interface)</li>
        <li>IP addressing or default gateway mismatch</li>
        <li>DNS resolution failure</li>
        <li>Firewall or Access Control List (ACL) drop</li>
      </ul>

      <h2>Checks Performed</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false"><div>Checked physical link LEDs and cable connectivity</div></li>
        <li data-type="taskItem" data-checked="false"><div>Verified local IP, subnet mask, and default gateway</div></li>
        <li data-type="taskItem" data-checked="false"><div>Tested loopback (127.0.0.1) and default gateway ping</div></li>
        <li data-type="taskItem" data-checked="false"><div>Inspected interface status and error counters</div></li>
      </ul>

      <h2>Solution</h2>
      <p>Specific resolution or configuration change that fixed the problem...</p>

      <h2>Root Cause</h2>
      <p>The definitive underlying failure...</p>

      <h2>What I Learned</h2>
      <p>Key takeaway to prevent this or diagnose faster in the future...</p>
    `,
  },
  {
    id: 'networking_concept',
    name: 'Networking Concept',
    track: 'IT & Networking',
    description: 'Protocol explanation, OSI layer, how it works, and differences',
    defaultType: 'general',
    content: `
      <h2>Concept Overview</h2>
      <p>Brief definition and what role it plays in network architecture...</p>

      <h2>OSI Layer & Scope</h2>
      <p>Layer 2 (Data Link) / Layer 3 (Network) / Layer 4 (Transport)...</p>

      <h2>How It Works</h2>
      <p>Step-by-step mechanism and protocol behavior...</p>

      <h2>Key Differences / Comparison</h2>
      <p>How does this compare to related protocols? (e.g., TCP vs UDP, Static vs OSPF)...</p>

      <h2>Key Takeaways</h2>
      <ul>
        <li>Core principle to remember</li>
        <li>Common configuration pitfall</li>
      </ul>
    `,
  },

  // --- Software Development Templates (Requirement 8) ---
  {
    id: 'coding_concept',
    name: 'Coding Concept',
    track: 'Software Development',
    description: 'Concept explanation, code example, common mistakes & review',
    defaultType: 'coding_concept',
    content: `
      <h2>Concept</h2>
      <p>Name and core definition of the programming concept (e.g. Closure, Dependency Injection, Event Loop, Indexes)...</p>

      <h2>Explanation</h2>
      <p>Why does this concept exist, and how does the language runtime or database handle it under the hood?</p>

      <h2>Example</h2>
      <p>Practical real-world scenario where this concept is essential...</p>

      <h2>Code</h2>
      <pre><code>// Example implementation
function examplePattern() {
  // Clear, commented code demonstrating the concept
}</code></pre>

      <h2>Common Mistakes</h2>
      <ul>
        <li>Mistake 1: Memory leaks, unnecessary re-renders, or unindexed lookups...</li>
        <li>Mistake 2: Missing edge-case validation or improper error boundaries...</li>
      </ul>

      <h2>What I Learned</h2>
      <p>The fundamental mental model to retain...</p>

      <h2>Things to Review</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false"><div>Implement this concept in a small standalone test script</div></li>
        <li data-type="taskItem" data-checked="false"><div>Identify where this pattern is used in existing open-source frameworks</div></li>
      </ul>
    `,
  },
  {
    id: 'dev_project',
    name: 'Development Project',
    track: 'Software Development',
    description: 'Stack, architecture, features, problem-solving, code & deployment',
    defaultType: 'dev_project',
    content: `
      <h2>Project Name</h2>
      <p>Name and one-sentence elevator pitch of the project...</p>

      <h2>Objective</h2>
      <p>What problem does this project solve, and what technical skills was it built to practice?</p>

      <h2>Stack</h2>
      <ul>
        <li><strong>Frontend:</strong> React / Next.js / TailwindCSS</li>
        <li><strong>Backend:</strong> Laravel / Node.js / Express</li>
        <li><strong>Database:</strong> PostgreSQL / MySQL / Prisma</li>
        <li><strong>Auth & Tools:</strong> JWT / OAuth / Docker</li>
      </ul>

      <h2>Architecture</h2>
      <p>High-level system design, data flow, client-server communication, and folder structure...</p>

      <h2>Features</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false"><div>Core feature 1 (e.g. User authentication & sessions)</div></li>
        <li data-type="taskItem" data-checked="false"><div>Core feature 2 (e.g. REST API endpoints with validation)</div></li>
        <li data-type="taskItem" data-checked="false"><div>Core feature 3 (e.g. Database migrations & relational relations)</div></li>
      </ul>

      <h2>Implementation</h2>
      <p>Key architectural decisions, database models, and service layer patterns...</p>

      <h2>Problems Encountered</h2>
      <p>Bugs, state management hiccups, CORS errors, or N+1 query bottlenecks...</p>

      <h2>Solutions</h2>
      <p>How the issues were resolved with concrete fixes...</p>

      <h2>Important Code</h2>
      <pre><code>// Highlight the most important function, route, or custom hook
export async function handleBusinessLogic() {
  // ...
}</code></pre>

      <h2>Deployment</h2>
      <p>Where and how it is deployed (e.g. Docker, VPS, Vercel, Supabase)...</p>

      <h2>What I Learned</h2>
      <p>Key skills mastered throughout building this project...</p>

      <h2>Future Improvements</h2>
      <ul>
        <li>Add automated end-to-end testing</li>
        <li>Implement caching layer (Redis)</li>
      </ul>
    `,
  },
  {
    id: 'api_integration',
    name: 'API / Integration',
    track: 'Software Development',
    description: 'Endpoint, auth, request, response, error handling & troubleshooting',
    defaultType: 'api_integration',
    content: `
      <h2>API / Service</h2>
      <p>Name of the third-party service or internal microservice (e.g. Stripe, SendGrid, GitHub API)...</p>

      <h2>Purpose</h2>
      <p>What is this integration used for in the application?</p>

      <h2>Authentication</h2>
      <p>Bearer Token / API Key / OAuth 2.0 (Header: <code>Authorization: Bearer &lt;TOKEN&gt;</code>)...</p>

      <h2>Endpoint</h2>
      <pre><code>POST https://api.service.com/v1/resource</code></pre>

      <h2>Request</h2>
      <pre><code>{
  "key": "value",
  "items": []
}</code></pre>

      <h2>Response</h2>
      <pre><code>{
  "status": "success",
  "data": {
    "id": "res_12345"
  }
}</code></pre>

      <h2>Example Usage</h2>
      <pre><code>// Client-side or backend fetch example
const response = await fetch('/api/resource', {
  headers: { 'Authorization': 'Bearer ' + apiKey }
});</code></pre>

      <h2>Errors & Status Codes</h2>
      <ul>
        <li><code>400 Bad Request</code> — Missing required parameters</li>
        <li><code>401 Unauthorized</code> — Expired token or invalid secret</li>
        <li><code>429 Rate Limited</code> — Request quota exceeded</li>
      </ul>

      <h2>Troubleshooting</h2>
      <p>Steps to debug failed requests, webhook signatures, or payload mismatches...</p>

      <h2>Notes</h2>
      <p>Rate limits, caching recommendations, and SDK quirks to keep in mind...</p>
    `,
  },

  // --- AI & Automation Templates (Requirement 8) ---
  {
    id: 'automation_workflow',
    name: 'Automation Workflow',
    track: 'AI & Automation',
    description: 'Goal, trigger, nodes, AI model, prompt, database, output & testing',
    defaultType: 'automation_workflow',
    content: `
      <h2>Workflow Name</h2>
      <p>Name of the n8n / Make / Python workflow...</p>

      <h2>Goal</h2>
      <p>What business or technical process is automated from start to finish?</p>

      <h2>Trigger</h2>
      <p>Webhook / Schedule (Cron) / Email Received / Form Submission / Database Change...</p>

      <h2>Input</h2>
      <p>Schema of the incoming payload or trigger payload...</p>

      <h2>Nodes / Steps</h2>
      <ol>
        <li><strong>Step 1:</strong> Webhook Listener (receives payload)</li>
        <li><strong>Step 2:</strong> Data transformation & validation</li>
        <li><strong>Step 3:</strong> AI Agent / LLM Processing (extract insights)</li>
        <li><strong>Step 4:</strong> Database insert (Supabase / PostgreSQL)</li>
        <li><strong>Step 5:</strong> Notification / Output (Slack / Email)</li>
      </ol>

      <h2>AI Model</h2>
      <p>OpenAI GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Pro (temperature, token limits)...</p>

      <h2>Prompt</h2>
      <pre><code>System Prompt:
You are an expert technical assistant. Analyze the incoming telemetry...

User Message:
{{ $json.body.message }}</code></pre>

      <h2>APIs / Integrations</h2>
      <p>External systems connected (e.g. Gmail API, Google Sheets, HubSpot, Notion)...</p>

      <h2>Database</h2>
      <p>Tables queried or updated during workflow execution...</p>

      <h2>Output</h2>
      <p>Final generated artifact, formatted report, or synced record...</p>

      <h2>Error Handling</h2>
      <p>Retry strategies, fallback nodes, and dead-letter notifications...</p>

      <h2>Testing & Problems Encountered</h2>
      <p>Edge cases found during testing (timeouts, rate limits, malformed JSON)...</p>

      <h2>Solution</h2>
      <p>How the workflow logic was adjusted to ensure 100% reliability...</p>

      <h2>What I Learned</h2>
      <p>Key automation patterns mastered in this build...</p>

      <h2>Future Improvements</h2>
      <p>Planned enhancements for scalability or additional tool calling...</p>
    `,
  },
  {
    id: 'ai_concept',
    name: 'AI Concept',
    track: 'AI & Automation',
    description: 'Concept definition, tools, implementation, limitations & review',
    defaultType: 'ai_concept',
    content: `
      <h2>Concept</h2>
      <p>Name of the AI technique (e.g. RAG, Tool Calling, Vector Embeddings, Fine-Tuning, Multi-Agent Swarms)...</p>

      <h2>What It Is</h2>
      <p>Clear, direct technical definition without buzzwords...</p>

      <h2>Why It Matters</h2>
      <p>What problem does it solve compared to simple prompt-in/text-out inference?</p>

      <h2>Example</h2>
      <p>Concrete architecture where this technique is implemented...</p>

      <h2>Tools & Ecosystem</h2>
      <ul>
        <li><strong>Frameworks:</strong> LangChain / LlamaIndex / n8n LangChain nodes</li>
        <li><strong>Vector Databases:</strong> ChromaDB / pgvector / Pinecone</li>
        <li><strong>Embeddings:</strong> text-embedding-3-small</li>
      </ul>

      <h2>Implementation</h2>
      <pre><code>// Architecture pattern or code example
const vectorStore = await PGVectorStore.initialize(embeddings, config);
const results = await vectorStore.similaritySearch(query, 3);</code></pre>

      <h2>Limitations & Tradeoffs</h2>
      <p>Latency overhead, chunking boundaries, hallucination risks, or cost considerations...</p>

      <h2>What I Learned</h2>
      <p>Core intuition to keep in mind when designing AI workflows...</p>

      <h2>Things to Review</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false"><div>Test chunking size strategies on technical PDF documents</div></li>
        <li data-type="taskItem" data-checked="false"><div>Evaluate retrieval relevance with hybrid search (BM25 + Semantic)</div></li>
      </ul>
    `,
  },

  // --- Quick Notes & Reference ---
  {
    id: 'quick_capture',
    name: 'Quick Capture',
    track: 'IT & Networking',
    description: 'Fast scratchpad note for lab observations and immediate thoughts',
    defaultType: 'quick_capture',
    content: `
      <p>Quick note taken during lab / study session...</p>
    `,
  },
  {
    id: 'command_reference',
    name: 'Command Reference Note',
    track: 'IT & Networking',
    description: 'Structured command reference note with syntax and flags',
    defaultType: 'general',
    content: `
      <h2>Command</h2>
      <pre><code>command [flags] [arguments]</code></pre>

      <h2>Purpose</h2>
      <p>What this command accomplishes...</p>

      <h2>Common Examples</h2>
      <pre><code>example command 1
example command 2</code></pre>

      <h2>Options & Flags</h2>
      <ul>
        <li><code>-a</code> — Explanation</li>
        <li><code>-v</code> — Verbose output</li>
      </ul>

      <h2>Notes</h2>
      <p>Gotchas or prerequisites...</p>
    `,
  },
];
