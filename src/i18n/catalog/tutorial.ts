import type { Locale } from "@/i18n/locales";

export const tutorial: Record<Locale, Record<string, string>> = {
  en: {
    "tutorial.trainingGrounds": "Training grounds",
    "tutorial.skipToLocal": "Skip to Local Duel",
    "tutorial.interactive": "Interactive tutorial",
    "tutorial.lessonProgress": "{current} / {total}",
    "tutorial.footerHint":
      "Pick your maneuver, then tap Resolve drill. The bot's action stays hidden until you resolve — same discipline as the local duel.",
    "tutorial.flow":
      "Flow: read the lesson → choose a legal maneuver → Resolve drill to reveal the bot and ledger. Use Retry on a miss, or Next lesson when the drill clears.",
    "tutorial.botPlayed": "Training bot played:",
    "tutorial.botHidden":
      "The bot's maneuver stays hidden until you resolve your pick.",
    "tutorial.yourManeuver": "Your maneuver",
    "tutorial.pickLegal":
      "Choose a legal action for this stance, then resolve the drill.",
    "tutorial.resolveDrill": "Resolve drill",
    "tutorial.lessonCleared": "Lesson cleared",
    "tutorial.tryAgain": "Try again",
    "tutorial.retry": "Retry",
    "tutorial.nextLesson": "Next lesson",
    "tutorial.allComplete": "You have completed all tutorial lessons.",
    "tutorial.tacticalRulesMobile": "Tactical rules",
    "tutorial.l1.title": "Lesson 1: Scissors beats Paper",
    "tutorial.l1.objective": "Commit Scissors while the training bot plays Paper.",
    "tutorial.l1.explanation":
      "Scissors is a fast attack that beats Paper. When they clash, the Paper player takes damage and is staggered.",
    "tutorial.l1.success":
      "Correct — Scissors cut through Paper and forced a stagger.",
    "tutorial.l1.failure":
      "Not quite. You need Scissors to beat their Paper and deal a staggering blow.",
    "tutorial.l2.title": "Lesson 2: Rock starts charge",
    "tutorial.l2.objective": "Commit Rock while the training bot plays Paper.",
    "tutorial.l2.explanation":
      "Rock does not attack immediately. It starts charging. Paper meets a charging Rock without countering—it only answers a Rock release.",
    "tutorial.l2.success":
      "Good — you began charging Rock while their Paper found nothing to counter.",
    "tutorial.l2.failure":
      "Try again with Rock so you enter the charge stance instead of clashing wrong.",
    "tutorial.l3.title": "Lesson 3: Release Rock Lv1",
    "tutorial.l3.objective": "From charge level 1, commit Rock again to release.",
    "tutorial.l3.explanation":
      "Once charged, Rock can be released. A released Rock overpowers an incoming Scissors.",
    "tutorial.l3.success":
      "Solid release — your Rock resolved as a level-one blast and connected for full damage.",
    "tutorial.l3.failure":
      "From CHARGING_LV1 you must commit Rock again to release. Match the training bot's Scissors timing.",
    "tutorial.l4.title": "Lesson 4: Paper counters Rock release",
    "tutorial.l4.objective": "Commit Paper while the bot releases Rock from charge level 1.",
    "tutorial.l4.explanation":
      "Paper only counters the release moment of Rock. Here the bot is releasing—answer with Paper.",
    "tutorial.l4.success":
      "Perfect timing — Paper punished the Rock release for heavy damage and a stagger.",
    "tutorial.l4.failure":
      "Wait for the release and answer with Paper. You need the counter, not a different clash.",
    "tutorial.l5.title": "Lesson 5: Paper does not counter Rock charge",
    "tutorial.l5.objective":
      "Commit Paper while the training bot starts Rock (still charging).",
    "tutorial.l5.explanation":
      "Paper does not counter Rock charging. It only counters Rock release. Here the bot is only starting their charge—you should not get a counter hit.",
    "tutorial.l5.success":
      "Right — their Rock completed into charge while your Paper dealt no counter damage.",
    "tutorial.l5.failure":
      "Use Paper against their Rock start so they finish charging without you countering.",
    "tutorial.l6.title": "Lesson 6: Scissors chips charging Rock",
    "tutorial.l6.objective": "Commit Scissors while the training bot starts Rock.",
    "tutorial.l6.explanation":
      "Scissors only deals chip damage against Rock charging, but the charge still completes.",
    "tutorial.l6.success":
      "Exactly — a single point of chip damage and they still landed in CHARGING_LV1.",
    "tutorial.l6.failure":
      "Strike with Scissors into their Rock start: chip them and let the charge resolve.",
    "tutorial.l7.title": "Lesson 7: Paper Lockout",
    "tutorial.l7.objective":
      "After two consecutive Papers, Paper is locked. Choose another maneuver first.",
    "tutorial.l7.explanation":
      "Your Paper streak is already at 2. Paper is now unavailable until you use a different legal action.",
    "tutorial.l7.success":
      "Correct — you switched actions while Paper was locked.",
    "tutorial.l7.failure":
      "Paper is locked at 2 streak. Pick another legal maneuver.",
    "tutorial.l8.title": "Lesson 8: Third Scissors becomes Rock",
    "tutorial.l8.objective":
      "After two consecutive Scissors, the next Scissors becomes Rock Release Lv1.",
    "tutorial.l8.explanation":
      "The card now displays as Rock · Lv1 Release. Internally it still submits Scissors, then resolves as forced Rock release.",
    "tutorial.l8.success":
      "There it is — your third Scissors resolved as a Rock release instead of another snip.",
    "tutorial.l8.failure":
      "From two Scissors streak, commit Scissors once more so the rule converts it to Rock release.",
  },
  zh: {
    "tutorial.trainingGrounds": "训练场",
    "tutorial.skipToLocal": "跳到本地双人",
    "tutorial.interactive": "交互教程",
    "tutorial.lessonProgress": "{current} / {total}",
    "tutorial.footerHint":
      "选好招式后点「演练结算」。机器人出牌在你结算前保持隐藏——与本地双人相同的纪律。",
    "tutorial.flow":
      "流程：阅读课程 → 选择合法招式 → 「演练结算」揭晓机器人与战报。失误可重试，通过后「下一课」。",
    "tutorial.botPlayed": "训练机器人出牌：",
    "tutorial.botHidden": "在你结算前，机器人的招式保持隐藏。",
    "tutorial.yourManeuver": "你的招式",
    "tutorial.pickLegal": "根据当前姿态选择合法招式，然后开始演练结算。",
    "tutorial.resolveDrill": "演练结算",
    "tutorial.lessonCleared": "课程完成",
    "tutorial.tryAgain": "再来一次",
    "tutorial.retry": "重试",
    "tutorial.nextLesson": "下一课",
    "tutorial.allComplete": "已完成全部教程关卡。",
    "tutorial.tacticalRulesMobile": "战术要点",
    "tutorial.l1.title": "第一课：剪刀克布",
    "tutorial.l1.objective": "在机器人出布时，你选择剪刀。",
    "tutorial.l1.explanation":
      "剪刀是快攻，克制布。双方正面相撞时，布方受伤并进入僵直。",
    "tutorial.l1.success": "正确——剪刀切开布并打出僵直。",
    "tutorial.l1.failure": "还不太对。你需要用剪刀击败对方的布并造成僵直。",
    "tutorial.l2.title": "第二课：石头开始蓄力",
    "tutorial.l2.objective": "在机器人出布时，你选择石头。",
    "tutorial.l2.explanation":
      "石头不会立刻出手，而是进入蓄力。布遇到正在蓄力的石头无法反制——只有石头释放瞬间才能被布反制。",
    "tutorial.l2.success": "很好——你开始蓄力石头，而对方的布无处反制。",
    "tutorial.l2.failure": "再用石头试一次，正确进入蓄力姿态，而不是打成别的碰撞。",
    "tutorial.l3.title": "第三课：释放石头一段",
    "tutorial.l3.objective": "在蓄力一段时，再次选择石头以释放。",
    "tutorial.l3.explanation":
      "蓄力完成后石头可以释放。释放的石头压制迎面而来的剪刀。",
    "tutorial.l3.success": "释放漂亮——一段石头完整命中并打出足额伤害。",
    "tutorial.l3.failure":
      "在「蓄力一段」时必须再次选石头才能释放，跟上机器人剪刀的节奏。",
    "tutorial.l4.title": "第四课：布反制石头释放",
    "tutorial.l4.objective": "机器人从蓄力一段释放石头时，你选择布。",
    "tutorial.l4.explanation":
      "布只在石头释放的瞬间反制。这里是释放窗口——用布回击。",
    "tutorial.l4.success": "时机完美——布在释放点反制，重创并僵直对手。",
    "tutorial.l4.failure": "等待释放再用布，你需要的是反制而不是别的对撞。",
    "tutorial.l5.title": "第五课：布不能反制石头蓄力",
    "tutorial.l5.objective": "机器人刚开始蓄力石头（仍在蓄力）时，你选择布。",
    "tutorial.l5.explanation":
      "布不能反制正在蓄力的石头，只能反制释放。这里机器人只是起手蓄力——你不应打出反制伤害。",
    "tutorial.l5.success":
      "没错——对方石头顺利完成蓄力，你的布没有造成反制伤害。",
    "tutorial.l5.failure":
      "在对方石头起手时用布，让对方完成蓄力而你不要打出反制。",
    "tutorial.l6.title": "第六课：剪刀蹭蓄力石头",
    "tutorial.l6.objective": "机器人开始蓄力石头时，你选择剪刀。",
    "tutorial.l6.explanation":
      "剪刀对蓄力中的石头只能蹭少量伤害，但蓄力仍会完成。",
    "tutorial.l6.success": "正好——打出 1 点蹭血，对方仍进入蓄力一段。",
    "tutorial.l6.failure":
      "用剪刀打在石头起手：蹭血并让蓄力照常结算。",
    "tutorial.l7.title": "第七课：连续出布限制",
    "tutorial.l7.objective":
      "你已经连续出了两次布。现在布被锁定，必须先换一个招式。",
    "tutorial.l7.explanation":
      "当前布连击已到 2。下一回合不能继续出布，需先使用其他合法招式解除锁定。",
    "tutorial.l7.success":
      "正确——你在布被锁定时成功切换了其他招式。",
    "tutorial.l7.failure":
      "布连击达到 2 后会被锁定，请选择其他合法招式。",
    "tutorial.l8.title": "第八课：第三次剪刀变石头",
    "tutorial.l8.objective":
      "你已经连续出了两次剪刀。下一次剪刀会强制变成一段石头释放。",
    "tutorial.l8.explanation":
      "卡面会直接显示为「石头 · 一段释放」。内部仍提交剪刀输入，但结算会强制转为石头释放。",
    "tutorial.l8.success":
      "就是这样——第三次剪刀结算为石头释放，而不是又一记剪刀。",
    "tutorial.l8.failure":
      "在剪刀二连后，再出一次剪刀让规则把它转为石头释放。",
  },
};
