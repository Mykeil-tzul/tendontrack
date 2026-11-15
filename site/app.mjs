import {demoTrace, summarize} from "./analysis.mjs";

const $ = id => document.getElementById(id);
const video = $("video");
const storage = "tendontrack.sessions.v1";
const formatAngle = n => n == null ? "—" : n.toFixed(1) + "°";
let sessions = readSessions();
let clipURL;
let result;
let sample = false;
let task;

function readSessions() {
  try {
    const data = JSON.parse(localStorage.getItem(storage) || "[]");
    if (!Array.isArray(data)) return [];
    return data.filter(s => s && typeof s.id === "string" && typeof s.saved === "string" &&
      ["left","right"].includes(s.side) && Number.isFinite(s.lift) && Number.isInteger(s.reps) &&
      Number.isFinite(s.coverage) && (s.spread === null || Number.isFinite(s.spread)));
  } catch {
    return [];
  }
}

function store(next) {
  try {
    if (next.length) localStorage.setItem(storage,JSON.stringify(next));
    else localStorage.removeItem(storage);
    sessions = next;
    refreshJournal();
    return true;
  } catch {
    $("journal-note").textContent = "This browser blocked local storage. No changes were saved.";
    return false;
  }
}

function chart(canvas, data, markers=[], xLabel="Time (s)") {
  const rect=canvas.getBoundingClientRect();
  const dpr=window.devicePixelRatio || 1;
  canvas.width=Math.max(1, Math.round(rect.width*dpr));
  canvas.height=Math.max(1, Math.round(rect.height*dpr));
  const ctx=canvas.getContext("2d");
  ctx.scale(dpr,dpr);
  const width=rect.width, height=rect.height;
  const visible=data.filter(p=>Number.isFinite(p.angle));
  ctx.font="12px system-ui";
  ctx.fillStyle="#aec0b5";
  if (!visible.length) {
    ctx.fillText("No measurements to display",16,24);
    return;
  }
  const min=Math.min(0,...visible.map(p=>p.angle)),max=Math.max(min+1,...visible.map(p=>p.angle));
  const end=Math.max(1,data.at(-1).t);
  const x=t=>44+t/end*(width-60);
  const y=value=>12+(max-value)/(max-min)*(height-40);
  for (let i=0;i<=3;i++) {
    const value=min+(max-min)*i/3;
    ctx.beginPath();
    ctx.strokeStyle="#35443c";
    ctx.moveTo(42,y(value));
    ctx.lineTo(width-12,y(value));
    ctx.stroke();
    ctx.fillText(Math.round(value)+"°",4,y(value)+4);
  }
  ctx.fillText(xLabel,44,height-3);
  ctx.textAlign="right";
  ctx.fillText(end.toFixed(xLabel === "Time (s)" ? 1 : 0),width-12,height-3);
  ctx.strokeStyle="#cbf5aa";
  ctx.lineWidth=2;
  ctx.beginPath();
  let started=false;
  for (const p of data) {
    if (!Number.isFinite(p.angle)) {started=false;continue;}
    if (started) ctx.lineTo(x(p.t),y(p.angle));
    else ctx.moveTo(x(p.t),y(p.angle));
    started=true;
  }
  ctx.stroke();
  ctx.fillStyle="#cbf5aa";
  for (const p of markers) {
    ctx.beginPath();
    ctx.arc(x(p.t),y(p.lift),4,0,2*Math.PI);
    ctx.fill();
  }
}

function show(value,isSample=false) {
  result=value;
  sample=isSample;
  $("demo").textContent=isSample ? "Exit sample sessions" : "Explore sample sessions";
  $("reps").textContent=value?.trace ? value.reps.length : "—";
  $("lift").textContent=formatAngle(value?.lift);
  $("coverage").textContent=value ? Math.round(100*value.coverage)+"%" : "—";
  $("result-note").textContent=value?.reason || (isSample ? "Synthetic example. These values did not come from a patient or video." :
    value ? "Estimated from the "+value.side+" foot in this clip." : "Analyze a clip or explore the sample sessions to see how results are displayed.");
  $("rep-details").textContent=value?.reps?.map((r,i)=>"Rep "+(i+1)+": "+r.t.toFixed(1)+"s, "+formatAngle(r.lift)).join(" · ") || "";
  $("save").disabled=isSample || !value?.reps?.length;
  chart($("trace"),value?.trace || [],value?.reps || []);
}

function exampleSessions() {
  return [[14,15,13],[16,17,15,16],[18,19,17,19,18]].map((values,i)=> {
    const item=summarize(demoTrace(values));
    return {id:"sample-"+i,saved:"Example "+(i+1),side:"left",reps:item.reps.length,lift:item.lift,spread:item.spread,coverage:item.coverage};
  });
}

function refreshJournal() {
  const list=sample ? exampleSessions() : sessions.filter(s=>s.side===$("journal-side").value);
  $("journal-note").textContent=sample ? "Three synthetic sessions illustrate the trend chart. Your saved sessions are unchanged."
    : "Compare sessions recorded from the same side with a similar camera angle.";
  $("journal-side").disabled=sample;
  $("clear").disabled=sample || !sessions.length;
  $("export").disabled=!list.length;
  const points=list.map((s,i)=>({t:i+1,angle:s.lift,lift:s.lift}));
  chart($("trend"),points,points,"Session");
  const rows=list.map((session,i)=>{
    const row=document.createElement("tr");
    const title=sample ? session.saved : "Session "+(i+1)+" · "+new Date(session.saved).toLocaleDateString();
    for (const v of [title,session.reps,formatAngle(session.lift),formatAngle(session.spread),Math.round(session.coverage*100)+"%"]) {
      const cell=row.insertCell();
      cell.textContent=v;
    }
    const cell=row.insertCell();
    if (!sample) {
      const button=document.createElement("button");
      button.textContent="Remove";
      button.setAttribute("aria-label","Remove "+title);
      button.onclick=()=>store(sessions.filter(s=>s.id!==session.id));
      cell.append(button);
    }
    return row;
  });
  if (!rows.length) {
    const row=document.createElement("tr");
    const cell=row.insertCell();
    cell.colSpan=6;
    cell.textContent="No saved sessions for this foot.";
    rows.push(row);
  }
  $("sessions").replaceChildren(...rows);
}

function clearClip() {
  video.pause();
  video.removeAttribute("src");
  video.load();
  if (clipURL) URL.revokeObjectURL(clipURL);
  clipURL=undefined;
  video.hidden=true;
  $("clear-video").hidden=true;
  $("analyze").disabled=true;
}

$("file").onchange=()=>{
  clearClip();
  show(null);
  refreshJournal();
  $("status").textContent="";
  const file=$("file").files[0];
  if (!file) return;
  if (file.size>150*1024*1024) {
    $("status").textContent="Choose a video under 150 MB.";
    return;
  }
  clipURL=URL.createObjectURL(file);
  video.src=clipURL;
  video.hidden=false;
  $("clear-video").hidden=false;
};

video.onloadeddata=()=>{
  const valid=clipURL && Number.isFinite(video.duration) && video.duration>=3 && video.duration<=30;
  $("analyze").disabled=!valid;
  $("status").textContent=valid ? "Ready to analyze." : "Choose a clip between 3 and 30 seconds.";
};
video.onerror=()=>{
  if (!clipURL) return;
  $("analyze").disabled=true;
  $("status").textContent="This browser couldn't open the clip. Try an MP4 encoded with H.264.";
};

function seek(t,signal) {
  signal.throwIfAborted();
  if (!video.seeking && Math.abs(video.currentTime-t)<0.0001 && video.readyState>=2) return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>finish(new Error("The video could not seek to a frame.")),4500);
    function finish(error) {
      clearTimeout(timer);
      video.removeEventListener("seeked",done);
      signal.removeEventListener("abort",abort);
      if (error) reject(error); else resolve();
    }
    const done=()=>finish();
    const abort=()=>finish(signal.reason);
    video.addEventListener("seeked",done,{once:true});
    signal.addEventListener("abort",abort,{once:true});
    video.currentTime=t;
  });
}

function setBusy(busy) {
  for (const id of ["analyze","file","side","clear-video","demo"]) $(id).disabled=busy;
  $("cancel").hidden=!busy;
  $("progress").hidden=!busy;
  if (busy) $("progress").value=0;
  video.controls=!busy;
}

$("analyze").onclick=async()=>{
  if (task || !clipURL) return;
  const controller=new AbortController();
  task=controller;
  const {signal}=controller;
  let detector;
  video.pause();
  show(null);
  refreshJournal();
  setBusy(true);
  const side=$("side").value;
  let step="Loading the pose model…";
  $("status").textContent=step;
  try {
    const {openPose,measure}=await import("./pose.mjs");
    signal.throwIfAborted();
    detector=await openPose();
    signal.throwIfAborted();
    step="Analyzing frames on this device…";
    $("status").textContent=step;
    const frames=[];
    const total=Math.floor(video.duration*10);
    for (let i=0;i<total;i++) {
      const t=i/10;
      await seek(t,signal);
      frames.push({t,angle:measure(detector,video,t,side)});
      $("progress").value=(i+1)/total;
    }
    show({...summarize(frames),side});
    $("status").textContent="Analysis finished.";
  } catch (error) {
    $("status").textContent=signal.aborted ? "Analysis canceled." :
      step.startsWith("Loading") ? "The pose model could not load. Check your connection or try a current Chrome or Edge browser." :
      "This video could not be analyzed. Try a shorter MP4 clip.";
    if (!signal.aborted) console.error(error);
  } finally {
    detector?.close();
    task=undefined;
    setBusy(false);
    $("analyze").disabled=!clipURL || video.duration<3 || video.duration>30;
  }
};

$("cancel").onclick=()=>task?.abort();
$("clear-video").onclick=()=>{clearClip();$("file").value="";$("status").textContent="Video removed.";show(null);refreshJournal();};
$("demo").onclick=()=>{
  if (sample) {
    show(null);
    refreshJournal();
    return;
  }
  show({...summarize(demoTrace([18,19,17,19,18])),side:"left"},true);
  refreshJournal();
  $("analyzer").scrollIntoView({block:"start"});
};
$("save").onclick=()=>{
  if (sample || !result?.reps?.length) return;
  const {side,lift,spread,coverage,reps}=result;
  if (store([...sessions,{id:crypto.randomUUID(),saved:new Date().toISOString(),side,lift,spread,coverage,reps:reps.length}])) {
    $("journal-side").value=side;
    $("save").disabled=true;
    refreshJournal();
    $("status").textContent="Session metrics saved in this browser.";
  }
};
$("clear").onclick=()=>{if (confirm("Clear all saved TendonTrack sessions on this browser?")) store([]);};
$("journal-side").onchange=refreshJournal;
$("export").onclick=()=>{
  const list=sample ? exampleSessions() : sessions.filter(s=>s.side===$("journal-side").value);
  const csv=["session,side,reps,peak_lift_degrees,rep_spread_degrees,usable_fraction",
    ...list.map(s=>[s.saved,s.side,s.reps,s.lift.toFixed(2),s.spread?.toFixed(2)??"",s.coverage.toFixed(3)].join(","))].join("\n");
  const url=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
  const a=document.createElement("a");
  a.href=url;
  a.download=sample ? "tendontrack-synthetic-example.csv" : "tendontrack-sessions.csv";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
window.addEventListener("resize",()=>{
  chart($("trace"),result?.trace || [],result?.reps || []);
  refreshJournal();
});
show(null);
refreshJournal();
