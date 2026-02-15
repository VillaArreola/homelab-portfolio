export type LabNodeData = {
  title: string;
  role?: string;
  cpu?: string;
  ram?: string;
  os?: string;
  network?: string;
  services?: string[];
};

export const labNodes: Record<string, LabNodeData> = {
  oci: {
    title: "OCI Cloud Server",
    role: "Docker Host / Public Entry",
    cpu: "4 OCPU",
    ram: "24GB",
    os: "Ubuntu 24.04",
    services: [
      "Nginx Proxy Manager",
      "n8n",
      "Portainer",
      "Ollama",
    ],
  },

  proxmox: {
    title: "Proxmox Node",
    role: "Hypervisor (Laptop)",
    cpu: "Intel i5",
    ram: "16GB",
  },

  pfsense: {
    title: "pfSense Firewall",
    role: "Gateway & Network Segmentation",
    cpu: "2 vCPU",
    ram: "2GB",
    network: "10.10.10.0/24",
    services: ["DHCP", "DNS Resolver", "NTP"],
  },

  wazuh: {
    title: "Wazuh SIEM",
    role: "Security Monitoring & Log Analysis",
  },

  win11: {
    title: "Windows 11 VM",
    role: "Endpoint Monitoring (Sysmon)",
  },

  kali: {
    title: "Kali Linux",
    role: "Offensive Security Lab",
  },

  ubuntu: {
    title: "Ubuntu Server",
    role: "Internal Services & Testing",
  },
};
