/**
 * 成长体系 - 经验值、等级、统计
 */
const Growth = {
  // 等级配置：[所需累计经验, 等级名称]
  LEVELS: [
    [0, '观察者'],       // Lv1
    [50, '记录者'],      // Lv2
    [120, '表达者'],     // Lv3
    [220, '思考者'],     // Lv4
    [350, '分析者'],     // Lv5
    [520, '写作者'],     // Lv6
    [730, '观点构建者'],  // Lv7
    [1000, '深度思考者'], // Lv8
    [1350, '个人风格形成者'], // Lv9
    [1800, '思维创作者']  // Lv10
  ],

  calcLevel(exp) {
    let level = 1;
    for (let i = this.LEVELS.length - 1; i >= 0; i--) {
      if (exp >= this.LEVELS[i][0]) {
        level = i + 1;
        break;
      }
    }
    return level;
  },

  getLevelName(level) {
    return this.LEVELS[Math.min(level, this.LEVELS.length) - 1][1];
  },

  getLevelProgress(exp) {
    const level = this.calcLevel(exp);
    const currentThreshold = this.LEVELS[level - 1][0];
    const nextThreshold = level < this.LEVELS.length ? this.LEVELS[level][0] : this.LEVELS[level - 1][0];
    if (level >= this.LEVELS.length) return 1;
    return (exp - currentThreshold) / (nextThreshold - currentThreshold);
  },

  // 获取统计数据（用于图表）
  getStats() {
    const articles = Storage.getArticles();
    const progress = Storage.getProgress();

    // 按日期分组
    const byDate = {};
    articles.forEach(a => {
      const date = a.createdAt.slice(0, 10);
      if (!byDate[date]) byDate[date] = { words: 0, scores: [], count: 0 };
      byDate[date].words += a.wordCount;
      byDate[date].count += 1;
      if (a.score) byDate[date].scores.push(a.score.total);
    });

    // 取最近30天数据
    const dates = Object.keys(byDate).sort().slice(-30);
    const wordsByDate = dates.map(d => ({ date: d, value: byDate[d].words }));
    const scoresByDate = dates.map(d => {
      const scores = byDate[d].scores;
      return { date: d, value: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null };
    }).filter(d => d.value !== null);

    // 能力维度统计（最近10篇有评分的文章）
    const scoredArticles = articles.filter(a => a.score).slice(0, 10);
    const abilities = { clarity: 0, detail: 0, logic: 0, depth: 0 };
    if (scoredArticles.length > 0) {
      scoredArticles.forEach(a => {
        abilities.clarity += a.score.clarity || 0;
        abilities.detail += a.score.detail || 0;
        abilities.logic += a.score.logic || 0;
        abilities.depth += a.score.depth || 0;
      });
      const n = scoredArticles.length;
      abilities.clarity = Math.round(abilities.clarity / n);
      abilities.detail = Math.round(abilities.detail / n);
      abilities.logic = Math.round(abilities.logic / n);
      abilities.depth = Math.round(abilities.depth / n);
    }

    return {
      progress,
      wordsByDate,
      scoresByDate,
      abilities,
      totalDays: dates.length,
      recentArticles: articles.slice(0, 20)
    };
  }
};
