// Workout shorthand -> rows. One set per line:
//   "400 warmup", "8x100 free @1:30", "4 x 50 kick". Lines without a distance are headings.
// Groups: a "3x" / "3 rounds" / "3x through:" line, then its sets on lines starting with
// "-" or indentation. A blank line, heading, or unmarked line (once marked ones were used) ends it.
// ponytail: no groups inside groups; add when you swim them.
const SET = /^\s*(?:(\d+)\s*[x×*]\s*)?(\d+)(?![\d:])\s*(.*)$/i;
const GROUP = /^(\d+)\s*(?:[x×*]|rounds?\b)(?!\s*\d)\s*(.*?)\s*:?$/i;
const MARK = /^(?:\s+|\s*[-•]\s*)/;

function parseSet(line) {
  const m = line.match(SET);
  return m ? { reps: +(m[1] || 1), dist: +m[2], label: m[3].trim() } : null;
}

export function parseSets(text) {
  const rows = [];
  let group = null;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) { group = null; continue; }
    const g = line.match(GROUP);
    const marked = MARK.test(raw);
    if (group && !g && (marked || !group.marked)) {
      const body = raw.replace(MARK, "").trim(), s = parseSet(body);
      if (s || marked) { // unmarked non-set line (a heading) closes the group instead
        group.items.push(s || { heading: body });
        if (s) group.dist += s.reps * s.dist;
        group.marked ||= marked;
        continue;
      }
    }
    group = null;
    if (g) { group = { group: true, reps: +g[1], dist: 0, label: g[2].replace(/:$/, ""), items: [], marked: false }; rows.push(group); continue; }
    const s = parseSet(line);
    rows.push(s || { heading: line.replace(/:$/, "") });
  }
  for (const r of rows) delete r.marked;
  return { rows, total: rows.reduce((t, r) => t + (r.heading ? 0 : r.reps * r.dist), 0) };
}

// "1:05:30" | "55:00" | "55" (minutes) | "4830" (48:30) | "12000" (1:20:00) -> seconds; "" -> 0
// Colon-free digits exist because the iPhone number pad has no ":".
export function parseTime(s) {
  s = s.trim();
  if (/^\d{3,6}$/.test(s)) s = s.padStart(s.length + (s.length % 2), "0").match(/../g).join(":");
  const parts = s.split(":").filter(Boolean).map(Number);
  if (!parts.length || parts.some(isNaN)) return 0;
  if (parts.length === 1) return parts[0] * 60;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

export function fmtTime(sec) {
  sec = Math.round(sec);
  const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export const pacePer100 = (sec, dist) => (dist > 0 && sec > 0 ? fmtTime(sec / (dist / 100)) : "");

export const fmtNum = n => Math.round(n).toLocaleString("en-US");
