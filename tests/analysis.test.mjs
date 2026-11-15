import {test} from "node:test";
import assert from "node:assert/strict";
import {demoTrace,footAngle,summarize} from "../site/analysis.mjs";

test("counts complete cycles and reports spread",()=>{
  const r=summarize(demoTrace([15,18,21,16]));
  assert.equal(r.reps.length,4);
  assert.ok(r.lift>15 && r.lift<21);
  assert.ok(r.spread>0);
});
test("ignores a rise without a visible return",()=>{
  const r=summarize(demoTrace([18,18]).filter(p=>p.t<=4.15));
  assert.equal(r.reps.length,1);
});
test("does not bridge missing observations",()=>{
  const r=summarize(demoTrace([18,18]).map(p=>p.t>1.6 && p.t<2.3 ? {...p,angle:null} : p));
  assert.equal(r.reps.length,1);
});
test("rejects an obscured tracked foot and handles mirror direction",()=>{
  const pose=[];
  pose[27]={x:.4,y:.7,visibility:.9};
  pose[29]={x:.4,y:.8,visibility:.95};
  pose[31]={x:.49,y:.85,visibility:.9};
  const normal=footAngle(pose,"left",1920,1080);
  assert.ok(normal>0);
  pose[31].x=.31;
  assert.ok(Math.abs(normal-footAngle(pose,"left",1920,1080))<1e-8);
  pose[29].visibility=.3;
  assert.equal(footAngle(pose,"left",1920,1080),null);
});
