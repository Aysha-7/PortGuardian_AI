import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Shield,
  Cpu,
  Activity,
  AlertTriangle,
  Network,
  Lock,
  Gauge as GaugeIcon,
  Bug,
} from 'lucide-react';
import Header from './components/Header';
import Gauge from './components/Gauge';
import StatCard from './components/StatCard';
import AttackCard from './components/AttackCard';
import TerminalLog from './components/TerminalLog';
import PortTable from './components/PortTable';
import ThreatTicker from './components/ThreatTicker';
import ThreatRadar from './components/ThreatRadar';
import ScanPanel from './components/ScanPanel';
import { useScan } from './hooks/useScan';
import type {
  AttackEvent,
  AttackType,
  LogLine,
  LogLevel,
  PortEntry,
  ScanResult,
  ThreatLevel,
} from './types';

// ── Simulation data ────────────────────────────────────────────────────────────

const ATTACK_TYPES: AttackType[] = [
  'DMA Injection',
  'Firmware Rootkit',
  'Side-Channel Leak',
  'USB Rubber Ducky',
  'PCIe Spoofing',
  'JTAG Unlock',
  'Thunderbolt DMA',
  'I2C Sniffing',
];

const SERVICES = ['SSH', 'HTTPS', 'DNS', 'SMB', 'RDP', 'IPMI', 'BMC', 'iSCSI', 'Redis', 'gRPC'];
const SOURCES = ['10.0.4.21', '172.16.8.9', 'fe80::1a', '192.168.2.77', '10.0.9.3', 'fd00::7c'];
const TARGETS = ['PCIe-0', 'USB-C.2', 'JTAG-IF', 'I2C-BUS', 'SPI-FLASH', 'DMA-CTL'];

const LOG_TAGS = ['GUARDIAN', 'KERNEL', 'IOMMU', 'TPM', 'AI.CORE', 'NETMON', 'FIRMWARE'];

const LOG_TEMPLATES: { level: LogLevel; text: string }[] = [
  { level: 'INFO', text: 'IOMMU isolation groups verified for all PCIe endpoints' },
  { level: 'OK', text: 'TPM2.0 attestation quote matched reference baseline' },
  { level: 'DEBUG', text: 'Scanning JTAG interface lock state…' },
  { level: 'WARN', text: 'Unrecognized USB descriptor on port USBC.2 — quarantined' },
  { level: 'ALERT', text: 'DMA transaction blocked: device 03:00.0 failed ACS check' },
  { level: 'INFO', text: 'Secure boot chain integrity: PASS' },
  { level: 'OK', text: 'Firmware signature valid — vendor key ring trusted' },
  { level: 'WARN', text: 'Side-channel timing variance detected on core 7' },
  { level: 'ALERT', text: 'JTAG unlock attempt — physical probe asserted' },
  { level: 'INFO', text: 'AI model retrained on 14,302 new hardware signatures' },
  { level: 'DEBUG', text: 'Polling SPI flash hash at 1Hz' },
  { level: 'OK', text: 'Memory encryption (TSME) active across all DIMMs' },
  { level: 'ALERT', text: 'Thunderbolt device spoofing controller identity' },
  { level: 'INFO', text: 'Port stealth mode engaged on 4 unused interfaces' },
];

let logId = 0;
let attackId = 0;
const rand = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function makePort(): PortEntry {
  const status = rand(['listening', 'established', 'blocked', 'stealth'] as const);
  const risk =
    status === 'blocked' ? randInt(70, 98) : status === 'stealth' ? randInt(2, 12) : randInt(5, 60);
  return {
    id: Math.random().toString(36).slice(2, 8),
    port: randInt(1, 65535),
    protocol: Math.random() > 0.3 ? 'TCP' : 'UDP',
    service: rand(SERVICES),
    status,
    risk,
    connections: randInt(0, 240),
  };
}

function makeAttack(overrides?: Partial<AttackEvent>): AttackEvent {
  const severity = rand(['low', 'medium', 'high', 'critical'] as const);
  return {
    id: (attackId++).toString(36).padStart(6, '0'),
    type: rand(ATTACK_TYPES),
    source: rand(SOURCES),
    target: rand(TARGETS),
    severity,
    ts: Date.now(),
    blocked: Math.random() > 0.25,
    ...overrides,
  };
}

function makeLog(overrides?: Partial<LogLine>): LogLine {
  const t = rand(LOG_TEMPLATES);
  return {
    id: logId++,
    ts: Date.now(),
    level: t.level,
    tag: rand(LOG_TAGS),
    text: t.text,
    ...overrides,
  };
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${d}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// Map a scan result into dashboard state mutations
function applyResultToState(
  data: ScanResult,
  setLogs: React.Dispatch<React.SetStateAction<LogLine[]>>,
  setAttacks: React.Dispatch<React.SetStateAction<AttackEvent[]>>,
  setThreat: React.Dispatch<React.SetStateAction<number>>,
  setIntegrity: React.Dispatch<React.SetStateAction<number>>,
  setShield: React.Dispatch<React.SetStateAction<number>>,
  setBlockedCount: React.Dispatch<React.SetStateAction<number>>,
  setVulnCount: React.Dispatch<React.SetStateAction<number>>,
) {
  // Inject ai_reasoning lines into the terminal
  const reasoningLines: LogLine[] = data.ai_reasoning.map((text) =>
    makeLog({
      level: data.verdict === 'SAFE' ? 'OK' : data.verdict === 'SUSPICIOUS' ? 'WARN' : 'ALERT',
      tag: 'AI.CORE',
      text,
    }),
  );

  // Inject user_report as a final INFO/ALERT summary line
  if (data.user_report) {
    const summaryLevel: LogLevel = data.verdict === 'SAFE' ? 'OK' : data.verdict === 'SUSPICIOUS' ? 'WARN' : 'ALERT';
    reasoningLines.push(
      makeLog({ level: summaryLevel, tag: 'REPORT', text: `[VERDICT: ${data.verdict}] ${data.user_report}` }),
    );
  }

  setLogs((prev) => [...prev, ...reasoningLines].slice(-120));

  // Inject as an attack event when malicious/suspicious
  if (data.verdict !== 'SAFE') {
    const attackTypeRaw = data.attack_type ?? 'DMA Injection';
    const knownTypes = ATTACK_TYPES as readonly string[];
    const attackType: AttackType = knownTypes.includes(attackTypeRaw)
      ? (attackTypeRaw as AttackType)
      : rand(ATTACK_TYPES);

    const newAttack = makeAttack({
      type: attackType,
      source: data.source ?? rand(SOURCES),
      target: data.target ?? rand(TARGETS),
      severity: data.verdict === 'MALICIOUS' ? 'critical' : 'high',
      blocked: data.blocked ?? data.verdict === 'SUSPICIOUS',
      ts: Date.now(),
    });
    setAttacks((prev) => [newAttack, ...prev].slice(0, 6));
    if (newAttack.blocked) setBlockedCount((v) => v + 1);
    setVulnCount((v) => Math.min(12, v + (data.verdict === 'MALICIOUS' ? 2 : 1)));
  } else {
    setVulnCount((v) => Math.max(0, v - 1));
  }

  // Drive the threat gauge from threat_score if provided, else derive from verdict
  const score =
    data.threat_score != null
      ? data.threat_score
      : data.verdict === 'MALICIOUS'
        ? randInt(70, 95)
        : data.verdict === 'SUSPICIOUS'
          ? randInt(35, 55)
          : randInt(5, 20);

  setThreat(score);
  setIntegrity(data.verdict === 'MALICIOUS' ? randInt(60, 80) : randInt(88, 100));
  setShield(data.verdict === 'SAFE' ? randInt(90, 100) : randInt(68, 88));
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function App() {
  const [ports, setPorts] = useState<PortEntry[]>(() => Array.from({ length: 8 }, makePort));
  const [attacks, setAttacks] = useState<AttackEvent[]>(() => Array.from({ length: 4 }, makeAttack));
  const [logs, setLogs] = useState<LogLine[]>(() => Array.from({ length: 14 }, makeLog));
  const [integrity, setIntegrity] = useState(98);
  const [shield, setShield] = useState(94);
  const [threat, setThreat] = useState(12);
  const [aiLoad, setAiLoad] = useState(67);
  const [blockedCount, setBlockedCount] = useState(1287);
  const [scannedCount, setScannedCount] = useState(48213);
  const [vulnCount, setVulnCount] = useState(3);
  const startTime = useRef(Date.now());

  const { state: scanState, result: scanResult, error: scanError, scan, reset: scanReset } = useScan();

  // When a scan completes successfully, apply the result to dashboard state
  const handleScan = useCallback(
    async (scenario: Parameters<typeof scan>[0]) => {
      setLogs((prev) => [
        ...prev,
        makeLog({ level: 'INFO', tag: 'GUARDIAN', text: `Initiating multi-agent scan: scenario=${scenario}` }),
      ]);
      const data = await scan(scenario);
      if (data) {
        applyResultToState(
          data,
          setLogs,
          setAttacks,
          setThreat,
          setIntegrity,
          setShield,
          setBlockedCount,
          setVulnCount,
        );
      } else {
        setLogs((prev) => [
          ...prev,
          makeLog({ level: 'WARN', tag: 'GUARDIAN', text: 'Scan failed — backend unreachable. Check Python server.' }),
        ]);
      }
    },
    [scan],
  );

  // Live telemetry drift (only when no scan is running)
  useEffect(() => {
    const id = setInterval(() => {
      if (scanState === 'scanning') return;
      setIntegrity((v) => Math.max(85, Math.min(100, v + randInt(-1, 1))));
      setShield((v) => Math.max(80, Math.min(100, v + randInt(-2, 2))));
      setThreat((v) => Math.max(0, Math.min(100, v + randInt(-6, 6))));
      setAiLoad((v) => Math.max(30, Math.min(99, v + randInt(-4, 4))));
      setScannedCount((v) => v + randInt(3, 18));
    }, 1800);
    return () => clearInterval(id);
  }, [scanState]);

  // Background attack simulation
  useEffect(() => {
    const id = setInterval(() => {
      if (scanState === 'scanning') return;
      const a = makeAttack();
      setAttacks((prev) => [a, ...prev].slice(0, 6));
      if (a.blocked) setBlockedCount((v) => v + 1);
      setVulnCount((v) => Math.max(0, Math.min(12, v + randInt(-1, 1))));
    }, 4200);
    return () => clearInterval(id);
  }, [scanState]);

  // Background log stream
  useEffect(() => {
    const id = setInterval(() => {
      if (scanState === 'scanning') return;
      setLogs((prev) => [...prev, makeLog()].slice(-120));
    }, 1500);
    return () => clearInterval(id);
  }, [scanState]);

  // Port table refresh
  useEffect(() => {
    const id = setInterval(() => {
      setPorts((prev) => {
        const next = [...prev];
        const i = randInt(0, next.length - 1);
        next[i] = makePort();
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const level: ThreatLevel = useMemo(() => {
    if (threat >= 60) return 'critical';
    if (threat >= 30) return 'elevated';
    return 'safe';
  }, [threat]);

  const uptime = formatUptime(Date.now() - startTime.current);

  const tickerItems = useMemo(
    () =>
      attacks.map(
        (a) =>
          `${a.type} :: ${a.source} → ${a.target} :: ${a.severity.toUpperCase()} :: ${
            a.blocked ? 'BLOCKED' : 'ACTIVE'
          }`,
      ),
    [attacks],
  );

  return (
    <div className="crt-backdrop scanlines relative min-h-screen text-slate-200">
      <div className="relative z-10 mx-auto max-w-[1500px] px-4 pb-10 md:px-6">
        <Header
          level={level}
          uptime={uptime}
          aiStatus={scanState === 'scanning' ? 'SCANNING' : 'ONLINE'}
        />
        <ThreatTicker items={tickerItems} />

        {/* Scan panel — primary interaction, full width */}
        <section className="mt-5">
          <ScanPanel
            state={scanState}
            result={scanResult}
            error={scanError}
            onScan={handleScan}
            onReset={scanReset}
          />
        </section>

        {/* Top stat strip */}
        <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <StatCard
            icon={Shield}
            label="Threats Blocked"
            value={blockedCount.toLocaleString()}
            delta="last 24h"
            accent="green"
          />
          <StatCard
            icon={Bug}
            label="Active Vulns"
            value={vulnCount}
            delta="hardware surface"
            accent="red"
          />
          <StatCard
            icon={Network}
            label="Packets Scanned"
            value={scannedCount.toLocaleString()}
            delta="real-time"
            accent="cyan"
          />
          <StatCard
            icon={Cpu}
            label="Endpoints"
            value={ports.length}
            delta="monitored"
            accent="amber"
          />
          <StatCard
            icon={Lock}
            label="Secure Boot"
            value="PASS"
            delta="TPM2.0 verified"
            accent="green"
          />
          <StatCard
            icon={Activity}
            label="AI Inference"
            value={`${aiLoad}%`}
            delta="neural engine"
            accent="cyan"
          />
        </section>

        {/* Main grid */}
        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Gauges */}
          <div className="bracket-corners relative overflow-hidden rounded-md border border-ink-600/70 bg-ink-850/60 p-5 shadow-inset-line backdrop-blur-sm lg:col-span-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xs font-bold tracking-[0.2em] text-slate-300">
                <GaugeIcon className="h-4 w-4 text-neon-cyan" />
                SYSTEM VITALS
              </h2>
              <span className="text-[10px] text-ink-500">LIVE TELEMETRY</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Gauge value={integrity} label="HW Integrity" sublabel="TPM / IOMMU" variant="green" />
              <Gauge value={shield} label="Shield Index" sublabel="Active defense" variant="cyan" />
              <Gauge
                value={threat}
                label="Threat Level"
                sublabel="Live attacks"
                variant={level === 'critical' ? 'red' : level === 'elevated' ? 'amber' : 'green'}
              />
              <Gauge value={aiLoad} label="AI Core Load" sublabel="Inference engine" variant="amber" />
            </div>
          </div>

          {/* Radar */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            <div className="bracket-corners relative overflow-hidden rounded-md border border-ink-600/70 bg-ink-850/60 p-5 shadow-inset-line backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-xs font-bold tracking-[0.2em] text-slate-300">
                  <Network className="h-4 w-4 text-neon-cyan" />
                  PERIMETER SCAN
                </h2>
                <span className="text-[10px] text-neon-cyan">SWEEP ACTIVE</span>
              </div>
              <div className="flex justify-center">
                <ThreatRadar />
              </div>
            </div>
          </div>

          {/* Active attacks */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-neon-red" />
              <h2 className="font-display text-xs font-bold tracking-[0.2em] text-slate-300">
                ACTIVE THREATS
              </h2>
              <span className="ml-auto rounded border border-neon-red/40 bg-neon-red/5 px-1.5 py-0.5 text-[10px] font-bold text-neon-red">
                {attacks.filter((a) => !a.blocked).length} LIVE
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {attacks.slice(0, 4).map((a) => (
                <AttackCard key={a.id} attack={a} />
              ))}
            </div>
          </div>
        </section>

        {/* Bottom grid: ports + terminal */}
        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="mb-2 flex items-center gap-2">
              <Network className="h-4 w-4 text-neon-cyan" />
              <h2 className="font-display text-xs font-bold tracking-[0.2em] text-slate-300">
                PORT MONITOR
              </h2>
              <span className="ml-auto text-[10px] text-ink-500">{ports.length} interfaces</span>
            </div>
            <PortTable ports={ports} />
          </div>
          <div className="lg:col-span-7">
            <div className="mb-2 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-neon-green" />
              <h2 className="font-display text-xs font-bold tracking-[0.2em] text-slate-300">
                AI CORE LOG STREAM
              </h2>
            </div>
            <div className="h-[420px]">
              <TerminalLog lines={logs} />
            </div>
          </div>
        </section>

        <footer className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-ink-700/60 pt-4 text-[10px] uppercase tracking-[0.2em] text-ink-600 md:flex-row">
          <span>PortGuardian AI v4.2.1 // Hardware Security Suite</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
            SECURE CHANNEL // AES-256-GCM
          </span>
        </footer>
      </div>
    </div>
  );
}
