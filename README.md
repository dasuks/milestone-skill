# milestone

며칠~1주 규모 작업을 AI 코딩 에이전트에게 끝까지 맡기기 위한 스킬이다.

- **닻 파일**: 레포의 `docs/MILESTONE.md`(30줄 이내)에 목표, 범위, 완료 조건, 단계를 고정한다. 대화가 길어져도 에이전트가 이걸 기준으로 움직인다.
- **워커 분배**: 작업마다 등급(`[자동] [반복] [구현] [판단]`)을 붙이고 등급에 맞는 모델에게 맡긴다.
- **교차 검수**: 단계가 끝나면 구현한 쪽의 반대 회사 모델(Claude ↔ Codex)이 지적만 하고, 감독자가 확인해서 고친다.
- **가드**: 진행 중에 범위를 바꾸는 요청이 오면 바로 하지 않고 "백로그에 넣을까, 마일스톤을 수정할까?"를 묻는다.

## 설치

### Claude Code (권장, 훅 포함)

```
/plugin marketplace add dasuks/milestone-skill
/plugin install milestone@dasuks-milestone
```

플러그인으로 설치하면 닻 파일을 매 메시지마다 맥락에 넣어 주는 훅도 같이 설치된다. 명령은 `/milestone:milestone new`처럼 앞에 플러그인 이름이 붙는다.

### 다른 에이전트 (Codex CLI 등)

```
npx skills add dasuks/milestone-skill -g
```

이 방법은 스킬만 설치하고 훅은 설치하지 않는다. 훅이 없으면 스킬이 매 턴 `docs/MILESTONE.md`를 직접 읽어서 대신한다.

## 필요한 것

| 도구 | 필수 | 없으면 |
|---|---|---|
| Claude Code 또는 Codex CLI | 필수 | — |
| Node.js | 훅을 쓸 때 | 훅 없이 동작(위 참고) |
| Codex CLI (`codex`) | 선택 | 교차 검수를 Claude 서브에이전트가 한다. 같은 회사 모델이라 놓치는 게 더 있을 수 있어 계획 파일에 표시된다 |
| Orca | 선택 | `overnight` 모드도 현재 세션 안에서 돈다. 세션을 닫으면 작업이 멈춘다 |

`run`을 시작할 때 Codex·Orca가 있는지 확인해서 닻 파일 "도구:" 줄에 적는다.

## 사용법

| 입력 | 동작 |
|---|---|
| `/milestone new [설명]` | 완료 조건·범위 밖·위험 단계를 묻고, 닻 파일과 계획 파일을 만든다 |
| `/milestone run` / "계속해" | 다음 단계를 진행한다 |
| `/milestone run careful` | 단계마다 멈추고 확인받는다 |
| `/milestone run overnight` / "끝까지 해줘" | 멈추지 않는다. 위험 단계는 "승인 대기"로 미루고 나머지를 계속한다 |
| `/milestone status` | 현재 단계, 완료 항목, 승인 대기를 보고한다 |
| `/milestone close` | 완료 조건을 확인하고 닻 파일을 지운다 |

위험 단계(운영 DB 변경, 배포, 삭제, 공용 인터페이스 변경, 비밀값, `main` push)는 어떤 모드에서도 승인 없이 하지 않는다.

## 모델 바꾸기

모델 이름은 `skills/milestone/MODEL_ROUTING.md` 한 곳에만 있다. 쓰는 모델이 다르면 이 파일만 고친다. 플러그인으로 설치했으면 업데이트할 때 덮어써지므로, 고친 내용을 유지하려면 이 저장소를 포크해서 쓴다.

## 개발

```
npm test
claude plugin validate .
```

## 라이선스

MIT
