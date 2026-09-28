export type SourceType = 'industrial' | 'flare' | 'forest' | 'agricultural' | 'mining' | 'unknown';
export type SourceStatus = 'critical' | 'anomalous' | 'elevated' | 'normal' | 'review';
export type Region = 'Gujarat, India' | 'All India' | 'Maharashtra, India' | 'Rajasthan, India' | 'Tamil Nadu, India';
export type Period = 'Last 7 Days' | 'Last 24 Hours' | 'Last 30 Days';

export interface ThermalSource {
  id: string;
  name: string;
  shortName: string;
  state: string;
  type: SourceType;
  status: SourceStatus;
  industry: string;
  frp: number;
  baseline: number;
  confidence: number;
  lat: number;
  lon: number;
  x: number;
  y: number;
  observations: number;
  updated: string;
  hoursAgo: number;
}

export const STATUS: Record<SourceStatus, { label: string; color: string; background: string }> = {
  critical: { label: 'Critical', color: '#D32F2F', background: '#FFEBEE' },
  anomalous: { label: 'Anomalous', color: '#E65100', background: '#FBE9E7' },
  elevated: { label: 'Elevated', color: '#D99A16', background: '#FFF8E1' },
  normal: { label: 'Normal', color: '#2E7D32', background: '#E8F5E9' },
  review: { label: 'Needs Review', color: '#546E7A', background: '#ECEFF1' },
};

export const SOURCE_TYPES: { id: SourceType; label: string; color: string }[] = [
  { id: 'industrial', label: 'Industrial', color: '#1565C0' },
  { id: 'flare', label: 'Gas Flare', color: '#E65100' },
  { id: 'forest', label: 'Forest Fire', color: '#2E7D32' },
  { id: 'agricultural', label: 'Agricultural', color: '#D99A16' },
  { id: 'mining', label: 'Mining', color: '#795548' },
  { id: 'unknown', label: 'Unknown', color: '#607785' },
];

const mainSource: ThermalSource = {
  id: 'IND-GJ-047', name: 'Jamnagar Refinery Zone', shortName: 'Jamnagar', state: 'Gujarat',
  type: 'industrial', status: 'critical', industry: 'Petroleum Refinery', frp: 847, baseline: 210,
  confidence: 91, lat: 22.47, lon: 70.06, x: 215, y: 296, observations: 847,
  updated: '2 minutes ago', hoursAgo: 0.03,
};

export const SOURCES: ThermalSource[] = [
  mainSource,
  { ...mainSource, id: 'IND-GJ-012', name: 'Kandla Industrial Estate', shortName: 'Kandla', industry: 'Chemical Processing', frp: 568, baseline: 175, confidence: 94, lat: 23.03, lon: 70.22, x: 396, y: 191, observations: 612, updated: '8 minutes ago', hoursAgo: 0.13 },
  { ...mainSource, id: 'IND-GJ-083', name: 'Ahmedabad Thermal Station', shortName: 'Ahmedabad', industry: 'Thermal Power Station', frp: 721, baseline: 225, confidence: 96, lat: 23.02, lon: 72.57, x: 592, y: 287, observations: 731, updated: '14 minutes ago', hoursAgo: 0.23 },
  { ...mainSource, id: 'IND-GJ-031', name: 'Mundra Port Complex', shortName: 'Mundra', status: 'anomalous', industry: 'Port & Logistics', frp: 312, baseline: 180, confidence: 89, lat: 22.84, lon: 69.73, x: 271, y: 217, observations: 426, updated: '18 minutes ago', hoursAgo: 0.3 },
  { ...mainSource, id: 'IND-GJ-058', name: 'Morbi Ceramic Cluster', shortName: 'Morbi', status: 'elevated', industry: 'Ceramic Manufacturing', frp: 278, baseline: 185, confidence: 86, lat: 22.81, lon: 70.84, x: 370, y: 280, observations: 387, updated: '23 minutes ago', hoursAgo: 0.38 },
  { ...mainSource, id: 'IND-GJ-064', name: 'Rajkot Engineering Estate', shortName: 'Rajkot', status: 'anomalous', industry: 'Metal Engineering', frp: 329, baseline: 130, confidence: 92, lat: 22.3, lon: 70.8, x: 353, y: 361, observations: 562, updated: '31 minutes ago', hoursAgo: 0.52 },
  { ...mainSource, id: 'FLR-GJ-019', name: 'Vadodara Gas Processing', shortName: 'Vadodara', type: 'flare', status: 'anomalous', industry: 'Natural Gas Processing', frp: 365, baseline: 150, confidence: 88, lat: 22.3, lon: 73.19, x: 628, y: 369, observations: 463, updated: '42 minutes ago', hoursAgo: 0.7 },
  { ...mainSource, id: 'IND-GJ-072', name: 'Bhavnagar Steel Works', shortName: 'Bhavnagar', status: 'elevated', industry: 'Steel Manufacturing', frp: 241, baseline: 170, confidence: 83, lat: 21.76, lon: 72.15, x: 483, y: 438, observations: 284, updated: '56 minutes ago', hoursAgo: 0.93 },
  { ...mainSource, id: 'FLR-GJ-026', name: 'Dahej Petrochemical Zone', shortName: 'Dahej', type: 'flare', status: 'anomalous', industry: 'Petrochemical Processing', frp: 401, baseline: 195, confidence: 90, lat: 21.71, lon: 72.6, x: 570, y: 433, observations: 644, updated: '1 hour ago', hoursAgo: 1 },
  { ...mainSource, id: 'IND-GJ-093', name: 'Porbandar Industrial Estate', shortName: 'Porbandar', status: 'elevated', industry: 'Cement Manufacturing', frp: 218, baseline: 160, confidence: 82, lat: 21.64, lon: 69.62, x: 157, y: 402, observations: 319, updated: '1 hour ago', hoursAgo: 1.2 },
  { ...mainSource, id: 'FLR-GJ-041', name: 'Hazira Gas Terminal', shortName: 'Hazira', type: 'flare', status: 'elevated', industry: 'LNG Terminal', frp: 283, baseline: 180, confidence: 87, lat: 21.12, lon: 72.65, x: 617, y: 511, observations: 488, updated: '2 hours ago', hoursAgo: 2 },
  { ...mainSource, id: 'MIN-GJ-007', name: 'Kutch Lignite Mine', shortName: 'Kutch', type: 'mining', status: 'normal', industry: 'Lignite Mining', frp: 72, baseline: 75, confidence: 95, lat: 23.75, lon: 69.2, x: 175, y: 142, observations: 203, updated: '21 minutes ago', hoursAgo: 0.35 },
  { ...mainSource, id: 'IND-GJ-022', name: 'Bhuj Manufacturing Zone', shortName: 'Bhuj', status: 'normal', industry: 'Textile Manufacturing', frp: 119, baseline: 122, confidence: 98, lat: 23.24, lon: 69.67, x: 280, y: 149, observations: 371, updated: '38 minutes ago', hoursAgo: 0.63 },
  { ...mainSource, id: 'AGR-GJ-011', name: 'Junagadh Agricultural Belt', shortName: 'Junagadh', type: 'agricultural', status: 'normal', industry: 'Agricultural Land', frp: 38, baseline: 40, confidence: 84, lat: 21.52, lon: 70.45, x: 276, y: 445, observations: 192, updated: '1 hour ago', hoursAgo: 1.1 },
  { ...mainSource, id: 'FOR-GJ-003', name: 'Gir Forest North', shortName: 'Gir Forest', type: 'forest', status: 'normal', industry: 'Protected Forest', frp: 22, baseline: 24, confidence: 92, lat: 21.15, lon: 70.73, x: 347, y: 493, observations: 167, updated: '2 hours ago', hoursAgo: 2.1 },
  { ...mainSource, id: 'IND-GJ-036', name: 'Surendranagar Textile Estate', shortName: 'Surendranagar', status: 'normal', industry: 'Textile Manufacturing', frp: 156, baseline: 155, confidence: 96, lat: 22.72, lon: 71.64, x: 463, y: 303, observations: 326, updated: '3 hours ago', hoursAgo: 3.2 },
  { ...mainSource, id: 'AGR-GJ-029', name: 'Amreli Agricultural Zone', shortName: 'Amreli', type: 'agricultural', status: 'normal', industry: 'Agricultural Land', frp: 46, baseline: 48, confidence: 81, lat: 21.6, lon: 71.21, x: 402, y: 426, observations: 148, updated: '5 hours ago', hoursAgo: 5 },
  { ...mainSource, id: 'UNK-GJ-008', name: 'Dhrangadhra Unclassified Source', shortName: 'Dhrangadhra', type: 'unknown', status: 'review', industry: 'Unclassified Thermal Source', frp: 89, baseline: 52, confidence: 74, lat: 23.0, lon: 71.46, x: 468, y: 220, observations: 63, updated: '1 day ago', hoursAgo: 25 },
  { ...mainSource, id: 'UNK-GJ-015', name: 'Bharuch Unclassified Source', shortName: 'Bharuch', type: 'unknown', status: 'review', industry: 'Unclassified Thermal Source', frp: 64, baseline: 43, confidence: 76, lat: 21.7, lon: 72.97, x: 652, y: 427, observations: 48, updated: '2 days ago', hoursAgo: 49 },
  { ...mainSource, id: 'IND-MH-023', name: 'Nagpur Steel Zone', shortName: 'Nagpur', state: 'Maharashtra', status: 'anomalous', industry: 'Steel Manufacturing', frp: 312, baseline: 126, confidence: 89, lat: 21.15, lon: 79.09, observations: 526, updated: '47 minutes ago', hoursAgo: 0.78 },
  { ...mainSource, id: 'IND-RJ-091', name: 'Barmer Oil Fields', shortName: 'Barmer', state: 'Rajasthan', type: 'flare', status: 'elevated', industry: 'Petroleum Extraction', frp: 198, baseline: 110, confidence: 86, lat: 25.75, lon: 71.4, observations: 392, updated: '2 hours ago', hoursAgo: 2 },
  { ...mainSource, id: 'IND-TN-044', name: 'Chennai Port Industrial', shortName: 'Chennai', state: 'Tamil Nadu', type: 'unknown', status: 'review', industry: 'Port & Logistics', frp: 67, baseline: 42, confidence: 74, lat: 13.08, lon: 80.27, observations: 218, updated: '3 hours ago', hoursAgo: 3 },
];

export const RECENT_ALERTS = [SOURCES[0], SOURCES[19], SOURCES[20], SOURCES[21]];

export interface Filters {
  types: SourceType[];
  statuses: SourceStatus[];
  minFrp: number;
  maxFrp: number;
  confidence: number;
}

export const DEFAULT_FILTERS: Filters = {
  types: SOURCE_TYPES.map((type) => type.id),
  statuses: Object.keys(STATUS) as SourceStatus[],
  minFrp: 0,
  maxFrp: 500,
  confidence: 70,
};

export function getReadings(source: ThermalSource): number[] {
  const historical = [204, 210, 198, 219, 210, 224, 211, 213, 217, 205, 218, 204, 209, 201, 215, 221, 216, 208, 214, 202, 209, 216, 213, 217];
  if (source.id === 'IND-GJ-047') return [...historical, 205, 198, 215, 380, 612, 847];
  return [
    ...historical.map((reading) => Math.round(reading * source.baseline / 210)),
    Math.round(source.baseline * 0.98), Math.round(source.baseline * 0.95), Math.round(source.baseline * 1.02),
    Math.round(source.baseline + (source.frp - source.baseline) * 0.26),
    Math.round(source.baseline + (source.frp - source.baseline) * 0.63), source.frp,
  ];
}

export function deviation(source: ThermalSource): number {
  return Math.round((source.frp / source.baseline - 1) * 100);
}

export function downloadFile(filename: string, content: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportIncident(source: ThermalSource) {
  const readings = getReadings(source).slice(-6);
  const report = [
    'THERMALSENSE | INDUSTRIAL THERMAL SURVEILLANCE',
    'DEMONSTRATION INCIDENT REPORT - NOT AN OPERATIONAL ALERT',
    'Report date: August 25, 2025', '',
    `Source: ${source.id}`, `Location: ${source.name}, ${source.state}, India`,
    `Coordinates: ${source.lat.toFixed(2)} N, ${source.lon.toFixed(2)} E`,
    `Industry: ${source.industry}`, `Status: ${STATUS[source.status].label.toUpperCase()}`,
    `Fire radiative power: ${source.frp} MW`, `90-day baseline: ${source.baseline} MW`,
    `Baseline deviation: ${deviation(source)}%`, `AI confidence: ${source.confidence}%`,
    `Observations: ${source.observations}`, '', 'EVIDENCE FACTORS',
    'Industrial boundary match (OSM Overpass API): +35%',
    `FRP baseline deviation (NASA FIRMS VIIRS): +30%; ${source.frp} MW vs ${source.baseline} MW`,
    'Land cover context (ESA WorldCover 10m): +15%',
    'Persistence pattern change (FIRMS Historical Archive): +12%',
    'Atmospheric signal (Sentinel-5P TROPOMI): +8%',
    'Atmospheric signals are supporting evidence, not ground truth confirmation.', '',
    'INCIDENT EVOLUTION',
    ...readings.map((value, index) => `2025-08-${20 + index}: ${value} MW | ${index === 2 ? 'MODIS' : 'VIIRS'}`),
    '', 'All values are hardcoded demonstration data. No live satellite APIs are connected.',
    'Generated by ThermalSense | NEON GENESIS',
  ].join('\n');
  downloadFile(`ThermalSense_Incident_${source.id}.txt`, report);
}