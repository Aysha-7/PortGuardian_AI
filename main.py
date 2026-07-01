from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI()

# Enable CORS so your frontend can communicate through the ngrok tunnel smoothly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/scan")
async def scan_endpoint(payload: Dict[str, Any]):
    scenario_info = payload.get("scenario", {})
    
    # Handle whether the frontend sends a raw identifier string or an object bundle
    if isinstance(scenario_info, dict):
        scenario_id = scenario_info.get("id", "DEFAULT").upper()
    else:
        scenario_id = str(scenario_info).upper()

    print(f"Processing hardware scan request for threat profile: {scenario_id}")

    # 1. Juice Jacking — Malware Implant
    if "JUICE_JACKING_MALWARE" in scenario_id:
        return {
            "status": "success",
            "verdict": "SUSPICIOUS",
            "threat_score": 75,
            "blocked": True,
            "attack_type": "Juice Jacking Attempt",
            "source": "Public Charging Kiosk",
            "target": "Traveler Mobile Device",
            "ai_reasoning": [
                "Detected unexpected USB data channel utilization.",
                "Potential data extraction vector recognized on simulated pins.",
                "Sentry agent has initiated isolation protocol."
            ],
            "user_report": "The PortGuardian system flagged an anomaly during the hardware check. Simulated relays have disconnected data transfer lines to protect your device."
        }

    # 2. Juice Jacking — Data Exfiltration
    elif "JUICE_JACKING_DATA" in scenario_id:
        return {
            "status": "success",
            "verdict": "MALICIOUS",
            "threat_score": 88,
            "blocked": True,
            "attack_type": "Active Data Exfiltration",
            "source": "Malicious Power Station",
            "target": "Host Controller Storage",
            "ai_reasoning": [
                "High-frequency background handshakes detected on D+ and D- pins.",
                "Unauthorized mounting request intercepted for directory root.",
                "Data path physically severed by hardware optocoupler."
            ],
            "user_report": "Critical Action Taken: PortGuardian intercepted an active attempt to clone or read system data profiles via a compromised power node."
        }

    # 3. USB Rubber Ducky (HID Injection)
    elif "BAD_USB" in scenario_id or "RUBBER_DUCKY" in scenario_id:
        return {
            "status": "success",
            "verdict": "MALICIOUS",
            "threat_score": 95,
            "blocked": True,
            "attack_type": "HID Keyboard Emulation",
            "source": "Untrusted USB Hardware",
            "target": "Local Terminal Shell",
            "ai_reasoning": [
                "Keystroke injection burst detected within 5ms of attachment.",
                "Malicious powershell script deployment blocked.",
                "Triage agent flagged matching payload signatures."
            ],
            "user_report": "Critical Threat Intercepted: An attached device attempted to simulate high-speed keyboard layouts to bypass standard operating system firewalls."
        }

    # 4. Firmware Rootkit
    elif "FIRMWARE_ROOTKIT" in scenario_id:
        return {
            "status": "success",
            "verdict": "CRITICAL",
            "threat_score": 99,
            "blocked": True,
            "attack_type": "SPI Flash Modification",
            "source": "Malicious Controller Board",
            "target": "System ROM Firmware",
            "ai_reasoning": [
                "Signature verification mismatch detected during low-level boot check.",
                "Unauthorized write command detected targeting SPI-FLASH [10.0.4.21].",
                "Rootkit deployment vector quarantined at the physical bus layer."
            ],
            "user_report": "CRITICAL ALERT: Hardware telemetry caught an injection attempt directly modifying core system firmware. The memory bus has been locked to prevent a persistent breach."
        }

    # 5. Thunderbolt DMA Hijack / DMA Attack
    elif "DMA" in scenario_id or "THUNDERBOLT" in scenario_id:
        return {
            "status": "success",
            "verdict": "CRITICAL",
            "threat_score": 92,
            "blocked": True,
            "attack_type": "Direct Memory Access Hijack",
            "source": "External PCIe Controller",
            "target": "System RAM Core",
            "ai_reasoning": [
                "Bypass attempt detected tracking RAM paging boundaries.",
                "High-speed read request initiated without CPU kernel authorization.",
                "IOMMU protective structures deployed to isolate the physical port."
            ],
            "user_report": "Hardware Shield Activated: A Direct Memory Access (DMA) attack attempting to read cryptographic keys straight out of your computer's RAM has been neutralized."
        }

    # 6. JTAG Interface Unlock
    elif "JTAG" in scenario_id:
        return {
            "status": "success",
            "verdict": "CRITICAL",
            "threat_score": 98,
            "blocked": True,
            "attack_type": "Hardware Debugger Hijack",
            "source": "Unauthorized JTAG Probe",
            "target": "CPU Boundary Scan Interface",
            "ai_reasoning": [
                "Boundary scan instruction register state transition forced manually.",
                "Attempted bypass of chip security fuses observed.",
                "JTAG clock line grounded via protection circuit."
            ],
            "user_report": "CRITICAL: A physical exploit device attempted to hijack the CPU's low-level JTAG debugging interface. Hardware line termination has locked down the debug bus."
        }

    # 7. PCIe Controller Spoofing
    elif "PCIE" in scenario_id:
        return {
            "status": "success",
            "verdict": "MALICIOUS",
            "threat_score": 91,
            "blocked": True,
            "attack_type": "PCIe Device Spoofing",
            "source": "Malicious Expansion Card",
            "target": "PCIe Root Complex",
            "ai_reasoning": [
                "Device reported invalid vendor ID / Product ID combinations.",
                "Abnormal configuration space registers modification detected.",
                "Bus master capability disabled for the suspicious slot."
            ],
            "user_report": "Threat Mitigated: An unverified hardware component attempted to masquerade as a legitimate network controller to gain unauthorized system access."
        }

    # 8. I2C Bus Sniffing
    elif "I2C" in scenario_id:
        return {
            "status": "success",
            "verdict": "SUSPICIOUS",
            "threat_score": 70,
            "blocked": True,
            "attack_type": "Inter-Chip Bus Wiretapping",
            "source": "Physical Logic Analyzer Probe",
            "target": "Internal System Management Bus",
            "ai_reasoning": [
                "Impedance drop detected on SDA/SCL signal lines.",
                "Passive eavesdropping pattern identified on crypto-peripheral bus.",
                "Switched bus topology to noise-injection mode to garble signals."
            ],
            "user_report": "Security Alert: Micro-voltage fluctuations indicate a physical probe may be actively monitoring your internal motherboard communications."
        }

    # 9. Side-Channel Timing Leak
    elif "SIDE_CHANNEL" in scenario_id or "TIMING" in scenario_id:
        return {
            "status": "success",
            "verdict": "SUSPICIOUS",
            "threat_score": 65,
            "blocked": True,
            "attack_type": "Side-Channel Timing Analysis",
            "source": "External Profiling Agent",
            "target": "Cryptographic Subsystem",
            "ai_reasoning": [
                "Detected high-precision monitoring of cryptographic operation durations.",
                "Repetitive, structured mathematical queries identified.",
                "Activated clock-jitter randomization to obfuscate processing timing."
            ],
            "user_report": "Defensive Countermeasures Active: The system detected structural behavior designed to analyze clock cycles. Random timing noise has been introduced to protect data structures."
        }

    # 10. Safe Device (Baseline Fallback)
    else:
        return {
            "status": "success",
            "verdict": "SAFE",
            "threat_score": 5,
            "blocked": False,
            "attack_type": "None",
            "source": "Verified Compliant Power Source",
            "target": "Protected Port",
            "ai_reasoning": [
                "VCC and GND power lines matching baseline specification.",
                "Data lines D+ and D- remain inert and grounded.",
                "No unauthorized logic handshakes observed."
            ],
            "user_report": "Port scan complete. The power transfer environment is perfectly stable and free from active data injection signatures."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)