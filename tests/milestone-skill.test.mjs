import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { MAX_LINES } from "../hooks/milestone-anchor.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const skill = join(root, "skills", "milestone");
const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");

test("SKILL.md frontmatter names milestone and allows auto invocation", () => {
  const text = read(join(skill, "SKILL.md"));
  const fm = text.split("\n---")[0];
  assert.match(fm, /^---\nname: milestone\n/);
  assert.match(fm, /\ndescription: .+/);
  assert.ok(!fm.includes("disable-model-invocation"));
});

test("every file SKILL.md points to exists", () => {
  const text = read(join(skill, "SKILL.md"));
  for (const rel of ["run.md", "review.md", "templates/MILESTONE.md", "templates/plan.md"]) {
    assert.ok(text.includes(rel), `SKILL.md should mention ${rel}`);
    assert.ok(existsSync(join(skill, rel)), `${rel} should exist`);
  }
  assert.ok(text.includes("MODEL_ROUTING.md"));
  assert.ok(existsSync(join(skill, "MODEL_ROUTING.md")));
});

test("skill files have no machine-specific paths", () => {
  for (const rel of ["SKILL.md", "run.md", "review.md", "MODEL_ROUTING.md"]) {
    assert.ok(!/[A-Z]:[\\/]/.test(read(join(skill, rel))), `${rel} has an absolute Windows path`);
  }
});

test("anchor template fits the hook limit and has every field", () => {
  const text = read(join(skill, "templates", "MILESTONE.md")).trimEnd();
  assert.ok(text.split("\n").length <= MAX_LINES);
  for (const field of ["모드:", "목표:", "범위:", "범위 밖:", "완료 조건:", "단계:", "승인 대기:", "계획:"]) {
    assert.ok(text.includes(field), `missing ${field}`);
  }
});

test("routing table has every tier", () => {
  const text = read(join(skill, "MODEL_ROUTING.md"));
  for (const tier of ["[자동]", "[반복]", "[구현]", "[판단]", "[검수]"]) assert.ok(text.includes(tier), tier);
});
