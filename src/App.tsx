import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowRight, Bell, Check, CheckCheck, CircleCheck, Clock3, Flame, Info, Radio, RefreshCw, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import ThermalMap from './components/ThermalMap';
import DetailPanel, { type DetailTab } from './components/DetailPanel';
import { DEFAULT_FILTERS, RECENT_ALERTS, SOURCES, STATUS, downloadFile, type Filters, type Period, type Region, type SourceStatus, type ThermalSource } from './data';

function filterSources(filters: Filters, region: Region, period: Period) {
  return SOURCES.filter((source) =>
    (region === 'All India' || region.startsWith(source.state)) &&
    filters.types.includes(source.type) && filters.statuses.includes(source.status) &&
    source.frp >= filters.minFrp && (filters.maxFrp === 500 || source.frp <= filters.maxFrp) &&
    source.confidence >= filters.confidence &&
    source.hoursAgo <= (period === 'Last 24 Hours' ? 24 : period === 'Last 7 Days' ? 168 : 720),
  );
}

function Modal({ title, subtitle, children, onClose, className = '' }: { title: string; subtitle: string; children: ReactNode; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog ref={ref} className={`app-modal ${className}`} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} aria-labelledby="modal-title"><div className="modal-heading"><div><h2 id="modal-title">{title}</h2><p>{subtitle}</p></div><button className="icon-button" aria-label="Close dialog" onClick={onClose} autoFocus><X size={19} /></button></div>{children}</dialog>;
}

export default function App() {
  const [region, setRegion] = useState<Region>('Gujarat, India');
  const [period, setPeriod] = useState<Period>('Last 7 Days');
  const [draftFilters, setDraftFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<ThermalSource | null>(SOURCES[0]);
  const [tab, setTab] = useState<DetailTab>('details');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState<'alerts' | 'about' | null>(null);
  const [alertSearch, setAlertSearch] = useState('');
  const [alertStatus, setAlertStatus] = useState('all');
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const [escalated, setEscalated] = useState<string[]>([]);
  const [sentSource, setSentSource] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState('14:32 IST');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const escalationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleSources = useMemo(() => filterSources(appliedFilters, region, period), [appliedFilters, region, period]);

  useEffect(() => {
    if (!visibleSources.some((source) => source.id === selected?.id)) setSelected(visibleSources[0] || null);
  }, [visibleSources, selected?.id]);

  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (escalationTimer.current) clearTimeout(escalationTimer.current);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);

  const notify = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 4800);
  };
  const applyFilters = () => {
    setAppliedFilters(draftFilters); setSidebarOpen(false);
    const count = filterSources(draftFilters, region, period).length;
    notify(`Filters applied. ${count} matching thermal ${count === 1 ? 'source' : 'sources'} on the map.`);
  };
  const resetFilters = () => { setDraftFilters(DEFAULT_FILTERS); setAppliedFilters(DEFAULT_FILTERS); notify('All source filters have been reset.'); };
  const quickFilter = (status?: SourceStatus) => {
    const filters = { ...DEFAULT_FILTERS, statuses: status ? [status] : DEFAULT_FILTERS.statuses };
    setDraftFilters(filters); setAppliedFilters(filters);
    notify(status ? `Showing ${STATUS[status].label.toLowerCase()} thermal sources.` : 'Showing all source types and behaviour states.');
  };
  const viewAlert = (source: ThermalSource) => {
    setSidebarOpen(false);
    setDraftFilters(DEFAULT_FILTERS); setAppliedFilters(DEFAULT_FILTERS);
    setRegion(`${source.state}, India` as Region);
    setPeriod('Last 7 Days'); setSelected(source); setTab('details'); setModal(null);
    if (window.innerWidth < 1050) window.setTimeout(() => document.getElementById('source-detail-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };
  const escalate = () => {
    if (!selected || sentSource === selected.id) return;
    if (escalationTimer.current) clearTimeout(escalationTimer.current);
    setSentSource(selected.id);
    setEscalated((ids) => ids.includes(selected.id) ? ids : [...ids, selected.id]);
    notify(`Demo escalation recorded for ${selected.id}. No external alert was sent.`);
    escalationTimer.current = setTimeout(() => setSentSource(null), 2000);
  };
  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    refreshTimer.current = setTimeout(() => { setRefreshing(false); setLastSync('Just now'); notify('Demo satellite snapshot refreshed. All sources are up to date.'); }, 750);
  };
  const openAlerts = () => { setSidebarOpen(false); setAlertSearch(''); setAlertStatus('all'); setModal('alerts'); };
  const exportDataset = () => {
    downloadFile('ThermalSense_Demo_Dataset.json', JSON.stringify({ product: 'ThermalSense', demo: true, snapshot: '2025-08-25', sources: SOURCES }, null, 2), 'application/json');
    notify('Complete demo dataset downloaded as JSON.');
  };
  const resetWorkspace = () => { setSidebarOpen(false); setRegion('Gujarat, India'); setPeriod('Last 7 Days'); setDraftFilters(DEFAULT_FILTERS); setAppliedFilters(DEFAULT_FILTERS); setSelected(SOURCES[0]); setTab('details'); };
  const filteredAlerts = SOURCES.filter((source) => source.status !== 'normal' && (alertStatus === 'all' || source.status === alertStatus) && `${source.id} ${source.name} ${source.state}`.toLowerCase().includes(alertSearch.toLowerCase()));

  return <div className="app-shell">
    <Topbar
      region={region}
      period={period}
      acknowledged={acknowledged}
      onRegionChange={(value) => { setSidebarOpen(false); setRegion(value); }}
      onPeriodChange={(value) => { setSidebarOpen(false); setPeriod(value); notify(`Observation window set to ${value.toLowerCase()}.`); }}
      onOpenFilters={() => setSidebarOpen(true)}
      onHome={resetWorkspace}
      onViewAlert={viewAlert}
      onOpenAlerts={openAlerts}
      onAbout={() => { setSidebarOpen(false); setModal('about'); }}
      onExport={exportDataset}
    />
    <div className="dashboard-body">
      <Sidebar draft={draftFilters} applied={appliedFilters} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onChange={setDraftFilters} onApply={applyFilters} onReset={resetFilters} onQuickFilter={quickFilter} />
      <main className="main-content">
        <div className="workspace-heading"><div><div className="workspace-title-row"><h1>Thermal surveillance</h1><span className="workspace-live"><i />Live monitoring</span></div><p>Satellite intelligence for industrial safety and early response.</p></div><div className="workspace-tools"><button className="mobile-filter-button outline-button" onClick={() => setSidebarOpen(true)}><SlidersHorizontal size={14} />Filters</button><div className="sync-time"><span>August 25, 2025</span><small>Last sync <span>&middot;</span> {lastSync}</small></div><button className={`refresh-button ${refreshing ? 'is-refreshing' : ''}`} aria-label="Refresh demo satellite data" title="Refresh satellite data" onClick={refresh} disabled={refreshing}><RefreshCw size={15} /></button></div></div>
        <div className="monitoring-grid"><ThermalMap sources={visibleSources} selected={selected} region={region} onSelect={setSelected} onViewDetails={() => { setTab('details'); if (window.innerWidth < 1050) document.getElementById('source-detail-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); else document.getElementById('tab-details')?.focus(); }} onNotify={notify} /><DetailPanel source={selected} tab={tab} onTabChange={setTab} sent={sentSource === selected?.id} onEscalate={escalate} onNotify={notify} /></div>
        <section className="recent-alerts" aria-label="Recent thermal alerts"><div className="recent-alerts-heading"><h2><Bell size={14} />Recent alerts<span>4</span></h2><button onClick={openAlerts}>View all alerts<ArrowRight size={13} /></button></div><div className="recent-alert-list">{RECENT_ALERTS.map((source) => <button key={source.id} className={`recent-alert ${selected?.id === source.id ? 'is-selected' : ''}`} style={{ borderLeftColor: STATUS[source.status].color }} onClick={() => viewAlert(source)}><div className="alert-card-top"><strong><i style={{ background: STATUS[source.status].color }} />{source.id}</strong><span className={`alert-status ${source.status}`}>{STATUS[source.status].label.toUpperCase()}</span></div><div className="alert-location">{source.id === 'IND-GJ-047' ? 'Jamnagar, Gujarat' : source.name}</div><div className="alert-card-bottom"><span><Clock3 size={10} />{source.updated}</span><strong>{source.frp} <span>MW</span></strong><span className="alert-view">View<ArrowRight size={11} /></span></div></button>)}</div></section>
        <footer className="workspace-footer"><span><ShieldCheck size={12} />For situational awareness. Verify before action.</span><span className="demo-disclaimer">Illustrative boundaries <i />Demo data</span><span className="footer-team">NEON GENESIS</span></footer>
      </main>
    </div>

    {toast && <div className="toast" role="status"><CircleCheck size={18} /><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={14} /></button></div>}
    {modal === 'alerts' && <Modal title="Alert center" subtitle="Investigate and acknowledge thermal observations across India." onClose={() => setModal(null)} className="alerts-modal"><div className="alert-center-toolbar"><div className="alert-search"><Search size={15} /><input aria-label="Search alerts by source or location" placeholder="Search source ID or location..." value={alertSearch} onChange={(event) => setAlertSearch(event.target.value)} /></div><select aria-label="Filter alerts by severity" value={alertStatus} onChange={(event) => setAlertStatus(event.target.value)}><option value="all">All severities</option>{(Object.keys(STATUS) as SourceStatus[]).filter((status) => status !== 'normal').map((status) => <option key={status} value={status}>{STATUS[status].label}</option>)}</select></div><div className="alert-center-summary"><span>{filteredAlerts.length} observations</span><span>{escalated.length} demo escalations <i />{acknowledged.length} acknowledged</span></div><div className="alert-center-list">{filteredAlerts.length === 0 ? <div className="alert-search-empty"><Search size={25} /><h3>No matching alerts</h3><p>Try another source ID, location, or severity.</p></div> : filteredAlerts.map((source) => <div className="alert-center-row" key={source.id}><span className={`alert-center-symbol ${source.status}`}><Radio size={17} /></span><div className="alert-center-info"><strong>{source.id}<span className={`status-badge ${source.status}`}>{STATUS[source.status].label}</span></strong><span>{source.name}</span><small>{source.frp} MW <span>&middot;</span> {source.updated}{escalated.includes(source.id) && <b>Demo escalated</b>}</small></div><button className={`acknowledge-button ${acknowledged.includes(source.id) ? 'acknowledged' : ''}`} disabled={acknowledged.includes(source.id)} title="Acknowledge this alert" onClick={() => { setAcknowledged((ids) => [...ids, source.id]); notify(`${source.id} acknowledged by NEON GENESIS.`); }}>{acknowledged.includes(source.id) ? <CheckCheck size={14} /> : <Check size={14} />}<span>{acknowledged.includes(source.id) ? 'Acknowledged' : 'Acknowledge'}</span></button><button className="view-alert-button" onClick={() => viewAlert(source)}>View<ArrowRight size={13} /></button></div>)}</div><div className="modal-bottom-note"><Info size={13} />Demo observations only. No live or external alerts are transmitted.</div></Modal>}
    {modal === 'about' && <Modal title="Built for early action." subtitle="ThermalSense | Industrial Thermal Surveillance System" onClose={() => setModal(null)} className="about-modal"><div className="about-mark"><Flame size={37} /><span>ThermalSense</span></div><p>A satellite-based investigation workspace for industrial safety and disaster management teams. Connect thermal observations with site context, baseline behaviour, and independent evidence.</p><div className="about-facts"><div><span>Workspace</span><strong>NEON GENESIS</strong></div><div><span>Data snapshot</span><strong>August 25, 2025</strong></div><div><span>Map sources</span><strong>{SOURCES.length} demo observations</strong></div><div><span>Data connections</span><strong>Simulated, no external APIs</strong></div></div><div className="about-disclaimer"><ShieldCheck size={19} /><p>This is a demonstration environment. Geographic boundaries are illustrative. All satellite readings and evidence are hardcoded examples and must not be used for operational decisions.</p></div><button className="primary-button" onClick={exportDataset}><ArrowDownToLine size={15} />Download demo dataset</button></Modal>}
  </div>;
}
