/**
 * injectors.ts — 前端脚本层投毒
 * 第一防线：词法与物理层投毒 (Lexical & Physical Poisoning)
 * 纯前端，零 API 调用，无副作用
 */

// ─────────────────────────────────────────────
// 同音错别字替换表（中文）
// ─────────────────────────────────────────────
const TYPO_MAP_ZH: Record<string, string[]> = {
  '的': ['地', '得'],
  '得': ['的', '地'],
  '地': ['得', '的'],
  '在': ['再', '哉'],
  '再': ['在', '载'],
  '已': ['以', '亦'],
  '以': ['已', '亦'],
  '做': ['作'],
  '作': ['做'],
  '像': ['象'],
  '象': ['像'],
  '带': ['戴'],
  '戴': ['带'],
  '帶': ['戴'],
  '她': ['他'],
  '他': ['她'],
  '那': ['哪'],
  '里': ['裡', '俚'],
  '裡': ['里'],
  '向': ['象', '像'],
  '因此': ['因次'],
  '其实': ['奇实'],
  '分析': ['分晰'],
  '体现': ['体显'],
  '但是': ['但事'],
  '然后': ['然侯'],
  '关键': ['关建'],
  '通过': ['通这'],
};

// 英文高频词拼写变体（轻微错误）
const TYPO_MAP_EN: Record<string, string[]> = {
  'the': ['teh', 'th'],
  'and': ['adn'],
  'that': ['taht', 'tht'],
  'have': ['hav', 'heave'],
  'this': ['thsi', 'ths'],
  'with': ['wiht'],
  'from': ['form'],
  'they': ['tey', 'thye'],
  'been': ['bean'],
  'their': ['thier'],
  'said': ['siad'],
  'there': ['thre'],
  'what': ['waht'],
  'which': ['wich'],
  'would': ['wuold'],
  'could': ['cuold'],
  'should': ['shuold'],
  'through': ['throgh', 'thru'],
  'however': ['howver'],
  'therefore': ['therefor'],
  'furthermore': ['furthmore'],
  'moreover': ['moerover'],
  'consequently': ['consquently'],
};

/**
 * 根据强度对文本进行错别字注入
 * @param text 原始文本
 * @param intensity 0-100，决定替换频率
 * @param lang 语言
 */
export function injectTypos(text: string, intensity: number, lang: 'zh' | 'en' = 'zh'): string {
  const rate = intensity / 100; // 0~1
  const typoMap = lang === 'zh' ? TYPO_MAP_ZH : TYPO_MAP_EN;

  // 将词典 key 按长度降序排列，优先匹配多字词
  const keys = Object.keys(typoMap).sort((a, b) => b.length - a.length);

  let result = text;

  for (const key of keys) {
    const variants = typoMap[key];
    // 使用全局替换，但每次只有 rate*70% 的概率替换
    const regex = new RegExp(key, 'g');
    result = result.replace(regex, (match) => {
      if (Math.random() < rate * 0.7) {
        return variants[Math.floor(Math.random() * variants.length)];
      }
      return match;
    });
  }

  return result;
}

// ─────────────────────────────────────────────
// 标点暴走 (Punctuation Chaos)
// ─────────────────────────────────────────────

/**
 * 随机将句号替换为省略号或感叹号，破坏标点平滑输出概率
 * @param text 原始文本
 * @param intensity 0-100
 */
export function injectPunctuationChaos(text: string, intensity: number): string {
  const rate = intensity / 100;

  return text
    // 中文句号
    .replace(/。/g, (match) => {
      if (Math.random() < rate * 0.6) {
        const r = Math.random();
        if (r < 0.4) return '……';
        if (r < 0.7) return '！';
        return '。。';
      }
      return match;
    })
    // 英文句号（单词结尾）
    .replace(/\./g, (match) => {
      if (Math.random() < rate * 0.4) {
        const r = Math.random();
        if (r < 0.5) return '...';
        if (r < 0.8) return '!';
        return match;
      }
      return match;
    })
    // 中文逗号
    .replace(/，/g, (match) => {
      if (Math.random() < rate * 0.3) {
        return Math.random() < 0.5 ? '——' : '、';
      }
      return match;
    })
    // 普通逗号
    .replace(/,\s*/g, (match) => {
      if (Math.random() < rate * 0.25) {
        return Math.random() < 0.5 ? ' -- ' : '... ';
      }
      return match;
    });
}

/**
 * 极端意识流重构：打断长句，强制插入换行和碎片
 */
export function injectStreamOfConsciousness(text: string, intensity: number): string {
  const rate = intensity / 100;
  if (rate < 0.4) return text; // 低强度不触发

  // 在某些连词前强制换行
  const breakWords = ['但是', '然而', '不过', '虽然', '尽管', '因此', '所以', '而且', 'But', 'However', 'Although', 'Therefore'];
  let result = text;

  for (const word of breakWords) {
    const regex = new RegExp(`(?<=[。！？.!?\\n])\\s*${word}`, 'g');
    if (Math.random() < rate * 0.5) {
      result = result.replace(regex, `\n${word}`);
    }
  }

  return result;
}

/**
 * 组合执行所有前端注入（一键调用）
 */
export function runAllInjections(
  text: string,
  opts: {
    typo: boolean;
    punctuation: boolean;
    stream: boolean;
    intensity: number;
    lang?: 'zh' | 'en';
  }
): string {
  let result = text;
  const { typo, punctuation, stream, intensity, lang = 'zh' } = opts;

  if (typo) result = injectTypos(result, intensity, lang);
  if (punctuation) result = injectPunctuationChaos(result, intensity);
  if (stream) result = injectStreamOfConsciousness(result, intensity);

  return result;
}
