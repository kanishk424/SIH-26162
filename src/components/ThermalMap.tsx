import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowDownToLine, ArrowRight, Check, Factory, Layers2, LocateFixed, MapPin, Maximize2, Minus, Plus, Radio, Satellite, Siren, X } from 'lucide-react';
import { STATUS, deviation, downloadFile, type Region, type ThermalSource } from '../data';
import { useFocusTrap } from '../utils/useFocusTrap';

interface MapProps {
  sources: ThermalSource[];
  selected: ThermalSource | null;
  region: Region;
  onSelect: (source: ThermalSource) => void;
  onViewDetails: () => void;
  onNotify: (message: string) => void;
}

const INDIA_COORDS = [
  [68.1, 23.7], [68.7, 23.5], [69.2, 22.8], [69.0, 22.3], [70, 21], [71, 20.6], [72.1, 21.1],
  [72.3, 22.2], [72.7, 21.8], [72.8, 20], [72.7, 19], [73.5, 16], [74.5, 14], [75.5, 12],
  [76.6, 10], [77.5, 8.1], [78.4, 8.8], [79.2, 10.4], [79.8, 11], [80.3, 13.2], [81.2, 15.7],
  [84.1, 18.7], [86.3, 20], [87.7, 21.5], [89, 21.7], [88.8, 23.3], [88.1, 24.6], [88.6, 26.2],
  [89.8, 26.6], [89.9, 25.8], [92, 25.1], [92.2, 23], [93.1, 22.1], [94.5, 25], [95.5, 26.5],
  [97.2, 27.2], [96.7, 28.5], [95.3, 29.2], [93, 28.5], [91.9, 27.1], [88.1, 27.9], [87.8, 27.2],
  [85.5, 26.8], [83.1, 27.5], [80.2, 28.8], [79.4, 30.4], [78.2, 31.3], [79.2, 32.7],
  [78.5, 34.4], [76.9, 35.5], [76, 34.7], [74.5, 35.3], [73, 34.5], [74.1, 33.4],
  [73.8, 32.1], [74.9, 31.1], [74.3, 30], [73.8, 29.3], [72.2, 28], [70.5, 27.8],
  [70.2, 25.9], [70.8, 24.7], [68.8, 24.3],
];
const indiaPath = INDIA_COORDS.map(([lon, lat], index) => `${index ? 'L' : 'M'}${(lon - 66) * 22},${(37 - lat) * 21}`).join(' ') + 'Z';
const ROADS = [
  'M66 99 Q154 122 224 143 T396 191 Q442 191 479 151 T607 107 Q666 83 733 92',
  'M171 145 Q226 147 280 149 Q338 162 396 191 L405 230 Q417 251 463 303 Q524 281 592 287 L628 369 L652 427 L617 511 L655 625',
  'M45 311 Q112 282 163 300 L215 296 Q299 294 370 280 Q421 278 463 303 L539 313 L592 287',
  'M84 377 Q121 390 157 402 L235 420 L276 445 Q321 480 347 493 Q379 484 402 426 Q421 402 483 438',
  'M215 296 Q282 323 353 361 Q418 352 483 438 Q498 465 480 499',
  'M353 361 Q327 404 276 445 L272 512 M353 361 Q375 324 370 280 L396 191',
  'M353 361 Q423 328 463 303 Q490 254 468 220 L482 171',
  'M592 287 Q620 240 647 181 Q681 132 710 128 M628 369 Q672 370 725 339',
  'M157 402 Q190 364 215 296 Q228 259 271 217 M276 445 L328 419 L402 426 L424 383 L483 351 L539 313',
  'M396 191 Q343 227 271 217 Q234 218 189 201 L121 198',
  'M617 511 Q669 514 733 498 M652 427 Q691 413 728 405',
];

function GujaratBase({ roads }: { roads: boolean }) {
  return (
    <>
      <rect width="720" height="640" fill="#e5eef2" />
      <path d="M0 0H720V640H661L650 597 634 572 627 540 608 518 601 495 588 477 584 459 570 448 560 415 546 400 535 377 525 358 510 361 510 395 506 425 493 456 479 482 457 502 433 518 408 538 380 552 346 553 319 545 294 540 268 524 245 512 222 494 202 472 182 460 168 439 146 422 125 403 104 383 78 369 59 347 47 329 55 308 78 297 98 290 126 281 150 277 177 269 202 267 226 253 253 249 280 240 316 242 345 232 364 218 380 203 366 203 342 209 325 211 301 213 275 208 251 209 225 202 198 202 177 195 150 197 128 192 99 191 83 182 61 182 43 169 24 158 0 145Z" fill="#f2f3ee" stroke="#bccfce" strokeWidth="1.3" />
      <path d="M0 18Q108 34 144 70T250 65Q322 13 386 82T492 74L543 0ZM333 100Q385 78 437 108L463 137 421 162 370 151 340 168 308 139Z" fill="#e8ecdf" opacity=".7" />
      <path d="M0 0H556L533 56 505 68 518 103 486 123 471 166 435 180 436 219 469 243 481 269 505 282 558 275 594 304 619 338 625 380 657 397 661 444 642 481 648 526 626 528 599 493 581 454 558 412 533 369 511 360 507 418 480 483 435 519 379 550 331 551 271 526 216 485 168 437 100 380 49 330 76 301 158 276 225 258 299 244 349 231 380 204 328 212 255 209 197 200 131 195 61 181 0 145Z" fill="#e3f2fd" fillOpacity=".18" stroke="#a6bdc7" strokeWidth="1" strokeDasharray="5 5" />
      <g fill="#dfe8d7" opacity=".8">
        <path d="M253 484L281 471 306 485 329 475 353 485 387 492 399 517 376 538 335 531 309 522 277 517Z" />
        <path d="M540 54L555 26 595 30 613 63 586 81 559 73Z" />
        <path d="M669 248L701 219 720 230V286L692 298 668 278Z" />
        <path d="M672 468L699 451 720 466V550L690 553 664 528 679 503Z" />
        <path d="M73 70L105 55 149 76 135 100 89 102Z" />
      </g>
      <g fill="none" stroke="#d8e1d8" strokeWidth="1" opacity=".8">
        <path d="M155 236L207 196 225 153 260 116 250 65M281 247L298 298 298 338 277 363 287 422M379 238L409 263 417 296 398 331 433 375 466 378M149 358L182 336 173 298M476 165L523 186 562 181 592 204 635 200M628 369L680 330 710 342M479 482L428 458 402 426" />
      </g>
      <g fill="none" stroke="#bbd6df" strokeWidth="2" opacity=".9">
        <path d="M573 86Q556 122 570 158T579 215Q561 241 575 271T580 322Q559 348 549 380" />
        <path d="M720 416Q690 426 675 414T630 418L585 445" />
        <path d="M718 489Q690 480 676 492T632 493L608 508" />
      </g>
      {roads && <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {ROADS.map((path, index) => <path key={`outline-${index}`} d={path} stroke="#dedbcb" strokeWidth="4.2" opacity=".8" />)}
        {ROADS.map((path, index) => <path key={`road-${index}`} d={path} stroke="#fffdf4" strokeWidth="2.5" />)}
        <g stroke="#ffffff" strokeWidth="1.2" opacity=".85">
          <path d="M221 295L225 341 259 362 253 389 235 420M280 149L327 110 353 101 390 109 437 108M276 445L218 452 206 425 157 402M463 303L505 331 520 361M353 361L346 408 328 419M396 191L442 186 469 198 468 220M592 287L648 313 681 306 718 329M402 426L432 491 412 533M175 142L195 96 228 102 250 65M370 280L329 253 298 253 271 217" />
        </g>
      </g>}
      <g className="map-town-labels" fill="#78868b" fontSize="11" fontFamily="Inter, sans-serif">
        <text x="274" y="133">Bhuj</text><text x="396" y="175">Gandhidham</text>
        <text x="219" y="331">Jamnagar</text><text x="365" y="259">Morbi</text>
        <text x="351" y="387">Rajkot</text><text x="598" y="276">Ahmedabad</text>
        <text x="478" y="327" textAnchor="middle" fontSize="9">Surendranagar</text>
        <text x="633" y="355">Vadodara</text><text x="469" y="464">Bhavnagar</text>
        <text x="214" y="459">Junagadh</text><text x="110" y="422">Porbandar</text>
        <text x="631" y="534">Surat</text><text x="278" y="202" fontSize="9">Mundra</text>
      </g>
      <g fill="#7c8b91" fontFamily="Inter, sans-serif" textAnchor="middle">
        <text x="458" y="363" fontSize="18" letterSpacing="5" opacity=".65">GUJARAT</text>
        <text x="286" y="63" fontSize="11" letterSpacing="3" opacity=".7">GREAT RANN OF KUTCH</text>
        <text x="594" y="42" fontSize="10" letterSpacing="2" opacity=".7">RAJASTHAN</text>
        <text x="169" y="244" fontSize="10" fill="#839eab" fontStyle="italic" transform="rotate(-10 169 244)">Gulf of Kutch</text>
        <text x="550" y="496" fontSize="10" fill="#839eab" fontStyle="italic" transform="rotate(-76 550 496)">Gulf of Khambhat</text>
        <text x="174" y="553" fontSize="15" fill="#8fa8b5" letterSpacing="3" fontStyle="italic">Arabian Sea</text>
        <text x="338" y="516" fontSize="9" fill="#8d9f82" letterSpacing="1">GIR NATIONAL PARK</text>
      </g>
      <g fill="#bac5c7">
        {[[222, 316], [353, 373], [280, 139], [615, 283], [638, 358], [486, 450], [262, 449], [394, 178]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" />)}
      </g>
    </>
  );
}

function IndiaBase({ roads, region }: { roads: boolean; region: Region }) {
  const regionShapes: Partial<Record<Region, string>> = {
    'Gujarat, India': 'M47 275L83 259 111 266 133 299 150 318 142 354 122 342 106 321 111 295 94 310 69 316 46 298Z',
    'Maharashtra, India': 'M150 321L179 354 234 365 300 345 292 311 245 298 171 298Z',
    'Rajasthan, India': 'M111 199L140 175 164 187 191 215 195 258 170 298 134 292 111 266 83 258 87 226Z',
    'Tamil Nadu, India': 'M244 466L273 479 316 482 303 522 278 564 260 606 246 577 248 538 235 507Z',
  };
  return <>
    <rect width="720" height="640" fill="#e5eef2" />
    <path d="M0 0H720V212L665 233 652 272 620 266 614 221 574 210 535 196 490 191 451 173 429 165 395 161 354 143 338 114 306 97 290 58 271 43 244 38 208 33 166 48 144 74 118 143 90 175 66 232 29 271 0 278Z" fill="#eff0e9" />
    <path d={indiaPath} fill="#edf2ea" stroke="#b7c8c5" strokeWidth="1.5" />
    {regionShapes[region] && <path d={regionShapes[region]} fill="#d9eafb" stroke="#7daed0" strokeDasharray="4 3" />}
    <g fill="none" stroke="#d3ded4" strokeWidth="1.2">
      <path d="M113 204L164 216 191 264 170 298 131 301M171 298L245 298 282 310 290 346 234 365 179 354 150 323M179 354L190 404 244 415 273 389 288 350M190 404L214 467 249 489 273 452 244 415M249 489L278 512 289 560M192 263L227 208 258 218 291 252 348 267 385 275M291 252L282 310 344 326 385 275M214 467L206 488M245 298L244 251M282 310L336 305" />
    </g>
    {roads && <g fill="none" stroke="#ffffff" strokeWidth="2.2">
      <path d="M82 305L150 291 241 234 302 284 392 308M150 291L177 378 244 411 275 502 260 596M241 234L275 335 311 385 275 502M177 378L288 350 392 308M275 335L302 284 348 267 434 237M241 234L205 180 224 120" />
    </g>}
    <g fill="#859594" fontFamily="Inter, sans-serif" fontSize="10">
      <text x="98" y="289">Gujarat</text><text x="132" y="236">Rajasthan</text><text x="196" y="358">Maharashtra</text>
      <text x="246" y="523">Tamil Nadu</text><text x="247" y="226">New Delhi</text><text x="181" y="391">Mumbai</text>
      <text x="365" y="310">Kolkata</text><text x="277" y="489">Chennai</text>
      <text x="299" y="187" fontSize="22" letterSpacing="8" fill="#9dada7">INDIA</text>
      <text x="61" y="469" fill="#90a8b4" fontSize="14" fontStyle="italic">Arabian Sea</text>
      <text x="421" y="437" fill="#90a8b4" fontSize="14" fontStyle="italic">Bay of Bengal</text>
    </g>
  </>;
}

export default function ThermalMap({ sources, selected, region, onSelect, onViewDetails, onNotify }: MapProps) {
  const [hovered, setHovered] = useState<ThermalSource | null>(null);
  const [popupOpen, setPopupOpen] = useState(true);
  const [layersOpen, setLayersOpen] = useState(false);
  const [boundaries, setBoundaries] = useState(true);
  const [roads, setRoads] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 720, height: 640 });
  const [popupSize, setPopupSize] = useState({ width: 226, height: 215 });
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const mapRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const national = region !== 'Gujarat, India';
  const view = { x: pan.x + 360 * (1 - 1 / zoom), y: pan.y + 320 * (1 - 1 / zoom), width: 720 / zoom, height: 640 / zoom };
  const visibleSelected = selected && sources.some((source) => source.id === selected.id) ? selected : null;
  const active = hovered || (popupOpen ? visibleSelected : null);
  const sourcePoint = (source: ThermalSource) => national ? { x: (source.lon - 66) * 22, y: (37 - source.lat) * 21 } : { x: source.x, y: source.y };
  const activePoint = active ? sourcePoint(active) : { x: 0, y: 0 };
  const popupX = (activePoint.x - view.x) / view.width * 100;
  const popupY = (activePoint.y - view.y) / view.height * 100;
  const showPopup = Boolean(active && popupX > 0 && popupX < 100 && popupY > 0 && popupY < 100);
  const anchorX = popupX / 100 * viewportSize.width;
  const anchorY = popupY / 100 * viewportSize.height;
  const popupGap = viewportSize.width < 460 ? 18 : 24;
  const fitsRight = anchorX + popupGap + popupSize.width <= viewportSize.width - 8;
  const fitsLeft = anchorX - popupGap - popupSize.width >= 8;
  const placement = fitsLeft && (!fitsRight || popupX > 56) ? 'left' : fitsRight ? 'right' : 'center';
  const desiredLeft = placement === 'left' ? anchorX - popupSize.width - popupGap : placement === 'right' ? anchorX + popupGap : anchorX - popupSize.width / 2;
  const desiredTop = placement === 'center' ? (anchorY > popupSize.height + 24 ? anchorY - popupSize.height - 18 : anchorY + 18) : anchorY - popupSize.height * 0.82;
  const popupLeft = Math.max(8, Math.min(desiredLeft, viewportSize.width - popupSize.width - 8));
  const popupTop = Math.max(8, Math.min(desiredTop, viewportSize.height - popupSize.height - 8));
  const centerDirection = anchorY >= popupTop + popupSize.height ? 'above' : anchorY <= popupTop ? 'below' : 'overlap';
  useFocusTrap(mapRef, expanded, () => setExpanded(false));

  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      setViewportSize((size) => size.width === rect.width && size.height === rect.height ? size : { width: Math.max(1, rect.width), height: Math.max(1, rect.height) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const element = popupRef.current;
    if (!showPopup || !element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      setPopupSize((size) => size.width === rect.width && size.height === rect.height ? size : { width: rect.width, height: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [showPopup]);

  useEffect(() => { setPopupOpen(true); setHovered(null); }, [selected?.id]);
  useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); setHovered(null); }, [region]);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); setPopupOpen(true); };
  const exportMap = () => {
    const csv = ['Source ID,Location,Status,FRP (MW),Baseline (MW),Confidence (%),Latitude,Longitude', ...sources.map((source) => `${source.id},${source.name},${STATUS[source.status].label},${source.frp},${source.baseline},${source.confidence},${source.lat},${source.lon}`)].join('\n');
    downloadFile('ThermalSense_Thermal_Sources.csv', csv, 'text/csv');
    onNotify(`Exported ${sources.length} thermal sources as CSV.`);
  };
  const startDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if ((event.target as Element).closest('[data-map-marker]')) return;
    dragStart.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const moveDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragStart.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPan({ x: dragStart.current.panX - (event.clientX - dragStart.current.x) / rect.width * view.width, y: dragStart.current.panY - (event.clientY - dragStart.current.y) / rect.height * view.height });
  };

  return (
    <section ref={mapRef} className={`map-panel panel ${expanded ? 'map-expanded' : ''}`} aria-label="Interactive thermal source map" role={expanded ? 'dialog' : 'region'} aria-modal={expanded ? true : undefined}>
      <div className="map-panel-header">
        <div className="map-title"><span className="map-title-icon"><MapPin size={17} /></span><h2>Live Thermal Source Map</h2><span className="live-tag"><i />LIVE</span></div>
        <div className="map-header-actions">
          <div className="layers-control">
            <button className={`icon-button ${layersOpen ? 'is-active' : ''}`} title="Map layers" aria-label="Map layers" aria-expanded={layersOpen} onClick={() => setLayersOpen(!layersOpen)}><Layers2 size={16} /></button>
            {layersOpen && <div className="layer-menu"><h4>Map layers</h4><label><input type="checkbox" checked={boundaries} onChange={(event) => setBoundaries(event.target.checked)} />Industrial boundaries</label><label><input type="checkbox" checked={roads} onChange={(event) => setRoads(event.target.checked)} />Road network</label><span><Radio size={12} /> Thermal sources always visible</span><button onClick={() => setLayersOpen(false)}>Done <Check size={13} /></button></div>}
          </div>
          <button className="icon-button" title={expanded ? 'Exit fullscreen' : 'Expand map'} aria-label={expanded ? 'Exit fullscreen map' : 'Expand map'} data-initial-focus onClick={() => setExpanded(!expanded)}>{expanded ? <X size={17} /> : <Maximize2 size={16} />}</button>
          <button className="icon-button" title="Export visible sources as CSV" aria-label="Export map sources" onClick={exportMap}><ArrowDownToLine size={16} /></button>
        </div>
      </div>
      <div ref={viewportRef} className={`map-viewport ${dragging ? 'is-dragging' : ''}`}>
        <svg className="geographic-map" viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} preserveAspectRatio="none" aria-label={`${region} map with ${sources.length} thermal sources. Select a marker to view its incident.`} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={() => { dragStart.current = null; setDragging(false); }} onPointerCancel={() => { dragStart.current = null; setDragging(false); }}>
          <defs><pattern id="map-grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0V80" fill="none" stroke="#a7bec8" strokeWidth=".5" opacity=".13" /></pattern></defs>
          {national ? <IndiaBase roads={roads} region={region} /> : <GujaratBase roads={roads} />}
          <rect width="720" height="640" fill="url(#map-grid)" pointerEvents="none" />
          {boundaries && !national && <g className="industrial-boundaries" fill="#90caf9" fillOpacity=".24" stroke="#71a9d4" strokeWidth="1.4" strokeDasharray="4 3">
            <path d="M183 274L208 263 244 275 251 302 232 321 204 317 181 300Z" />
            <path d="M378 174L401 166 419 179 415 205 388 212 374 194Z" />
            <path d="M577 270L599 265 612 280 610 305 585 310 572 289Z" />
            <path d="M337 343L363 338 379 357 370 378 342 382 330 361Z" />
            <path d="M553 418L578 411 594 433 580 451 556 446 548 430Z" />
          </g>}
          {boundaries && !national && <text x="81" y="262" fill="#4c7eab" fontFamily="Inter, sans-serif" fontSize="9.5" fontWeight="500">Jamnagar Refinery Complex</text>}
          {sources.map((source, index) => {
            const point = sourcePoint(source);
            const color = source.status === 'elevated' ? '#e97926' : STATUS[source.status].color;
            const radius = source.status === 'critical' ? (source.id === 'IND-GJ-047' ? 10 : 8) : source.status === 'normal' || source.status === 'review' ? 5.5 : 6.5;
            return <g key={source.id} className={`thermal-marker ${source.status}`} data-map-marker="true" role="button" tabIndex={0} aria-label={`${source.id}, ${source.name}, ${STATUS[source.status].label}, ${source.frp} MW`} onMouseEnter={() => setHovered(source)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(source)} onBlur={() => setHovered(null)} onClick={() => { onSelect(source); setPopupOpen(true); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(source); setPopupOpen(true); } }}>
              {/* Compensate for the map scale to keep markers circular at every viewport size. */}
              <g transform={`translate(${point.x} ${point.y}) scale(${view.width / viewportSize.width} ${view.height / viewportSize.height})`}>
                <circle r="18" fill="transparent" />
                {source.status === 'critical' && <circle className="marker-pulse" style={{ animationDelay: `${index * 0.38}s`, transformOrigin: '0px 0px' }} r={radius + 6} fill={color} fillOpacity=".15" stroke={color} strokeOpacity=".2" />}
                {source.id === selected?.id && <circle r={radius + 5} fill="white" fillOpacity=".55" />}
                <circle className="marker-dot" r={radius} fill={color} stroke="#ffffff" strokeWidth="2.5" />
                {source.id === selected?.id && <circle r="2.7" fill="white" />}
              </g>
            </g>;
          })}
        </svg>
        <div className="map-region-label"><MapPin size={12} /><span>{region === 'All India' ? 'India' : region.split(',')[0]}</span><span className="map-region-divider" />{sources.length} sources</div>
        <div className="map-navigation"><div className="zoom-controls"><button title="Zoom in" aria-label="Zoom in" onClick={() => setZoom(Math.min(zoom + 0.3, 2.8))} disabled={zoom >= 2.8}><Plus size={17} /></button><button title="Zoom out" aria-label="Zoom out" onClick={() => setZoom(Math.max(zoom - 0.3, 0.7))} disabled={zoom <= 0.7}><Minus size={17} /></button></div><button className="locate-button" title="Reset map view" aria-label="Reset map view" onClick={resetView}><LocateFixed size={17} /></button></div>
        {active && showPopup && <div ref={popupRef} className={`map-popup opens-${placement} popup-${centerDirection}`} style={{ left: `${popupLeft}px`, top: `${popupTop}px`, '--popup-pointer-y': `${Math.max(15, Math.min(anchorY - popupTop, popupSize.height - 15))}px`, '--popup-pointer-x': `${anchorX - popupLeft}px` } as CSSProperties} onMouseEnter={() => { if (hovered) setHovered(active); }} onMouseLeave={() => setHovered(null)}>
          <div className="popup-topline"><span><i style={{ background: STATUS[active.status].color }} />{active.id}</span><button aria-label="Close map popup" onClick={() => { setHovered(null); setPopupOpen(false); }}><X size={13} /></button></div>
          <h3>{active.name}</h3><p className="popup-industry"><Factory size={12} />{active.industry}</p>
          <div className="popup-properties"><span>Behaviour</span><span className={`status-badge ${active.status === 'critical' ? 'anomalous' : active.status}`}>{active.status === 'critical' ? 'ANOMALOUS' : STATUS[active.status].label.toUpperCase()}</span><span>Fire radiative power</span><strong>{active.frp} <small>MW</small><em>{deviation(active) >= 0 ? '+' : ''}{deviation(active)}%</em></strong><span>Recommended action</span><b className={active.status === 'critical' ? 'escalate-text' : 'monitor-text'}>{active.status === 'critical' ? <><Siren size={12} />ESCALATE</> : active.status === 'normal' ? 'MONITOR' : 'REVIEW'}</b></div>
          <button className="popup-view" onClick={() => { onSelect(active); setHovered(null); setPopupOpen(true); setExpanded(false); onViewDetails(); }}>View source details<ArrowRight size={13} /></button>
        </div>}
        {!sources.length && <div className="map-empty"><MapPin size={24} /><strong>No matching thermal sources</strong><span>Try adjusting your filters or selecting another region.</span></div>}
        <div className="map-legend"><h4>THERMAL ACTIVITY</h4><div>{(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((status) => <span key={status}><i style={{ background: STATUS[status].color }} />{STATUS[status].label}</span>)}</div><p><i className="boundary-key" />Industrial boundary</p></div>
        <div className="map-compass"><span>N</span><svg width="17" height="23" viewBox="0 0 17 23"><path d="M8.5 1L15 21 8.5 16 2 21Z" fill="#8ca0ad" /><path d="M8.5 1V16L2 21Z" fill="#ffffff" stroke="#8ca0ad" strokeWidth=".7" /></svg></div>
        <div className="map-scale"><span>{Math.round(50 / zoom)} km</span><i /></div>
        <div className="india-inset" title="Illustrative India overview"><svg viewBox="0 0 720 640"><path d={indiaPath} fill="#e9edf0" stroke="#bac9d4" strokeWidth="7" />{region === 'Gujarat, India' && <path d="M47 275L83 259 111 266 133 299 150 318 142 354 122 342 106 321 111 295 94 310 69 316 46 298Z" fill="#6ca4d8" />}<circle cx={selected ? (selected.lon - 66) * 22 : 110} cy={selected ? (37 - selected.lat) * 21 : 299} r="12" fill="#1565c0" /></svg><span>INDIA</span></div>
      </div>
      <div className="map-footer"><span><Satellite size={12} />NASA FIRMS <i />VIIRS + MODIS</span><span><i className="online-dot" />Updated 2m ago</span></div>
    </section>
  );
}