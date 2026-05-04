# RPS Tactical Duel（战术猜拳）项目说明文档

## 1. 项目概述

项目名称：**RPS Tactical Duel**

这是一个基于“石头 / 剪刀 / 布”变体规则设计的战术博弈游戏。

它不是普通猜拳游戏，而是一个：

- 同步回合制
- 双人隐藏选择
- 无随机结算
- 读招与反制为核心
- 状态机驱动
- 可扩展到 AI / 联机 / 排位的战斗系统

核心体验：

> 读人 > 运气

玩家需要通过观察对手习惯、状态、资源压力，预测对手下一步行动，并选择合适的反制方式。

---

## 2. 当前 MVP 目标

当前阶段只做 **本地双人可玩原型**。

MVP 必须完成：

- 本地双人 Pass-and-Play
- 玩家 1 隐藏选择行动
- 玩家 2 隐藏选择行动
- 双方同时公开
- 战斗结算 Resolve
- HP 系统
- 石头蓄力系统
- 布反制系统
- 剪刀压制系统
- 僵直系统
- Heat / 连续使用惩罚系统
- 战斗日志
- 胜负判断
- 重新开始游戏

MVP 暂时不要做：

- 联机
- 账号系统
- 排位
- AI 对战
- iOS 封装
- 数据库
- 复杂动画
- 音乐
- 视频过场
- 复杂美术资源

---

## 3. 推荐技术栈

建议使用：

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vitest

核心要求：

> 战斗规则逻辑必须和 UI 分离。

不要把战斗结算逻辑写在 React Component 里面。

核心战斗逻辑应该写成纯函数：

```ts
resolveRound(previousGameState, p1InputAction, p2InputAction): GameState
```

这个函数未来应该可以复用于：

- 本地双人模式
- AI 对战
- 网页联机
- 回放系统
- 单元测试

---

## 4. 初始数值

每个玩家初始数值：

| 项目 | 数值 |
|---|---:|
| HP | 30 |
| 初始状态 | NORMAL |
| scissorsStreak | 0 |
| paperStreak | 0 |

胜利条件：

```txt
对方 HP <= 0
```

如果双方同一回合 HP 同时归零，则为平局。

---

## 5. 玩家状态

请使用字符串枚举，不要使用 0 / 1 / 2 / 3 这类裸数字。

```ts
type PlayerState =
  | "NORMAL"
  | "CHARGING_LV1"
  | "CHARGING_LV2"
  | "STAGGERED";
```

状态说明：

| 状态 | 含义 |
|---|---|
| NORMAL | 正常状态，可以选择基础行动 |
| CHARGING_LV1 | 石头蓄力 1 阶段 |
| CHARGING_LV2 | 石头蓄力 2 阶段 |
| STAGGERED | 僵直状态，下一回合无法行动 |

---

## 6. 玩家输入行动

玩家在 UI 上看到的行动：

```ts
type InputAction =
  | "SCISSORS"
  | "ROCK"
  | "PAPER"
  | "HOLD";
```

注意：

同一个输入行动，在不同状态下含义不同。

例如：

| 当前状态 | 输入 | 实际含义 |
|---|---|---|
| NORMAL | ROCK | 开始蓄力 |
| CHARGING_LV1 | ROCK | 释放石头 Lv1 |
| CHARGING_LV2 | ROCK | 释放石头 Lv2 |

---

## 7. 内部实际行动

规则引擎需要把玩家输入行动转换成内部实际行动。

```ts
type EffectiveAction =
  | "SCISSORS_ATTACK"
  | "PAPER_COUNTER"
  | "PAPER_EXHAUSTED"
  | "ROCK_START_CHARGE"
  | "ROCK_HOLD_CHARGE"
  | "ROCK_RELEASE_LV1"
  | "ROCK_RELEASE_LV2"
  | "STUNNED_SKIP"
  | "INVALID";
```

---

## 8. 不同状态下的可选行动

### 8.1 NORMAL 状态

允许：

- SCISSORS
- ROCK
- PAPER

不允许：

- HOLD

行动映射：

| 输入 | 实际行动 |
|---|---|
| SCISSORS | SCISSORS_ATTACK |
| ROCK | ROCK_START_CHARGE |
| PAPER | PAPER_COUNTER |

---

### 8.2 CHARGING_LV1 状态

允许：

- SCISSORS
- ROCK
- PAPER
- HOLD

行动映射：

| 输入 | 实际行动 |
|---|---|
| SCISSORS | SCISSORS_ATTACK |
| ROCK | ROCK_RELEASE_LV1 |
| PAPER | PAPER_COUNTER |
| HOLD | ROCK_HOLD_CHARGE |

设计含义：

玩家在石头 Lv1 蓄力后，可以选择：

- 释放石头 Lv1
- 继续蓄力到 Lv2
- 转布反制
- 转剪刀抢节奏

---

### 8.3 CHARGING_LV2 状态

允许：

- ROCK
- PAPER

不允许：

- SCISSORS
- HOLD

行动映射：

| 输入 | 实际行动 |
|---|---|
| ROCK | ROCK_RELEASE_LV2 |
| PAPER | PAPER_COUNTER |

设计含义：

石头 Lv2 压力更强，但灵活性更低。

玩家只能：

- 释放石头 Lv2
- 转布反制

---

### 8.4 STAGGERED 状态

允许：

- 无行动

任何输入都应被转换为：

```ts
"STUNNED_SKIP"
```

僵直玩家本回合跳过行动。

如果本回合没有再次被打入僵直，则回合结束后状态恢复为：

```ts
"NORMAL"
```

---

## 9. 伤害常量

建议统一写在 `constants.ts`。

```ts
export const INITIAL_HP = 30;

export const SCISSORS_DAMAGE = 3;
export const SCISSORS_PAPER_HEAT_DAMAGE = 5;
export const SCISSORS_CHIP_DAMAGE = 1;

export const ROCK_LV1_DAMAGE = 6;
export const ROCK_LV2_DAMAGE = 8;

export const PAPER_COUNTER_DAMAGE = 10;
```

---

## 10. 石头系统

石头是压力制造器。

### 10.1 开始蓄力

```txt
NORMAL + ROCK => CHARGING_LV1
```

这一回合不造成伤害。

---

### 10.2 继续蓄力

```txt
CHARGING_LV1 + HOLD => CHARGING_LV2
```

这一回合不造成伤害。

---

### 10.3 释放石头 Lv1

```txt
CHARGING_LV1 + ROCK => ROCK_RELEASE_LV1
```

伤害：

```txt
6
```

---

### 10.4 释放石头 Lv2

```txt
CHARGING_LV2 + ROCK => ROCK_RELEASE_LV2
```

伤害：

```txt
8
```

---

### 10.5 石头设计意义

石头的作用不是单纯打伤害，而是制造压力。

它迫使对手猜测：

- 你会不会释放？
- 你会不会继续蓄力？
- 你会不会转布？
- 你会不会在 Lv1 转剪刀？

---

## 11. 布系统

布是反制工具。

核心规则：

> 布只反制石头释放，不反制石头蓄力。

---

### 11.1 布 vs 石头释放

如果布面对石头释放：

```txt
PAPER_COUNTER beats ROCK_RELEASE_LV1
PAPER_COUNTER beats ROCK_RELEASE_LV2
```

结果：

- 布使用者造成 10 点伤害
- 石头释放者进入 STAGGERED
- 石头伤害被取消

---

### 11.2 布 vs 石头蓄力

如果布面对石头蓄力：

```txt
PAPER_COUNTER vs ROCK_START_CHARGE
PAPER_COUNTER vs ROCK_HOLD_CHARGE
```

结果：

- 布没有效果
- 不造成伤害
- 石头蓄力正常进行

---

### 11.3 布 vs 剪刀

如果布面对剪刀：

```txt
SCISSORS_ATTACK beats PAPER_COUNTER
```

结果：

- 剪刀使用者造成伤害
- 布使用者进入 STAGGERED

---

## 12. 布 Heat 机制

布不能无限安全使用。

每个玩家需要记录：

```ts
paperStreak: number
```

规则：

| 连续使用布次数 | 效果 |
|---:|---|
| 1 | 正常布 |
| 2 | 布仍然有效，但如果输给剪刀，会受到更高伤害 |
| 3 或以上 | 布自动疲劳，反制失败 |

---

### 12.1 paperStreak 更新规则

如果玩家选择 PAPER：

```txt
paperStreak += 1
```

如果玩家选择非 PAPER 行动：

```txt
paperStreak = 0
```

如果玩家处于 STAGGERED 跳过行动：

```txt
paperStreak = 0
```

---

### 12.2 第二次连续布

第二次连续使用布时：

- 仍然可以正常反制石头释放
- 但如果被剪刀命中，受到 5 点伤害，而不是 3 点

```txt
SCISSORS_PAPER_HEAT_DAMAGE = 5
```

---

### 12.3 第三次连续布

第三次连续使用布时，布变为：

```ts
"PAPER_EXHAUSTED"
```

疲劳布效果：

- 不能反制石头释放
- 面对剪刀会失败
- 面对石头蓄力无事发生
- 面对石头释放时，石头伤害正常生效

---

## 13. 剪刀系统

剪刀是快速压制工具。

基础伤害：

```txt
3
```

---

### 13.1 剪刀 vs 布

```txt
SCISSORS_ATTACK beats PAPER_COUNTER
```

结果：

- 剪刀使用者造成 3 点伤害
- 布使用者进入 STAGGERED

如果布使用者的 `paperStreak >= 2`：

- 剪刀伤害变为 5

---

### 13.2 剪刀 vs 石头蓄力

如果剪刀攻击正在蓄力但没有释放的石头：

```txt
SCISSORS_ATTACK vs ROCK_START_CHARGE
SCISSORS_ATTACK vs ROCK_HOLD_CHARGE
```

结果：

- 剪刀造成 1 点 chip damage
- 石头蓄力仍然继续
- 石头使用者不进入僵直

---

### 13.3 剪刀 vs 石头释放

如果剪刀面对石头释放：

```txt
ROCK_RELEASE beats SCISSORS_ATTACK
```

结果：

- 剪刀使用者受到石头伤害
- 剪刀伤害不生效
- 石头使用者不进入僵直

---

## 14. 剪刀连续使用机制

每个玩家需要记录：

```ts
scissorsStreak: number
```

规则：

| 连续使用剪刀次数 | 效果 |
|---:|---|
| 1 | 正常剪刀 |
| 2 | 正常剪刀 |
| 3 | 自动转为石头 Lv1 释放 |
| 4 | 重新循环 |

---

### 14.1 scissorsStreak 更新规则

如果玩家选择 SCISSORS：

```txt
scissorsStreak += 1
```

如果玩家选择非 SCISSORS 行动：

```txt
scissorsStreak = 0
```

如果玩家处于 STAGGERED 跳过行动：

```txt
scissorsStreak = 0
```

---

### 14.2 第三次连续剪刀

当：

```txt
scissorsStreak === 3
```

该行动自动转为：

```ts
"ROCK_RELEASE_LV1"
```

效果：

- 造成 6 点石头伤害
- 按石头释放规则参与结算
- 回合结束后 scissorsStreak 重置为 0

设计目的：

> 防止玩家无限剪刀压制。

---

## 15. 核心克制关系

基础克制：

```txt
Scissors > Paper
Paper > Rock Release
Rock Release > Scissors
```

重要区别：

```txt
Paper only counters Rock Release.
Paper does not counter Rock Charge.
```

也就是说：

| 对局 | 结果 |
|---|---|
| 剪刀 vs 布 | 剪刀赢 |
| 布 vs 石头释放 | 布赢 |
| 石头释放 vs 剪刀 | 石头赢 |
| 布 vs 石头蓄力 | 无事发生，石头继续蓄力 |
| 剪刀 vs 石头蓄力 | 剪刀造成 1 点伤害，石头继续蓄力 |

---

## 16. 回合流程

每一回合流程：

```txt
1. 玩家 1 选择行动
2. 玩家 1 确认
3. 显示 Pass Device 遮罩
4. 玩家 2 接过设备
5. 玩家 2 选择行动
6. 玩家 2 确认
7. 同时公开双方行动
8. 调用 resolveRound
9. 更新 HP / 状态 / streak
10. 生成战斗日志
11. 判断胜负
12. 进入下一回合
```

禁止：

```txt
玩家 2 在选择前看到玩家 1 的行动
```

---

## 17. 游戏阶段

```ts
type GamePhase =
  | "P1_PICK"
  | "PASS_TO_P2"
  | "P2_PICK"
  | "RESOLVE"
  | "ROUND_END"
  | "GAME_OVER";
```

阶段说明：

| 阶段 | 含义 |
|---|---|
| P1_PICK | 玩家 1 选择行动 |
| PASS_TO_P2 | 设备交给玩家 2 |
| P2_PICK | 玩家 2 选择行动 |
| RESOLVE | 结算中 |
| ROUND_END | 本回合结束，展示结果 |
| GAME_OVER | 游戏结束 |

---

## 18. Resolve 结算顺序

`resolveRound` 必须按照以下顺序处理。

---

### Step 1：转换输入行动

根据玩家当前状态，把输入行动转换为实际行动。

例子：

```txt
P1 state = NORMAL
P1 input = ROCK
=> P1 effectiveAction = ROCK_START_CHARGE
```

例子：

```txt
P1 state = CHARGING_LV1
P1 input = ROCK
=> P1 effectiveAction = ROCK_RELEASE_LV1
```

例子：

```txt
P1 state = STAGGERED
P1 input = SCISSORS
=> P1 effectiveAction = STUNNED_SKIP
```

---

### Step 2：处理 Paper Heat 与 Scissors Streak

需要在结算前判断：

- 玩家是否连续第三次使用 PAPER
- 玩家是否连续第三次使用 SCISSORS

如果第三次连续 PAPER：

```txt
PAPER_COUNTER => PAPER_EXHAUSTED
```

如果第三次连续 SCISSORS：

```txt
SCISSORS_ATTACK => ROCK_RELEASE_LV1
```

---

### Step 3：结算双方实际行动

重要对局：

| 行动 A | 行动 B | 结果 |
|---|---|---|
| SCISSORS_ATTACK | PAPER_COUNTER | 剪刀赢，布方受伤并僵直 |
| PAPER_COUNTER | ROCK_RELEASE_LV1 | 布赢，石头方受 10 伤并僵直 |
| PAPER_COUNTER | ROCK_RELEASE_LV2 | 布赢，石头方受 10 伤并僵直 |
| ROCK_RELEASE_LV1 | SCISSORS_ATTACK | 石头赢，剪刀方受 6 伤 |
| ROCK_RELEASE_LV2 | SCISSORS_ATTACK | 石头赢，剪刀方受 8 伤 |
| PAPER_COUNTER | ROCK_START_CHARGE | 无伤害，石头进入 Lv1 |
| PAPER_COUNTER | ROCK_HOLD_CHARGE | 无伤害，石头进入 Lv2 |
| SCISSORS_ATTACK | ROCK_START_CHARGE | 剪刀造成 1 点伤害，石头进入 Lv1 |
| SCISSORS_ATTACK | ROCK_HOLD_CHARGE | 剪刀造成 1 点伤害，石头进入 Lv2 |
| SCISSORS_ATTACK | SCISSORS_ATTACK | 双方各受 3 伤 |
| PAPER_COUNTER | PAPER_COUNTER | 无伤害 |
| ROCK_RELEASE_LV1 | ROCK_RELEASE_LV1 | 双方各受 6 伤 |
| ROCK_RELEASE_LV2 | ROCK_RELEASE_LV2 | 双方各受 8 伤 |
| ROCK_RELEASE_LV1 | ROCK_RELEASE_LV2 | Lv1 方受 8 伤，Lv2 方受 6 伤 |
| ROCK_START_CHARGE | ROCK_START_CHARGE | 双方进入 ChargingLv1 |
| ROCK_HOLD_CHARGE | ROCK_HOLD_CHARGE | 双方进入 ChargingLv2 |

---

### Step 4：扣除 HP

HP 不能小于 0。

```ts
hp = Math.max(0, hp - damage);
```

---

### Step 5：更新状态

状态更新规则：

| 实际行动 | 回合后状态 |
|---|---|
| ROCK_START_CHARGE | CHARGING_LV1 |
| ROCK_HOLD_CHARGE | CHARGING_LV2 |
| ROCK_RELEASE_LV1 | NORMAL |
| ROCK_RELEASE_LV2 | NORMAL |
| PAPER_COUNTER | NORMAL |
| PAPER_EXHAUSTED | NORMAL |
| SCISSORS_ATTACK | NORMAL |
| STUNNED_SKIP | NORMAL |

特殊规则：

如果某玩家本回合被打入 STAGGERED，则最终状态必须是：

```ts
"STAGGERED"
```

僵直优先级高于普通状态变化。

---

### Step 6：更新 Streak

根据玩家原始输入行动更新。

如果玩家本回合是 STUNNED_SKIP：

```txt
scissorsStreak = 0
paperStreak = 0
```

如果玩家选择 PAPER：

```txt
paperStreak += 1
scissorsStreak = 0
```

如果玩家选择 SCISSORS：

```txt
scissorsStreak += 1
paperStreak = 0
```

如果玩家选择 ROCK 或 HOLD：

```txt
scissorsStreak = 0
paperStreak = 0
```

如果玩家第三次连续 SCISSORS 触发 forced Rock：

```txt
scissorsStreak = 0
```

---

### Step 7：生成战斗日志

每回合需要生成易读日志。

示例：

```txt
Round 3:
P1 released Rock Lv1.
P2 used Paper Counter.
P2 successfully countered the Rock release and dealt 10 damage.
P1 is staggered.
```

日志必须解释：

- 双方做了什么
- 谁克制了谁
- 造成了多少伤害
- 谁进入了什么状态
- 为什么发生这个结果

---

### Step 8：判断胜负

如果 P1 HP <= 0 且 P2 HP <= 0：

```ts
winner = "DRAW"
phase = "GAME_OVER"
```

如果 P1 HP <= 0：

```ts
winner = "P2"
phase = "GAME_OVER"
```

如果 P2 HP <= 0：

```ts
winner = "P1"
phase = "GAME_OVER"
```

否则进入下一回合。

---

## 19. 推荐数据结构

```ts
export type PlayerId = "P1" | "P2";

export type PlayerState =
  | "NORMAL"
  | "CHARGING_LV1"
  | "CHARGING_LV2"
  | "STAGGERED";

export type InputAction =
  | "SCISSORS"
  | "ROCK"
  | "PAPER"
  | "HOLD";

export type EffectiveAction =
  | "SCISSORS_ATTACK"
  | "PAPER_COUNTER"
  | "PAPER_EXHAUSTED"
  | "ROCK_START_CHARGE"
  | "ROCK_HOLD_CHARGE"
  | "ROCK_RELEASE_LV1"
  | "ROCK_RELEASE_LV2"
  | "STUNNED_SKIP"
  | "INVALID";

export type GamePhase =
  | "P1_PICK"
  | "PASS_TO_P2"
  | "P2_PICK"
  | "RESOLVE"
  | "ROUND_END"
  | "GAME_OVER";

export interface PlayerSnapshot {
  id: PlayerId;
  hp: number;
  state: PlayerState;
  scissorsStreak: number;
  paperStreak: number;
}

export interface RoundLog {
  round: number;
  messages: string[];
}

export interface GameState {
  roundNumber: number;
  phase: GamePhase;
  p1: PlayerSnapshot;
  p2: PlayerSnapshot;
  p1PendingAction?: InputAction;
  p2PendingAction?: InputAction;
  lastEffectiveActions?: {
    p1: EffectiveAction;
    p2: EffectiveAction;
  };
  logs: RoundLog[];
  winner?: PlayerId | "DRAW";
}
```

---

## 20. 推荐文件结构

```txt
src/
  app/
    page.tsx

  components/
    BattleScreen.tsx
    PlayerPanel.tsx
    ActionButtons.tsx
    BattleLog.tsx
    PassDeviceOverlay.tsx
    GameOverPanel.tsx

  game/
    types.ts
    constants.ts
    initialState.ts
    actionAvailability.ts
    resolveRound.ts
    resolveRound.test.ts
    logMessages.ts
```

文件职责：

| 文件 | 作用 |
|---|---|
| types.ts | 类型定义 |
| constants.ts | 数值常量 |
| initialState.ts | 初始游戏状态 |
| actionAvailability.ts | 判断当前状态可用行动 |
| resolveRound.ts | 核心战斗结算 |
| resolveRound.test.ts | 单元测试 |
| logMessages.ts | 战斗日志文案 |

---

## 21. UI 要求

MVP UI 不需要复杂美术。

优先使用清晰的卡牌式界面。

页面需要显示：

- 游戏标题
- 当前回合数
- 当前阶段
- P1 HP
- P2 HP
- P1 状态
- P2 状态
- P1 streak 信息
- P2 streak 信息
- 当前玩家可选行动
- 确认按钮
- Pass Device 遮罩
- 战斗日志
- 游戏结束面板
- 重新开始按钮

---

## 22. 本地双人隐藏选择流程

流程：

```txt
P1_PICK
P1 chooses action
P1 confirms
PASS_TO_P2 overlay appears
P2 clicks "I am Player 2"
P2_PICK
P2 chooses action
P2 confirms
resolveRound is called
ROUND_END displays result
Next round starts
```

核心要求：

> P2 在选择行动前，不能看到 P1 的选择。

---

## 23. 行动按钮规则

根据当前玩家状态显示或启用按钮。

### NORMAL

显示：

- Scissors
- Rock
- Paper

禁用：

- Hold

### CHARGING_LV1

显示：

- Scissors
- Rock
- Paper
- Hold

### CHARGING_LV2

显示：

- Rock
- Paper

禁用：

- Scissors
- Hold

### STAGGERED

不允许选择行动。

显示提示：

```txt
You are staggered and will skip this round.
```

---

## 24. 必须添加的测试

在做 UI 之前，必须先为规则引擎添加测试。

测试列表：

1. NORMAL + ROCK 应进入 CHARGING_LV1
2. CHARGING_LV1 + HOLD 应进入 CHARGING_LV2
3. CHARGING_LV1 + ROCK 应释放 Rock Lv1
4. CHARGING_LV2 + ROCK 应释放 Rock Lv2
5. Rock Lv1 释放命中时造成 6 点伤害
6. Rock Lv2 释放命中时造成 8 点伤害
7. Paper 能反制 Rock Lv1 release
8. Paper 能反制 Rock Lv2 release
9. Paper 不能反制 Rock start charge
10. Paper 不能反制 Rock hold charge
11. Scissors 能击败 Paper
12. Scissors 击败 Paper 后 Paper 使用者进入 STAGGERED
13. 第二次连续 Paper 被 Scissors 命中时受到 5 点伤害
14. 第三次连续 Paper 变为 PAPER_EXHAUSTED
15. PAPER_EXHAUSTED 不能反制 Rock release
16. Scissors vs Rock charging 只造成 1 点伤害
17. Rock release 击败 Scissors
18. 第三次连续 Scissors 自动转为 Rock Lv1 release
19. STAGGERED 玩家跳过一回合
20. STAGGERED 玩家跳过后恢复 NORMAL
21. 双方 Scissors 时双方各受 3 点伤害
22. 双方 Rock release 时双方互相受伤
23. HP 不会低于 0
24. P1 HP 归零时 P2 获胜
25. P2 HP 归零时 P1 获胜
26. 双方同回合 HP 归零时 DRAW

---

## 25. 开发优先级

### Phase 1：规则引擎

目标：

- 完成 types
- 完成 constants
- 完成 initialState
- 完成 actionAvailability
- 完成 resolveRound
- 完成测试

不要做 UI。

---

### Phase 2：本地双人 UI

目标：

- 完成 Pass-and-Play
- 完成行动选择
- 完成隐藏选择
- 完成回合结算展示
- 完成战斗日志
- 完成 Game Over

---

### Phase 3：UI 打磨

目标：

- 状态徽章
- HP 条
- 行动说明
- 战斗结果摘要
- 移动端适配
- 简单动画

---

### Phase 4：AI 对战

目标：

- 添加 Player vs AI
- AI 只能根据公开信息决策
- AI 不能偷看玩家当前选择
- AI 使用简单策略权重

---

### Phase 5：网页联机

目标：

- 房间码
- 创建房间
- 加入房间
- 双方隐藏提交行动
- 服务器统一结算
- 双方同步结果

联机阶段不要在 MVP 开始前做。

---

## 26. 未来联机设计

未来联机建议：

- Frontend：Next.js / React
- Realtime Server：Node.js + Socket.IO
- Database：Supabase Postgres，可选
- Frontend Deploy：Vercel
- Socket Server Deploy：Render / Railway / Fly.io

联机核心原则：

> 双方行动在都提交前不能公开。

基础联机流程：

```txt
1. P1 创建房间
2. P2 使用房间码加入
3. P1 提交行动到服务器
4. P2 提交行动到服务器
5. 服务器在双方都提交前隐藏行动
6. 双方都提交后，服务器调用 resolveRound
7. 服务器广播结算结果
8. 双方进入下一回合
```

不要让客户端自己决定正式比赛结果。

正式联机中，服务器应该是权威方。

---

## 27. 代码要求

必须：

- 使用 TypeScript
- 使用清晰类型
- 使用常量管理数值
- 使用纯函数处理战斗逻辑
- 添加单元测试
- 保持 UI 和规则分离
- 保持文件职责清楚
- 日志必须易读

避免：

- 把所有代码写进 page.tsx
- 把规则逻辑散落在组件里
- 使用裸数字表示状态
- 写无法测试的结算逻辑
- 过早加入联机
- 过早加入复杂动画
- 过早加入图片资源

---

## 28. MVP 完成标准

MVP 完成时，用户应该可以：

- 打开网页
- 开始一局本地双人游戏
- P1 隐藏选择行动
- P2 隐藏选择行动
- 双方行动同时公开
- 系统正确结算胜负关系
- HP 正确变化
- 状态正确变化
- 石头蓄力正确工作
- 布反制正确工作
- 剪刀压制正确工作
- 僵直正确工作
- Paper Heat 正确工作
- Scissors Streak 正确工作
- 战斗日志解释每回合发生了什么
- 游戏能判断 P1 胜利、P2 胜利或平局
- 玩家可以重新开始游戏

---

## 29. 项目本质

这个项目的重点不是“做一个普通猜拳”。

它的本质是：

> 一个可扩展的、确定性同步回合制战斗系统。

未来可扩展方向：

- AI 对战
- 联机 PVP
- 技能系统
- 卡组系统
- 角色系统
- 排位系统
- 移动端封装
- 战斗回放
- 数据统计

但当前阶段必须先完成：

> 稳定、可测试、可玩的本地 MVP。