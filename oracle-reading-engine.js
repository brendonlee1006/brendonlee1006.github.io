function createOracleInterpreter(corpus) {
  "use strict";
  if (!corpus || typeof corpus !== "object") throw new TypeError("Oracle interpretation corpus is required.");
  const VERSION = "oracle-reading-2.3";
  const DOMAIN_KEYS = ["general", "work", "relationships", "decision", "selfcare"];
  const DOMAIN_DEFAULTS = {
    general: { label: "日常方向", intention: "把注意力放回此刻能看見、能實行的一件事。", question: "今天，我想把注意力放在哪裡？" },
    work: { label: "工作與創作", intention: "釐清成果、合作與資源，把想法轉成可檢查的下一步。", question: "在這件工作或創作中，我現在需要看見什麼？" },
    relationships: { label: "關係與溝通", intention: "辨認自己的需求與界線，以可觀察的互動代替猜測。", question: "這段關係裡，我現在能如何表達與回應？" },
    decision: { label: "選擇與決策", intention: "整理選項、條件與代價，先做可以回頭的小測試。", question: "面對這個選擇，我還需要確認什麼？" },
    selfcare: { label: "身心節奏", intention: "看見負荷、休息與日常支持，找出做得久的小調整。", question: "此刻，我需要怎樣照顧自己的節奏？" }
  };
  const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const deepFreeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(key => deepFreeze(value[key]));
    return Object.freeze(value);
  };
  const clean = value => typeof value === "string" ? value.trim() : "";
  const firstSentence = value => {
    const text = clean(value);
    const sentence = text.match(/^[\s\S]*?[。！？.!?](?:[」』”’])?/);
    return sentence ? sentence[0] : text;
  };
  const nonempty = (value, where) => {
    const text = clean(value);
    if (!text) throw new TypeError("Missing authored oracle field: " + where);
    return text;
  };
  const toRecords = value => Array.isArray(value) ? value : Object.values(value || {});
  const profileRecords = toRecords(corpus.profiles);
  if (profileRecords.length !== 24) throw new RangeError("The Moonlit corpus must contain exactly 24 profiles.");
  const profiles = Object.create(null);
  const expectedIds = Array.from({ length: 24 }, (_, index) => "moonlit-" + String(index + 1).padStart(2, "0"));
  const profileFields = ["name", "group", "symbolism", "focus", "resource", "shadow", "present", "obstacle", "advice"];
  profileRecords.forEach(raw => {
    if (!raw || typeof raw !== "object" || !expectedIds.includes(raw.id) || hasOwn(profiles, raw.id)) {
      throw new TypeError("An oracle profile has an unknown or repeated card ID.");
    }
    const profile = { id: raw.id };
    profileFields.forEach(key => { profile[key] = nonempty(raw[key], raw.id + "." + key); });
    profile.domains = Object.create(null);
    DOMAIN_KEYS.forEach(key => {
      const source = raw.domains && raw.domains[key];
      if (!source || typeof source !== "object") throw new TypeError("Missing domain profile: " + raw.id + "." + key);
      profile.domains[key] = {
        reading: nonempty(source.reading, raw.id + "." + key + ".reading"),
        action: nonempty(source.action, raw.id + "." + key + ".action"),
        check: nonempty(source.check, raw.id + "." + key + ".check")
      };
    });
    profiles[raw.id] = deepFreeze(profile);
  });
  expectedIds.forEach(id => { if (!hasOwn(profiles, id)) throw new TypeError("Missing Moonlit card: " + id); });
  const providedDomains = toRecords(corpus.domains);
  const domains = DOMAIN_KEYS.map(id => {
    const source = (corpus.domains && corpus.domains[id]) || providedDomains.find(item => item && (item.id === id || item.key === id)) || {};
    return deepFreeze({
      id,
      label: clean(source.label) || DOMAIN_DEFAULTS[id].label,
      intention: clean(source.intention) || DOMAIN_DEFAULTS[id].intention,
      question: clean(source.question) || DOMAIN_DEFAULTS[id].question
    });
  });
  const domainMap = Object.fromEntries(domains.map(item => [item.id, item]));
  const pairs = Object.create(null);
  const pairSource = corpus.pairs || {};
  Object.keys(pairSource).forEach(key => {
    const split = key.split("|");
    if (split.length !== 2 || split[0] === split[1] || !hasOwn(profiles, split[0]) || !hasOwn(profiles, split[1])) {
      throw new TypeError("An ordered oracle pair has an invalid key: " + key);
    }
    const source = pairSource[key];
    if (!source || typeof source !== "object") throw new TypeError("Missing authored oracle pair: " + key);
    pairs[key] = deepFreeze({
      bridge: nonempty(source.bridge, key + ".bridge"),
      tension: nonempty(source.tension, key + ".tension"),
      transition: nonempty(source.transition, key + ".transition")
    });
  });
  const pairCount = Object.keys(pairs).length;
  const pairComplete = pairCount === 24 * 23 && expectedIds.every(from => expectedIds.every(to => from === to || hasOwn(pairs, from + "|" + to)));
  if (pairCount && !pairComplete) throw new RangeError("The directed-pair corpus must contain all 552 ordered pairs.");
  const undirectedDifferentiated = pairComplete ? expectedIds.reduce((count, from, index) => count + expectedIds.slice(index + 1).filter(to => JSON.stringify(pairs[from + "|" + to]) !== JSON.stringify(pairs[to + "|" + from])).length, 0) : 0;
  if (pairComplete && undirectedDifferentiated !== 276) throw new RangeError("Reversing every ordered pair must change its authored interpretation.");
  const coverage = deepFreeze({ profiles: 24, domains: 5, directedPairs: pairCount, pairsComplete: pairComplete, undirectedDifferentiated, positionedTriples: pairComplete ? 24 * 23 * 22 : 0 });
  const classify = question => {
    const text = clean(question).normalize("NFKC").toLowerCase();
    const scores = { work: 0, relationships: 0, decision: 0, selfcare: 0 };
    const signals = {
      work: [
        [/工作|職場|事業|求職|轉職|換工作|履歷|面試|升遷|薪資|薪水|主管|同事|客戶|專案|項目|deadline|career|job|workplace/g, 3],
        [/創作|寫作|作品|設計|創業|商業|生意|業績|成交|任務|會議|報告|交付|productivity|project|business|creative/g, 2]
      ],
      relationships: [
        [/伴侶|夫妻|婚姻|戀愛|感情|愛情|分手|復合|交往|喜歡的人|曖昧|親子|家人|家庭|朋友|友情|relationship|partner|marriage|friendship/g, 3],
        [/關係|溝通|相處|衝突|表達需求|吵架|告白|約會|界線|communication|conversation/g, 2]
      ],
      decision: [
        [/選擇|抉擇|決策|決定|兩難|選項|取捨|要不要|該不該|去不去|留下還是|choice|decision|decide|option/g, 2],
        [/比較|利弊|代價|風險|後悔|試驗|試做|compare|trade.?off/g, 1]
      ],
      selfcare: [
        [/睡眠|睡覺|失眠|休息|疲憊|疲倦|倦怠|焦慮|壓力|情緒|身體|健康|呼吸|身心|療癒|照顧自己|自我照顧|自我關懷|self.?care|burnout|sleep|anxiety|stress/g, 3],
        [/作息|節奏|放鬆|負荷|精神|飲食|散步|冥想|休養|rest|wellbeing/g, 2]
      ]
    };
    Object.keys(signals).forEach(key => {
      signals[key].forEach(([pattern, weight]) => { const matches = text.match(pattern); if (matches) scores[key] += Math.min(2, matches.length) * weight; });
    });
    const ranked = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    const first = ranked[0], second = ranked[1];
    if (!scores[first]) return { domain: "general", reason: "先以日常方向展開；也可以自行選擇更貼近提問的角度。", scores };
    if (scores[first] < 2 || (scores[second] > 0 && scores[first] - scores[second] < 3)) {
      return { domain: "general", reason: "提問涉及不只一個面向，先以日常方向展開；請選擇你最想聚焦的角度。", scores };
    }
    return { domain: first, reason: "依提問先聚焦「" + domainMap[first].label + "」；你可以更換角度。", scores };
  };
  const detectDomain = question => classify(question).domain;
  const roleLabels = { single: "今日提醒", present: "現況", obstacle: "阻礙", advice: "建議" };
  const roleQuestions = {
    single: "這張牌如何回應我此刻的提問？",
    present: "目前有哪些資源、習慣或狀態值得看清？",
    obstacle: "這個主題失衡時，會在哪裡形成卡點？",
    advice: "下一步如何小而具體地改變我的回應？"
  };
  const fallbackPair = (from, to) => {
    const interactions = corpus.interactions || {};
    const authored = interactions[from.group + "|" + to.group] || interactions[from.group + "→" + to.group];
    if (authored && typeof authored === "object" && clean(authored.bridge) && clean(authored.tension) && clean(authored.transition)) {
      return { bridge: clean(authored.bridge), tension: clean(authored.tension), transition: clean(authored.transition), basis: "authored-group-draft" };
    }
    return {
      bridge: from.resource + " " + to.advice,
      tension: from.present + " " + to.shadow,
      transition: from.obstacle + " " + to.advice,
      basis: "profile-draft"
    };
  };
  const makePair = (from, to, key, label, component) => {
    const pair = pairs[from.id + "|" + to.id];
    const source = pair || fallbackPair(from, to);
    return {
      key,
      label,
      fromId: from.id,
      toId: to.id,
      fromName: from.name,
      toName: to.name,
      pairKey: from.id + "|" + to.id,
      bridge: source.bridge,
      tension: source.tension,
      transition: source.transition,
      reading: source[component],
      basis: pair ? "authored-directed-pair" : source.basis
    };
  };
  const REVIEW = {
    general: { action: "第7天把3次紀錄放在一起：選出真正幫你把注意力放回提問的一步；保留它，刪去只增加負擔的一步。", check: "能否指出一個實際做出的改變，以及支持這個判斷的紀錄？", question: "我看見了什麼實際改變，而不只是讀到一句喜歡的話？" },
    work: { action: "第7天對照3次紀錄和實際產出：哪個調整減少卡關或返工？留下有證據的一步，再決定是否擴大。", check: "比較前後的完成情況、返工或中斷；只採用你實際記錄過的指標。", question: "我交付了什麼、卡在哪一步，以及哪個小調整值得繼續？" },
    relationships: { action: "第7天回看3次互動：區分自己有說清的需求、對方實際的回應與尚未確認的猜測，再決定下一次怎麼說。", check: "是否留下具體說過的話與實際回應？界線是否更清楚、也能由自己維持？", question: "哪些是可見的互動，哪些仍需要直接問清楚？" },
    decision: { action: "第7天對照原本的條件和3次小測試：補齊缺少的資訊，保留有證據支持的選項，寫下一個可回頭的決定。", check: "是否能用實測紀錄說明選項的代價、可行性與仍未知的條件？", question: "什麼新證據會讓我改變選擇，而不只是尋找支持原決定的理由？" },
    selfcare: { action: "第7天比較3次調整前後的負荷與恢復感：保留容易持續的一步；若多做反而更累，就縮小份量或換方式。", check: "以自己的紀錄比較負荷、恢復感與可持續性；一次感受不代表長期結果。", question: "這個做法能融入我的日常，還是又變成一個必須完成的要求？" }
  };
  const interpret = (entry, optionalDomain) => {
    if (!entry || typeof entry !== "object" || !Array.isArray(entry.cardIds) || ![1, 3].includes(entry.cardIds.length)) {
      throw new TypeError("An oracle reading requires one or three card IDs.");
    }
    const ids = entry.cardIds.slice();
    if (new Set(ids).size !== ids.length || ids.some(id => !hasOwn(profiles, id))) {
      throw new TypeError("An oracle reading contains an unknown or repeated card ID.");
    }
    const question = clean(entry.question);
    const classified = classify(question);
    const requested = optionalDomain === undefined || optionalDomain === null || optionalDomain === "" ? entry.interpretationDomain : optionalDomain;
    const overridden = DOMAIN_KEYS.includes(requested);
    const domain = overridden ? requested : classified.domain;
    const domainInfo = domainMap[domain];
    const roleKeys = ids.length === 1 ? ["single"] : ["present", "obstacle", "advice"];
    const readingCards = ids.map((id, index) => {
      const profile = profiles[id], context = profile.domains[domain], roleKey = roleKeys[index];
      return {
        id, name: profile.name, group: profile.group, roleKey,
        roleLabel: roleLabels[roleKey], roleQuestion: roleQuestions[roleKey],
        symbolism: profile.symbolism, focus: profile.focus, resource: profile.resource, shadow: profile.shadow,
        roleReading: roleKey === "single" ? profile.present.replace(/^在現況位置，/, "此刻，") : profile[roleKey],
        contextReading: context.reading, action: context.action, check: context.check,
        balance: roleKey === "obstacle" ? profile.shadow : profile.resource
      };
    });
    const chosen = readingCards[readingCards.length - 1];
    const threePairs = ids.length === 3 ? [
      makePair(profiles[ids[0]], profiles[ids[1]], "present-obstacle", "現況 → 阻礙：資源如何變成卡點", "tension"),
      makePair(profiles[ids[1]], profiles[ids[2]], "obstacle-advice", "阻礙 → 建議：卡點如何轉成下一步", "transition"),
      makePair(profiles[ids[0]], profiles[ids[2]], "present-advice", "現況 → 建議：下一步承接哪些資源", "bridge")
    ] : [];
    const summary = ids.length === 1 ? chosen.contextReading : "現況｜" + readingCards[0].roleReading + "\n阻礙｜" + readingCards[1].roleReading + "\n轉向｜" + threePairs[1].transition + "\n承接｜" + threePairs[2].bridge;
    const contradiction = ids.length === 1 ? chosen.shadow : threePairs[0].tension;
    const resolution = ids.length === 1 ? profiles[ids[0]].advice : chosen.roleReading;
    const obstacleCue = ids.length === 1 ? chosen.shadow : readingCards[1].roleReading;
    const planRationale = ids.length === 1 ? chosen.roleReading : threePairs[1].transition;
    const overall = ids.length === 1 ? {
      state: chosen.roleReading, friction: chosen.shadow, route: chosen.action,
      continuity: chosen.resource, resolution, decisionCriterion: chosen.check
    } : {
      state: readingCards[0].roleReading, friction: threePairs[0].tension,
      route: threePairs[1].transition, continuity: threePairs[2].bridge,
      resolution, decisionCriterion: chosen.check
    };
    const plan = [
      { key: "today", label: "今天，先做一次", when: "今天 · 做出一個小步驟", action: chosen.action, check: chosen.check, rationale: planRationale, obstacleCue },
      { key: "experiment", label: "3天，做一個小實驗", when: "接下來3天 · 同一小步再試兩次", action: "沿用這個小步驟再試兩次：" + firstSentence(chosen.action) + "每次只改一項條件，並用同一指標記錄前後差異。", check: chosen.check, rationale: planRationale, obstacleCue },
      { key: "review", label: "7天，依紀錄調整", when: "第7天 · 回看3次紀錄", action: REVIEW[domain].action, check: REVIEW[domain].check, rationale: ids.length === 1 ? chosen.resource : threePairs[2].bridge, obstacleCue }
    ];
    return deepFreeze({
      version: VERSION,
      corpusVersion: clean(corpus.version) || clean(corpus.schema) || "moonlit-authored-depth-v1",
      pairVersion: clean(corpus.pairVersion) || "moonlit-directed-pairs-v1",
      domain, domainLabel: domainInfo.label, domainIntention: domainInfo.intention,
      domainReason: overridden ? "你選擇以「" + domainInfo.label + "」展開這次提問。" : classified.reason,
      domainSource: overridden ? "selected" : "question",
      question, mode: ids.length === 1 ? "single" : "three",
      cardIds: ids, cards: readingCards,
      headline: ids.length === 1 ? chosen.name + "｜讓一個小步驟回應你的提問" : "從現況看見卡點，讓建議落在可做的一步",
      summary, overview: ids.length === 1 ? firstSentence(summary) : threePairs[1].transition, overall,
      connection: ids.length === 1 ? chosen.resource : threePairs[2].bridge,
      contradiction, resolution, threePairs, plan,
      action: chosen.action, check: chosen.check,
      reviewQuestions: [chosen.roleQuestion, REVIEW[domain].question],
      basis: {
        kind: "authored-original-oracle",
        label: "月光手札原創牌義 · 依提問角度與牌位展開",
        method: ids.length === 1 ? "以原創圖像、資源與失衡兩面、提問角度及可觀察行動展開。" : "以原創牌義、現況／阻礙／建議牌位與3組有方向的兩牌關係組合解讀。",
        profiles: ids.slice(), pairs: threePairs.map(pair => pair.pairKey),
        completeDirectedPairs: pairComplete,
        generatedPositionedTriple: ids.length === 3,
        assurance: "行動計畫是可調整的探索建議；觀察紀錄後再決定是否繼續。"
      }
    });
  };
  return deepFreeze({ version: VERSION, profiles, domains, pairs, coverage, interpret, detectDomain });
}
