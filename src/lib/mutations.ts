export const LEXICAL_DEGRADATION = {
  en: [
    "Ban high-frequency AI words: 'In conclusion', 'Moreover', 'Tapestry', 'Delve into', 'Testament'.",
    "Replace professional jargon with colloquial, everyday terms.",
    "Use slightly imprecise vocabulary instead of perfectly accurate words.",
    "Introduce mild repetition of simple words instead of using a diverse vocabulary."
  ],
  zh: [
    "禁用高频AI词汇：'总之'、'此外'、'画卷'、'深入探讨'、'证明'、'底层逻辑'。",
    "用大白话替换专业术语。",
    "使用略微不精确的词汇，而不是完美的用词。",
    "引入简单词汇的轻微重复，而不是使用丰富的词汇量。"
  ]
};

export const SYNTAX_FRACTURE = {
  en: [
    "Break parallel structures. Make lists asymmetrical.",
    "Create extreme imbalance between sentence lengths (e.g., a 30-word sentence followed by a 2-word sentence).",
    "Introduce a dangling modifier or a slightly awkward phrasing.",
    "Use run-on sentences with multiple conjunctions (and, but, so)."
  ],
  zh: [
    "打破排比结构。让列表变得不对称。",
    "制造长短句极端失衡（例如，一个30字的句子后面跟着一个2字的句子）。",
    "引入无主语句或略显生硬的措辞。",
    "使用带有多个连词（然后，但是，所以）的不间断长句。"
  ]
};

export const LOGIC_LEAP = {
  en: [
    "Remove causal conjunctions (therefore, because). Let the reader infer the connection.",
    "Introduce a moment of self-doubt or a cognitive crack (e.g., 'Wait, maybe that's wrong...').",
    "Slightly scramble the timeline of events or explanations.",
    "Jump to a conclusion slightly too fast without fully explaining the intermediate steps."
  ],
  zh: [
    "抹除因果连词（因此，因为）。让读者自己推断联系。",
    "引入自我怀疑或认知裂缝（例如，'等等，也许那不对...'）。",
    "稍微打乱事件或解释的时间线。",
    "稍微过快地得出结论，而不完全解释中间步骤。"
  ]
};

export const NOISE_INJECTION = {
  en: [
    "Forcefully insert a physical environmental noise (e.g., 'The AC is humming too loud').",
    "Mention a physiological reaction or state (e.g., 'My eyes are burning from the screen').",
    "Add a completely irrelevant micro-observation about the surroundings.",
    "Interrupt the thought with a sudden distraction."
  ],
  zh: [
    "强行插入物理环境噪音（例如，'空调的嗡嗡声太大了'）。",
    "提及生理反应或状态（例如，'看屏幕看得眼睛疼'）。",
    "添加一个关于周围环境的完全不相关的微小观察。",
    "用突然的分心打断思路。"
  ]
};

export const PROFILE_PRESETS = {
  geekInsomnia: {
    en: {
      name: "Geek Insomnia",
      mutations: [
        LEXICAL_DEGRADATION.en[1],
        SYNTAX_FRACTURE.en[1],
        LOGIC_LEAP.en[3],
        NOISE_INJECTION.en[1]
      ]
    },
    zh: {
      name: "极客失眠模式",
      mutations: [
        LEXICAL_DEGRADATION.zh[1],
        SYNTAX_FRACTURE.zh[1],
        LOGIC_LEAP.zh[3],
        NOISE_INJECTION.zh[1]
      ]
    }
  },
  drunkFriend: {
    en: {
      name: "Drunk Old Friend",
      mutations: [
        LEXICAL_DEGRADATION.en[3],
        SYNTAX_FRACTURE.en[3],
        LOGIC_LEAP.en[1],
        NOISE_INJECTION.en[0]
      ]
    },
    zh: {
      name: "微醺老友模式",
      mutations: [
        LEXICAL_DEGRADATION.zh[3],
        SYNTAX_FRACTURE.zh[3],
        LOGIC_LEAP.zh[1],
        NOISE_INJECTION.zh[0]
      ]
    }
  }
};

export function getRandomMutations(language: 'en' | 'zh'): string[] {
  const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  
  return [
    `[Lexical Degradation] ${pickRandom(LEXICAL_DEGRADATION[language])}`,
    `[Syntax Fracture] ${pickRandom(SYNTAX_FRACTURE[language])}`,
    `[Logic Leap] ${pickRandom(LOGIC_LEAP[language])}`,
    `[Noise Injection] ${pickRandom(NOISE_INJECTION[language])}`
  ];
}
