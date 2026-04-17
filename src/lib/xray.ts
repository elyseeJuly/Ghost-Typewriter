/**
 * xray.ts — X-Ray 透析扫描引擎
 * 最终防线：统计学指纹剥离 (Statistical Fingerprint Detox)
 * 
 * 三色高亮系统：
 * 红色 (xray-cliche)   → 高频 AI 套话
 * 蓝色 (xray-trans)    → 平滑逻辑连词
 * 黄色 (xray-struct)   → 对称排比结构
 */

// ─────────────────────────────────────────────
// 词典定义
// ─────────────────────────────────────────────

/** 高频 AI 套话词典（红色） */
export const DICT_CLICHES = [
  // 中文核心高危词
  '总的来说', '总而言之', '综上所述', '不难发现', '值得注意的是',
  '不可否认', '毋庸置疑', '众所周知', '不言而喻', '显而易见',
  '与此同时', '不仅如此', '除此之外', '在此基础上', '与之相对',
  '从某种意义上说', '从长远来看', '从某种程度上说', '在某种程度上',
  '不得不说', '可以说是', '堪称典范', '脱颖而出',
  '深入探讨', '深度剖析', '全面分析', '系统梳理', '深刻理解',
  '底层逻辑', '核心逻辑', '顶层设计', '赋能', '闭环', '落地',
  '刻板印象', '范式转移', '元叙事',
  '令人深思', '引人深思', '发人深省', '耐人寻味',
  '日新月异', '方兴未艾', '与时俱进', '开拓进取',
  '波澜壮阔', '蓬勃发展', '欣欣向荣',
  '画卷', '图景', '格局',
  // 英文
  'in conclusion', 'to summarize', 'it is worth noting', 'it goes without saying',
  'needless to say', 'it is undeniable that', 'it is evident that', 'evidently',
  'it is important to', 'it is crucial to', 'one must consider',
  'delve into', 'tapestry', 'testament to', 'in the realm of',
  'navigate the complexities', 'at the end of the day',
  'think outside the box', 'move the needle', 'circle back', 'synergy',
  'leverage', 'paradigm shift', 'game-changer', 'disruptive',
];

/** 平滑逻辑连词（蓝色） */
export const DICT_TRANSITIONS = [
  // 中文
  '然而', '但是', '不过', '尽管如此', '话虽如此',
  '因此', '所以', '故而', '从而', '进而',
  '首先', '其次', '再次', '最后', '最终',
  '一方面', '另一方面', '相比之下', '与此相对',
  '此外', '另外', '加之', '再者', '况且',
  '换而言之', '换句话说', '也就是说', '即',
  '正如', '犹如', '如同',
  // 英文
  'however', 'nevertheless', 'nonetheless', 'on the other hand',
  'therefore', 'thus', 'hence', 'consequently', 'as a result',
  'firstly', 'secondly', 'finally', 'in addition', 'furthermore',
  'moreover', 'additionally', 'besides', 'also',
  'in contrast', 'on the contrary', 'conversely',
  'in other words', 'that is to say', 'namely',
  'for example', 'for instance', 'such as',
  'in summary', 'in short', 'to put it simply',
];

/** 对称排比结构模式（黄色）— 用正则 */
export const PATTERN_STRUCTURES: Array<{ pattern: RegExp; label: string }> = [
  // "一方面...另一方面" 配对
  { pattern: /一方面[^。！？\n]{2,50}(另一方面|同时)/g, label: '排比结构' },
  // "不仅...而且" 配对
  { pattern: /不仅[^。！？\n]{1,40}而且/g, label: '递进排比' },
  // "既...又" 配对
  { pattern: /既[^，。！？\n]{1,30}又/g, label: '并列排比' },
  // 三连结构（X、Y、Z）
  { pattern: /[\u4e00-\u9fa5]{1,8}[、，,][^\n]{1,20}[、，,][^\n]{1,20}(和|与|及|以及)/g, label: '三元排比' },
  // 英文三连
  { pattern: /\b\w+(?:ing|ly|tion|ness)\b[,，]\s*\w+(?:ing|ly|tion|ness)\b[,，]\s*(?:and|or)\s*\w+(?:ing|ly|tion|ness)\b/gi, label: 'Tricolon' },
  // "首先...其次...最后" 三段式
  { pattern: /首先[^。！？]{5,60}(其次|然后)[^。！？]{5,60}(最后|最终)/gs, label: '三段式' },
  // "First...Second...Finally"
  { pattern: /first(?:ly)?[^.!?]{10,100}second(?:ly)?[^.!?]{10,100}(?:finally|lastly)/gi, label: 'First-Second-Finally' },
];

// ─────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────

/** 转义 HTML 实体，防止 XSS */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface XRayCounts {
  cliches: number;
  transitions: number;
  structures: number;
  total: number;
}

export interface XRayResult {
  html: string;
  counts: XRayCounts;
}

/**
 * 核心 X-Ray 扫描函数
 * 输入纯文本，输出带高亮 <span> 的 HTML 及计数
 */
export function runXRayScan(rawText: string): XRayResult {
  // 先转义，再做标记
  let text = escapeHtml(rawText);

  let clicheCount = 0;
  let transCount = 0;
  let structCount = 0;

  // 使用占位符系统避免 span 嵌套
  // 各类 match 收集 { start, end, cls, tip, type }
  interface Match { start: number; end: number; cls: string; tip: string; type: 'c' | 't' | 's' }
  const matches: Match[] = [];

  // ── 1. 高频套话（红色）
  for (const phrase of DICT_CLICHES) {
    const escapedPhrase = escapeHtml(phrase);
    let idx = text.indexOf(escapedPhrase);
    while (idx !== -1) {
      matches.push({ start: idx, end: idx + escapedPhrase.length, cls: 'xray-cliche', tip: '高频套话', type: 'c' });
      idx = text.indexOf(escapedPhrase, idx + escapedPhrase.length);
    }
  }

  // ── 2. 平滑连词（蓝色）
  for (const word of DICT_TRANSITIONS) {
    const escapedWord = escapeHtml(word);
    let idx = text.indexOf(escapedWord);
    while (idx !== -1) {
      matches.push({ start: idx, end: idx + escapedWord.length, cls: 'xray-trans', tip: '平滑连词', type: 't' });
      idx = text.indexOf(escapedWord, idx + escapedWord.length);
    }
  }

  // ── 3. 对称排比（黄色）
  for (const { pattern, label } of PATTERN_STRUCTURES) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      matches.push({ start: match.index, end: match.index + match[0].length, cls: 'xray-struct', tip: label, type: 's' });
    }
  }

  // 去重并按 start 排序，消除重叠（优先套话 > 连词 > 排比）
  matches.sort((a, b) => a.start - b.start || (a.type === 'c' ? -1 : 1));

  // 合并重叠区间
  const merged: Match[] = [];
  for (const m of matches) {
    const last = merged[merged.length - 1];
    if (last && m.start < last.end) {
      // 重叠：保留优先级高的（c > t > s）
      const priority = (x: Match) => x.type === 'c' ? 0 : x.type === 't' ? 1 : 2;
      if (priority(m) < priority(last)) {
        merged[merged.length - 1] = { ...m, end: Math.max(m.end, last.end) };
      }
      continue;
    }
    merged.push(m);
  }

  // 统计
  for (const m of merged) {
    if (m.type === 'c') clicheCount++;
    else if (m.type === 't') transCount++;
    else structCount++;
  }

  // 构建输出 HTML（从后往前替换，避免偏移）
  let result = text;
  for (let i = merged.length - 1; i >= 0; i--) {
    const { start, end, cls, tip } = merged[i];
    const original = result.slice(start, end);
    const wrapped = `<span class="${cls}" data-tip="${tip}" title="[AI特征] ${tip}">${original}</span>`;
    result = result.slice(0, start) + wrapped + result.slice(end);
  }

  // 将换行符转为 <br>
  result = result.replace(/\n/g, '<br>');

  return {
    html: result,
    counts: {
      cliches: clicheCount,
      transitions: transCount,
      structures: structCount,
      total: clicheCount + transCount + structCount,
    },
  };
}

/**
 * 从带 span 标签的编辑器 HTML 中提取纯文本（用于导出）
 */
export function extractCleanText(editorHtml: string): string {
  const div = document.createElement('div');
  div.innerHTML = editorHtml;
  // 将 <br> 还原为换行
  div.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
  return div.innerText || div.textContent || '';
}

/**
 * 安全区阈值
 */
export const XRAY_SAFE_THRESHOLD = 3;
