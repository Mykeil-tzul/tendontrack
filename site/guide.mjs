export const sources = {
  aaos: ["AAOS OrthoInfo · Achilles tendon rupture", "https://www.orthoinfo.org/bodypart/foot-ankle/achilles-tendon-rupture-tear/"],
  aossm: ["American Orthopaedic Society for Sports Medicine", "https://www.sportsmed.org/achilles-tendon-injuries"],
  trial: ["Myhrvold et al. · Randomized treatment trial", "https://www.nejm.org/doi/full/10.1056/NEJMoa2108447"],
  rehab: ["Worcestershire NHS · Management and rehabilitation", "https://www.worcsacute.nhs.uk/leaflets/achilles-tendon-rupture-management-and-rehabilitation/"],
  clot: ["Kent Community Health NHS · Blood clot symptoms", "https://www.kentcht.nhs.uk/leaflet/deep-vein-thrombosis-dvt/"],
  followup: ["Plymouth NHS · Achilles rehabilitation and follow-up", "https://www.plymouthhospitals.nhs.uk/display-pil/pil-achilles-tendon-rupture-rehabilitation-8516"],
};

const topics = {
  emergency: ["Get emergency help now", "New chest pain, sudden shortness of breath or coughing blood can be signs of a clot in the lungs. Call your local emergency number now. Do not drive yourself.", ["clot"]],
  urgent: ["Contact a clinician urgently", "New one-sided calf swelling, warmth or pain during recovery or immobilization needs urgent medical assessment for a possible blood clot. Increasing redness, drainage or fever after surgery also needs prompt contact with your surgical team. Chest pain or trouble breathing needs emergency help.", ["clot", "followup"]],
  signs: ["Could this be a rupture?", "A sudden pop or the feeling of being kicked behind the heel or calf can happen with an Achilles tear. Swelling, bruising and weak push-off are other clues. Being able to walk does not rule it out. If this just happened, stop activity and seek prompt in-person assessment. Avoid stretching or testing the tendon yourself.", ["aaos", "aossm"]],
  diagnosis: ["How clinicians check", "A clinician asks how the injury happened and examines strength and tendon continuity. A calf squeeze can help assess the tendon. Ultrasound or MRI may help if the diagnosis is unclear or the clinician needs more detail. A home test or video cannot confirm a tear.", ["aaos", "rehab"]],
  treatment: ["Surgery or a structured nonsurgical plan?", "Both paths can treat an acute rupture. Nonsurgical treatment uses protection in a boot or cast and a supervised progression. Surgical treatment repairs the tendon and also requires rehab. In a randomized trial, the groups had similar patient-reported function at one year. Rerupture was more frequent without surgery, and surgery increased nerve injuries. Ask about your tear, health and activity goals, the risks on each path, and access to follow-up and PT.", ["aaos", "trial"]],
  protect: ["Boot, walking and early recovery", "Early recovery usually focuses on protecting the tendon. Boot angle, heel wedges, crutches, weight bearing and when to remove the boot depend on your treatment plan. Ask your care team what you may do today and what needs clearance before changing anything.", ["aaos", "rehab"]],
  rehab: ["Why physical therapy matters", "Rehab gradually restores movement, walking, calf strength and activity tolerance after either treatment. A physical therapist can teach you what to do at home and progress the load when it is appropriate. Ask what to practice now, which symptoms to report and how progress will be measured.", ["aaos", "rehab"]],
  return: ["Returning to work, running or sport", "Recovery is measured in months and varies with the injury, treatment and activity. Ask your clinician about the milestones they use for your specific goal, such as walking, strength and sport-specific testing. Athlete stories show individual experiences. A video score or a calendar date cannot clear you to return.", ["aaos", "aossm"]],
  unknown: ["Bring this question to your care team", "I couldn’t match your question to a sourced guide. You can rephrase it or choose a topic below. For personal symptoms or treatment decisions, contact your clinician.", ["aaos"]],
};

const routes = [
  ["emergency", /chest (pain|hurts?|tightness)|short(ness)? of breath|(?:can.?t|cannot|hard to|trouble|difficulty) breathe|trouble breathing|cough(?:ing)?(?: up)? blood|pulmonary embol|breathless/],
  ["urgent", /blood clot|\bdvt\b|calf (?:is )?(?:swollen|warm|pain)|swoll(?:en|ing) calf|one.sided.*swell|wound|drainage|fever/],
  ["signs", /\bpop(?:ped)?\b|snap|kicked|weak push|bruis|just (?:tore|hurt|injured)|symptom|did i tear|tore my|retear|rupture again/],
  ["treatment", /surg|non.?op|operat|treatment/],
  ["diagnosis", /diagnos|\bmri\b|ultrasound|thompson|calf squeeze|partial|complete tear|know.*tear/],
  ["return", /return|\bsport|run(?:ning)?|drive|work again|how long|timeline|basketball/],
  ["protect", /boot|crutch|cast|wedge|weight.bear|\bwalk|first week/],
  ["rehab", /\bpt\b|physio|physical therap|rehab|strength|stretch|exercis|heel.rais|calf.rais/],
];

export function answerQuestion(question) {
  const key = routes.find(([, pattern]) => pattern.test(question.toLowerCase()))?.[0] ?? "unknown";
  return {key, title: topics[key][0], text: topics[key][1], sources: topics[key][2]};
}
