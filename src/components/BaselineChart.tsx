import { useEffect, useRef } from 'react';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Filler, type Plugin } from 'chart.js';
import { TrendingUp } from 'lucide-react';
import { deviation, getReadings, type ThermalSource } from '../data';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Filler);

export default function BaselineChart({ source }: { source: ThermalSource }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const readings = getReadings(source);
    const labels = readings.map((_, index) => {
      const date = new Date(Date.UTC(2025, 6, 27 + index));
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' });
    });
    const todayLine: Plugin<'line'> = {
      id: 'todayLine',
      beforeDatasetsDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        const x = scales.x.getPixelForValue(readings.length - 1);
        ctx.save();
        ctx.strokeStyle = '#edb4b8';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();
        ctx.restore();
      },
    };
    const chart = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Current reading', data: readings, borderColor: '#D94343', borderWidth: 2.5,
            backgroundColor: '#D94343', tension: 0.27,
            fill: { target: 1, above: 'rgba(239, 83, 80, 0.12)', below: 'rgba(239, 83, 80, 0.02)' },
            pointRadius: (context) => context.dataIndex === readings.length - 1 ? 4.5 : 0,
            pointHoverRadius: 5, pointBackgroundColor: '#D94343', pointBorderColor: '#ffffff', pointBorderWidth: 2,
          },
          {
            label: '90-day baseline', data: readings.map(() => source.baseline), borderColor: '#4B8DCB',
            backgroundColor: '#4B8DCB', borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0,
            pointHoverRadius: 3, fill: false,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700 },
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { top: 8, right: 9 } },
        plugins: {
          tooltip: {
            backgroundColor: '#ffffff', titleColor: '#253c55', bodyColor: '#5f7185', borderColor: '#dce4ed',
            borderWidth: 1, cornerRadius: 7, padding: 11, usePointStyle: true, boxWidth: 7, boxHeight: 7,
            titleFont: { family: 'Inter, sans-serif', size: 11, weight: 600 },
            bodyFont: { family: 'Inter, sans-serif', size: 10 }, bodySpacing: 6,
            callbacks: { label: (context) => ` ${context.dataset.label}: ${context.parsed.y} MW` },
          },
        },
        scales: {
          x: {
            grid: { display: false }, border: { color: '#e7edf2' },
            ticks: {
              color: '#8796a5', maxRotation: 0, autoSkip: false, font: { family: 'Inter, sans-serif', size: 9 },
              callback: (_value, index) => [0, 7, 14, 21, 29].includes(index) ? labels[index] : '',
            },
          },
          y: {
            min: 0, max: source.frp > 500 ? 1000 : Math.ceil(Math.max(source.frp, source.baseline) * 1.25 / 100) * 100,
            border: { display: false }, grid: { color: '#edf0f4', drawTicks: false },
            ticks: { stepSize: source.frp > 500 ? 250 : source.frp > 240 ? 100 : source.frp > 80 ? 50 : 25, padding: 8, color: '#8796a5', font: { family: 'Inter, sans-serif', size: 9 } },
          },
        },
      },
      plugins: [todayLine],
    });
    return () => chart.destroy();
  }, [source]);

  return (
    <section className="baseline-chart" aria-label="Fire radiative power baseline comparison">
      <div className="chart-heading">
        <div><h3>FRP vs. 90-Day Baseline</h3><p>Current reading is <strong>{Math.abs(deviation(source))}% {deviation(source) >= 0 ? 'above' : 'below'}</strong> site baseline</p></div>
        <span className="chart-heading-icon"><TrendingUp size={17} /></span>
      </div>
      <div className="chart-key"><span><i className="line-key current" />Current reading</span><span><i className="line-key baseline" />Historical baseline</span></div>
      <div className="chart-axis-label"><span>FRP (MW)</span><span className="today-reading">TODAY <TrendingUp size={10} /> {source.frp} MW</span></div>
      <div className="chart-canvas-wrap"><canvas ref={canvasRef} role="img" aria-label={`30-day FRP readings. Today: ${source.frp} MW. 90-day baseline: ${source.baseline} MW. Hover over the chart to inspect daily values.`} /></div>
      <div className="chart-bottom-label"><span>JUL 27 - AUG 25, 2025</span><span><i />Baseline: {source.baseline} MW</span></div>
    </section>
  );
}