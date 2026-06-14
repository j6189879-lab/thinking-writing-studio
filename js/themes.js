/**
 * 主题卡牌数据库
 * 6类卡牌：观察卡、回忆卡、观点卡、心理卡、思辨卡、成长卡
 *
 * 设计原则：每个主题都包含「思考锚点」，要求写作者不只描述，
 * 还要分析、反思、建立观点，避免流水账。
 */
const THEME_TYPES = {
  observe: { name: '观察卡', color: '#4A90A4', icon: '👁️', desc: '训练描述与洞察力' },
  memory: { name: '回忆卡', color: '#D4845A', icon: '📖', desc: '训练叙事与反思力' },
  opinion: { name: '观点卡', color: '#7B68AE', icon: '💬', desc: '训练逻辑与说服力' },
  psychology: { name: '心理卡', color: '#5A9E6F', icon: '🪞', desc: '训练自我觉察力' },
  critical: { name: '思辨卡', color: '#C75B5B', icon: '⚖️', desc: '训练深度批判力' },
  growth: { name: '成长卡', color: '#D4A03C', icon: '🌱', desc: '训练认知迭代力' }
};

const THEMES = [
  // ===== 观察卡（观察现象 + 追问本质）=====
  {
    id: 'obs-01',
    title: '你每天经过却从未注意的地方，为什么会被你忽略？',
    type: 'observe',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 15,
    requirements: '先描述这个地方，然后分析：是什么机制让我们对日常景观"视而不见"？这种忽略意味着什么？',
    structure: ['场景还原', '你忽略了什么', '为什么会忽略', '这说明什么']
  },
  {
    id: 'obs-02',
    title: '观察一个正在等待的人——等待如何改变一个人的状态？',
    type: 'observe',
    difficulty: 2,
    wordRange: [300, 500],
    timeMinutes: 15,
    requirements: '描述你观察到的人的外在表现，然后分析"等待"这件事如何暴露了一个人的内在状态。',
    structure: ['人物描写', '等待中的细节变化', '等待暴露了什么', '你的思考']
  },
  {
    id: 'obs-03',
    title: '同一家店的老顾客和新顾客，行为有什么本质区别？',
    type: 'observe',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 15,
    requirements: '去一个你常去的地方，观察不同人的行为差异。思考：熟悉感如何改变人的行为模式？',
    structure: ['老顾客表现', '新顾客表现', '差异背后的原因', '熟悉感的本质']
  },
  {
    id: 'obs-04',
    title: '一个人独处时和在人群中，表情有什么不同？这种差异说明什么？',
    type: 'observe',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '描述你观察到的具体差异（包括自己），然后思考：我们在多大程度上"表演"自己？真实的自我在哪里？',
    structure: ['独处时的观察', '人群中的观察', '差异分析', '关于真实自我的思考']
  },
  {
    id: 'obs-05',
    title: '你手机屏幕使用时间最长的 App 说明了你什么？',
    type: 'observe',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 15,
    requirements: '不只是列数据。思考：你的时间分配和你"以为的自己"一致吗？差距说明了什么问题？',
    structure: ['客观数据', '你以为的自己', '实际的自己', '这个差距意味着什么']
  },
  {
    id: 'obs-06',
    title: '观察一次争吵（或意见不合）——两个人真正在争的是什么？',
    type: 'observe',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '可以是你经历的或旁观的。描述表面争论的内容，再挖掘底层真正的诉求。大多数争吵的本质是什么？',
    structure: ['表面上在争什么', '各自的真实诉求', '为什么说不出真实诉求', '你的判断']
  },
  {
    id: 'obs-07',
    title: '深夜和清晨的同一条街道——时间如何赋予空间不同的意义？',
    type: 'observe',
    difficulty: 2,
    wordRange: [300, 500],
    timeMinutes: 15,
    requirements: '描述同一空间在不同时间的氛围差异，然后思考：是什么在改变——空间本身，还是我们的投射？',
    structure: ['深夜的样子', '清晨的样子', '差异的来源', '空间与人的关系']
  },
  {
    id: 'obs-08',
    title: '你最近注意到什么"正在消失的事物"？它的消失意味着什么？',
    type: 'observe',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '可以是一种习惯、一个职业、一种物品、一种交往方式。描述它，并思考它的消失反映了什么趋势。',
    structure: ['它是什么', '它正在怎样消失', '为什么会消失', '我们失去了什么/获得了什么']
  },

  // ===== 回忆卡（叙事 + 提炼意义）=====
  {
    id: 'mem-01',
    title: '一次失败，它教会了你什么是你当时不可能学到的？',
    type: 'memory',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '不要只写"失败让我成长了"。具体说明：如果没有这次失败，你的哪个认知会一直是错的？',
    structure: ['事件经过', '当时的理解', '现在的理解', '这个认知落差说明什么']
  },
  {
    id: 'mem-02',
    title: '一个你曾经深信不疑、后来发现是错的信念',
    type: 'memory',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '写出你当时为什么坚信它、什么事件打破了它、信念崩塌的过程是痛苦还是解放？人是如何改变认知的？',
    structure: ['曾经相信什么', '为什么坚信', '什么打破了它', '改变认知的过程感受']
  },
  {
    id: 'mem-03',
    title: '一段关系的结束教会你什么关于"人与人之间的距离"？',
    type: 'memory',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '不写狗血剧情。关注：这段关系的结束让你理解了什么之前不懂的关于人际关系的规律？',
    structure: ['关系概述', '结束的真正原因', '你后来意识到的规律', '这如何影响你后续的关系']
  },
  {
    id: 'mem-04',
    title: '一个改变了你"做事方式"的瞬间——它为什么有效？',
    type: 'memory',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 15,
    requirements: '可能是一句话、一次观察、一次教训。写清楚它之前你怎么做的，之后怎么做的，为什么新方式更有效。',
    structure: ['之前的做法', '那个瞬间', '之后的做法', '为什么有效']
  },
  {
    id: 'mem-05',
    title: '你做过最违背本能的正确决定——人为什么要对抗自己的直觉？',
    type: 'memory',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '写出当时直觉想让你怎么做、你为什么选择了相反的方向、结果如何。什么时候该听直觉，什么时候不该？',
    structure: ['直觉的声音', '你的选择', '结果', '关于直觉的思考']
  },
  {
    id: 'mem-06',
    title: '一个你小时候不理解、长大后突然懂了的事——为什么需要时间才能理解它？',
    type: 'memory',
    difficulty: 2,
    wordRange: [300, 500],
    timeMinutes: 15,
    requirements: '不是简单的"长大才懂父母的辛苦"。精确地说出：你具体缺少什么经验或视角，导致当时无法理解？',
    structure: ['小时候看到什么', '当时的理解', '后来的理解', '缺了什么才能看懂']
  },
  {
    id: 'mem-07',
    title: '你生命中一次"无用"的经历，后来被证明是有价值的',
    type: 'memory',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 15,
    requirements: '思考：价值是在什么条件下显现的？是经历本身变了，还是你变了？能否提前判断一件事的长期价值？',
    structure: ['那个"无用"的经历', '为什么当时觉得无用', '后来如何变得有价值', '价值是如何被发现的']
  },
  {
    id: 'mem-08',
    title: '一次你选择沉默的时刻——沉默是对的选择吗？',
    type: 'memory',
    difficulty: 2,
    wordRange: [300, 500],
    timeMinutes: 15,
    requirements: '写出你当时为什么选择不说，事后看来是对的还是错的。什么时候沉默是智慧，什么时候是懦弱？',
    structure: ['当时的情境', '沉默的原因', '后果', '关于沉默的判断标准']
  },

  // ===== 观点卡（建立论证 + 回应反驳）=====
  {
    id: 'opi-01',
    title: '"有目标的人"比"没有目标的人"活得更好吗？',
    type: 'opinion',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '不要给空泛的"因人而异"。选一个立场，用你观察到的真实案例论证，并回应对方可能的反驳。',
    structure: ['你的立场', '核心论据（含案例）', '预判反驳', '最终结论']
  },
  {
    id: 'opi-02',
    title: '信息过载时代，"少知道一些"是不是一种能力？',
    type: 'opinion',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '思考"无知"在什么条件下是有害的，在什么条件下是保护性的。如何区分"选择性忽略"和"逃避现实"？',
    structure: ['现象观察', '你的判断', '条件与边界', '实践建议']
  },
  {
    id: 'opi-03',
    title: '你认为一个人最难改变的是什么——性格、习惯、认知，还是欲望？',
    type: 'opinion',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '选一个你认为最难改变的，给出理由。为什么其他几项相比之下更容易？用你的亲身经历或观察做论据。',
    structure: ['你的选择', '为什么难', '其他几项为什么相对容易', '这对"改变自己"有什么启示']
  },
  {
    id: 'opi-04',
    title: '"做自己"是好建议还是坏建议？',
    type: 'opinion',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '拆解"做自己"这句话的逻辑漏洞。什么情境下这是好建议？什么情境下这是逃避成长的借口？',
    structure: ['这句话通常怎么被使用', '什么情况下是好建议', '什么情况下是坏建议', '你的判断标准']
  },
  {
    id: 'opi-05',
    title: '一个人应该为"自己不喜欢但社会认为重要"的事情努力吗？',
    type: 'opinion',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '不要回答"平衡"。给出一个清晰的判断框架：在什么条件下应该坚持自我，什么条件下应该适应？',
    structure: ['问题的真实难度', '你的判断框架', '论据', '限定条件']
  },
  {
    id: 'opi-06',
    title: '朋友之间应不应该说"真话"？真话的边界在哪里？',
    type: 'opinion',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 15,
    requirements: '思考：真话伤人时怎么办？"为你好"和"控制欲"的界限在哪？用真实例子支撑你的判断。',
    structure: ['你的立场', '真话的价值', '真话的代价', '你认为的边界']
  },
  {
    id: 'opi-07',
    title: '为什么很多"正确的道理"听起来让人反感？',
    type: 'opinion',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '分析"道理正确但令人不舒服"的机制：是道理本身的问题，还是传达方式的问题，还是接收者的问题？',
    structure: ['列举现象', '你认为的原因', '谁的问题', '如何让正确的道理被接受']
  },
  {
    id: 'opi-08',
    title: '你觉得"运气"在人生中占多大比重？承认这一点有什么用？',
    type: 'opinion',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '不要说"努力更重要"然后结束。思考：如果运气占比很大，我们该怎么调整行为策略？"承认运气"和"放弃努力"是一回事吗？',
    structure: ['你判断的占比', '论据', '承认运气的积极作用', '如何理性对待运气']
  },

  // ===== 心理卡（自我探索 + 分析机制）=====
  {
    id: 'psy-01',
    title: '你最近在逃避什么？逃避的背后是害怕失去什么？',
    type: 'psychology',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '不要停在"我在逃避 X"。追问下去：逃避保护了你什么？如果不逃避，你害怕面对的最坏结果是什么？那个结果真的会发生吗？',
    structure: ['你在逃避什么', '逃避保护了你什么', '最坏结果是什么', '理性评估那个结果']
  },
  {
    id: 'psy-02',
    title: '你身上有没有一种"明知不对但改不了"的模式？它的奖励机制是什么？',
    type: 'psychology',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '任何坏习惯/坏模式之所以持续，一定是因为它给了你某种"隐性奖励"。精确找到那个奖励。',
    structure: ['模式描述', '表面的代价', '隐性的奖励', '如果要改变，需要什么替代品']
  },
  {
    id: 'psy-03',
    title: '你在什么情境下会变成"另一个人"？那个你是更真实还是更虚假？',
    type: 'psychology',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '比如在特定人面前、特定场合、特定情绪下。分析：那个"不像你"的行为版本是被什么触发的？你更认同哪个版本？',
    structure: ['在什么情境下', '你变成什么样', '触发机制', '哪个是真的你']
  },
  {
    id: 'psy-04',
    title: '你最容易被什么类型的人激怒？这说明你什么？',
    type: 'psychology',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 15,
    requirements: '"容易被激怒"往往是因为对方触碰了你的某个核心信念或未解决的问题。找到那个点。',
    structure: ['什么类型的人/行为', '你的反应', '为什么是这个点', '这暴露了你什么信念']
  },
  {
    id: 'psy-05',
    title: '你对自己的哪个评价可能是不准确的？是高估还是低估？',
    type: 'psychology',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '人的自我认知总有偏差。找到你最不确定的那个自我评价，分析证据：支持和反对这个评价的事实各有什么？',
    structure: ['你的自我评价', '支持的证据', '反对的证据', '更客观的判断']
  },
  {
    id: 'psy-06',
    title: '你的"安全感"主要来源于什么？如果那个来源消失了呢？',
    type: 'psychology',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '安全感可能来自钱、关系、能力、习惯、身份。找到你的核心来源，然后做思想实验：它不存在了，你会怎样？这暴露了什么脆弱性？',
    structure: ['你的安全感来源', '思想实验：如果它消失了', '你会变成什么状态', '如何建立更稳固的内在安全感']
  },
  {
    id: 'psy-07',
    title: '你是否在用"忙碌"逃避某种空虚？忙和充实的区别是什么？',
    type: 'psychology',
    difficulty: 2,
    wordRange: [300, 500],
    timeMinutes: 15,
    requirements: '分析你的忙碌：哪些是真正有价值的事，哪些只是填充时间让自己"感觉"充实？二者的判断标准是什么？',
    structure: ['你的忙碌清单', '哪些是真正有价值的', '哪些是填充', '忙与充实的区分标准']
  },
  {
    id: 'psy-08',
    title: '你最近一次强烈的情绪波动，底层真正的诉求是什么？',
    type: 'psychology',
    difficulty: 2,
    wordRange: [300, 500],
    timeMinutes: 15,
    requirements: '情绪是信号，不是问题本身。愤怒可能是"边界被侵犯"，焦虑可能是"失控感"。找到你那次情绪波动下面真正没有被满足的需求。',
    structure: ['情绪事件', '表面原因', '底层诉求', '如何直接回应这个诉求']
  },

  // ===== 思辨卡（深度分析 + 挑战常识）=====
  {
    id: 'cri-01',
    title: '为什么"知道"和"做到"之间有巨大的鸿沟？这个鸿沟能缩小吗？',
    type: 'critical',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '不要只说"因为懒"。从认知科学、习惯心理学、或你的亲身经验出发，分析知行脱节的真实机制，并给出你的解法。',
    structure: ['现象', '常见解释为什么不够', '更深层的机制', '你的解法']
  },
  {
    id: 'cri-02',
    title: '"独立思考"在实际生活中真的可能吗？我们的思想有多少是自己的？',
    type: 'critical',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '思考：你最"独立"的想法，能否追溯到它的来源（某本书、某个人、某段经历）？如果一切思想都有来源，"独立思考"的定义应该是什么？',
    structure: ['你认为自己独立思考的一个例子', '追溯它的来源', '重新定义"独立思考"', '它的真正含义']
  },
  {
    id: 'cri-03',
    title: '"公平"是一种真实的存在，还是人类发明的安慰剂？',
    type: 'critical',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '分析：在什么意义上公平是存在的？在什么意义上它只是一种信念？追求公平是否有实用价值，即使它不"真实存在"？',
    structure: ['公平在哪些层面存在', '在哪些层面是虚构', '追求公平的实用价值', '你的结论']
  },
  {
    id: 'cri-04',
    title: '人们真的想要自由吗？还是只是想要"选择自由的权利"？',
    type: 'critical',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '观察：很多人获得自由后反而焦虑、选择困难。分析自由和安全感之间的张力。真正的自由可能是什么样的？',
    structure: ['自由的表面吸引力', '获得自由后的真实反应', '自由与安全感的矛盾', '你理解的真正的自由']
  },
  {
    id: 'cri-05',
    title: '为什么人更容易记住负面的事？这种"偏见"有什么进化价值？对我们今天有害吗？',
    type: 'critical',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '用你的亲身经验举例，然后分析这种负面偏好在原始环境中的合理性，以及在现代社会中的副作用。我们能做什么？',
    structure: ['你的经验', '进化角度的合理性', '现代社会的副作用', '应对策略']
  },
  {
    id: 'cri-06',
    title: '你相信"性格决定命运"吗？如果是，人是不是一出生就被决定了？',
    type: 'critical',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '拆解这句话的逻辑：性格是什么？它是固定的吗？它在什么意义上"决定"命运？有没有更准确的表述方式？',
    structure: ['你的初始判断', '拆解"性格"', '拆解"决定"', '更准确的表述']
  },
  {
    id: 'cri-07',
    title: '网络上的"真诚"和现实中的"真诚"是同一种东西吗？',
    type: 'critical',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '分析：为什么很多人在网上更愿意表达真实情感？网络真诚是否有虚假成分？当"真诚"成为人设，它还真诚吗？',
    structure: ['网络真诚的表现', '它为什么更容易', '它的可疑之处', '真诚的判断标准']
  },
  {
    id: 'cri-08',
    title: '"成长"一定是好事吗？我们是否在不断失去某种东西？',
    type: 'critical',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '成长的叙事总是正面的。但你有没有在"变得更好"的过程中失去了某些有价值的品质（比如天真、热情、信任感）？那些失去值得吗？',
    structure: ['成长让你获得了什么', '同时失去了什么', '失去的东西有价值吗', '你的结论']
  },

  // ===== 成长卡（认知迭代 + 行动复盘）=====
  {
    id: 'gro-01',
    title: '你最近改变了一个什么观点？是什么新信息打败了旧信息？',
    type: 'growth',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 15,
    requirements: '分析这次改变的过程：新信息是怎么进来的？你抵抗了多久？最终打动你的那个"决定性证据"是什么？',
    structure: ['旧观点', '新信息', '抵抗过程', '决定性证据']
  },
  {
    id: 'gro-02',
    title: '你目前正在学习的一件事——你的学习方法有效吗？如何判断？',
    type: 'growth',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 15,
    requirements: '不只是说"在学 X"。分析你的学习方法：你怎么知道自己在进步？进步的标志是什么？你有没有在"假装学习"？',
    structure: ['在学什么', '你的方法', '如何衡量进步', '方法是否需要调整']
  },
  {
    id: 'gro-03',
    title: '你花了很长时间才接受的一个关于自己的事实——为什么接受它这么难？',
    type: 'growth',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '分析抵抗的原因：是自尊？是恐惧？是与自我认同冲突？接受之后你的生活发生了什么变化？',
    structure: ['那个事实', '你抵抗了多久', '为什么抵抗', '接受后的变化']
  },
  {
    id: 'gro-04',
    title: '你现在和一年前最大的区别是什么？这个变化是主动的还是被动的？',
    type: 'growth',
    difficulty: 2,
    wordRange: [400, 600],
    timeMinutes: 15,
    requirements: '如果是主动的：你做了什么决定？如果是被动的：环境怎样塑造了你？你倾向于主动改变还是等待被改变？',
    structure: ['最大的区别', '变化的原因', '主动还是被动', '你的倾向分析']
  },
  {
    id: 'gro-05',
    title: '你有没有一个"反复出现但始终没解决"的问题？为什么它解决不了？',
    type: 'growth',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '如果一个问题反复出现，往往意味着你的解法层次不够深。分析：你之前试过什么？为什么不管用？问题的根源可能在哪一层？',
    structure: ['那个问题', '你试过的解法', '为什么不管用', '更深层的根源猜想']
  },
  {
    id: 'gro-06',
    title: '最近一次你从别人身上学到的东西——你觉得人和人之间最有效的学习方式是什么？',
    type: 'growth',
    difficulty: 2,
    wordRange: [300, 500],
    timeMinutes: 15,
    requirements: '写出那个具体的学习时刻：是观察、是对话、是模仿、还是被指出错误？哪种方式对你最有效？为什么？',
    structure: ['学到了什么', '通过什么方式', '为什么这种方式对你有效', '你如何主动复制这种学习']
  },
  {
    id: 'gro-07',
    title: '如果三年后的你回看今天，你觉得现在的自己最大的盲点是什么？',
    type: 'growth',
    difficulty: 3,
    wordRange: [400, 600],
    timeMinutes: 20,
    requirements: '想象未来的自己已经看到了你现在看不到的东西。那会是什么？你能根据什么线索来猜测自己的盲点？',
    structure: ['你的猜测', '为什么是这个', '有什么线索', '如何减小这个盲点']
  },
  {
    id: 'gro-08',
    title: '你现在的焦虑——三个月后来看，大概率是真实的威胁还是虚假的警报？你怎么判断？',
    type: 'growth',
    difficulty: 2,
    wordRange: [300, 500],
    timeMinutes: 15,
    requirements: '回顾你过去的焦虑，有多少最终成了真？用这个"基率"来评估当前的焦虑，建立自己的焦虑判断框架。',
    structure: ['当前的焦虑', '过去焦虑的成真率', '判断当前焦虑', '你的焦虑筛选框架']
  }
];
