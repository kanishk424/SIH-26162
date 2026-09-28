import { useEffect, useRef, useState } from 'react';
import { Activity, BellRing, Check, CircleHelp, Eye, Factory, Flame, Leaf, Pickaxe, RotateCcw, Satellite, SlidersHorizontal, Sprout, UsersRound, X } from 'lucide-react';
import { SOURCE_TYPES, STATUS, type Filters, type SourceStatus, type SourceType } from '../data';
import { useFocusTrap } from '../utils/useFocusTrap';

interface SidebarProps {
  draft: Filters;
  applied: Filters;
  open: boolean;
  onClose: () => void;
  onChange: (filters: Filters) => void;
  onApply: () => void;
  onReset: () => void;
  onQuickFilter: (status?: SourceStatus) => void;
}

const TYPE_ICONS = { industrial: Factory, flare: Flame, forest: Leaf, agricultural: Sprout, mining: Pickaxe, unknown: CircleHelp };

export default function Sidebar({ draft, applied, open, onClose, onChange, onApply, onReset, onQuickFilter }: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);
  const toggleType = (type: SourceType) => onChange({ ...draft, types: draft.types.includes(type) ? draft.types.filter((item) => item !== type) : [...draft.types, type] });
  const toggleStatus = (status: SourceStatus) => onChange({ ...draft, statuses: draft.statuses.includes(status) ? draft.statuses.filter((item) => item !== status) : [...draft.statuses, status] });
  useFocusTrap(sidebarRef, mobile && open, onClose);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return <>
    {open && <div className="sidebar-backdrop" onClick={onClose} />}
    <aside ref={sidebarRef} className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Monitoring overview and source filters" role={mobile ? 'dialog' : undefined} aria-modal={mobile && open ? true : undefined} inert={mobile && !open}>
      <div className="sidebar-content"><div className="sidebar-heading"><span>MONITORING OVERVIEW</span><Activity size={14} /><button className="sidebar-close icon-button" aria-label="Close filters" data-initial-focus onClick={onClose}><X size={17} /></button></div>
        <div className="overview-stats"><button className="overview-stat" onClick={() => onQuickFilter()} title="Show all mapped sources"><Satellite size={16} /><strong className="blue-text">847</strong><span>Total sources</span></button><button className={`overview-stat critical-stat ${applied.statuses.length === 1 && applied.statuses[0] === 'critical' ? 'stat-selected' : ''}`} onClick={() => onQuickFilter('critical')} title="Filter critical sources"><BellRing size={16} /><strong className="red-text">3</strong><span>Critical alerts</span></button><button className="overview-stat" onClick={() => onQuickFilter('normal')} title="Filter normal monitoring sources"><Eye size={16} /><strong className="green-text">412</strong><span>Monitoring</span></button><button className="overview-stat" onClick={() => onQuickFilter('review')} title="Filter sources needing review"><UsersRound size={16} /><strong className="orange-text">28</strong><span>Needs review</span></button></div>
        <div className="filters-divider" />
        <section className="filter-section source-type-section"><h3>Source type</h3><div className="filter-chip-grid">{SOURCE_TYPES.map((type) => { const Icon = TYPE_ICONS[type.id]; const isSelected = draft.types.includes(type.id); return <button key={type.id} className={`type-chip ${isSelected ? 'selected' : ''}`} aria-pressed={isSelected} style={{ color: isSelected ? '#fff' : type.color, background: isSelected ? type.color : '#fff', borderColor: isSelected ? type.color : `${type.color}70` }} onClick={() => toggleType(type.id)}><Icon size={13} />{type.label}{isSelected && <Check size={11} />}</button>; })}</div></section>
        <section className="filter-section behaviour-section"><h3>Behaviour state</h3><div className="behaviour-chips">{(Object.keys(STATUS) as SourceStatus[]).map((status) => { const isSelected = draft.statuses.includes(status); return <button key={status} className={`behaviour-chip ${isSelected ? 'selected' : ''}`} aria-pressed={isSelected} style={{ color: STATUS[status].color, background: isSelected ? STATUS[status].background : '#fff', borderColor: isSelected ? `${STATUS[status].color}25` : `${STATUS[status].color}70` }} onClick={() => toggleStatus(status)}><i style={{ background: STATUS[status].color }} />{STATUS[status].label}{isSelected && <Check size={10} />}</button>; })}</div></section>
        <section className="filter-section frp-section"><div className="slider-heading"><h3>FRP range <span>(MW)</span></h3><span>{draft.minFrp} - {draft.maxFrp === 500 ? '500+' : draft.maxFrp}</span></div><div className="dual-range"><div className="range-rail" /><div className="range-selection" style={{ left: `${draft.minFrp / 5}%`, right: `${100 - draft.maxFrp / 5}%` }} /><input type="range" min="0" max="500" step="10" value={draft.minFrp} aria-label="Minimum fire radiative power in megawatts" onChange={(event) => onChange({ ...draft, minFrp: Math.min(Number(event.target.value), draft.maxFrp - 10) })} /><input type="range" min="0" max="500" step="10" value={draft.maxFrp} aria-label="Maximum fire radiative power. 500 includes values above 500 megawatts" onChange={(event) => onChange({ ...draft, maxFrp: Math.max(Number(event.target.value), draft.minFrp + 10) })} /></div><div className="range-endpoints"><span>0 MW</span><span title="Includes sources above 500 MW">500+ MW</span></div></section>
        <section className="filter-section confidence-section"><div className="slider-heading"><h3>Min confidence</h3><span className="confidence-value">{draft.confidence}%</span></div><input className="confidence-range" type="range" min="0" max="100" step="1" value={draft.confidence} style={{ background: `linear-gradient(to right, #2474c7 ${draft.confidence}%, #e6edf4 ${draft.confidence}%)` }} aria-label="Minimum detection confidence" onChange={(event) => onChange({ ...draft, confidence: Number(event.target.value) })} /><div className="range-endpoints"><span>0%</span><span>100%</span></div></section>
        <div className="filter-actions"><button className="primary-button" onClick={onApply}><SlidersHorizontal size={14} />Apply filters{dirty && <i />}</button><button className="outline-button reset-button" onClick={onReset}><RotateCcw size={13} />Reset filters</button></div>
      </div>
      <div className="sidebar-bottom"><div><span><Satellite size={14} />Satellite connection</span><span className="connection-status"><i />Online</span></div><p>NASA FIRMS <span>&middot;</span> VIIRS &amp; MODIS</p><div className="demo-workspace"><span>DEMO WORKSPACE</span><span>v1.0</span></div></div>
    </aside>
  </>;
}