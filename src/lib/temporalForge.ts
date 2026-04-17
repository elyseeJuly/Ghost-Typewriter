/**
 * temporalForge.ts — 时间戳伪造引擎
 * 
 * 对抗平台元数据与编辑行为分析（如知乎编辑时间戳）。
 * 将一次性生成的文本，伪造成历时 2~3 小时、多次反复修改的人类写作时间轴。
 */

export interface EditTrailEntry {
  version: string;         // "v1.0", "v1.1", etc.
  timestamp: Date;
  durationSince: string;   // human-readable elapsed
  action: EditAction;
  paragraphHint: string;   // which paragraph was touched
  charCount: number;
}

export type EditAction =
  | '初稿完成'
  | '修改措辞'
  | '重写段落'
  | '添加细节'
  | '删除冗余'
  | '调整结构'
  | '最终校对'
  | '发布前检查';

const EDIT_ACTIONS: EditAction[] = [
  '修改措辞', '重写段落', '添加细节', '删除冗余', '调整结构',
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatElapsed(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  if (hrs === 0) return `${mins} 分钟`;
  return `${hrs} 小时 ${remainMins} 分钟`;
}

function pickAction(): EditAction {
  return EDIT_ACTIONS[Math.floor(Math.random() * EDIT_ACTIONS.length)];
}

/**
 * 核心：反推伪造编辑时间轴
 * 
 * @param text          最终定稿文本
 * @param totalDurationMs  模拟总写作时长（默认 2h）
 * @param editCount     伪造中间修改次数（默认 5~9 次）
 * @param startOffset   从多少ms之前开始（默认当前时间）
 */
export function forgeEditTrail(
  text: string,
  totalDurationMs = 7200000, // 2 hours
  editCount?: number,
  startOffset?: number
): EditTrailEntry[] {
  const now = new Date();
  const startTime = new Date(now.getTime() - (startOffset ?? totalDurationMs));
  const numEdits = editCount ?? randomBetween(5, 9);

  // Split text into paragraphs for realistic paragraph hints
  const paragraphs = text
    .split(/\n{1,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  const paraCount = Math.max(1, paragraphs.length);

  const trail: EditTrailEntry[] = [];

  // Step 1: 初稿完成（在开始后 15~40 分钟）
  const draftOffset = randomBetween(15, 40) * 60000;
  const draftTime = new Date(startTime.getTime() + draftOffset);
  trail.push({
    version: 'v1.0',
    timestamp: draftTime,
    durationSince: formatElapsed(draftOffset),
    action: '初稿完成',
    paragraphHint: `全文 ${text.length} 字`,
    charCount: Math.round(text.length * randomBetween(60, 85) / 100), // draft is shorter
  });

  // Step 2: 多次中间修改（非线性时间跳跃）
  // Generate random time offsets between draft and end, sorted
  const rawOffsets: number[] = [];
  for (let i = 0; i < numEdits; i++) {
    rawOffsets.push(randomBetween(draftOffset + 600000, totalDurationMs - 300000));
  }
  rawOffsets.sort((a, b) => a - b);

  // Also randomly skip & re-visit (duplicate some offsets with small delta)
  rawOffsets.forEach((off, idx) => {
    if (Math.random() < 0.3 && idx < rawOffsets.length - 1) {
      // insert a "re-open" ~5min after
      rawOffsets.splice(idx + 1, 0, off + randomBetween(3, 8) * 60000);
    }
  });

  rawOffsets.slice(0, numEdits).forEach((offset, i) => {
    const editTime = new Date(startTime.getTime() + offset);
    const paraIdx = Math.floor(Math.random() * paraCount);
    const paraSnippet = paragraphs[paraIdx]?.slice(0, 20) ?? '段落';
    const versionMinor = i + 1;
    const charDelta = randomBetween(-80, 200);

    trail.push({
      version: `v1.${versionMinor}`,
      timestamp: editTime,
      durationSince: formatElapsed(offset),
      action: pickAction(),
      paragraphHint: `第 ${paraIdx + 1} 段：「${paraSnippet}…」`,
      charCount: text.length + charDelta,
    });
  });

  // Step 3: 最终校对 + 发布前检查
  const preFinalTime = new Date(now.getTime() - randomBetween(5, 15) * 60000);
  trail.push({
    version: `v1.${numEdits + 1}`,
    timestamp: preFinalTime,
    durationSince: formatElapsed(totalDurationMs - randomBetween(5, 15) * 60000),
    action: '最终校对',
    paragraphHint: '全文审阅',
    charCount: text.length,
  });
  trail.push({
    version: `v1.${numEdits + 2}`,
    timestamp: now,
    durationSince: formatElapsed(totalDurationMs),
    action: '发布前检查',
    paragraphHint: `定稿 ${text.length} 字`,
    charCount: text.length,
  });

  return trail;
}

/**
 * 构建含伪造编辑历史的 Markdown 导出文件
 */
export function buildExportMarkdown(cleanText: string, trail: EditTrailEntry[]): string {
  const lines: string[] = [cleanText, '', '---'];
  lines.push('');

  for (const entry of trail) {
    const iso = entry.timestamp.toISOString().replace('T', ' ').slice(0, 19);
    lines.push(`<!-- Edit ${entry.version} | Time: ${iso} | Action: ${entry.action} | ${entry.paragraphHint} | chars: ${entry.charCount} -->`);
  }

  lines.push('');
  lines.push(`<!-- Total writing session: ${formatElapsed(trail[trail.length - 1].timestamp.getTime() - trail[0].timestamp.getTime())} -->`);

  return lines.join('\n');
}

/**
 * 格式化时间戳为可读字符串（用于 UI 显示）
 */
export function formatTimestamp(date: Date): string {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
