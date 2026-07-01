import json
from simulator import PortGuardianSimulator

class PortGuardianMCPServer:
    def __init__(self, simulator_instance: PortGuardianSimulator):
        self.hardware = simulator_instance

    def get_available_tools(self) -> list:
        """Defines the tool registry schemas following the MCP standard specification."""
        return [
            {
                "name": "read_port_telemetry",
                "description": "Reads raw physical voltage, data lines state, and packet dumps from the charging proxy kiosk.",
                "input_schema": {"type": "object", "properties": {}}
            },
            {
                "name": "actuate_hardware_relay",
                "description": "Physically disconnects or reconnects the internal data pins (D+/D-) while keeping power wires intact.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "state": {"type": "string", "enum": ["CONNECTED", "ISOLATED"], "description": "Target configuration state."}
                    },
                    "required": ["state"]
                }
            }
        ]

    def call_tool(self, tool_name: str, arguments: dict = None) -> str:
        """Executes a tool call requested by the AI agent."""
        if tool_name == "read_port_telemetry":
            telemetry_data = self.hardware.get_port_telemetry()
            return json.dumps(telemetry_data, indent=2)
            
        elif tool_name == "actuate_hardware_relay":
            state = arguments.get("state")
            result = self.hardware.set_relay_state(state)
            return json.dumps({"status": "success", "message": result})
            
        else:
            return json.dumps({"status": "error", "message": f"Tool '{tool_name}' not found."})