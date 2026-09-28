import { useState } from 'react';
import { Activity, ArrowDownToLine, CheckCheck, ChevronDown, CircleCheck, Clock3, Copy, Factory, FileText, FlaskConical, History, Layers2, MapPin, Radio, Satellite, ShieldCheck, Siren, Sparkles, TrendingUp } from 'lucide-react';
import { STATUS, SOURCE_TYPES, deviation, exportIncident, getReadings, type SourceStatus, type ThermalSource } from '../data';
import BaselineChart from './BaselineChart';

export type DetailTab = 'details' | 'evidence' | 'timeline';

interface DetailProps {
  source: ThermalSource | null;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  sent: boolean;
  onEscalate: () => void;
  onNotify: (message: string) => void;
}

function EscalationButton({ sent, onClick, compact = false }: { sent: boolean; onClick: () => void; compact?: boolean }) {
  return <button className={`${compact ? 'escalate-badge' : 'escalation-button'} ${sent ? 'is-sent' : ''}`} onClick={onClick} disabled={sent}>{sent ? <CheckCheck size={compact ? 11 : 16} /> : <Siren size={compact ? 11 : 16} />}{sent ? (compact ? 'ALERT SENT' : 'Alert sent to control room') : (compact ? 'ESCALATE' : 'Escalate to control room')}</button>;
}

function SourceDetails({ source, sent, onEscalate, onNotify }: Pick<DetailProps, 'sent' | 'onEscalate' | 'onNotify'> & { source: ThermalSource }) {
  const type = SOURCE_TYPES.find((item) => item.id === source.type)!;
  const behaviour = source.status === 'critical' ? 'anomalous' : source.status;
  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(source.id);
      onNotify(`${source.id} copied to clipboard.`);
    } catch {
      onNotify(`Clipboard unavailable. Source reference: ${source.id}`);
    }
  };

  return <div className="source-detail-content tab-content">
    <section className="source-identity" style={{ borderLeftColor: STATUS[source.status].color }}>
      <div className="identity-top"><span className="source-id"><Factory size={13} />{source.id}</span><button className="small-icon-button" title="Copy source ID" aria-label="Copy source ID" onClick={copyId}><Copy size={13} /></button></div>
      <div className="identity-badges"><span className="type-badge" style={{ background: type.color }}><Factory size={10} />{type.label.toUpperCase()}</span><span className={`filled-status ${behaviour}`}><Activity size={10} />{STATUS[behaviour].label.toUpperCase()}</span>{source.status !== 'normal' && <EscalationButton compact sent={sent} onClick={onEscalate} />}</div>
      <dl className="identity-grid">
        <div><dt>Location</dt><dd>{source.name}</dd></div><div><dt>Coordinates</dt><dd>{source.lat.toFixed(2)}&deg;N <span className="middot">&middot;</span> {source.lon.toFixed(2)}&deg;E</dd></div>
        <div><dt>Industry</dt><dd>{source.industry}</dd></div><div><dt>First seen</dt><dd>90 days ago</dd></div>
        <div><dt>Detections</dt><dd>{source.observations} <span>observations</span></dd></div><div><dt>Last updated</dt><dd className="last-updated"><i />{source.updated}</dd></div>
      </dl>
    </section>
    <BaselineChart source={source} />
    <div className="quick-stats"><div><strong className="red-text">{(source.frp / source.baseline).toFixed(1)}<span>x</span></strong><span>Baseline deviation</span></div><div><strong className="orange-text">{source.status === 'normal' ? '0' : '6'} <span>days</span></strong><span>Elevated duration</span></div><div><strong className="blue-text">{source.confidence}<span>%</span><Sparkles size={12} /></strong><span>AI confidence</span></div></div>
  </div>;
}

function EvidenceChain({ source, sent, onEscalate, onNotify }: { source: ThermalSource; sent: boolean; onEscalate: () => void; onNotify: (message: string) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const evidence = [
    { title: 'Industrial Boundary Match', weight: 35, text: source.type === 'industrial' || source.type === 'flare' ? 'Source confirmed inside OSM refinery polygon boundary.' : 'Source location checked against nearby industrial boundaries.', tag: 'OSM Overpass API', color: '#2e7d32', icon: CircleCheck, detail: 'Spatial analysis uses point-in-polygon matching. Detection coordinates are compared with the mapped industrial footprint and a 375 m VIIRS uncertainty buffer.' },
    { title: 'FRP Baseline Deviation', weight: 30, text: `Current FRP ${source.frp} MW vs. 90-day baseline ${source.baseline} MW.`, tag: 'NASA FIRMS VIIRS', color: '#d32f2f', icon: TrendingUp, detail: `The site-specific rolling baseline is ${source.baseline} MW. This observation is ${Math.abs(deviation(source))}% ${deviation(source) >= 0 ? 'above' : 'below'} the baseline after cloud-masked observations are excluded.` },
    { title: 'Land Cover Context', weight: 15, text: `ESA WorldCover confirms ${source.type === 'forest' ? 'Tree Cover' : source.type === 'agricultural' ? 'Cropland' : 'Industrial / Built-up'} surface type.`, tag: 'ESA WorldCover 10m', color: '#1565c0', icon: Layers2, detail: 'The 10 m land-cover classification provides environmental context for source attribution. Adjacent pixels are included to account for mixed land use.' },
    { title: 'Persistence Pattern Change', weight: 12, text: source.status === 'normal' ? 'Detection frequency remains consistent with baseline pattern.' : 'Detection frequency increased 250% from baseline pattern.', tag: 'FIRMS Historical Archive', color: '#e65100', icon: Clock3, detail: 'Repeated day and night detections have been compared with the previous 90-day observation frequency. The pattern is sustained across consecutive satellite passes.' },
    { title: 'TROPOMI Atmospheric Signal', weight: 8, text: `SO2 concentration ${source.status === 'normal' ? 'within' : 'elevated above'} regional baseline.`, tag: 'Sentinel-5P TROPOMI', color: '#8065af', icon: FlaskConical, detail: 'Regional sulfur dioxide column density supports the thermal anomaly assessment. Wind transport, cloud cover, and the larger sensor footprint introduce uncertainty.' },
  ];

  return <div className="evidence-content tab-content">
    <div className="tab-section-heading"><div><h3>Evidence chain</h3><p>{source.id} <span>&middot;</span> {source.shortName}</p></div><span className={`quality-badge ${source.confidence < 80 ? 'moderate' : ''}`}><ShieldCheck size={12} />{source.confidence < 80 ? 'MODERATE' : 'STRONG'}</span></div>
    <div className="evidence-list">{evidence.map((item, index) => <button key={item.title} className={`evidence-item ${expanded === index ? 'is-expanded' : ''}`} style={{ borderLeftColor: item.color }} aria-expanded={expanded === index} onClick={() => setExpanded(expanded === index ? null : index)}>
      <div className="evidence-item-heading"><item.icon size={15} style={{ color: item.color }} /><h4>{item.title}</h4><span style={{ color: item.color }}>+{item.weight}%</span></div><p>{item.text}</p>
      {index === 1 && <div className="deviation-meter"><i style={{ width: `${Math.min(100, Math.abs(deviation(source)) / 4)}%` }} /><span>{deviation(source)}% deviation</span></div>}
      {index === 4 && <p className="evidence-caveat">Supporting evidence only &middot; Not ground truth confirmation</p>}
      <div className="evidence-source"><span>{item.tag}</span><ChevronDown size={12} /></div>
      {expanded === index && <p className="evidence-expanded-text">{item.detail}</p>}
    </button>)}</div>
    <div className="overall-confidence"><div><h4>Overall confidence</h4><strong>{source.confidence}<span>%</span></strong></div><div className="confidence-meter" role="progressbar" aria-label="Overall evidence confidence" aria-valuenow={source.confidence} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${source.confidence}%` }} /></div><p>Based on 5 independent evidence factors</p></div>
    <div className="evidence-actions"><EscalationButton sent={sent} onClick={onEscalate} /><button className="outline-button report-button" onClick={() => { exportIncident(source); onNotify(`Incident report generated for ${source.id}.`); }}><FileText size={15} />Generate incident report<ArrowDownToLine size={14} /></button><span className="demo-action-note">Demo environment. No external alerts are transmitted.</span></div>
  </div>;
}

function Timeline({ source, onNotify }: { source: ThermalSource; onNotify: (message: string) => void }) {
  const values = getReadings(source).slice(-6);
  const getState = (index: number): SourceStatus => {
    if (source.status === 'normal') return 'normal';
    if (index < 3) return 'normal';
    if (index === 3) return 'elevated';
    if (index === 4) return source.status === 'review' ? 'review' : 'anomalous';
    return source.status;
  };
  const notes = ['Within baseline range', 'Within baseline range', 'Within baseline range', `FRP ${(values[3] / source.baseline).toFixed(1)}x above baseline. Watch initiated.`, `FRP ${(values[4] / source.baseline).toFixed(1)}x above baseline. TROPOMI triggered.`, `FRP ${(values[5] / source.baseline).toFixed(1)}x above baseline. ${source.status === 'critical' ? 'ESCALATE alert sent.' : source.status === 'normal' ? 'Routine monitoring continues.' : 'Review initiated.'}`];

  return <div className="timeline-content tab-content"><div className="tab-section-heading"><div><h3>Incident evolution timeline</h3><p>{source.id} <span>&middot;</span> Last 6 days</p></div><History size={19} className="blue-text" /></div><div className="timeline-intro"><Satellite size={14} />6 observations across 2 satellite instruments</div>
    <ol className="incident-timeline">{values.map((value, index) => { const status = getState(index); return <li key={index} className={`${index === 5 ? 'today-entry' : ''} ${status}`}><span className="timeline-node" style={{ background: STATUS[status].color }}>{index === 5 ? <Radio size={10} /> : null}</span><div className="timeline-date">Aug {20 + index}, 2025{index === 5 && <span>TODAY</span>}</div><div className="timeline-reading"><span className={`status-badge ${status}`}><span className="badge-dot" />{STATUS[status].label.toUpperCase()}</span><strong>{value} <span>MW</span></strong><span className="satellite-label"><Satellite size={10} />{index === 2 ? 'MODIS' : 'VIIRS'}</span></div><p>{source.status === 'normal' ? 'Within baseline range. Routine monitoring continues.' : notes[index]}</p></li>; })}</ol>
    <button className="outline-button report-button" onClick={() => { exportIncident(source); onNotify('Incident timeline included in downloaded report.'); }}><ArrowDownToLine size={14} />Download incident timeline</button><p className="timeline-footer"><Clock3 size={11} />All observations shown in Indian Standard Time (IST)</p>
  </div>;
}

export default function DetailPanel({ source, tab, onTabChange, sent, onEscalate, onNotify }: DetailProps) {
  const tabs: { id: DetailTab; label: string; icon: typeof Factory }[] = [{ id: 'details', label: 'Source Details', icon: Factory }, { id: 'evidence', label: 'Evidence Chain', icon: ShieldCheck }, { id: 'timeline', label: 'Timeline', icon: History }];
  return <section className="detail-panel panel" id="source-detail-panel" aria-label="Source investigation">
    <div className="detail-tabs" role="tablist" aria-label="Source information">{tabs.map((item, index) => <button key={item.id} id={`tab-${item.id}`} role="tab" aria-selected={tab === item.id} aria-controls={`panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} className={tab === item.id ? 'active' : ''} onClick={() => onTabChange(item.id)} onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : 2)) % 3]; onTabChange(next.id); document.getElementById(`tab-${next.id}`)?.focus(); } }}><item.icon size={13} />{item.label}</button>)}</div>
    <div className="detail-scroll" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} key={`${source?.id}-${tab}`}>
      {!source ? <div className="detail-empty"><MapPin size={30} /><h3>Select a thermal source</h3><p>Choose a marker on the map to investigate its readings, evidence, and incident history.</p></div> : tab === 'details' ? <SourceDetails source={source} sent={sent} onEscalate={onEscalate} onNotify={onNotify} /> : tab === 'evidence' ? <EvidenceChain source={source} sent={sent} onEscalate={onEscalate} onNotify={onNotify} /> : <Timeline source={source} onNotify={onNotify} />}
    </div>
  </section>;
}