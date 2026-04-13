import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AuthorFingerprint {
  id: string;
  name: string;
  vocabulary: string[];
  sentenceStructure: string;
  tone: string;
  formatting: string;
}

export async function extractFingerprint(samples: string[], name: string, language: 'en' | 'zh'): Promise<AuthorFingerprint> {
  const prompt = language === 'zh'
    ? `分析以下写作样本并提取作者的文体指纹。重点关注词汇（频繁使用的独特词语/短语）、句子结构（长度、节奏、复杂性）、语气（正式、随意、愤世嫉俗等）和格式习惯（段落长度、标点符号使用）。请用中文输出。\n\n写作样本:\n${samples.map((s, i) => `--- 样本 ${i + 1} ---\n${s}`).join('\n\n')}`
    : `Analyze the following writing samples and extract the author's stylistic fingerprint.
Focus on vocabulary (frequent unique words/phrases), sentence structure (length, rhythm, complexity), tone (formal, casual, cynical, etc.), and formatting habits (paragraph length, punctuation usage).

Writing Samples:
${samples.map((s, i) => `--- Sample ${i + 1} ---\n${s}`).join('\n\n')}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vocabulary: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: language === 'zh' ? "作者经常使用的独特词语或短语。" : "Distinctive words or phrases frequently used by the author."
          },
          sentenceStructure: {
            type: Type.STRING,
            description: language === 'zh' ? "详细描述作者的句子结构、长度和节奏。" : "Detailed description of the author's sentence structure, length, and rhythm."
          },
          tone: {
            type: Type.STRING,
            description: language === 'zh' ? "写作的整体基调和情感共鸣。" : "The overall tone and emotional resonance of the writing."
          },
          formatting: {
            type: Type.STRING,
            description: language === 'zh' ? "关于段落长度、标点符号和文本组织的习惯。" : "Habits regarding paragraph length, punctuation, and text organization."
          }
        },
        required: ["vocabulary", "sentenceStructure", "tone", "formatting"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  return {
    id: crypto.randomUUID(),
    name,
    vocabulary: data.vocabulary || [],
    sentenceStructure: data.sentenceStructure || "",
    tone: data.tone || "",
    formatting: data.formatting || ""
  };
}

export async function rewriteText(
  text: string,
  fingerprint: AuthorFingerprint | null,
  mutations: string[],
  language: 'en' | 'zh'
): Promise<string> {
  let systemInstruction = language === 'zh'
    ? `你是幽灵打字机（Ghost Typewriter），一个高级文本重写引擎，旨在通过应用动态突变来规避AI检测。\n\n你的任务是重写提供的文本。请务必使用中文输出。`
    : `You are the Ghost Typewriter, an advanced text rewriting engine designed to evade AI detection by applying dynamic mutations.\n\nYour task is to rewrite the provided text.`;

  if (fingerprint) {
    systemInstruction += language === 'zh'
      ? `\n\n[可选] 要克隆的作者指纹:
- 词汇: ${fingerprint.vocabulary.join(', ')}
- 句子结构: ${fingerprint.sentenceStructure}
- 语气: ${fingerprint.tone}
- 格式: ${fingerprint.formatting}

你必须完美采用这个指纹。重写后的文本听起来应该完全像这位作者。`
      : `\n\n[OPTIONAL] AUTHOR FINGERPRINT TO CLONE:
- Vocabulary: ${fingerprint.vocabulary.join(', ')}
- Sentence Structure: ${fingerprint.sentenceStructure}
- Tone: ${fingerprint.tone}
- Formatting: ${fingerprint.formatting}

You MUST adopt this fingerprint perfectly. The rewritten text should sound exactly like this author.`;
  }

  if (mutations.length > 0) {
    systemInstruction += language === 'zh'
      ? `\n\n要应用的动态突变:
${mutations.map(m => `- ${m}`).join('\n')}

应用这些突变来破坏统计可预测性（困惑度和突发性），确保规避AI检测。`
      : `\n\nDYNAMIC MUTATIONS TO APPLY:
${mutations.map(m => `- ${m}`).join('\n')}

Apply these mutations to disrupt statistical predictability (Perplexity and Burstiness) to ensure AI detection evasion.`;
  }

  // Exponential backoff for API calls
  let retries = 3;
  let delay = 1000;
  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: language === 'zh' ? `请根据系统指令重写以下文本：\n\n${text}` : `Rewrite the following text according to the system instructions:\n\n${text}`,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        }
      });
      return response.text || "";
    } catch (e) {
      retries--;
      if (retries === 0) throw e;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  return "";
}

export async function chatWithGemini(messages: { role: string, content: string }[]) {
  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: "You are a highly advanced AI assistant integrated into the Ghost Typewriter system. You help users understand AI detection, refine their writing, and configure their mutation matrices.",
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    }
  });

  // Replay history
  for (let i = 0; i < messages.length - 1; i++) {
    const msg = messages[i];
    // We can't easily replay history with the SDK's chat object unless we use the history array in create, but the SDK docs say:
    // Actually, the SDK docs don't show how to pass history to chats.create.
    // Let's just use generateContent with the conversation history.
  }
}
