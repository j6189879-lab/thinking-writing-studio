/**
 * 数据层 - localStorage 读写
 * 数据结构：Article / UserProgress / 设置 / 草稿
 */
const Storage = {
  KEYS: {
    ARTICLES: 'tw_articles',
    PROGRESS: 'tw_progress',
    SETTINGS: 'tw_settings',
    DRAFT: 'tw_draft',
    FAVORITES: 'tw_favorites'
  },

  // ===== 通用方法 =====
  _get(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error('Storage read error:', key, e);
      return fallback;
    }
  },

  _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error:', key, e);
    }
  },

  // ===== 文章 =====
  getArticles() {
    return this._get(this.KEYS.ARTICLES, []);
  },

  saveArticle(article) {
    const articles = this.getArticles();
    article.id = article.id || 'art-' + Date.now();
    article.createdAt = article.createdAt || new Date().toISOString();
    article.wordCount = article.content.replace(/\s/g, '').length;
    articles.unshift(article);
    this._set(this.KEYS.ARTICLES, articles);
    return article;
  },

  getArticleById(id) {
    return this.getArticles().find(a => a.id === id) || null;
  },

  // ===== 用户进度 =====
  getProgress() {
    return this._get(this.KEYS.PROGRESS, {
      totalWords: 0,
      totalArticles: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      experience: 0,
      lastWriteDate: null
    });
  },

  updateProgress(article) {
    const progress = this.getProgress();
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = progress.lastWriteDate;

    // 更新字数和篇数
    progress.totalWords += article.wordCount;
    progress.totalArticles += 1;

    // 更新连续打卡
    if (lastDate === today) {
      // 今天已经写过，不重复加天数
    } else if (lastDate === getYesterday()) {
      progress.currentStreak += 1;
    } else {
      progress.currentStreak = 1;
    }
    if (progress.currentStreak > progress.longestStreak) {
      progress.longestStreak = progress.currentStreak;
    }
    progress.lastWriteDate = today;

    // 更新经验值
    let expGain = 10;
    if (progress.currentStreak >= 7) expGain += 5;
    if (progress.currentStreak >= 14) expGain += 5;
    if (progress.currentStreak >= 30) expGain += 10;
    progress.experience += expGain;

    // 更新等级
    progress.level = Growth.calcLevel(progress.experience);

    this._set(this.KEYS.PROGRESS, progress);
    return { progress, expGain };
  },

  // ===== 草稿 =====
  saveDraft(draft) {
    this._set(this.KEYS.DRAFT, draft);
  },

  getDraft() {
    return this._get(this.KEYS.DRAFT, null);
  },

  clearDraft() {
    localStorage.removeItem(this.KEYS.DRAFT);
  },

  // ===== 设置 =====
  getSettings() {
    return this._get(this.KEYS.SETTINGS, {
      apiKey: '',
      apiBase: 'https://api.deepseek.com',
      model: 'deepseek-chat'
    });
  },

  saveSettings(settings) {
    this._set(this.KEYS.SETTINGS, settings);
  },

  // ===== 收藏主题 =====
  getFavorites() {
    return this._get(this.KEYS.FAVORITES, []);
  },

  toggleFavorite(themeId) {
    const favs = this.getFavorites();
    const idx = favs.indexOf(themeId);
    if (idx >= 0) {
      favs.splice(idx, 1);
    } else {
      favs.push(themeId);
    }
    this._set(this.KEYS.FAVORITES, favs);
    return idx < 0; // true = 添加了收藏
  },

  isFavorite(themeId) {
    return this.getFavorites().includes(themeId);
  }
};

// 工具函数
function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
