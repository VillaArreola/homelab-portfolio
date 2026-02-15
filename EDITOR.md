# 🛠️ Node Editor System

## Overview
The Node Editor allows users to dynamically add, edit, and delete infrastructure nodes. Regular users can experiment with changes (stored in memory), while admin users can save changes permanently to the JSON file.

## User Modes

### 👤 Regular User (Default)
- ✏️ **Add nodes**: Create new infrastructure nodes
- 📝 **Edit nodes**: Modify existing node properties
- 🗑️ **Delete nodes**: Remove nodes from the topology
- 📥 **Import JSON**: Load a custom topology from a JSON file
- 📤 **Export JSON**: Download the current topology
- ⚠️ **Temporary only**: Changes are lost on page reload

### 🔒 Admin User (Password Protected)
All regular user features **PLUS**:
- 💾 **Save Permanently**: Write changes to `src/data/infrastructure.json`
- 🔓 **Unlock**: Click "Admin Mode" button and enter password

## How to Use

### For Regular Users:
1. Click **"Add Node"** in the Node Editor section
2. Fill out the form (ID, Name, Type are required)
3. Click **"Add Node"** to create
4. To edit: Click a node → Click **"Edit"** in the side panel
5. To delete: Click a node → Click **"Delete"** in the side panel
6. Export your custom topology with **"Export JSON"**

### For Admin (You):
1. Click **"Admin Mode"** button in the Node Editor section
2. Enter password: `SmartInfinityKey1`
3. Make your changes (add/edit/delete nodes)
4. Click **"Save Permanently"** to write to `infrastructure.json`
5. Changes will persist for all users after page reload

## Node Fields

### Required:
- **ID**: Unique identifier (e.g., `proxmox`, `pfsense`)
- **Name**: Display name (e.g., `Proxmox VE`, `pfSense Firewall`)
- **Type**: Node type (e.g., `hypervisor`, `firewall`, `vm`, `container`)

### Optional:
- **Parent**: Parent node ID (creates hierarchy)
- **Layer**: `physical`, `virtual`, or `cloud`
- **Purpose**: Description of the node's role
- **Network**: CIDR notation (e.g., `10.10.10.0/24`)
- **Runtime**: Platform or runtime (e.g., `Docker`, `Kubernetes`)
- **IP**: IP address (e.g., `10.10.10.53`)
- **DNS**: Hostname (e.g., `hub.villaarreola.com`)
- **Port**: Service port (e.g., `8006`)
- **URL**: Full clickable URL (e.g., `https://10.10.10.53:8006`)

## Import/Export Format

The JSON format is an array of `InfraItem` objects:

```json
[
  {
    "id": "my-server",
    "name": "My Server",
    "type": "server",
    "parent": "laptop",
    "layer": "physical",
    "purpose": "Development environment",
    "network": "192.168.1.0/24",
    "ip": "192.168.1.100",
    "port": 8080,
    "url": "http://192.168.1.100:8080"
  }
]
```

## Admin Password
- Stored in: `.env.local`
- Variable: `NEXT_PUBLIC_ADMIN_PASSWORD`
- Current value: `SmartInfinityKey1`
- To change: Edit `.env.local` and restart the dev server

## API Endpoint
- **Route**: `/api/save-infrastructure`
- **Method**: POST
- **Auth**: Requires admin password in request body
- **Payload**:
  ```json
  {
    "topology": [...],
    "password": "SmartInfinityKey1"
  }
  ```

## Security Notes
- ⚠️ The password is in `NEXT_PUBLIC_` which means it's exposed to the client
- This is **acceptable for a portfolio project** on a local network
- For production, implement proper server-side auth (NextAuth.js, JWT, etc.)
- The `.env.local` file is in `.gitignore` (not committed to GitHub)

## Files Created
- `src/app/components/modals/AdminLoginModal.tsx` - Password entry modal
- `src/app/components/modals/NodeEditorModal.tsx` - Node add/edit form
- `src/app/api/save-infrastructure/route.ts` - API endpoint for saving
- `.env.local` - Environment variables (admin password)

## Files Modified
- `src/app/components/layout/Toolbar.tsx` - Added editor buttons
- `src/app/components/diagram/LabDiagram.tsx` - CRUD logic
- `src/app/components/diagram/NodePanel.tsx` - Edit/Delete buttons

---

🎉 **The editor is now fully functional!** Try it out at http://localhost:3000
