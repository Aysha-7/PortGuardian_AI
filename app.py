import gradio as gr
import json
from simulator import PortGuardianSimulator
from mcp_server import PortGuardianMCPServer
from agents import SentryAgent, TriageAgent, ConciergeAgent

# Initialize core pipeline engines
simulator = PortGuardianSimulator()
mcp_server = PortGuardianMCPServer(simulator)

sentry = SentryAgent()
triage = TriageAgent()
concierge = ConciergeAgent()

# Advanced CSS injection to completely override Gradio's standard interface
custom_css = """
body {
    background: radial-gradient(circle at 50% 0%, #111625 0%, #07090e 70%) !important;
    color: #e2e8f0 !important;
    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
}
.gradio-container {
    max-width: 1200px !important;
    margin: 0 auto !important;
    border: none !important;
    padding: 20px !important;
}
/* Glassmorphic Cyber Cards */
.cyber-card {
    background: rgba(13, 17, 28, 0.7) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 20px !important;
    padding: 24px !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4) !important;
}
/* Premium Custom Interactive Button */
#scan-button {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
    color: white !important;
    font-weight: 700 !important;
    letter-spacing: 0.5px !important;
    text-transform: uppercase !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 14px 24px !important;
    box-shadow: 0 0 20px rgba(37, 99, 235, 0.4) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    cursor: pointer !important;
}
#scan-button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 0 30px rgba(37, 99, 235, 0.7) !important;
    filter: brightness(1.1) !important;
}
/* Micro-animations */
@keyframes pulse-glow {
    0%, 100% { opacity: 0.4; filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3)); }
    50% { opacity: 0.9; filter: drop-shadow(0 0 25px rgba(59, 130, 246, 0.8)); }
}
.scan-radar {
    animation: pulse-glow 2s infinite ease-in-out;
}
"""

def get_3d_state_card(status, details="", reasoning=""):
    """Renders elite, custom dashboard layouts with high-fidelity visual UI elements."""
    if status == "PENDING":
        return f"""
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 30px; border-radius: 20px; background: rgba(18, 24, 38, 0.5); border: 1px dashed rgba(255, 255, 255, 0.1); text-align: center; min-height: 380px;">
            <div class="scan-radar" style="font-size: 80px; margin-bottom: 25px;">🔌</div>
            <h2 style="color: #60a5fa; font-weight: 700; margin: 0; font-size: 24px; letter-spacing: 0.5px;">SYSTEM IDLE</h2>
            <p style="color: #64748b; margin-top: 12px; font-size: 14px; max-width: 360px; line-height: 1.6;">Establish a hardware proxy routing connection by deploying a kiosk scenario signature on the control console.</p>
        </div>
        """
    elif status == "SAFE":
        return f"""
        <div style="border-radius: 24px; background: linear-gradient(135deg, rgba(6, 78, 59, 0.3) 0%, rgba(2, 44, 34, 0.6) 100%); border: 1px solid #10b981; box-shadow: 0 0 40px rgba(16, 185, 129, 0.15); padding: 35px; min-height: 380px; transition: all 0.5s ease;">
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px;">
                <div style="font-size: 45px; background: rgba(16, 185, 129, 0.15); width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 18px; border: 1px solid rgba(16, 185, 129, 0.3); filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.4));">🛡️</div>
                <div>
                    <div style="color: #34d399; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Zero-Trust Audit Verified</div>
                    <h2 style="color: #ffffff; font-weight: 800; margin: 2px 0 0 0; font-size: 26px; letter-spacing: -0.5px;">Conduit Clean</h2>
                </div>
            </div>
            <div style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 18px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.05);">
                <p style="color: #e2e8f0; margin: 0; font-size: 14px; line-height: 1.6; font-weight: 500;">{details}</p>
            </div>
            <div style="display: flex; gap: 15px; font-family: monospace; font-size: 11px; color: #a7f3d0;">
                <span style="background: rgba(16, 185, 129, 0.1); padding: 4px 10px; border-radius: 6px;">D+ WIRE: OPEN</span>
                <span style="background: rgba(16, 185, 129, 0.1); padding: 4px 10px; border-radius: 6px;">D- WIRE: OPEN</span>
                <span style="background: rgba(16, 185, 129, 0.1); padding: 4px 10px; border-radius: 6px;">VBUS: 5.0V SAFE</span>
            </div>
        </div>
        """
    else: # MALICIOUS VECTOR INTERCEPTED
        # Convert string block lines into formatted code rows for our stylized terminal display
        reasoning_rows = "".join([f"<div style='margin-bottom: 6px; color: #fca5a5;'>&gt; {line}</div>" for line in reasoning.split("-> ") if line])
        
        return f"""
        <div style="border-radius: 24px; background: linear-gradient(135deg, rgba(127, 29, 29, 0.25) 0%, rgba(69, 10, 10, 0.5) 100%); border: 1px solid #ef4444; box-shadow: 0 0 40px rgba(239, 68, 68, 0.2); padding: 35px; min-height: 380px;">
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px;">
                <div style="font-size: 45px; background: rgba(239, 68, 68, 0.15); width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 18px; border: 1px solid rgba(239, 68, 68, 0.3); filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.5));">🚨</div>
                <div>
                    <div style="color: #f87171; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Active Exploit Neutralized</div>
                    <h2 style="color: #ffffff; font-weight: 800; margin: 2px 0 0 0; font-size: 26px; letter-spacing: -0.5px;">Exploit Isolated</h2>
                </div>
            </div>
            
            <div style="background: rgba(15, 10, 10, 0.6); border-radius: 14px; border: 1px solid rgba(239, 68, 68, 0.2); font-family: 'Fira Code', monospace; font-size: 12px; padding: 20px; max-height: 180px; overflow-y: auto; box-shadow: inset 0 2px 8px rgba(0,0,0,0.5); line-height: 1.6;">
                <div style="color: #64748b; font-weight: 700; border-bottom: 1px solid rgba(239,68,68,0.15); padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Agent Mitigation Reasoning</div>
                {reasoning_rows}
                <div style="color: #ef4444; font-weight: 700; margin-top: 10px;">⚡ SYSTEM ACTION: HARDWARE RELAY SEVERED [ISOLATED MODE]</div>
            </div>
        </div>
        """

def run_guardian_pipeline(selected_scenario):
    simulator.set_scenario(selected_scenario)
    telemetry_logs = sentry.run(mcp_server)
    triage_decision = triage.evaluate(telemetry_logs, mcp_server)
    final_telemetry_logs = sentry.run(mcp_server)
    
    verdict = triage_decision["security_verdict"]
    visual_card = get_3d_state_card(verdict, triage_decision["analysis_details"], triage_decision.get("ai_analysis", ""))
    
    return (
        json_format(telemetry_logs), 
        json_format(triage_decision), 
        json_format(final_telemetry_logs), 
        visual_card
    )

def json_format(data):
    return json.dumps(data, indent=2)

# Structure the Layout Interface
with gr.Blocks(css=custom_css, title="PortGuardian AI Console") as demo:
    
    # Header Banner Area
    gr.HTML("""
    <div style="text-align: center; margin: 30px 0 50px 0;">
        <div style="background: linear-gradient(90deg, #3b82f6, #10b981); width: fit-content; margin: 0 auto; padding: 6px 14px; border-radius: 30px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: white; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(59,130,246,0.2);">
            Kaggle Capstone Execution
        </div>
        <h1 style="font-size: 42px; font-weight: 900; letter-spacing: -1px; background: linear-gradient(135deg, #ffffff 30%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 12px 0;">
            PORTGUARDIAN.AI
        </h1>
        <p style="color: #64748b; font-size: 15px; max-width: 580px; margin: 0 auto; line-height: 1.6;">
            Zero-Trust dynamic charging proxy proxying public physical threats into safe execution sandboxes managed via Model Context Protocol toolchains.
        </p>
    </div>
    """)
    
    with gr.Row(equal_height=True):
        # Console Configuration Column
        with gr.Column(scale=4, elem_classes=["cyber-card"]):
            gr.HTML("""
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #f8fafc; font-size: 16px; font-weight: 700; margin: 0;">Hardware Matrix Input</h3>
                    <p style="color: #475569; font-size: 12px; margin: 4px 0 0 0;">Inject data frames into the isolated system interface connector.</p>
                </div>
            """)
            
            scenario_input = gr.Dropdown(
                choices=["SAFE", "JUICE_JACKING_DATA", "BAD_USB_HID"],
                value="SAFE",
                label="Simulation Target Interface Profile",
                container=False
            )
            
            gr.HTML("<div style='margin-bottom: 25px;'></div>")
            scan_btn = gr.Button("⚡ Deploy & Evaluate Connection Sequence", elem_id="scan-button")
            
        # Spacing Pillar
        with gr.Column(scale=1):
            pass
            
        # Core Visualization Column
        with gr.Column(scale=6):
            visual_output_3d = gr.HTML(value=get_3d_state_card("PENDING"))
            
    gr.HTML("<div style='margin-bottom: 50px;'></div>")
    
    # Advanced Diagnostics Architecture View
    with gr.Accordion("🔍 Multi-Agent Network Backplane & Structural MCP Payloads", open=False):
        gr.HTML("<p style='color:#475569; font-size:12px; margin-bottom:15px;'>Real-time payload outputs passed internally between the Sentry, Triage decision matrix, and the virtual hardware controller:</p>")
        with gr.Row():
            log_initial = gr.Code(label="1. Sentry Sensor Node Payload Packet", language="json")
            log_triage = gr.Code(label="2. Triage Node Exploit Evaluator Output", language="json")
            log_final = gr.Code(label="3. Dynamic Post-Mitigation Validation Frame", language="json")

    # Connect UI event hooks
    scan_btn.click(
        fn=run_guardian_pipeline,
        inputs=[scenario_input],
        outputs=[log_initial, log_triage, log_final, visual_output_3d]
    )

if __name__ == "__main__":
    demo.launch()