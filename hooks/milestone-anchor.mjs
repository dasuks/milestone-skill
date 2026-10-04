#!/usr/bin/env node
// UserPromptSubmit 훅: 레포 최상위에 docs/MILESTONE.md가 있으면 감독자 맥락에 주입한다.
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const MAX_LINES = 30;
export const GUARD =
  "[milestone guard] 범위를 바꾸는 요청이면 바로 하지 말고 '백로그에 넣을까, 마일스톤을 수정할까?'를 먼저 묻는다. 질문·잡담·작은 딴 작업은 막지 않고, 작은 딴 작업은 계획 파일에 '마일스톤 밖 작업'으로 기록한다.";

export function findRepoRoot(start, exists = existsSync) {
  let dir = resolve(start);
  for (;;) {
    if (exists(join(dir, ".git"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function buildAnchor(cwd, io = {}) {
  const exists = io.exists ?? existsSync;
  const read = io.read ?? ((p) => readFileSync(p, "utf8"));
  const root = findRepoRoot(cwd, exists);
  if (!root) return "";
  const file = join(root, "docs", "MILESTONE.md");
  if (!exists(file)) return "";
  const lines = read(file).replace(/\r\n/g, "\n").trimEnd().split("\n");
  const body = lines.slice(0, MAX_LINES).join("\n");
  const warning = lines.length > MAX_LINES
    ? `\n[milestone warning] 닻 파일이 ${lines.length}줄이다. ${MAX_LINES}줄 이내로 줄인다.`
    : "";
  return `[active milestone] ${file}\n${body}${warning}\n${GUARD}\n`;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  try {
    let cwd = process.cwd();
    try {
      const input = JSON.parse(await readStdin());
      if (typeof input?.cwd === "string" && input.cwd) cwd = input.cwd;
    } catch { /* 입력이 없거나 JSON이 아니면 현재 폴더를 쓴다 */ }
    process.stdout.write(buildAnchor(cwd));
  } catch { /* 훅은 프롬프트를 막지 않는다 */ }
  process.exitCode = 0;
}

function realPath(p) {
  try { return realpathSync(p); } catch { return resolve(p); }
}

// 링크·junction 경로로 실행돼도 main이 돌도록 실제 경로끼리 비교한다.
if (process.argv[1] && realPath(process.argv[1]) === realPath(fileURLToPath(import.meta.url))) {
  await main();
}
