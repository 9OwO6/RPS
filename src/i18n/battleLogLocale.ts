import { buildMessageTable } from "@/i18n/catalog/index";
import type { Locale } from "@/i18n/locales";

function inputZh(table: Record<string, string>, raw: string): string {
  const k = `action.${raw}.short`;
  return table[k] ?? raw;
}

function stateTokenZh(table: Record<string, string>, raw: string): string {
  const k = `invalid.token.${raw}`;
  return table[k] ?? raw;
}

/**
 * Display-layer translation for English lines stored by resolveRound / logMessages.
 * Does not modify engine output — only used when rendering logs.
 */
export function translateBattleLogLine(locale: Locale, line: string): string {
  if (locale === "en") return line;

  const table = buildMessageTable("zh");

  const roundM = line.match(/^Round (\d+):$/);
  if (roundM) {
    return `第 ${roundM[1]} 回合：`;
  }

  const invalidM = line.match(
    /^(P1|P2) attempted (SCISSORS|ROCK|PAPER|HOLD) while ([^;]+); the action is invalid and has no effect\.$/,
  );
  if (invalidM) {
    const player = invalidM[1];
    const input = inputZh(table, invalidM[2]);
    const stateTok = invalidM[3].trim();
    const stateZh = stateTokenZh(table, stateTok);
    return `${player} 在 ${stateZh} 状态下尝试 ${input}，招式无效，不产生效果。`;
  }

  const effM = line.match(/^(P1|P2) (.+)$/);
  if (effM) {
    const player = effM[1];
    const rest = effM[2];
    const map: Record<string, string> = {
      "used Scissors.": `${player} 使出剪刀。`,
      "used Paper (Counter).": `${player} 使用布（反制）。`,
      "used Paper (Exhausted).": `${player} 使用布（衰竭）。`,
      "started charging Rock (Lv1).": `${player} 开始蓄力石头（一段）。`,
      "continued charging Rock (Lv2).": `${player} 继续蓄力石头（二段）。`,
      "released Rock Lv1.": `${player} 释放石头一段。`,
      "released Rock Lv2.": `${player} 释放石头二段。`,
      "is staggered and skips this round.": `${player} 僵直，本回合跳过行动。`,
      "has no valid action this round.": `${player} 本回合没有可用招式。`,
    };
    const hit = map[rest];
    if (hit) return hit;
  }

  const scissorsPaper = line.match(
    /^Scissors from (P1|P2) beats Paper from (P1|P2)\. (P1|P2) takes (\d+) damage and is staggered\.$/,
  );
  if (scissorsPaper) {
    const [, atk, def, victim, dmg] = scissorsPaper;
    return `${atk} 的剪刀克制 ${def} 的布；${victim} 受到 ${dmg} 点伤害并僵直。`;
  }

  let m = line.match(
    /^Paper from (P1|P2) counters (P1|P2)'s Rock release\. (P1|P2) takes 10 damage and is staggered\.$/,
  );
  if (m) {
    const [, atk, def, victim] = m;
    return `${atk} 的布反制 ${def} 的石头释放；${victim} 受到 10 点伤害并僵直。`;
  }

  m = line.match(
    /^Exhausted Paper from (P1|P2) fails to counter Rock release\. (P1|P2) takes (\d+) damage\.$/,
  );
  if (m) {
    const [, holder, victim, dmg] = m;
    return `${holder} 的衰竭布未能反制石头释放；${victim} 受到 ${dmg} 点伤害。`;
  }

  m = line.match(
    /^Rock release from (P1|P2) beats Scissors from (P1|P2)\. (P1|P2) takes (\d+) damage\.$/,
  );
  if (m) {
    const [, rockP, , victim, dmg] = m;
    return `${rockP} 的石头释放压制 ${victim} 的剪刀；${victim} 受到 ${dmg} 点伤害。`;
  }

  m = line.match(
    /^Scissors from (P1|P2) chips (P1|P2) during Rock charging for 1 damage; charging continues\.$/,
  );
  if (m) {
    const [, s, r] = m;
    return `${s} 的剪刀在 ${r} 蓄力石头时蹭到 1 点伤害；蓄力继续进行。`;
  }

  const fixed: Record<string, string> = {
    "Both players used Scissors; each takes 3 damage.":
      "双方均出剪刀；各受 3 点伤害。",
    "Both players used Paper variants; neither scores a Rock counter, so nothing happens.":
      "双方均为布系交锋；未触发石头反制，无事发生。",
    "Both players released Rock (Lv1 vs Lv2); the Lv1 player takes 8 damage and the Lv2 player takes 6 damage.":
      "双方均释放石头（一段对二段）；一段方受 8 点伤害，二段方受 6 点伤害。",
    "Both players started charging Rock; each reaches charging Lv1.":
      "双方同时开始蓄力石头；均达到蓄力一段。",
    "Both players held Rock charge; each reaches charging Lv2.":
      "双方同时续蓄石头；均达到蓄力二段。",
    "One player started charging while the other held charge; no damage is dealt.":
      "一方起手蓄力而另一方续蓄；未造成伤害。",
    "Paper clashes with charging Rock; no damage is dealt and charging completes.":
      "布与蓄力中的石头相撞；无伤害，蓄力照常完成。",
    "Rock release hits an opponent while they charge; the charging player takes full Rock damage and still completes charging.":
      "石头释放命中正在蓄力的对手；蓄力方吃满石头伤害并完成蓄力。",
    "Rock release hits a passive opponent; P2 takes damage.":
      "石头释放命中被动一方；P2 受到伤害。",
    "Rock release hits a passive opponent; P1 takes damage.":
      "石头释放命中被动一方；P1 受到伤害。",
    "Scissors hits a passive opponent; P2 takes 3 damage.":
      "剪刀命中被动一方；P2 受到 3 点伤害。",
    "Scissors hits a passive opponent; P1 takes 3 damage.":
      "剪刀命中被动一方；P1 受到 3 点伤害。",
    "A player charges Rock while the opponent cannot attack; no damage is dealt.":
      "一方蓄力石头而对手无法出击；未造成伤害。",
    "Paper finds no Rock release to counter; no damage is dealt.":
      "布没有找到可反制的石头释放；未造成伤害。",
    "Both sides are passive; nothing happens.":
      "双方均为被动；无事发生。",
    "No impactful interaction occurs this round.":
      "本回合没有决定性交锋。",
  };
  if (fixed[line]) return fixed[line];

  m = line.match(/^Both players released Rock Lv(\d); each takes (\d+) damage\.$/);
  if (m) {
    const lvl = m[1];
    const dmg = m[2];
    return `双方均释放石头 Lv${lvl}；各受到 ${dmg} 点伤害。`;
  }

  return line;
}
