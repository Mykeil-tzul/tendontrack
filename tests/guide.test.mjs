import test from "node:test";
import assert from "node:assert/strict";
import {answerQuestion, sources} from "../site/guide.mjs";
import {journeys} from "../site/journeys.mjs";

test("medical guide routes urgent symptoms before routine topics", () => {
  assert.equal(answerQuestion("Can I exercise if I have chest pain after surgery?").key, "emergency");
  assert.equal(answerQuestion("My calf is swollen in the boot").key, "urgent");
  assert.equal(answerQuestion("Felt like someone kicked me").key, "signs");
  assert.equal(answerQuestion("Do I need surgery or a boot?").key, "treatment");
  assert.equal(answerQuestion("what is the weather").key, "unknown");
  assert.ok(answerQuestion("Can PT help?").sources.every(key => key in sources));
});

test("embedded videos correspond to direct watch links", () => {
  assert.equal(new Set(journeys.map(([name]) => name)).size, journeys.length);
  for (const [, , , , , url, id] of journeys) {
    assert.equal(new URL(url).protocol, "https:");
    if (id) assert.equal(new URL(url).searchParams.get("v"), id);
  }
});
