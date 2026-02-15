export const nodes = [
  {
    id: "oci",
    label: "OCI Cloud Server",
    layer: "cloud",
    specs: {
      cpu: "4 OCPU",
      ram: "24GB",
      os: "Ubuntu 24.04",
      role: "Docker host",
    },
  },
  {
    id: "proxmox",
    label: "Proxmox",
    layer: "onprem",
    specs: {
      role: "Hypervisor",
      vms: 6,
    },
  },
  {
    id: "wazuh",
    label: "Wazuh SIEM",
    layer: "security",
    specs: {
      role: "SIEM",
    },
  },
];
