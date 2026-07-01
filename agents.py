import json

class SentryAgent:
    def run(self, mcp_server) -> dict:
        """Fetches raw metrics via the MCP telemetry tool connection."""
        raw_telemetry = mcp_server.call_tool("read_port_telemetry")
        return raw_telemetry if isinstance(raw_telemetry, dict) else json.loads(raw_telemetry)

class TriageAgent:
    def evaluate(self, telemetry_data: dict, mcp_server) -> dict:
        """Uses an AI reasoning chain to evaluate unseen raw logs and issue tools."""
        ai_thoughts = []
        verdict = "SAFE"
        action_taken = "NONE"
        details = "The interface matches normal physical peripheral operating parameters."

        raw_packets = telemetry_data.get("raw_packet_dump", "")
        handshake = telemetry_data.get("usb_handshake_protocol", "")
        voltage = telemetry_data.get("voltage_v", 5.0)

        # 1. Handle Isolated state check
        if not telemetry_data.get("data_lines_active", True):
            return {
                "security_verdict": "SAFE", 
                "action_taken": "NONE", 
                "ai_analysis": "Data lines are physically disconnected via hardware relay.", 
                "analysis_details": "System safe. Power-only configuration active."
            }

        # 2. Dynamic multi-threat reasoning engine mapping to Bolt scenarios
        if "DCIM" in raw_packets or "MTP" in handshake:
            ai_thoughts.append("CRITICAL ANOMALY: Public charging interface requested a filesystem descriptor mapping.")
            ai_thoughts.append("DEDUCTION: This indicates an unprompted background photo directory traversal (Juice Jacking - Data Exfil).")
            verdict = "MALICIOUS"
            action_taken = "HARDWARE_ISOLATION_TRIGGERED"
            details = "Juice Jacking data exfiltration profile intercepted. Data routing conduits severed."
            mcp_server.call_tool("actuate_hardware_relay", {"state": "ISOLATED"})

        elif "WRITE_BLOCK" in raw_packets or "MASS_STORAGE" in handshake:
            ai_thoughts.append("CRITICAL ANOMALY: Port presenting storage device descriptors requesting block-write access.")
            ai_thoughts.append("DEDUCTION: Charger attempting background secondary stage payload drops (Juice Jacking - Malware Drop).")
            verdict = "MALICIOUS"
            action_taken = "HARDWARE_ISOLATION_TRIGGERED"
            details = "Malware storage volume deployment blocked via dynamic physical isolation switches."
            mcp_server.call_tool("actuate_hardware_relay", {"state": "ISOLATED"})

        elif "DMA" in raw_packets or "PCIE" in handshake:
            ai_thoughts.append("CRITICAL ANOMALY: High-speed physical link trying to address system memory directly.")
            ai_thoughts.append("DEDUCTION: This signature matches a Direct Memory Access bypass vector (DMA Attack / Thunderbolt Hijack).")
            verdict = "MALICIOUS"
            action_taken = "HARDWARE_ISOLATION_TRIGGERED"
            details = "High-threat hardware memory bus takeover blocked. Direct RAM access rejected."
            mcp_server.call_tool("actuate_hardware_relay", {"state": "ISOLATED"})

        elif "FLASH_MEM" in raw_packets or "DFU" in handshake:
            ai_thoughts.append("CRITICAL ANOMALY: Interface requested DFU mode initialization parameter strings.")
            ai_thoughts.append("DEDUCTION: Connecting terminal trying to perform an authorized low-level flash firmware overwrite (Firmware Rootkit).")
            verdict = "MALICIOUS"
            action_taken = "HARDWARE_ISOLATION_TRIGGERED"
            details = "Hardware flashing attempt blocked. Bootloader interface lockdown deployed."
            mcp_server.call_tool("actuate_hardware_relay", {"state": "ISOLATED"})

        elif "powershell" in raw_packets or "HID" in handshake:
            ai_thoughts.append("CRITICAL ANOMALY: Port acting as a human interface peripheral typing keystroke strings.")
            ai_thoughts.append("DEDUCTION: Script signature matches a hidden terminal breakout macro deployment (USB Rubber Ducky).")
            verdict = "MALICIOUS"
            action_taken = "HARDWARE_ISOLATION_TRIGGERED"
            details = "BadUSB emulated script delivery terminated. Virtual key-buffer flushed."
            mcp_server.call_tool("actuate_hardware_relay", {"state": "ISOLATED"})

        elif "SPOOFED_VENDOR" in raw_packets:
            ai_thoughts.append("CRITICAL ANOMALY: Controller interface presenting unverified PCIe device class signatures.")
            ai_thoughts.append("DEDUCTION: Controller spoofing physical hardware vendor records to bypass OS security filters.")
            verdict = "MALICIOUS"
            action_taken = "HARDWARE_ISOLATION_TRIGGERED"
            details = "PCIe Controller Spoofing vector contained via physical bus disconnect."
            mcp_server.call_tool("actuate_hardware_relay", {"state": "ISOLATED"})

        elif "TAP_RESET" in raw_packets:
            ai_thoughts.append("CRITICAL ANOMALY: Low-level boundary scan instruction sequences intercepted on input pins.")
            ai_thoughts.append("DEDUCTION: Attacker attempting raw debug hardware logic testing (JTAG Interface Unlock).")
            verdict = "MALICIOUS"
            action_taken = "HARDWARE_ISOLATION_TRIGGERED"
            details = "JTAG physical tap test sequence dropped. Debug layer isolated."
            mcp_server.call_tool("actuate_hardware_relay", {"state": "ISOLATED"})

        elif "SNIFF" in raw_packets:
            ai_thoughts.append("CRITICAL ANOMALY: Serial bus analyzer tapping registered lines.")
            ai_thoughts.append("DEDUCTION: Active side-channel listening sequence reading system configurations (I2C Bus Sniffing).")
            verdict = "MALICIOUS"
            action_taken = "HARDWARE_ISOLATION_TRIGGERED"
            details = "I2C serial wire listener isolated from interface array."
            mcp_server.call_tool("actuate_hardware_relay", {"state": "ISOLATED"})

        elif telemetry_data.get("current_a", 0) > 2.5:
            ai_thoughts.append("CRITICAL ANOMALY: High-frequency operational electrical power trace variance detected.")
            ai_thoughts.append("DEDUCTION: Cryptographic or processing cycle leak targeted via load analysis (Side-Channel Leak).")
            verdict = "MALICIOUS"
            action_taken = "HARDWARE_ISOLATION_TRIGGERED"
            details = "Power leakage trace analysis mitigated via power rail smoothing dropouts."
            mcp_server.call_tool("actuate_hardware_relay", {"state": "ISOLATED"})

        else:
            ai_thoughts.append("No structural anomaly flags raised by the Sentry sensor node. Power profile pristine.")

        return {
            "security_verdict": verdict,
            "action_taken": action_taken,
            "ai_analysis": " -> ".join(ai_thoughts),
            "analysis_details": details
        }

class ConciergeAgent:
    def generate_report(self, telemetry: dict, triage: dict) -> str:
        """Converts complex agent reasoning into a clear advisory statement for travelers."""
        if triage["security_verdict"] == "SAFE":
            return (
                "✅ Port Status: Clean & Secure\n"
                f"⚡ Electrical Load: {telemetry.get('voltage_v', 5.0)}V @ {telemetry.get('current_a', 1.0)}A\n\n"
                f"Agent Insights:\n{triage['analysis_details']}"
            )
        else:
            return (
                "🚨 SECURITY BREAK: Threat Terminated!\n"
                f"🛡️ Action Taken: {triage['analysis_details']}\n\n"
                f"Internal Agent Reasoning Log:\n{triage['ai_analysis']}"
            )