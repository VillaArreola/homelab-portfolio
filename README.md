flowchart TD

    laptop["Main Laptop"]
    vmware["VMware"]
    docker_local["Docker (Local)"]
    proxmox["Proxmox VE"]
    pfsense["pfSense"]
    wazuh["Wazuh SIEM"]
    ubuntu_server["Ubuntu Server"]
    kali["Kali Linux"]
    windows_11["Windows 11"]
    oci(("OCI Cloud Instance"))
    docker_oci(("Docker (OCI)"))
    npm(("Nginx Proxy Manager"))
    n8n(("n8n"))
    portainer(("Portainer"))
    ceh_subnet[("CEH Lab Network")]
    ceh_windows[" Windows VM"]

    laptop --> vmware
    laptop --> docker_local
    laptop --> proxmox
    proxmox --> pfsense
    proxmox --> wazuh
    proxmox --> ubuntu_server
    vmware --> kali
    vmware --> windows_11
    oci --> docker_oci
    docker_oci --> npm
    docker_oci --> n8n
    docker_oci --> portainer
    pfsense --> ceh_subnet
    ceh_subnet --> ceh_windows

    classDef physical fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef virtual fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef cloud fill:#f59e0b,stroke:#d97706,color:#fff

    class laptop physical
    class vmware virtual
    class docker_local virtual
    class proxmox virtual
    class pfsense virtual
    class wazuh virtual
    class ubuntu_server virtual
    class kali virtual
    class windows_11 virtual
    class oci cloud
    class docker_oci cloud
    class npm cloud
    class n8n cloud
    class portainer cloud
    class ceh_subnet virtual
    class ceh_windows virtual