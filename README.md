# PortGuardian AI — Multi-Agent Hardware Threat Detection Dashboard

PortGuardian AI is an advanced, hardware-level security simulation dashboard designed to intercept, analyze, and mitigate sophisticated physical layer attacks. By leveraging a structured multi-agent reasoning framework, the system monitors real-time telemetry from external interfaces and communication buses to classify threat profiles, calculate risk metrics, and execute defensive isolation protocols before system integrity is compromised.

### Core Features
* **Multi-Agent Analysis:** Simulates specialized security agents (Sentry, Triage, and Isolation layers) providing granular step-by-step reasoning for every scan.
* **10 Deep Hardware Threat Profiles:** Comprehensive detection mappings ranging from physical port exploits to complex bus-level attacks.
* **Automated Mitigation:** Real-time visual feedback showing block states, physical relay overrides, and hardware-level line termination.

---

## System Architecture

[ React Frontend Dashboard ]  (Port 5173 / Bolt Environment)
             │
             ▼  (POST Payload JSON: e.g., {"scenario": "FIRMWARE_ROOTKIT"})
   [ Secure Ngrok Tunnel ]     (https://*.ngrok-free.app)
             │
             ▼
   [ FastAPI Backend Engine ]  (Port 8000 / Python Main Core)
             │
    ┌────────┴────────┐
    ▼                 ▼
[Threat Matrix]   [Multi-Agent Reasoning Chain]
    │                 │
    └────────┬────────┘
             ▼  (JSON Response: Verdict, Score, AI Logic, User Report)
[ Frontend UI Updates State ] ──> (Renders Critical/Suspicious/Safe UI)

---

## Hardware Threat Detection Matrix

The engine dynamically evaluates the hardware bus topology against 10 critical threat scenarios:

| Threat Scenario | Attack Type | Target Interface | Severity |
| :--- | :--- | :--- | :--- |
| **Juice Jacking — Malware** | Data Channel Exploitation | Public Charging Node | SUSPICIOUS |
| **Juice Jacking — Exfiltration** | Active Host Directory Cloning | Host Storage Controller | MALICIOUS |
| **USB Rubber Ducky** | High-Speed HID Injection | Local Terminal Shell | MALICIOUS |
| **Firmware Rootkit** | SPI Flash Modification | System ROM Firmware | CRITICAL |
| **Thunderbolt DMA Hijack** | Direct Memory Access Bypass | System RAM Core | CRITICAL |
| **JTAG Interface Unlock** | Hardware Debugger Hijack | CPU Boundary Scan Bus | CRITICAL |
| **PCIe Controller Spoofing** | Device Configuration Masquerade | PCIe Root Complex | MALICIOUS |
| **I2C Bus Sniffing** | Inter-Chip Wiretapping | System Management Bus | SUSPICIOUS |
| **Side-Channel Timing Leak** | Processing Cycle Profiling | Cryptographic Subsystem | SUSPICIOUS |
| **Safe Device (Baseline)** | Standard Compliance Check | Verified Power Source | SAFE |

---

## Installation & Local Setup

### Prerequisites
* Python 3.10+
* Node.js & npm (or Bolt runner environment)
* ngrok CLI installed and authenticated

### 1. Backend Server Setup
Navigate to the project root directory and start the FastAPI engine:
cd C:\Users\ameer\OneDrive\Desktop\PortGuardian_AI
python main.py
*The backend server will spin up under local loopback: http://127.0.0.1:8000.*

### 2. Establish Secure Reverse Proxy Tunnel
Open a secondary terminal window and initialize the ngrok secure link, explicitly forcing the port mapping configuration:
.\ngrok http 127.0.0.1:8000
*Copy the generated forwarding URL address (e.g., https://xxxx-xxxx.ngrok-free.app).*

### 3. Frontend Link Configuration
Open the src/hooks/useScan.ts file within your editor and update the core API path declaration string at the top of the file:
const API_URL = 'https://YOUR_GENERATED_NGROK_URL.ngrok-free.app/api/scan';

### 4. Running the Dashboard Scan
* Open the frontend preview window.
* Force a clean application cache reload via Ctrl + F5.
* Select any hardware vector from the threat deployment drop-down menu and execute SCAN.