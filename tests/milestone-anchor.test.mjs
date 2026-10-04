import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildAnchor, findRepoRoot, GUARD, MAX_LINES } from "../hooks/milestone-anchor.mjs";

const script = fileURLToPath(new URL("../hooks/milestone-anchor.mjs", import.meta.url));

function makeRepo(milestoneText) {
  const root = mkdtempSync(join(tmpdir(), "ms-anchor-"));
  mkdirSync(join(root, ".git"));
  mkdirSync(join(root, "src", "deep"), { recursive: true });
  if (milestoneText !== undefined) {
    mkdirSync(join(root, "docs"));
    writeFileSync(join(root, "docs", "MILESTONE.md"), milestoneText);
  }
  return root;
}

test("findRepoRoot walks up to the folder containing .git", () => {
  const root = makeRepo();
  try {
    assert.equal(findRepoRoot(join(root, "src", "deep")), root);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("findRepoRoot returns null outside a repo", () => {
  assert.equal(findRepoRoot("/nowhere", () => false), null);
});

test("no milestone file prints nothing", () => {
  const root = makeRepo();
  try {
    assert.equal(buildAnchor(join(root, "src")), "");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("milestone file is printed with header and guard", () => {
  const root = makeRepo("# 현재 마일스톤: 연습\r\n모드: default\r\n");
  try {
    const out = buildAnchor(join(root, "src", "deep"));
    assert.match(out, /^\[active milestone\] /);
    assert.match(out, /# 현재 마일스톤: 연습\n모드: default/);
    assert.ok(out.includes(GUARD));
    assert.ok(!out.includes("\r"));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("long milestone file is cut to MAX_LINES with a warning", () => {
  const lines = Array.from({ length: MAX_LINES + 5 }, (_, i) => `line ${i + 1}`);
  const root = makeRepo(lines.join("\n"));
  try {
    const out = buildAnchor(root);
    assert.ok(out.includes(`line ${MAX_LINES}`));
    assert.ok(!out.includes(`line ${MAX_LINES + 1}\n`));
    assert.match(out, /\[milestone warning\] 닻 파일이 35줄이다/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("CLI reads cwd from stdin JSON and exits 0", () => {
  const root = makeRepo("# 현재 마일스톤: CLI\n");
  try {
    const r = spawnSync(process.execPath, [script], { input: JSON.stringify({ cwd: root }), encoding: "utf8" });
    assert.equal(r.status, 0);
    assert.match(r.stdout, /# 현재 마일스톤: CLI/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("CLI with broken stdin exits 0", () => {
  const r = spawnSync(process.execPath, [script], { input: "not json", encoding: "utf8", cwd: tmpdir() });
  assert.equal(r.status, 0);
});

test("CLI runs when launched through a symlink", (t) => {
  const root = makeRepo("# 현재 마일스톤: LINK\n");
  const linkDir = mkdtempSync(join(tmpdir(), "ms-link-"));
  try {
    const link = join(linkDir, "milestone-anchor.mjs");
    try {
      symlinkSync(script, link, "file");
    } catch (e) {
      if (e.code === "EPERM") { t.skip("symlink creation not permitted"); return; }
      throw e;
    }
    const r = spawnSync(process.execPath, [link], { input: JSON.stringify({ cwd: root }), encoding: "utf8" });
    assert.equal(r.status, 0);
    assert.match(r.stdout, /# 현재 마일스톤: LINK/);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(linkDir, { recursive: true, force: true });
  }
});
