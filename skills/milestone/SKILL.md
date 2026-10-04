---
name: milestone
description: Plan, run, and guard a multi-day milestone with subagent, codex exec, or Orca workers, model routing, and cross-vendor review. Use when the user runs /milestone, asks to create, continue, or finish a milestone, or says "끝까지 해줘"/"계속해"/"이어서 해" while docs/MILESTONE.md exists.
---

# 마일스톤

며칠~1주 규모 작업을 닻 파일로 고정하고, 워커에게 나눠 맡기고, 교차 검수로 닫는다. 한 레포에 동시에 하나만 진행한다.

- 닻: 레포의 `docs/MILESTONE.md` (30줄 이내). 훅이 매 메시지마다 주입한다.
- 계획: 닻 "계획:"이 가리키는 파일.
- 모델: 이 스킬 폴더의 `MODEL_ROUTING.md`. 모델 이름이 바뀌면 이 파일만 고친다.

## 명령

Claude Code 플러그인으로 설치했으면 명령 앞에 플러그인 이름이 붙는다(`/milestone:milestone new`). 아래 표는 스킬로 설치했을 때 이름이다.

| 입력 | 동작 |
|---|---|
| `/milestone new [설명]` | 아래 "시작" |
| `/milestone run` / "계속해" / "이어서 해" | 닻의 모드로 `run.md`를 따른다 |
| `/milestone run careful` / `run overnight` / "끝까지 해줘"(=overnight) | 닻 모드를 바꾸고 `run.md`를 따른다 |
| `/milestone status` | 닻과 계획 파일로 현재 단계, 완료 항목, 승인 대기를 보고한다 |
| `/milestone close` | 완료 조건을 하나씩 확인 → 레포 상태 문서(있으면 `docs/STATUS.md`) 갱신 → 닻 파일 삭제. 계획 파일은 남긴다. 완료 조건이 하나라도 안 맞거나 승인 대기가 남아 있으면 목록을 보여 주고 "그래도 닫을까?"를 묻는다. 닫으면 미완 항목을 계획 파일 백로그로 옮긴 뒤 닻을 지운다 |

## 시작 (`new`)

1. 닻 파일이 이미 있으면 기존 마일스톤을 `close`할지 먼저 묻는다.
2. 직전 대화의 계획·설계 논의(grill-me·brainstorming 같은 스킬을 썼다면 그 결과)와 기존 스펙·계획 파일을 찾는다.
3. 빠진 것만 묻는다: 완료 조건, 범위 밖, 위험 단계.
4. 계획 파일을 정한다. `writing-plans`가 만든 계획이 있으면 새로 쓰지 않고 그 작업마다 등급을 덧붙인다. 없으면 `templates/plan.md`로 `docs/milestones/<이름>/plan.md`를 만든다.
5. 작업마다 `[자동] [반복] [구현] [판단]` 중 하나를 붙인다.
6. `templates/MILESTONE.md`로 닻 초안을 만들고, 닻·단계 목록·작업별 등급과 모델을 보여 주고 승인받은 뒤 파일을 쓴다.

## 가드

진행 중에는 사용자 요청을 나눈다.
- 질문·잡담: 그냥 답한다.
- 작은 딴 작업: 해 주고 계획 파일 "마일스톤 밖 작업"에 기록한다.
- 범위를 바꾸는 요청: 바로 하지 않고 "백로그에 넣을까, 마일스톤을 수정할까?"를 묻는다. 수정이면 닻을 고친 뒤 승인받는다.

이번 턴 맥락에 `[active milestone]` 줄이 없으면 훅이 없는 것이다. 그럴 때는 매 턴 `docs/MILESTONE.md`를 직접 읽는다.

## 검수

단계가 끝나면 `review.md`를 따른다.
