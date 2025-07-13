import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT = path.join(__dirname, '..', 'public', 'x12_segments.json');
const OUTPUT = path.join(__dirname, '..', 'public', 'x12_segments_flat.json');

function fmtQualifier(qualObj) {
  const pairs = Object.entries(qualObj || {}).map(([code, desc]) => `${code}=${desc}`);
  return pairs.length ? ` (${pairs.join(', ')})` : '';
}

function flatten(obj) {
  const dict = {};
  for (const [seg, val] of Object.entries(obj)) {
    if (seg === 'default') {
      dict[seg] = val; // pass through
      continue;
    }

    // If already flat (element keys are strings of numbers)
    const isFlat = Object.values(val).every(v => typeof v === 'string');
    if (isFlat) {
      dict[seg] = val;
      continue;
    }

    const elementsContainer = val.elements || val; // handle when nested under elements or directly
    const flatSeg = {};
    for (const [elemPos, elemVal] of Object.entries(elementsContainer)) {
      if (typeof elemVal === 'string') {
        flatSeg[elemPos.padStart(2, '0')] = elemVal;
      } else if (elemVal && typeof elemVal === 'object') {
        const desc = elemVal.name || '';
        const qualifier = fmtQualifier(elemVal.qualifiers);
        flatSeg[elemPos.padStart(2, '0')] = `${desc}${qualifier}`.trim();
      }
    }
    if (Object.keys(flatSeg).length) dict[seg] = flatSeg;
  }
  return dict;
}

function main() {
  const raw = fs.readFileSync(INPUT, 'utf8');
  const json = JSON.parse(raw);
  const flat = flatten(json);
  fs.writeFileSync(OUTPUT, JSON.stringify(flat, null, 2));
  console.log(`Flattened segments written to ${OUTPUT}`);
  console.log(`Total segments: ${Object.keys(flat).length}`);
}

main();
