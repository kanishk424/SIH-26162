import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowDownToLine, ArrowRight, Bell, CalendarDays, Check, CheckCheck, ChevronDown, Clock3, Flame, Info, MapPin, Menu, ShieldCheck } from 'lucide-react';
import { SOURCES, type Period, type Region, type ThermalSource } from '../data';

interface TopbarProps {
  region: Region;
  period: Period;
  acknowledged: string[];
  onRegionChange: (region: Region) => void;
  onPeriodChange: (period: Period) => void;
  onOpenFilters: () => void;
  onHome: () => void;
  onViewAlert: (source: ThermalSource) => void;
  onOpenAlerts: () => void;
  onAbout: () => void;
  onExport: () => void;
}

const REGIONS: Region[] = ['Gujarat, India', 'All India', 'Maharashtra, India', 'Rajasthan, India', 'Tamil Nadu, India'];
const PERIODS: Period[] = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days'];

export default function Topbar({ region, period, acknowledged, onRegionChange, onPeriodChange, onOpenFilters, onHome, onViewAlert, onOpenAlerts, onAbout, onExport }: TopbarProps) {
  const [openMenu, setOpenMenu] = useState<'region' | 'period' | 'notifications' | 'profile' | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const criticalAlerts = SOURCES.filter((source) => source.status === 'critical');
  const unreadCount = criticalAlerts.filter((source) => !acknowledged.includes(source.id)).length;
  const toggleMenu = (menu: NonNullable<typeof openMenu>) => setOpenMenu(openMenu === menu ? null : menu);
  const withClose = (action: () => void) => {
    const trigger = headerRef.current?.querySelector<HTMLButtonElement>('button[aria-expanded="true"]');
    setOpenMenu(null); action(); trigger?.focus({ preventScroll: true });
  };
  const navigateMenu = (event: KeyboardEvent<HTMLElement>) => {
    if (!openMenu || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const items = Array.from(headerRef.current?.querySelectorAll<HTMLButtonElement>('.dropdown-menu > button') || []);
    if (!items.length) return;
    event.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : event.key === 'ArrowDown' ? (current + 1) % items.length : (current < 0 ? items.length - 1 : (current - 1 + items.length) % items.length);
    items[next]?.focus();
  };

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => { if (headerRef.current && !headerRef.current.contains(event.target as Node)) setOpenMenu(null); };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const trigger = headerRef.current?.querySelector<HTMLButtonElement>('button[aria-expanded="true"]');
      setOpenMenu(null); trigger?.focus({ preventScroll: true });
    };
    document.addEventListener('click', closeMenus);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('click', closeMenus); document.removeEventListener('keydown', escape); };
  }, []);

  return <header className="topbar" ref={headerRef} onKeyDown={navigateMenu}>
    <div className="brand-group"><button className="mobile-menu-button icon-button" aria-label="Open source filters" onClick={onOpenFilters}><Menu size={20} /></button><a className="brand" href="#" aria-label="ThermalSense home" onClick={(event) => { event.preventDefault(); withClose(onHome); }}><span className="brand-mark"><Flame size={29} strokeWidth={1.7} /></span><span>ThermalSense</span></a><span className="brand-divider" /><span className="brand-description">Industrial Thermal<br />Surveillance System</span></div>
    <div className="nav-scope-controls">
      <div className="nav-dropdown"><button className="scope-button" aria-expanded={openMenu === 'region'} aria-haspopup="menu" onClick={() => toggleMenu('region')}><MapPin size={14} /><span>{region}</span><ChevronDown size={13} /></button>{openMenu === 'region' && <div className="dropdown-menu region-menu" role="menu"><p>MONITORING REGION</p>{REGIONS.map((item) => <button key={item} role="menuitemradio" aria-checked={region === item} onClick={() => withClose(() => onRegionChange(item))}><MapPin size={13} />{item}{region === item && <Check size={13} />}</button>)}</div>}</div>
      <div className="nav-dropdown"><button className="scope-button" aria-expanded={openMenu === 'period'} aria-haspopup="menu" onClick={() => toggleMenu('period')}><CalendarDays size={14} /><span>{period}</span><ChevronDown size={13} /></button>{openMenu === 'period' && <div className="dropdown-menu period-menu" role="menu"><p>OBSERVATION WINDOW</p>{PERIODS.map((item) => <button key={item} role="menuitemradio" aria-checked={period === item} onClick={() => withClose(() => onPeriodChange(item))}><Clock3 size={13} />{item}{period === item && <Check size={13} />}</button>)}<div className="dropdown-footnote">Snapshot ending Aug 25, 2025</div></div>}</div>
    </div>
    <div className="nav-account"><span className="feed-live" title="Simulated live feed. This workspace uses demo data."><i />FIRMS: Live</span><span className="nav-divider" /><div className="nav-dropdown"><button className={`notification-button ${openMenu === 'notifications' ? 'is-active' : ''}`} aria-label={`${unreadCount} unread critical alerts`} aria-expanded={openMenu === 'notifications'} onClick={() => toggleMenu('notifications')}><span className="bell-icon"><Bell size={18} />{unreadCount > 0 && <i />}</span><span className="alert-count">{unreadCount} Alerts</span></button>{openMenu === 'notifications' && <div className="dropdown-menu notifications-menu"><div className="notifications-title"><h3>Critical alerts</h3><span>{unreadCount} unread</span></div>{criticalAlerts.map((source) => <button key={source.id} className="notification-row" onClick={() => withClose(() => onViewAlert(source))}><span className="notification-dot" /><span><strong>{source.id}</strong><span>{source.name}</span><small>{source.frp} MW <span>&middot;</span> {source.updated}</small></span>{acknowledged.includes(source.id) ? <CheckCheck size={14} /> : <ArrowRight size={13} />}</button>)}<button className="notification-view-all" onClick={() => withClose(onOpenAlerts)}>Open alert center<ArrowRight size={14} /></button></div>}</div><span className="nav-divider" /><div className="nav-dropdown"><button className="avatar-button" aria-label="NEON GENESIS account menu" aria-expanded={openMenu === 'profile'} onClick={() => toggleMenu('profile')}>NG</button>{openMenu === 'profile' && <div className="dropdown-menu profile-menu"><div className="profile-heading"><span className="profile-avatar">NG</span><div><strong>NEON GENESIS</strong><span>Safety operations team</span></div></div><span className="operator-role"><ShieldCheck size={12} />Demo workspace operator</span><button onClick={() => withClose(onAbout)}><Info size={14} />About this workspace</button><button onClick={() => withClose(onExport)}><ArrowDownToLine size={14} />Download demo dataset</button></div>}</div></div>
  </header>;
}