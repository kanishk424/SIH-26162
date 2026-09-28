<<<<<<< HEAD
# ThermalSense

A light-themed industrial thermal surveillance demo for safety and disaster-management teams.

## Run

- Development: `npm run dev`
- Production: `npm run build`
- The production artifact is `dist/index.html`. JavaScript, application CSS, icons, and Chart.js are embedded in this single HTML file. Inter is loaded from Google Fonts, with a local system-font fallback.

The application uses the existing React/Vite project rather than a separate vanilla JavaScript implementation.

## Workspace

- Regional SVG map with industrial boundaries, 19 initial Gujarat markers, hover details, pan, zoom, layer controls, and an expanded map view.
- Source-type, behaviour, FRP, and confidence filters, plus region and observation-window selectors.
- Linked source details, a Chart.js baseline comparison, expandable evidence, and the August 20-25 incident timeline.
- Two-second demo escalation confirmation and a searchable alert center with acknowledgements.
- CSV map exports, JSON demo data exports, and plain-text incident reports.
- Responsive filter drawer, keyboard navigation, focus containment, and reduced-motion support.

## Demo Data

The snapshot is fixed at August 25, 2025. All observations, evidence factors, and aggregate counters are hardcoded. The detailed dataset contains 22 representative sources, including 19 in Gujarat; the overview counters describe the larger simulated catalog.

An FRP upper bound of **500+ MW** is open-ended so the initial 847 MW critical observation remains visible. Lowering the upper slider applies a finite maximum.

No satellite, geospatial, authentication, or alert-delivery APIs are connected. Escalations and acknowledgements are local session state. Map boundaries are illustrative and are not intended for operational or legal use.

## Source Files

- `src/App.tsx`: application state, alert center, and workspace composition.
- `src/data.ts`: observations, filters, historical readings, and local exports.
- `src/components/`: map, chart, navigation, filters, and investigation tabs.
- `src/index.css`: responsive visual system and motion.
=======
# SIH-26162
>>>>>>> 18bf7c7fc6794492e944ba4167bf1d4c3cf812d0
