export type ThreatLevel = 'safe' | 'elevated' | 'critical';

export type PortStatus = 'listening' | 'established' | 'blocked' | 'stealth';

export interface PortEntry {
  id: string;
  port: number;
  protocol: 'TCP' | 'UDP';
  service: string;
  status: PortStatus;
  risk: number; // 0-100
  connections: number;
}

export type AttackType =
  | 'DMA Injection'
  | 'Firmware Rootkit'
  | 'Side-Channel Leak'
  | 'USB Rubber Ducky'
  | 'PCIe Spoofing'
  | 'JTAG Unlock'
  | 'Thunderbolt DMA'
  | 'I2C Sniffing';

export interface AttackEvent {
  id: string;
  type: AttackType;
  source: string;
  target: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ts: number;
  blocked: boolean;
}

export type LogLevel = 'INFO' | 'WARN' | 'ALERT' | 'OK' | 'DEBUG';

export interface LogLine {
  id: number;
  ts: number;
  level: LogLevel;
  tag: string;
  text: string;
}

// ── Python backend (/api/scan) ────────────────────────────────────────────────

export const SCAN_SCENARIOS = [
  'JUICE_JACKING_DATA',
  'JUICE_JACKING_MALWARE',
  'DMA_ATTACK',
  'FIRMWARE_ROOTKIT',
  'SIDE_CHANNEL_LEAK',
  'USB_RUBBER_DUCKY',
  'PCIE_SPOOFING',
  'JTAG_UNLOCK',
  'THUNDERBOLT_DMA',
  'I2C_SNIFFING',
  'SAFE_DEVICE',
] as const;

export type ScanScenario = (typeof SCAN_SCENARIOS)[number];

export type ScanVerdict = 'SAFE' | 'MALICIOUS' | 'SUSPICIOUS';

export interface ScanResult {
  status: 'success' | 'error';
  verdict: ScanVerdict;
  ai_reasoning: string[];
  user_report: string;
  threat_score?: number;
  blocked?: boolean;
  attack_type?: string;
  source?: string;
  target?: string;
}

export type ScanState = 'idle' | 'scanning' | 'done' | 'error';
