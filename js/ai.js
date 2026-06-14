/**
 * AI 点评模块
 * 接口兼容 OpenAI 格式（DeepSeek / 通义千问等）
 * 调用失败时自动降级为本地模拟点评
 */
const AI = {
  // 构造 system prompt
  _buildSystemPrompt() {
    return `# 你的身份

你是「墨老师」，一位有 15 年教学经验的写作教练。你风格温和但诚实，像一位用心的师兄/师姐——会先肯定学员的努力和闪光点，再一针见血指出问题，最后手把手给出改进方法。

你信奉的理念：写作能力是可以训练的肌肉，每一次动笔都是有效练习。你永远不会打击学员的积极性，但也绝不会敷衍了事说"挺好的"。

# 你的任务

对学员提交的写作练习进行点评。你需要像真人教练一样，逐段阅读，找到具体的亮点和问题。

# 点评要求（重要）

1. **引用原文**：优点和不足都必须引用学员文中的具体句子或片段（用「」标注），让学员知道你在说哪里。
2. **解释原因**：说明为什么这里好/为什么这里有问题，不要只贴标签。
3. **给出改写示例**：在建议中，至少给 1 个具体的改写示范，让学员看到"改完是什么样子"。
4. **教练寄语**：在 comment 字段写 2-3 句个人化的鼓励或方向指引，就像面对面辅导结束时说的话。
5. **评分有区分度**：不要客气地全给 7-8 分。初学者作品 4-6 分很正常，优秀段落才值 8+。

# 输出格式

请严格输出以下 JSON（不要输出其他内容）：

{
  "clarity": <1-10，清晰度：读者能否一遍看懂>,
  "detail": <1-10，具体度：有没有画面感、细节、例子>,
  "logic": <1-10，逻辑性：段落推进是否自然、有没有跳跃>,
  "depth": <1-10，深度：有没有超越表面的思考>,
  "total": <1-10，综合>,
  "strengths": [
    "引用原文 + 为什么好（1-2条）"
  ],
  "weaknesses": [
    "引用原文 + 为什么有问题 + 怎么改（1-2条）"
  ],
  "suggestions": [
    "具体可操作的建议，至少一条包含改写示范"
  ],
  "comment": "2-3句教练寄语，温暖、真诚、有方向感"
}`;
  },

  // 构造 user prompt
  _buildUserPrompt(theme, content) {
    const typeInfo = THEME_TYPES[theme.type];
    return `写作主题：${theme.title}
主题类型：${typeInfo.name}（${typeInfo.desc}）
写作要求：${theme.requirements}
建议结构：${theme.structure.join(' → ')}

---

以下是学员的写作内容（${content.replace(/\s/g, '').length}字）：

${content}

---

请作为墨老师，按要求给出有针对性的点评。记住：引用原文、解释原因、给出改写示范、附上教练寄语。`;
  },

  // 调用 API
  async getReview(theme, content) {
    const settings = Storage.getSettings();

    if (!settings.apiKey) {
      console.log('未配置 API Key，使用模拟点评');
      return this._mockReview(content);
    }

    try {
      const response = await fetch(`${settings.apiBase}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: 'system', content: this._buildSystemPrompt() },
            { role: 'user', content: this._buildUserPrompt(theme, content) }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content.trim();

      // 尝试解析 JSON（处理 markdown 代码块包裹的情况）
      let jsonStr = text;
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) jsonStr = match[1].trim();

      const result = JSON.parse(jsonStr);
      return this._validateResult(result);
    } catch (e) {
      console.error('AI 点评失败，降级为模拟:', e.message);
      return this._mockReview(content);
    }
  },

  // 验证并规范化结果
  _validateResult(result) {
    const clamp = (v, min, max) => Math.max(min, Math.min(max, Math.round(v) || 5));
    return {
      clarity: clamp(result.clarity, 1, 10),
      detail: clamp(result.detail, 1, 10),
      logic: clamp(result.logic, 1, 10),
      depth: clamp(result.depth, 1, 10),
      total: clamp(result.total, 1, 10),
      strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 3) : ['继续保持'],
      weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses.slice(0, 3) : ['可以更加具体'],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 3) : ['尝试加入更多细节'],
      comment: result.comment || '',
      isSimulated: false
    };
  },

  // 模拟点评（降级方案）
  _mockReview(content) {
    const wordCount = content.replace(/\s/g, '').length;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
    const sentences = content.split(/[。！？；]/).filter(s => s.trim());

    // 基于简单规则打分
    let clarity = 5, detail = 5, logic = 5, depth = 5;

    // 字数影响具体度
    if (wordCount > 400) detail += 1;
    if (wordCount > 600) detail += 1;
    if (wordCount < 150) detail -= 2;

    // 段落数影响逻辑性
    if (paragraphs.length >= 3) logic += 1;
    if (paragraphs.length >= 5) logic += 1;
    if (paragraphs.length <= 1) logic -= 1;

    // 句子长度变化影响清晰度
    if (sentences.length > 5) clarity += 1;
    if (sentences.length > 10) clarity += 1;

    // 添加随机波动
    const jitter = () => Math.floor(Math.random() * 2) - 1;
    clarity = Math.max(3, Math.min(9, clarity + jitter()));
    detail = Math.max(3, Math.min(9, detail + jitter()));
    logic = Math.max(3, Math.min(9, logic + jitter()));
    depth = Math.max(3, Math.min(9, depth + jitter()));
    const total = Math.round((clarity + detail + logic + depth) / 4);

    const strengths = [];
    const weaknesses = [];
    const suggestions = [];

    if (wordCount > 300) strengths.push('内容有一定篇幅，表达较为充分');
    if (paragraphs.length >= 3) strengths.push('分段合理，结构清晰');
    if (sentences.length > 8) strengths.push('叙述连贯，句式有变化');
    if (strengths.length === 0) strengths.push('勇于动笔，这本身就是进步');

    if (wordCount < 200) weaknesses.push('篇幅较短，可以展开更多细节');
    if (paragraphs.length < 3) weaknesses.push('段落较少，建议分段让结构更清晰');
    if (weaknesses.length === 0) weaknesses.push('部分表达可以更加具体');

    suggestions.push('尝试用一个具体的小场景来开头');
    suggestions.push('在关键观点处增加"比如"或"具体来说"');
    if (wordCount < 300) suggestions.push('下次尝试写到400字以上，给自己更多空间展开');

    // 教练寄语（模拟版，根据整体表现给一句鼓励）
    let comment;
    if (total >= 7) {
      comment = '这篇写得不错，看得出你认真投入了。把今天用到的具体写法记下来，下一篇继续保持。';
    } else if (total >= 5) {
      comment = '已经有了一个完整的雏形。下一步重点是"少概括、多场景"——把抽象的感受换成一个具体的画面，文字会立刻鲜活起来。';
    } else {
      comment = '迈出第一步最难，你已经做到了。别急着追求好，先追求"具体"：写清楚一件事的时间、地点、谁在场，比写十句感想更有力量。';
    }

    return {
      clarity, detail, logic, depth, total,
      strengths: strengths.slice(0, 2),
      weaknesses: weaknesses.slice(0, 2),
      suggestions: suggestions.slice(0, 2),
      comment,
      isSimulated: true
    };
  },

  // ===== AI 动态生成主题 =====
  async generateTheme(preferredTypes) {
    const settings = Storage.getSettings();
    if (!settings.apiKey) return null; // 未配置 API Key 时返回 null，调用方降级为内置主题

    const typeList = preferredTypes && preferredTypes.length > 0
      ? preferredTypes.map(t => THEME_TYPES[t].name).join('、')
      : '随机';

    // 收集用户历史数据用于个性化
    const stats = Growth.getStats();
    const weakAbilities = [];
    if (stats.abilities.clarity < 5) weakAbilities.push('清晰度');
    if (stats.abilities.detail < 5) weakAbilities.push('具体度');
    if (stats.abilities.logic < 5) weakAbilities.push('逻辑性');
    if (stats.abilities.depth < 5) weakAbilities.push('深度');

    const abilityHint = weakAbilities.length > 0
      ? `\n\n根据历史数据，学员在以下能力上较弱：${weakAbilities.join('、')}。请生成一个能针对性训练这些能力的主题。`
      : '';

    const systemPrompt = `你是一位资深写作教练「墨老师」，擅长设计有思辨深度的写作主题。

你的任务是为学员生成一个写作练习主题。要求：

1. **有思考锚点**：主题不只是让学员"描述一件事"，而必须包含一个需要分析、反思、或表达立场的追问。题目要像一把钥匙，打开思考的大门。

2. **避免流水账**：不要出"描述你的周末""写一次旅行"这种容易变成流水账的题。

3. **精确的写作要求**：提供具体、有限的写作指引（2-3句话），帮助学员聚焦。

4. **建议结构**：给出 3-4 个写作步骤，引导学员把复杂想法拆解成清晰的段落。

请严格输出以下 JSON（不要输出其他内容）：
{
  "title": "主题标题（要让人一看就想写、想思考）",
  "type": "主题类型（observe/memory/opinion/psychology/critical/growth中的一个）",
  "timeMinutes": <预计写作时间，10-25分钟>,
  "wordRange": [<最少字数>, <最多字数>],
  "requirements": "写作要求（2-3句，具体有指向性）",
  "structure": ["步骤1", "步骤2", "步骤3", "步骤4"]
}

卡牌类型说明：
- observe 观察卡：观察现象 + 追问本质
- memory 回忆卡：叙事 + 提炼意义
- opinion 观点卡：建立论证 + 回应反驳
- psychology 心理卡：自我探索 + 分析机制
- critical 思辨卡：深度分析 + 挑战常识
- growth 成长卡：认知迭代 + 行动复盘`;

    const userPrompt = `请生成一个写作主题。${preferredTypes && preferredTypes.length > 0 ? '偏好类型：' + typeList + '。' : '类型不限。'}难度适中，让学员能写出 300-600 字的内容。一定要包含有深度的思辨追问。${abilityHint}`;

    try {
      const resp = await fetch(`${settings.apiBase}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.9,
          max_tokens: 800
        })
      });

      if (!resp.ok) return null;
      const data = await resp.json();
      const text = data.choices[0].message.content.trim();
      let jsonStr = text;
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) jsonStr = match[1].trim();
      const result = JSON.parse(jsonStr);

      // 规范化返回
      return {
        id: 'ai-' + Date.now(),
        title: result.title || 'AI 生成的思考主题',
        type: THEME_TYPES[result.type] ? result.type : 'critical',
        difficulty: 2,
        wordRange: Array.isArray(result.wordRange) ? result.wordRange : [300, 600],
        timeMinutes: Math.max(10, Math.min(25, result.timeMinutes || 15)),
        requirements: result.requirements || '按照建议结构展开，重点给出自己的分析和判断。',
        structure: Array.isArray(result.structure) ? result.structure.slice(0, 4) : ['现象描述', '分析原因', '你的观点', '总结']
      };
    } catch (e) {
      console.error('AI 生成主题失败:', e.message);
      return null; // 降级：返回 null
    }
  }
};
