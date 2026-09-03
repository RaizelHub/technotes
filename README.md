# TechNotes 📓

A clean, minimalist, private note-taking desktop application tailored for studying **Technical Support, Networking, Cisco IOS, Windows Troubleshooting, Hardware, and Cisco Packet Tracer**.

---

## Key Features

- **Distraction-Free Engineering Notebook**: Strict monochrome design inspired by Apple Notes and Notion simplicity. No bloatware, gradients, or widgets.
- **Cisco CLI Command Blocks**: Specially formatted code blocks for Cisco IOS configurations with 1-click clipboard copy.
- **Direct Screenshot & Image Paste**: Copy any Packet Tracer topology or Windows error with `Win + Shift + S` and paste directly with `Ctrl + V`.
- **Built-in CIDR & Subnet Calculator**: Calculate Network IDs, Broadcast, Usable Ranges, Subnet Masks, and Wildcard Masks (`Ctrl + Shift + C`) with 1-click table insertion.
- **Cisco CLI Snippet Library**: Instant configuration templates for SSH v2, 802.1Q ROAS, DHCP Pools, Named ACLs, OSPF, NAT/PAT, Rapid PVST+, and Port Security.
- **Sidecar / Mini Bar Mode (`Ctrl + M`)**: Collapses navigation to a compact, single-column floating window beside Cisco Packet Tracer.
- **Always-on-Top Modal (`Ctrl + Shift + T`)**: Pins TechNotes on top of Packet Tracer while configuring switches and routers.
- **Tagging System (`#tags`)**: Organize and filter notes with inline tags.
- **Clean Markdown Export & Print/PDF**: Export any note to `.md` or print clean documents with `@media print`.
- **Minimalist Dark Mode**: Pure `#09090b` dark theme to reduce eye strain during late-night lab sessions.
- **100% Private & Local-First**: Notes are saved locally in SQLite (`prisma/technotes.db`) with zero external cloud dependencies.

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd TechNotes

# Install dependencies
npm install

# Initialize local SQLite database
npx prisma db push
```

### Running TechNotes
```bash
# Launch Native Desktop App (Recommended)
npm run desktop

# Or Launch in Browser (Dev Mode)
npm run dev
```

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + N` | Create a new note |
| `Ctrl + Shift + N` | Open Quick Note modal |
| `Ctrl + Shift + C` | Open CIDR & Subnet Calculator |
| `Ctrl + M` | Toggle Sidecar / Mini Mode |
| `Ctrl + Shift + P` | Open Command Palette |
| `Ctrl + Shift + T` | Toggle Always-on-Top (Desktop window) |
| `Ctrl + F` | Search notes |
| `Ctrl + S` | Force save note |
| `Ctrl + V` | Paste screenshot from clipboard |
| `Esc` | Close modal / palette |

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, TipTap Editor, Lucide Icons, Zustand
- **Backend**: Node.js, Express, Prisma ORM, SQLite
- **Desktop**: Electron

---

## License

MIT
