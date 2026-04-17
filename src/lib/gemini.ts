import { GoogleGenAI } from "@google/genai";

export interface AuthorFingerprint {
  id: string;
  name: string;
  vocabulary: string[];
  sentenceStructure: string;
  tone: string;
  formatting: string;
}

// ─────────────────────────────────────────────
// 指数退避重试包装器
// ─────────────────────────────────────────────
async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let delay = initialDelay;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      const isFatal =
        e.status === 400 || e.status === 403 ||
        e.message?.includes('API key not valid') ||
        e.message?.includes('API key expired') ||
        e.message?.includes('400') ||
        e.message?.includes('403');
      if (isFatal) throw new Error('Invalid API Key');
      if (attempt === maxRetries) throw new Error('API Timeout / Connection Failed after retries.');
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error('Unreachable');
}

// ─────────────────────────────────────────────
// 标准重写（保持原有 API）
// ─────────────────────────────────────────────
export async function rewriteText(
  text: string,
  fingerprint: AuthorFingerprint | null,
  mutations: string[],
  language: 'en' | 'zh',
  apiKey: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  let systemInstruction = language === 'zh'
    ? `你是幽灵打字机（Ghost Typewriter），一个高级文本重写引擎，旨在通过应用动态突变来规避AI检测。\n\n你的任务是重写提供的文本。请务必使用中文输出。`
    : `You are the Ghost Typewriter, an advanced text rewriting engine designed to evade AI detection by applying dynamic mutations.\n\nYour task is to rewrite the provided text.`;

  if (fingerprint) {
    systemInstruction += language === 'zh'
      ? `\n\n[可选挂件] 要克隆的作者指纹:\n- 词汇: ${fingerprint.vocabulary.join(', ')}\n- 句子结构: ${fingerprint.sentenceStructure}\n- 语气: ${fingerprint.tone}\n- 格式: ${fingerprint.formatting}\n\n你必须完美采用这个指纹。重写后的文本听起来应该完全像这位作者。`
      : `\n\n[OPTIONAL PLUGIN] AUTHOR FINGERPRINT TO CLONE:\n- Vocabulary: ${fingerprint.vocabulary.join(', ')}\n- Sentence Structure: ${fingerprint.sentenceStructure}\n- Tone: ${fingerprint.tone}\n- Formatting: ${fingerprint.formatting}\n\nYou MUST adopt this fingerprint perfectly.`;
  }

  if (mutations.length > 0) {
    systemInstruction += language === 'zh'
      ? `\n\n要应用的动态突变:\n${mutations.map(m => `- ${m}`).join('\n')}\n\n应用这些突变来破坏统计可预测性，确保规避AI检测。`
      : `\n\nDYNAMIC MUTATIONS TO APPLY:\n${mutations.map(m => `- ${m}`).join('\n')}\n\nApply these mutations to disrupt statistical predictability.`;
  }

  return withExponentialBackoff(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: language === 'zh'
        ? `请根据系统指令重写以下文本：\n\n${text}`
        : `Rewrite the following text according to the system instructions:\n\n${text}`,
      config: { systemInstruction },
    });
    return response.text || '';
  });
}

// ─────────────────────────────────────────────
// Protocol Babel — 巴别塔多重翻译协议
// 中文 → 德文 → 日文 → 中文
// ─────────────────────────────────────────────

export type BabelStepCallback = (step: number, totalSteps: number, stepLabel: string) => void;

const BABEL_STEPS = [
  { from: '中文', to: '德语', langCode: 'de', label: '→ 中→德 量子转译中...' },
  { from: '德语', to: '日语', langCode: 'ja', label: '→ 德→日 语义拓扑扭曲中...' },
  { from: '日语', to: '中文', langCode: 'zh', label: '→ 日→中 语法树重建中...' },
  { from: '中文（跨语系重建版）', to: '最终中文', langCode: 'zh-final', label: '→ 最终润色中...' },
];

export async function runBabelProtocol(
  text: string,
  apiKey: string,
  onStep?: BabelStepCallback
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  let current = text;

  // Step 1: 中 → 德
  onStep?.(1, 4, BABEL_STEPS[0].label);
  current = await withExponentialBackoff(async () => {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: `请将以下中文文本翻译为德语。只输出翻译结果，不要解释或添加任何额外说明：\n\n${current}`,
    });
    return res.text || '';
  });

  // Step 2: 德 → 日
  onStep?.(2, 4, BABEL_STEPS[1].label);
  current = await withExponentialBackoff(async () => {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: `Bitte übersetzen Sie den folgenden deutschen Text ins Japanische. Geben Sie nur die Übersetzung aus, ohne Erklärungen:\n\n${current}`,
    });
    return res.text || '';
  });

  // Step 3: 日 → 中
  onStep?.(3, 4, BABEL_STEPS[2].label);
  current = await withExponentialBackoff(async () => {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: `以下の日本語テキストを中国語（简体）に翻訳してください。説明を加えず、翻訳結果のみを出力してください：\n\n${current}`,
    });
    return res.text || '';
  });

  // Step 4: 最终润色，消除翻译腔中多余的机器痕迹（保留轻微陌生化）
  onStep?.(4, 4, BABEL_STEPS[3].label);
  current = await withExponentialBackoff(async () => {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: `以下文本是经过多语言跨语系翻译重建后的中文，带有轻微的"翻译腔"和陌生化语感——请保留这种特质，仅修正明显的语法错误，不要过度平滑。只输出处理后的文本：\n\n${current}`,
    });
    return res.text || '';
  });

  return current;
}

// ─────────────────────────────────────────────
// Extreme Scramble — 意识流重构
// ─────────────────────────────────────────────
export async function runExtremeScramble(
  text: string,
  apiKey: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `你是一个极端意识流重构引擎。
规则：
1. 完全放弃所有逻辑连词（"因此"、"所以"、"然而"、"不过"等）
2. 强制生成碎片化长短句混合——每段至少有一个3字以内的超短句
3. 允许思维突然跳转，不需要过渡
4. 保留核心信息，但打碎其表达形式
5. 只输出重构后的文本，不要解释`;

  return withExponentialBackoff(async () => {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: `将以下文本进行极端意识流重构：\n\n${text}`,
      config: { systemInstruction },
    });
    return res.text || '';
  });
}

// ─────────────────────────────────────────────
// Adversarial Cluster — 对抗生成集群
// 5路并行生成，采用截然不同的底层风格指令
// ─────────────────────────────────────────────

export interface GenerationVariant {
  idx: number;
  promptStyle: string;
  promptStyleEn: string;
  text: string;
  status: 'pending' | 'running' | 'done' | 'error';
  error?: string;
}

export const ADVERSARIAL_PROMPT_STYLES = [
  {
    id: 'voice_memo',
    label: '语音速记风',
    labelEn: 'Voice Memo',
    icon: '🎙',
    system: `你是一个语音转文字后立刻保存的笔记本。
风格要求：
- 模拟说话的节奏，省略语多，有时语句不完整
- 每隔几句就停顿一下（用"……"或另起一段）
- 使用口语化的"嗯"、"就是说"、"对吧"等填充词（偶尔出现）
- 完全不使用书面套话和高频AI词汇
- 只输出改写后的文本，不要解释`,
  },
  {
    id: 'tech_draft',
    label: '技术初稿风',
    labelEn: 'Tech Draft',
    icon: '🖥',
    system: `你是一个工程师写的粗糙技术文档初稿。
风格要求：
- 句子简短直接，偶尔有未完成的想法
- 使用技术黑话但不过度解释
- 随意地跳过某些论证步骤，读者"应该懂的"
- 偶尔有一两处明显的错别字或自我纠错（如"也就是说——不对，换个说法"）
- 只输出改写后的文本，不要解释`,
  },
  {
    id: 'sleepless',
    label: '失眠碎碎念风',
    labelEn: 'Sleepless Ramble',
    icon: '🌙',
    system: `你是一个凌晨三点睡不着的人在手机备忘录里打字。
风格要求：
- 思维跳跃，有时说到一半忘了主题
- 混入毫不相关的感官细节（"窗外有只猫"、"空调噪音很烦"）
- 句子忽长忽短，不讲究对称
- 偶尔重复自己刚说过的话，然后又换个说法
- 情绪化，自我怀疑的表达（"或许我理解错了……"）
- 只输出改写后的文本，不要解释`,
  },
  {
    id: 'style_transfer',
    label: '风格迁移风',
    labelEn: 'Style Transfer',
    icon: '🎭',
    system: `你是一个文学翻译家，将文本改写成一种迥异的文学风格。
风格要求：
- 引入倒叙或非线性叙述顺序
- 用感官意象替代抽象论述（"热烘烘"替代"温暖"）
- 打破第四堵墙，偶尔直接质问"你"（读者）
- 句式多样，长短变化极端
- 完全规避AI套话
- 只输出改写后的文本，不要解释`,
  },
  {
    id: 'weibo_casual',
    label: '微博口语风',
    labelEn: 'Social Media',
    icon: '📱',
    system: `你是一个在微博发帖的普通网友，不是作家也不是学者。
风格要求：
- 句子极短，大量换行
- 使用网络词汇（"说真的"、"不是吧"、"给我整无语了"等，自然地点缀）
- 不用任何正式过渡词
- 情绪起伏明显，可以突然感叹或吐槽
- 结尾可以有一个突然的转折或疑问句
- 只输出改写后的文本，不要解释`,
  },
];

export type ClusterProgressCallback = (idx: number, style: string, status: 'running' | 'done' | 'error') => void;

export async function runAdversarialCluster(
  text: string,
  apiKey: string,
  onProgress?: ClusterProgressCallback
): Promise<GenerationVariant[]> {
  const ai = new GoogleGenAI({ apiKey });

  const tasks = ADVERSARIAL_PROMPT_STYLES.map(async (style, idx): Promise<GenerationVariant> => {
    onProgress?.(idx, style.label, 'running');
    try {
      const result = await withExponentialBackoff(async () => {
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-04-17',
          contents: `请将以下文本按照风格指令进行改写：\n\n${text}`,
          config: { systemInstruction: style.system },
        });
        return res.text || '';
      });
      onProgress?.(idx, style.label, 'done');
      return {
        idx,
        promptStyle: style.label,
        promptStyleEn: style.labelEn,
        text: result,
        status: 'done',
      };
    } catch (err: any) {
      onProgress?.(idx, style.label, 'error');
      return {
        idx,
        promptStyle: style.label,
        promptStyleEn: style.labelEn,
        text: '',
        status: 'error',
        error: err.message,
      };
    }
  });

  // Run all 5 in parallel
  return Promise.all(tasks);
}
