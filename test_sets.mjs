// node test_sets.mjs
import assert from "node:assert/strict";
import { parseSets, parseTime, fmtTime, pacePer100 } from "./sets.mjs";

const { rows, total } = parseSets(`Warmup:
400 swim
8x100 free @1:30
4 X 50 kick

200 cooldown`);
assert.equal(total, 400 + 800 + 200 + 200);
assert.deepEqual(rows[0], { heading: "Warmup" });
assert.deepEqual(rows[2], { reps: 8, dist: 100, label: "free @1:30" });
assert.equal(rows[3].reps, 4);
assert.deepEqual(parseSets("1:30 rest").rows[0], { heading: "1:30 rest" });

// groups: dash-marked, indented, and blank-line terminated
let p = parseSets(`3x
- 100 free
- 2x50 kick
200 cooldown`);
assert.equal(p.rows.length, 2);
assert.deepEqual(p.rows[0], { group: true, reps: 3, dist: 200, label: "",
  items: [{ reps: 1, dist: 100, label: "free" }, { reps: 2, dist: 50, label: "kick" }] });
assert.equal(p.total, 3 * 200 + 200);
p = parseSets("4 rounds:\n  100 free\n  50 back\nCooldown\n200");
assert.equal(p.rows[0].reps, 4); assert.equal(p.rows[0].items.length, 2);
assert.deepEqual(p.rows[1], { heading: "Cooldown" });
assert.equal(p.total, 4 * 150 + 200);
p = parseSets("2x through:\n100 free\n50 fly\n\n300 pull");
assert.equal(p.rows[0].label, "through"); assert.equal(p.rows[0].dist, 150);
assert.equal(p.total, 300 + 300);
assert.equal(parseSets("3 x 100 free").rows[0].dist, 100); // not a group
assert.equal(parseSets("4x50").rows[0].reps, 4);

assert.equal(parseTime("55"), 3300);
assert.equal(parseTime("55:30"), 3330);
assert.equal(parseTime("1:05:30"), 3930);
assert.equal(parseTime(""), 0);
assert.equal(parseTime("4830"), 48 * 60 + 30);
assert.equal(parseTime("930"), 9 * 60 + 30);
assert.equal(parseTime("12000"), 3600 + 20 * 60);
assert.equal(parseTime("012000"), 3600 + 20 * 60);
assert.equal(fmtTime(3930), "1:05:30");
assert.equal(fmtTime(90), "1:30");
assert.equal(pacePer100(1800, 2000), "1:30");
assert.equal(pacePer100(0, 2000), "");
console.log("ok");
