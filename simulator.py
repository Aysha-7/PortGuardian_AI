import random

class PortGuardianSimulator:
    def __init__(self):
        self.relay_state = "CONNECTED"
        self.current_scenario = "SAFE"

    def set_scenario(self, scenario: str):
        # Normalize incoming strings from the Bolt frontend dropdown
        self.current_scenario = scenario.upper().replace(" ", "_").replace("-", "_").replace("(", "").replace(")", "")

    def read_port_telemetry(self) -> dict:
        # Baseline safe values
        telemetry = {
            "voltage_v": round(random.uniform(4.9, 5.1), 2),
            "current_a": round(random.uniform(0.5, 1.5), 2),
            "data_lines_active": True if self.relay_state == "CONNECTED" else False,
            "usb_handshake_protocol": "USB_PD_3.0",
            "raw_packet_dump": "STATUS_OK // NO_DATA_REQUESTED"
        }

        # Match every option from Screenshot 2026-06-29 220259.png
        if "JUICE_JACKING_DATA" in self.current_scenario or "DATA_EXFIL" in self.current_scenario:
            telemetry["raw_packet_dump"] = "REQ_FS_DESCRIPTOR // GET /DCIM/Camera/IMG_001.jpg"
            telemetry["usb_handshake_protocol"] = "MTP_FILE_TRANSFER"
            
        elif "MALWARE_DROP" in self.current_scenario:
            telemetry["raw_packet_dump"] = "WRITE_BLOCK_0x4F // EXECUTE /tmp/payload.bin"
            telemetry["usb_handshake_protocol"] = "USB_MASS_STORAGE"

        elif "DMA_ATTACK" in self.current_scenario or "THUNDERBOLT" in self.current_scenario:
            telemetry["voltage_v"] = 19.5 # Thunderbolt high voltage footprint
            telemetry["raw_packet_dump"] = "DMA_QUEUE_REQUEST // TARGET_RAM_ADDR_0x000F410"
            telemetry["usb_handshake_protocol"] = "PCIE_EXT_INTERFACE"

        elif "FIRMWARE_ROOTKIT" in self.current_scenario:
            telemetry["raw_packet_dump"] = "FLASH_MEM_OVERWRITE // REQUEST_BOOTLOADER_REWRITE"
            telemetry["usb_handshake_protocol"] = "DFU_MODE"

        elif "SIDE_CHANNEL" in self.current_scenario:
            # Anomalous high-frequency electrical draw signature
            telemetry["current_a"] = round(random.uniform(2.8, 3.5), 2) 
            telemetry["raw_packet_dump"] = "POWER_DRAW_SPIKE_DETECTED // EM_LEAK_RISK"

        elif "RUBBER_DUCKY" in self.current_scenario or "BAD_USB" in self.current_scenario:
            telemetry["raw_packet_dump"] = "KEY_DOWN 'GUI+R' // DELAY 100 // STRING 'powershell'"
            telemetry["usb_handshake_protocol"] = "HID_KEYBOARD_DEVICE"

        elif "PCIE_CONTROLLER" in self.current_scenario:
            telemetry["raw_packet_dump"] = "SPOOFED_VENDOR_ID_0x10DE // VEN_CLASS_UNKN"
            telemetry["usb_handshake_protocol"] = "PCIE_ENUMERATION"

        elif "JTAG" in self.current_scenario:
            telemetry["raw_packet_dump"] = "TAP_RESET // BOUNDARY_SCAN_ACTIVATE"
            telemetry["usb_handshake_protocol"] = "IEEE_1149_1_JTAG"

        elif "I2C_BUS" in self.current_scenario:
            telemetry["raw_packet_dump"] = "I2C_SNIFF // MASTER_READ_ADDR_0x50_EEPROM"
            telemetry["usb_handshake_protocol"] = "I2C_SERIAL_BUS"

        return telemetry