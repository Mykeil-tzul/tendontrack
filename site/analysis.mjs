export const MIN_VISIBILITY = 0.65;
const quantile = (items, f) => {
  const sorted = [...items].sort((a,b) => a-b);
  const index = (sorted.length - 1) * f;
  const base = Math.floor(index);
  return sorted[base] + (sorted[Math.ceil(index)] - sorted[base]) * (index - base);
};

export function footAngle(landmarks, side, width, height) {
  const indexes = side === "left" ? [27,29,31] : [28,30,32];
  const points = indexes.map(i => landmarks?.[i]);
  if (points.some(p => !p || (p.visibility ?? 0) < MIN_VISIBILITY || !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1)) return null;
  const [, heel, toe] = points;
  const dx = Math.abs((heel.x - toe.x) * width);
  const dy = (toe.y - heel.y) * height;
  if (Math.hypot(dx,dy) < width * 0.018 || dx < width * 0.008) return null;
  return Math.atan2(dy, dx) * 180 / Math.PI;
}

export function summarize(samples) {
  const visible = samples.filter(p => Number.isFinite(p.angle));
  const coverage = visible.length / Math.max(1,samples.length);
  if (coverage < 0.7 || visible.length < 18) return {coverage, reason:"Too few clear views of the ankle, heel and toe."};
  const smooth = samples.map((p,i) => {
    if (!Number.isFinite(p.angle)) return p;
    const window = samples.slice(Math.max(0,i-1),i+2);
    return {...p, angle:quantile(window.map(x=>x.angle).filter(Number.isFinite),0.5)};
  });
  const initial = smooth.filter(p => p.t <= 0.65 && Number.isFinite(p.angle));
  if (initial.length < 4) return {coverage, reason:"The resting foot was unclear at the start of the clip."};
  const baseline = quantile(initial.map(p=>p.angle),0.5);
  const trace = smooth.map(p => ({t:p.t, angle:Number.isFinite(p.angle) ? p.angle-baseline : null}));
  const reps = [];
  let ready = false;
  let active = null;
  let lastValid = null;
  for (const p of trace) {
    if (!Number.isFinite(p.angle)) continue;
    if (lastValid !== null && p.t-lastValid > 0.3) {
      ready = false;
      active = null;
    }
    lastValid = p.t;
    if (p.angle <= 4) {
      if (active && p.t-active.start >= 0.35 && p.t-active.start <= 8 && active.peak >= 9) {
        reps.push({t:active.peakTime, lift:active.peak});
      }
      active = null;
      ready = true;
    } else if (ready && !active && p.angle >= 9) {
      active = {start:p.t,peak:p.angle,peakTime:p.t};
    } else if (active && p.angle > active.peak) {
      active.peak = p.angle;
      active.peakTime = p.t;
    }
  }
  const heights = reps.map(r=>r.lift);
  return {...(!reps.length ? {reason:"No full rise-and-return cycles reached the detection threshold."} : {}),
    coverage, trace, reps,
    lift:reps.length ? quantile(heights,0.5) : null,
    spread:reps.length >= 3 ? quantile(heights,0.75)-quantile(heights,0.25) : null};
}

export function demoTrace(amplitudes) {
  return Array.from({length:(amplitudes.length * 2 + 2)*10}, (_,i) => {
    const t=i/10;
    const index=Math.floor((t-1)/2);
    return {t,angle:(amplitudes[index] || 0) * Math.sin(Math.PI*((t-1)%2)/2)**2};
  });
}
