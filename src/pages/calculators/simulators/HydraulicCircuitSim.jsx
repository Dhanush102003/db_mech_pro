import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import SimulatorLayout from '../../../components/calculators/SimulatorLayout';
import { COMPONENT_TYPES, getComponentsByCategory, CATEGORIES, drawComponent, getPortPosition, hitTestComponent, hitTestPort } from '../../../utils/simulation/circuitComponents';
import { simulateCircuit, generateFlowParticles, validateCircuit } from '../../../utils/simulation/circuitEngine';
import { getPresets } from '../../../utils/simulation/circuitPresets';
import { Play, Pause, RotateCcw, Trash2, Copy, RotateCw, AlertTriangle, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Zap } from 'lucide-react';

const PRESETS = getPresets();

export default function HydraulicCircuitSim() {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const animRef = useRef(0);

  // Circuit state
  const [components, setComponents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [running, setRunning] = useState(false);
  const [simStates, setSimStates] = useState({});
  const [connStates, setConnStates] = useState({});
  const [particles, setParticles] = useState([]);
  const [validation, setValidation] = useState({ status: 'ok', errors: [], warnings: [] });

  // Interaction state
  const [placingType, setPlacingType] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [expandedCats, setExpandedCats] = useState({ 'Power Source': true, 'Directional Valves': true, 'Actuators': true });

  const componentsByCategory = getComponentsByCategory();
  let nextId = useRef(100);

  // Place component on canvas click
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (placingType) {
      const def = COMPONENT_TYPES[placingType];
      const newComp = {
        id: `comp_${nextId.current++}`,
        type: placingType,
        x: x - def.width / 2,
        y: y - def.height / 2,
        rotation: 0,
        params: { ...def.defaultParams },
      };
      setComponents(prev => [...prev, newComp]);
      setPlacingType(null);
      return;
    }

    // Check port click for connecting
    for (const comp of [...components].reverse()) {
      const port = hitTestPort(comp, x, y);
      if (port) {
        if (connecting) {
          // Complete connection
          if (connecting.componentId !== port.componentId) {
            const newConn = {
              id: `conn_${nextId.current++}`,
              fromComp: connecting.componentId,
              fromPort: connecting.portId,
              toComp: port.componentId,
              toPort: port.portId,
            };
            setConnections(prev => [...prev, newConn]);
          }
          setConnecting(null);
        } else {
          // Start connection
          setConnecting(port);
        }
        return;
      }
    }

    // Check component click
    for (const comp of [...components].reverse()) {
      if (hitTestComponent(comp, x, y)) {
        // If it's a DCV, toggle position
        if (comp.type === 'DCV43' && running) {
          const positions = ['extend', 'center', 'retract'];
          const idx = positions.indexOf(comp.params.position || 'center');
          const next = positions[(idx + 1) % 3];
          setComponents(prev => prev.map(c => c.id === comp.id ? { ...c, params: { ...c.params, position: next } } : c));
          return;
        }
        if (comp.type === 'DCV32' && running) {
          setComponents(prev => prev.map(c => c.id === comp.id ? { ...c, params: { ...c.params, position: c.params.position === 'on' ? 'off' : 'on' } } : c));
          return;
        }
        setSelectedId(comp.id);
        return;
      }
    }

    setSelectedId(null);
    setConnecting(null);
  }, [components, placingType, connecting, running]);

  // Mouse move for dragging and connecting preview
  const handleCanvasMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (dragging) {
      setComponents(prev => prev.map(c =>
        c.id === dragging.id ? { ...c, x: x - dragging.offsetX, y: y - dragging.offsetY } : c
      ));
    }
  }, [dragging]);

  const handleCanvasMouseDown = useCallback((e) => {
    if (placingType || connecting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const comp of [...components].reverse()) {
      if (hitTestComponent(comp, x, y)) {
        // Check if it's a port first
        const port = hitTestPort(comp, x, y);
        if (port) return; // Let click handler deal with ports
        setDragging({ id: comp.id, offsetX: x - comp.x, offsetY: y - comp.y });
        setSelectedId(comp.id);
        return;
      }
    }
  }, [components, placingType, connecting]);

  const handleCanvasMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Delete selected component
  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setComponents(prev => prev.filter(c => c.id !== selectedId));
    setConnections(prev => prev.filter(c => c.fromComp !== selectedId && c.toComp !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  // Rotate selected component
  const rotateSelected = useCallback(() => {
    if (!selectedId) return;
    setComponents(prev => prev.map(c =>
      c.id === selectedId ? { ...c, rotation: ((c.rotation || 0) + 90) % 360 } : c
    ));
  }, [selectedId]);

  // Duplicate selected
  const duplicateSelected = useCallback(() => {
    if (!selectedId) return;
    const src = components.find(c => c.id === selectedId);
    if (!src) return;
    const newComp = { ...src, id: `comp_${nextId.current++}`, x: src.x + 40, y: src.y + 40, params: { ...src.params } };
    setComponents(prev => [...prev, newComp]);
    setSelectedId(newComp.id);
  }, [selectedId, components]);

  // Load preset
  const loadPreset = useCallback((preset) => {
    setRunning(false);
    setParticles([]);
    setSimStates({});
    setConnStates({});
    setSelectedId(null);
    setConnecting(null);
    const { components: comps, connections: conns } = preset.build();
    setComponents(comps);
    setConnections(conns);
  }, []);

  // Reset
  const resetCircuit = useCallback(() => {
    setRunning(false);
    setComponents([]);
    setConnections([]);
    setSimStates({});
    setConnStates({});
    setParticles([]);
    setSelectedId(null);
    setConnecting(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
      if (e.key === ' ') { e.preventDefault(); setRunning(r => !r); }
      if (e.key === 'd' || e.key === 'D') duplicateSelected();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteSelected, duplicateSelected]);

  // Simulation loop
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const { states, connStates: cs } = simulateCircuit(components, connections);
      setSimStates(states);
      setConnStates(cs);
      setParticles(prev => generateFlowParticles(connections, components, cs, prev));

      // Animate cylinder extension
      setComponents(prev => prev.map(comp => {
        const s = states[comp.id];
        if (!s) return comp;
        if (comp.type === 'CYLINDER_DA' || comp.type === 'CYLINDER_SA') {
          let ext = comp.params.extension || 0;
          if (s.active && s.direction === 'extend') {
            ext = Math.min(100, ext + 0.8);
          } else if (s.active && s.direction === 'retract') {
            ext = Math.max(0, ext - 0.8);
          }
          if (ext !== comp.params.extension) {
            return { ...comp, params: { ...comp.params, extension: ext } };
          }
        }
        return comp;
      }));
    }, 50);
    return () => clearInterval(interval);
  }, [running, components, connections]);

  // Validation
  useEffect(() => {
    setValidation(validateCircuit(components, connections));
  }, [components, connections]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Draw connections
      for (const conn of connections) {
        const fromComp = components.find(c => c.id === conn.fromComp);
        const toComp = components.find(c => c.id === conn.toComp);
        if (!fromComp || !toComp) continue;

        const from = getPortPosition(fromComp, conn.fromPort);
        const to = getPortPosition(toComp, conn.toPort);
        if (!from || !to) continue;

        const cs = connStates[conn.id];
        const isActive = cs && cs.active;

        // Glow effect for active lines
        if (isActive && isDark) {
          ctx.save();
          ctx.beginPath();
          const midY = (from.y + to.y) / 2;
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(from.x, midY);
          ctx.lineTo(to.x, midY);
          ctx.lineTo(to.x, to.y);
          ctx.strokeStyle = cs.pressure > 100 ? 'rgba(255, 107, 107, 0.3)' : 'rgba(96, 165, 250, 0.3)';
          ctx.lineWidth = 8;
          ctx.stroke();
          ctx.restore();
        }

        ctx.beginPath();
        // Route: simple L-shaped
        const midY = (from.y + to.y) / 2;
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(from.x, midY);
        ctx.lineTo(to.x, midY);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = isActive
          ? (cs.pressure > 100 ? '#ff6b6b' : '#60a5fa')
          : isDark ? '#4a6a8a' : '#64748b';
        ctx.lineWidth = isActive ? 3.5 : 2.5;
        ctx.stroke();

        // Pressure label on active lines
        if (isActive && cs) {
          const mx = (from.x + to.x) / 2;
          const my = midY - 10;
          ctx.fillStyle = isDark ? 'rgba(10,14,26,0.85)' : 'rgba(255,255,255,0.9)';
          const labelText = `${cs.pressure.toFixed(0)} bar`;
          const tw = ctx.measureText(labelText).width + 12;
          ctx.beginPath();
          ctx.roundRect(mx - tw/2, my - 10, tw, 18, 4);
          ctx.fill();
          ctx.strokeStyle = cs.pressure > 100 ? 'rgba(255,107,107,0.5)' : 'rgba(96,165,250,0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = cs.pressure > 100 ? '#ff6b6b' : '#60a5fa';
          ctx.font = 'bold 10px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText(labelText, mx, my + 3);
        }
      }

      // Draw flow particles
      for (const particle of particles) {
        const conn = connections.find(c => c.id === particle.connId);
        if (!conn) continue;
        const fromComp = components.find(c => c.id === conn.fromComp);
        const toComp = components.find(c => c.id === conn.toComp);
        if (!fromComp || !toComp) continue;
        const from = getPortPosition(fromComp, conn.fromPort);
        const to = getPortPosition(toComp, conn.toPort);
        if (!from || !to) continue;

        const t = particle.t;
        const midY = (from.y + to.y) / 2;
        let px, py;
        if (t < 0.33) {
          const lt = t / 0.33;
          px = from.x;
          py = from.y + (midY - from.y) * lt;
        } else if (t < 0.66) {
          const lt = (t - 0.33) / 0.33;
          px = from.x + (to.x - from.x) * lt;
          py = midY;
        } else {
          const lt = (t - 0.66) / 0.34;
          px = to.x;
          py = midY + (to.y - midY) * lt;
        }

        const color = particle.pressure > 100 ? '#ff6b6b' : '#60a5fa';
        // Outer glow
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = particle.pressure > 100 ? 'rgba(255,107,107,0.15)' : 'rgba(96,165,250,0.15)';
        ctx.fill();
        // Core particle
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      // Draw connecting preview line
      if (connecting) {
        ctx.beginPath();
        ctx.moveTo(connecting.x, connecting.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw components
      for (const comp of components) {
        drawComponent(ctx, comp, isDark, comp.id === selectedId);
      }

      animRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animRef.current);
  }, [components, connections, selectedId, connecting, mousePos, isDark, particles, connStates]);

  // Readout panel
  const readoutContent = (
    <div className="space-y-4">
      <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Live Readout
      </h3>

      {/* Validation status */}
      <div className={`p-3 rounded-xl text-xs ${validation.status === 'ok' ? 'bg-green-500/10 text-green-400' : validation.status === 'warning' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
        <div className="flex items-center gap-2 font-semibold mb-1">
          {validation.status === 'ok' ? <CheckCircle size={14} /> : validation.status === 'warning' ? <AlertTriangle size={14} /> : <AlertCircle size={14} />}
          {validation.status === 'ok' ? 'All Checks Pass' : `${validation.errors.length + validation.warnings.length} Issue(s)`}
        </div>
        {validation.errors.map((e, i) => <div key={i} className="text-red-400 ml-5">• {e}</div>)}
        {validation.warnings.map((w, i) => <div key={i} className="text-yellow-400 ml-5">• {w}</div>)}
      </div>

      {/* Component states */}
      {components.map(comp => {
        const state = simStates[comp.id];
        if (!state) return null;
        const def = COMPONENT_TYPES[comp.type];

        return (
          <motion.div
            key={comp.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 rounded-xl border ${isDark ? 'bg-white/3 border-white/5' : 'bg-gray-50 border-gray-100'} ${comp.id === selectedId ? 'ring-1 ring-[var(--color-primary)]' : ''}`}
          >
            <div className={`text-xs font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className={`w-2 h-2 rounded-full ${state.active ? 'bg-green-400' : 'bg-gray-500'}`} />
              {def?.label || comp.type}
            </div>
            <div className="space-y-1 text-xs font-mono">
              {state.pressure > 0 && (
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Pressure</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{state.pressure.toFixed(0)} bar</span>
                </div>
              )}
              {state.flow > 0 && (
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Flow</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{state.flow.toFixed(1)} L/min</span>
                </div>
              )}
              {state.force > 0 && (
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Force</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{state.force.toFixed(1)} kN</span>
                </div>
              )}
              {state.speed > 0 && (
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Speed</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{state.speed.toFixed(1)} mm/s</span>
                </div>
              )}
              {state.rpm > 0 && (
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>RPM</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{state.rpm.toFixed(0)}</span>
                </div>
              )}
              {state.reading !== undefined && (
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Reading</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{state.reading.toFixed(1)}</span>
                </div>
              )}
              {state.engagementForce > 0 && (
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Engage Force</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{state.engagementForce.toFixed(1)} kN</span>
                </div>
              )}
              {state.torqueCapacity > 0 && (
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Torque Cap.</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{state.torqueCapacity.toFixed(0)} Nm</span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {components.length === 0 && (
        <div className={`text-center py-8 text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          <Zap size={24} className="mx-auto mb-2 opacity-30" />
          Load a preset or place components to see live data
        </div>
      )}
    </div>
  );

  // Selected component parameter editor
  const selectedComp = components.find(c => c.id === selectedId);
  const selectedDef = selectedComp ? COMPONENT_TYPES[selectedComp.type] : null;

  const paramEditor = selectedComp && selectedDef ? (
    <div className="mt-4 space-y-3">
      <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Edit: {selectedDef.label}
      </h3>
      <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        {Object.entries(selectedComp.params).filter(([k]) => k !== 'extension' && k !== 'position').map(([key, val]) => (
          <div key={key} className="flex items-center justify-between gap-2 mb-2 last:mb-0">
            <label className={`text-xs capitalize ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {key.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              type="number"
              value={val}
              onChange={(e) => {
                const newVal = parseFloat(e.target.value) || 0;
                setComponents(prev => prev.map(c =>
                  c.id === selectedId ? { ...c, params: { ...c.params, [key]: newVal } } : c
                ));
              }}
              className={`w-20 px-2 py-1 rounded-lg text-xs text-right font-mono border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            />
          </div>
        ))}
      </div>
    </div>
  ) : null;

  // Sidebar - component palette
  const sidebar = (
    <div className="p-3 space-y-1">
      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Components
      </h3>

      {/* Preset circuits */}
      <div className="mb-4">
        <div
          className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[var(--color-primary)]' : 'text-[var(--color-primary-dark)]'}`}
          onClick={() => setExpandedCats(prev => ({ ...prev, presets: !prev.presets }))}
        >
          {expandedCats.presets ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          Pre-Built Circuits
        </div>
        <AnimatePresence>
          {expandedCats.presets && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              {PRESETS.map(p => (
                <div key={p.id} onClick={() => loadPreset(p)}
                  className="component-palette-item flex items-center gap-2 text-xs">
                  <span>{p.icon}</span>
                  <div>
                    <div className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{p.name}</div>
                    <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Component categories */}
      {CATEGORIES.map(cat => (
        <div key={cat}>
          <div
            className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            onClick={() => setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }))}
          >
            {expandedCats[cat] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {cat}
          </div>
          <AnimatePresence>
            {expandedCats[cat] && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                {componentsByCategory[cat]?.map(cType => (
                  <div
                    key={cType.type}
                    onClick={() => setPlacingType(cType.type)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('componentType', cType.type);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    className={`component-palette-item text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} ${placingType === cType.type ? '!bg-[var(--color-primary)]/15 !border-[var(--color-primary)]/30' : ''}`}
                  >
                    <div className="component-preview-icon">
                      <svg width="24" height="24" viewBox="0 0 50 50" fill="none" stroke={isDark ? '#00e5ff' : '#0088aa'} strokeWidth="2">
                        <path d={cType.icon} />
                      </svg>
                    </div>
                    <div>
                      <div className={`font-medium text-[11px] ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{cType.label}</div>
                      {cType.description && (
                        <div className={`text-[9px] leading-tight ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{cType.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );

  // Toolbar
  const toolbar = (
    <div className="sim-toolbar">
      <button onClick={() => setRunning(!running)} className={`sim-btn ${running ? 'active' : ''}`} title={running ? 'Stop (Space)' : 'Run (Space)'}>
        {running ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button onClick={resetCircuit} className="sim-btn" title="Reset">
        <RotateCcw size={16} />
      </button>
      <div className={`w-px h-6 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
      <button onClick={rotateSelected} className="sim-btn" title="Rotate (selected)" disabled={!selectedId}>
        <RotateCw size={16} />
      </button>
      <button onClick={duplicateSelected} className="sim-btn" title="Duplicate (D)" disabled={!selectedId}>
        <Copy size={16} />
      </button>
      <button onClick={deleteSelected} className="sim-btn" title="Delete (Del)" disabled={!selectedId}>
        <Trash2 size={16} />
      </button>
      <div className={`w-px h-6 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
      {running && <span className="neon-badge pink">● LIVE</span>}
      {placingType && (
        <span className="neon-badge">
          Placing: {COMPONENT_TYPES[placingType]?.label}
          <button onClick={() => setPlacingType(null)} className="ml-1 opacity-60 hover:opacity-100">✕</button>
        </span>
      )}
      {connecting && (
        <span className="neon-badge">
          Connecting — click target port
          <button onClick={() => setConnecting(null)} className="ml-1 opacity-60 hover:opacity-100">✕</button>
        </span>
      )}
    </div>
  );

  return (
    <SimulatorLayout
      title="Hydraulic Circuit Simulator"
      description="Drag-and-drop ISO 1219 circuit builder with animated oil flow simulation"
      sidebar={<>{sidebar}{paramEditor}</>}
      toolbar={toolbar}
      readout={readoutContent}
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${placingType ? 'canvas-placing' : 'cursor-crosshair'}`}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseDown={handleCanvasMouseDown}
        onMouseUp={handleCanvasMouseUp}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
        onDrop={(e) => {
          e.preventDefault();
          const compType = e.dataTransfer.getData('componentType');
          if (!compType) return;
          const def = COMPONENT_TYPES[compType];
          if (!def) return;
          const rect = canvasRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left - def.width / 2;
          const y = e.clientY - rect.top - def.height / 2;
          const newComp = {
            id: `comp_${nextId.current++}`,
            type: compType,
            x, y,
            rotation: 0,
            params: { ...def.defaultParams },
          };
          setComponents(prev => [...prev, newComp]);
        }}
        style={{ display: 'block' }}
      />

      {/* Hint overlay when empty */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center p-8 rounded-2xl ${isDark ? 'bg-white/3' : 'bg-black/3'}`}
          >
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className={`text-lg font-bold font-[var(--font-display)] mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Hydraulic Circuit Simulator
            </h3>
            <p className={`text-sm max-w-md ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Load a pre-built circuit from the sidebar or click a component to place it on the canvas.
              Connect ports by clicking them. Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs">Space</kbd> to run the simulation.
            </p>
          </motion.div>
        </div>
      )}
    </SimulatorLayout>
  );
}
