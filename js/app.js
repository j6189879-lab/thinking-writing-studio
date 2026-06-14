/**
 * 主应用逻辑 - 页面路由、渲染、交互
 */
const App = {
  currentPage: 'home',
  currentTheme: null,

  init() {
    this.renderPage('home');
    // 检查草稿恢复
    const draft = Storage.getDraft();
    if (draft && draft.content) {
      this.currentTheme = THEMES.find(t => t.id === draft.themeId) || null;
    }
  },

  // ===== 页面路由 =====
  renderPage(page, data) {
    this.currentPage = page;
    const main = document.getElementById('main');
    // 更新导航
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    switch (page) {
      case 'home': this.renderHome(main); break;
      case 'write': this.renderWrite(main, data); break;
      case 'review': this.renderReview(main, data); break;
      case 'growth': this.renderGrowth(main); break;
      case 'settings': this.renderSettings(main); break;
      default: this.renderHome(main);
    }
  },

  // ===== 首页：今日主题 =====
  renderHome(container) {
    const progress = Storage.getProgress();
    const level = progress.level;
    const levelName = Growth.getLevelName(level);
    const levelProgress = Growth.getLevelProgress(progress.experience);
    const theme = this.currentTheme || this.getTodayTheme();
    this.currentTheme = theme;
    const typeInfo = THEME_TYPES[theme.type];
    const isFav = Storage.isFavorite(theme.id);

    container.innerHTML = `
      <div class="home-page">
        <div class="status-bar">
          <div class="level-info">
            <span class="level-badge">Lv${level}</span>
            <span class="level-name">${levelName}</span>
            <div class="level-bar"><div class="level-fill" style="width:${Math.round(levelProgress * 100)}%"></div></div>
          </div>
          <div class="streak-info">
            <span class="streak-flame">${progress.currentStreak > 0 ? '🔥' : '○'}</span>
            <span>连续 ${progress.currentStreak} 天</span>
          </div>
        </div>

        <div class="theme-card" style="border-left: 4px solid ${typeInfo.color}">
          <div class="theme-header">
            <span class="theme-type" style="color:${typeInfo.color}">${typeInfo.icon} ${typeInfo.name}</span>
            <button class="fav-btn ${isFav ? 'active' : ''}" onclick="App.toggleFav('${theme.id}')">${isFav ? '★' : '☆'}</button>
          </div>
          <h2 class="theme-title">${theme.title}</h2>
          <div class="theme-meta">
            <span>⏱ 约${theme.timeMinutes}分钟</span>
            <span>📝 ${theme.wordRange[0]}-${theme.wordRange[1]}字</span>
            <span>难度 ${'●'.repeat(theme.difficulty)}${'○'.repeat(3 - theme.difficulty)}</span>
          </div>
          <p class="theme-req">${theme.requirements}</p>
          <div class="theme-structure">
            <span class="struct-label">建议结构：</span>
            ${theme.structure.map(s => `<span class="struct-tag">${s}</span>`).join('')}
          </div>
        </div>

        <div class="home-actions">
          <button class="btn-primary" onclick="App.startWrite()">开始写作</button>
          <div class="secondary-actions">
            <button class="btn-secondary" onclick="App.changeTheme()">换一个主题</button>
            <button class="btn-secondary" onclick="App.randomTheme()">🎲 随机抽签</button>
          </div>
          <button class="btn-ai-theme" onclick="App.aiTheme()">🤖 AI 出题</button>
        </div>

        ${this.renderDraftHint()}
      </div>
    `;
  },

  renderDraftHint() {
    const draft = Storage.getDraft();
    if (!draft || !draft.content) return '';
    return `<div class="draft-hint" onclick="App.resumeDraft()">
      <span>📄 有未完成的草稿（${draft.content.replace(/\s/g, '').length}字）- 点击继续</span>
    </div>`;
  },

  // 获取今日主题（基于日期的确定性选择）
  getTodayTheme() {
    const today = new Date().toISOString().slice(0, 10);
    const hash = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return THEMES[hash % THEMES.length];
  },

  changeTheme() {
    const current = this.currentTheme;
    let next;
    do {
      next = THEMES[Math.floor(Math.random() * THEMES.length)];
    } while (next.id === current.id && THEMES.length > 1);
    this.currentTheme = next;
    this.renderPage('home');
  },

  randomTheme() {
    this.currentTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    this.renderPage('home');
    // 抽签动画效果
    const card = document.querySelector('.theme-card');
    if (card) {
      card.classList.add('card-flip');
      setTimeout(() => card.classList.remove('card-flip'), 500);
    }
  },

  toggleFav(themeId) {
    Storage.toggleFavorite(themeId);
    this.renderPage('home');
  },

  async aiTheme() {
    const btn = document.querySelector('.btn-ai-theme');
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = '🤖 生成中…';

    // 根据用户弱项能力决定偏好类型
    const stats = Growth.getStats();
    const preferredTypes = [];
    if (stats.abilities.depth < 5 && stats.abilities.logic < 5) {
      preferredTypes.push('critical', 'opinion');
    } else if (stats.abilities.detail < 5) {
      preferredTypes.push('observe', 'memory');
    } else if (stats.abilities.depth < 5) {
      preferredTypes.push('critical', 'psychology');
    }

    const theme = await AI.generateTheme(preferredTypes.length ? preferredTypes : null);
    if (theme) {
      this.currentTheme = theme;
      this.renderPage('home');
    } else {
      // 降级：随机从内置库选一个
      this.randomTheme();
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🤖 AI 出题';
    }
  },

  startWrite() {
    this.renderPage('write', { theme: this.currentTheme });
  },

  resumeDraft() {
    const draft = Storage.getDraft();
    if (draft) {
      this.currentTheme = THEMES.find(t => t.id === draft.themeId) || this.currentTheme;
      this.renderPage('write', { theme: this.currentTheme, draft });
    }
  },

  // ===== 写作编辑器 =====
  renderWrite(container, data = {}) {
    const theme = data.theme || this.currentTheme;
    const draft = data.draft || Storage.getDraft();
    const initContent = (draft && draft.themeId === theme.id) ? draft.content : '';
    const typeInfo = THEME_TYPES[theme.type];

    container.innerHTML = `
      <div class="write-page">
        <div class="write-header">
          <button class="back-btn" onclick="App.renderPage('home')">← 返回</button>
          <span class="auto-save-status" id="saveStatus">已保存</span>
        </div>

        <div class="write-theme-info" style="border-left: 3px solid ${typeInfo.color}">
          <h3>${theme.title}</h3>
          <p class="write-req">${theme.requirements}</p>
          <div class="write-structure">
            ${theme.structure.map(s => `<span class="struct-tag">${s}</span>`).join(' → ')}
          </div>
        </div>

        <div class="editor-container">
          <textarea id="editor" placeholder="开始写作吧…\n\n想到什么就写什么，不用追求完美。">${initContent}</textarea>
        </div>

        <div class="editor-footer">
          <div class="word-stats">
            <span id="wordCount">0</span> 字
            <span class="divider">|</span>
            预计阅读 <span id="readTime">0</span> 分钟
          </div>
          <button class="btn-primary btn-submit" id="submitBtn" onclick="App.submitArticle()" disabled>提交文章</button>
        </div>
      </div>
    `;

    // 绑定事件
    const editor = document.getElementById('editor');
    let saveTimer = null;
    editor.addEventListener('input', () => {
      const text = editor.value;
      const count = text.replace(/\s/g, '').length;
      document.getElementById('wordCount').textContent = count;
      document.getElementById('readTime').textContent = Math.max(1, Math.ceil(count / 300));
      document.getElementById('submitBtn').disabled = count < 50;

      // 自动保存（防抖）
      document.getElementById('saveStatus').textContent = '保存中…';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        Storage.saveDraft({ themeId: theme.id, content: text, updatedAt: new Date().toISOString() });
        document.getElementById('saveStatus').textContent = '已保存';
      }, 1000);
    });

    // 初始化字数显示
    if (initContent) {
      editor.dispatchEvent(new Event('input'));
    }
    editor.focus();
  },

  async submitArticle() {
    const editor = document.getElementById('editor');
    const content = editor.value.trim();
    if (content.replace(/\s/g, '').length < 50) return;

    const theme = this.currentTheme;
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '正在生成点评…';

    // 获取 AI 点评
    const score = await AI.getReview(theme, content);

    // 保存文章
    const article = Storage.saveArticle({
      title: theme.title,
      content,
      themeId: theme.id,
      themeType: theme.type,
      score
    });

    // 更新进度
    const { progress, expGain } = Storage.updateProgress(article);

    // 清除草稿
    Storage.clearDraft();

    // 跳转点评页
    this.renderPage('review', { article, score, expGain, progress });
  },

  // ===== 点评结果页 =====
  renderReview(container, data = {}) {
    const { article, score, expGain, progress } = data;
    if (!score) { this.renderPage('home'); return; }

    const dims = [
      { key: 'clarity', name: '清晰度', icon: '💎' },
      { key: 'detail', name: '具体度', icon: '🔍' },
      { key: 'logic', name: '逻辑性', icon: '🔗' },
      { key: 'depth', name: '深度', icon: '🌊' }
    ];

    container.innerHTML = `
      <div class="review-page">
        <div class="review-header">
          <h2>写作点评</h2>
          ${score.isSimulated ? '<span class="simulated-badge">模拟点评（未配置API）</span>' : ''}
        </div>

        <div class="score-overview">
          <div class="total-score">
            <span class="score-number">${score.total}</span>
            <span class="score-label">总分</span>
          </div>
          <div class="score-dims">
            ${dims.map(d => `
              <div class="dim-item">
                <span class="dim-icon">${d.icon}</span>
                <span class="dim-name">${d.name}</span>
                <div class="dim-bar"><div class="dim-fill" style="width:${score[d.key] * 10}%"></div></div>
                <span class="dim-score">${score[d.key]}</span>
              </div>
            `).join('')}
          </div>
        </div>

        ${score.comment ? `
        <div class="coach-comment">
          <div class="coach-avatar">✍️</div>
          <div class="coach-text">
            <span class="coach-label">教练寄语</span>
            <p>${score.comment}</p>
          </div>
        </div>
        ` : ''}

        <div class="review-sections">
          <div class="review-section strengths">
            <h4>✅ 写得好的地方</h4>
            <ul>${score.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
          </div>
          <div class="review-section weaknesses">
            <h4>⚠️ 可以更好的地方</h4>
            <ul>${score.weaknesses.map(s => `<li>${s}</li>`).join('')}</ul>
          </div>
          <div class="review-section suggestions">
            <h4>💡 下次试试看</h4>
            <ul>${score.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
          </div>
        </div>

        <div class="exp-gain">
          <span>🎉 获得 +${expGain} EXP</span>
          <span>Lv${progress.level} ${Growth.getLevelName(progress.level)}</span>
        </div>

        <div class="review-actions">
          <button class="btn-primary" onclick="App.renderPage('home')">继续训练</button>
          <button class="btn-secondary" onclick="App.renderPage('growth')">查看成长</button>
        </div>
      </div>
    `;
  },

  // ===== 成长记录页 =====
  renderGrowth(container) {
    const stats = Growth.getStats();
    const { progress, wordsByDate, scoresByDate, abilities, recentArticles } = stats;
    const levelProgress = Growth.getLevelProgress(progress.experience);

    container.innerHTML = `
      <div class="growth-page">
        <div class="growth-overview">
          <div class="growth-stat">
            <span class="stat-value">${progress.totalArticles}</span>
            <span class="stat-label">篇文章</span>
          </div>
          <div class="growth-stat">
            <span class="stat-value">${progress.totalWords}</span>
            <span class="stat-label">总字数</span>
          </div>
          <div class="growth-stat">
            <span class="stat-value">${progress.currentStreak}</span>
            <span class="stat-label">连续天数</span>
          </div>
          <div class="growth-stat">
            <span class="stat-value">Lv${progress.level}</span>
            <span class="stat-label">${Growth.getLevelName(progress.level)}</span>
          </div>
        </div>

        <div class="growth-level-detail">
          <div class="level-bar-large">
            <div class="level-fill" style="width:${Math.round(levelProgress * 100)}%"></div>
          </div>
          <span class="exp-text">${progress.experience} EXP / ${progress.level < 10 ? Growth.LEVELS[progress.level][0] : '∞'}</span>
        </div>

        ${this.renderAbilityChart(abilities)}
        ${this.renderWordChart(wordsByDate)}

        <div class="history-section">
          <h3>写作记录</h3>
          ${recentArticles.length === 0 ? '<p class="empty-hint">还没有写作记录，开始第一篇吧！</p>' : ''}
          <div class="history-list">
            ${recentArticles.map(a => `
              <div class="history-item" onclick="App.viewArticle('${a.id}')">
                <div class="history-date">${a.createdAt.slice(0, 10)}</div>
                <div class="history-title">${a.title}</div>
                <div class="history-meta">
                  <span>${a.wordCount}字</span>
                  ${a.score ? `<span class="history-score">${a.score.total}分</span>` : ''}
                  <span class="view-hint">点击查看 →</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  renderAbilityChart(abilities) {
    if (!abilities.clarity && !abilities.detail && !abilities.logic && !abilities.depth) {
      return '<div class="chart-placeholder">完成更多写作后这里将展示能力雷达图</div>';
    }
    const dims = [
      { name: '清晰度', value: abilities.clarity },
      { name: '具体度', value: abilities.detail },
      { name: '逻辑性', value: abilities.logic },
      { name: '深度', value: abilities.depth }
    ];
    const maxVal = 10;
    const barWidth = 100;
    return `
      <div class="ability-chart">
        <h3>能力维度</h3>
        ${dims.map(d => `
          <div class="ability-row">
            <span class="ability-name">${d.name}</span>
            <div class="ability-bar">
              <div class="ability-fill" style="width:${(d.value / maxVal) * barWidth}%"></div>
            </div>
            <span class="ability-val">${d.value}/10</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderWordChart(wordsByDate) {
    if (wordsByDate.length === 0) return '';
    const maxWords = Math.max(...wordsByDate.map(d => d.value), 100);
    const chartHeight = 100;
    const barCount = wordsByDate.length;
    return `
      <div class="word-chart">
        <h3>每日字数</h3>
        <div class="bar-chart">
          ${wordsByDate.map(d => {
            const h = (d.value / maxWords) * chartHeight;
            return `<div class="bar-col" title="${d.date}: ${d.value}字">
              <div class="bar" style="height:${h}px"></div>
              <span class="bar-label">${d.date.slice(5)}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ===== 设置页 =====
  renderSettings(container) {
    const settings = Storage.getSettings();
    container.innerHTML = `
      <div class="settings-page">
        <h2>设置</h2>

        <div class="settings-section">
          <h3>AI 点评配置</h3>
          <p class="settings-hint">配置大模型 API 后可获得真实的 AI 写作点评。未配置时使用本地模拟点评。</p>

          <div class="form-group">
            <label>API Base URL</label>
            <input type="text" id="apiBase" value="${settings.apiBase}" placeholder="https://api.deepseek.com">
            <span class="form-hint">DeepSeek: https://api.deepseek.com<br>通义千问: https://dashscope.aliyuncs.com/compatible-mode</span>
          </div>

          <div class="form-group">
            <label>API Key</label>
            <input type="password" id="apiKey" value="${settings.apiKey}" placeholder="sk-...">
          </div>

          <div class="form-group">
            <label>模型名称</label>
            <input type="text" id="model" value="${settings.model}" placeholder="deepseek-chat">
            <span class="form-hint">DeepSeek: deepseek-chat<br>通义千问: qwen-turbo / qwen-plus</span>
          </div>

          <button class="btn-primary" onclick="App.saveSettings()">保存设置</button>
          <button class="btn-secondary" onclick="App.testAPI()">测试连接</button>
          <span id="testResult"></span>
        </div>

        <div class="settings-section">
          <h3>数据管理</h3>
          <p class="data-stats">已保存 ${Storage.getArticles().length} 篇文章，累计 ${Storage.getProgress().totalWords} 字</p>
          <button class="btn-danger" onclick="App.exportData()">导出数据</button>
        </div>
      </div>
    `;
  },

  saveSettings() {
    Storage.saveSettings({
      apiBase: document.getElementById('apiBase').value.trim().replace(/\/$/, ''),
      apiKey: document.getElementById('apiKey').value.trim(),
      model: document.getElementById('model').value.trim() || 'deepseek-chat'
    });
    document.getElementById('testResult').textContent = '✓ 已保存';
  },

  async testAPI() {
    this.saveSettings();
    const result = document.getElementById('testResult');
    result.textContent = '测试中…';
    try {
      const settings = Storage.getSettings();
      const resp = await fetch(`${settings.apiBase}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [{ role: 'user', content: '你好' }],
          max_tokens: 10
        })
      });
      if (resp.ok) {
        result.textContent = '✓ 连接成功！';
        result.style.color = '#5A9E6F';
      } else {
        result.textContent = `✗ 失败: ${resp.status}`;
        result.style.color = '#C75B5B';
      }
    } catch (e) {
      result.textContent = `✗ 错误: ${e.message}`;
      result.style.color = '#C75B5B';
    }
  },

  // ===== 文章详情页（回顾全文 + 点评） =====
  viewArticle(articleId) {
    const article = Storage.getArticleById(articleId);
    if (!article) { this.renderPage('growth'); return; }
    const main = document.getElementById('main');
    const typeInfo = THEME_TYPES[article.themeType] || { name: '未知', color: '#999', icon: '📝' };
    const score = article.score;

    // 把文章内容的换行变成段落
    const contentHtml = article.content
      .split(/\n\s*\n/)
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');

    main.innerHTML = `
      <div class="article-detail-page">
        <div class="write-header">
          <button class="back-btn" onclick="App.renderPage('growth')">← 返回记录</button>
          <span class="article-date">${article.createdAt.slice(0, 10)}</span>
        </div>

        <div class="article-detail-card">
          <div class="theme-type" style="color:${typeInfo.color}">${typeInfo.icon} ${typeInfo.name}</div>
          <h2 class="article-detail-title">${article.title}</h2>
          <div class="article-detail-meta">
            <span>${article.wordCount} 字</span>
            ${score ? `<span>总分 ${score.total}/10</span>` : ''}
          </div>
        </div>

        <div class="article-content-box">
          ${contentHtml}
        </div>

        ${score ? `
        <div class="article-review-box">
          <h3>AI 点评</h3>
          <div class="score-dims">
            ${[
              { key: 'clarity', name: '清晰度' },
              { key: 'detail', name: '具体度' },
              { key: 'logic', name: '逻辑性' },
              { key: 'depth', name: '深度' }
            ].map(d => `
              <div class="dim-item">
                <span class="dim-name">${d.name}</span>
                <div class="dim-bar"><div class="dim-fill" style="width:${(score[d.key] / 10) * 100}%"></div></div>
                <span class="dim-score">${score[d.key]}/10</span>
              </div>
            `).join('')}
          </div>

          ${score.comment ? `<div class="coach-comment"><span class="coach-quote">“</span>${score.comment}</div>` : ''}

          <div class="review-sections">
            <div class="review-section strengths">
              <h4>✦ 优点</h4>
              <ul>${score.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div class="review-section weaknesses">
              <h4>△ 不足</h4>
              <ul>${score.weaknesses.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div class="review-section suggestions">
              <h4>→ 建议</h4>
              <ul>${score.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    `;
  },

  exportData() {
    const data = {
      articles: Storage.getArticles(),
      progress: Storage.getProgress(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `思维写作馆_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

// 启动
document.addEventListener('DOMContentLoaded', () => App.init());
