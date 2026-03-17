(function () {
'use strict';
// FILE: .\v1.4\app\core\data.js
const PAID_WORK_SECONDS_PER_DAY = 8 * 60 * 60;
const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";
const fixedSolarHolidays = {
  "01-01": "신정",
  "03-01": "삼일절",
  "05-05": "어린이날",
  "06-06": "현충일",
  "08-15": "광복절",
  "10-03": "개천절",
  "10-09": "한글날",
  "12-25": "성탄절"
};
const extraHolidayMap = {
  2025: {
    "2025-01-28": "설날 연휴",
    "2025-01-29": "설날",
    "2025-01-30": "설날 연휴",
    "2025-05-06": "대체공휴일",
    "2025-10-06": "추석 연휴",
    "2025-10-07": "추석",
    "2025-10-08": "추석 연휴"
  },
  2026: {
    "2026-02-16": "설날 연휴",
    "2026-02-17": "설날",
    "2026-02-18": "설날 연휴",
    "2026-05-25": "부처님오신날",
    "2026-09-24": "추석 연휴",
    "2026-09-25": "추석",
    "2026-09-26": "추석 연휴"
  },
  2027: {
    "2027-02-06": "설날 연휴",
    "2027-02-07": "설날",
    "2027-02-08": "설날 연휴",
    "2027-05-12": "부처님오신날",
    "2027-09-14": "추석 연휴",
    "2027-09-15": "추석",
    "2027-09-16": "추석 연휴"
  }
};
const lunchCategories = ["전체", "한식", "중식", "일식", "양식", "분식", "샐러드", "기타"];
const lunchPlaces = [
  { name: "집밥연구소", category: "한식", menu: "제육볶음 정식", copy: "빨리 나오고 밥심 채우기 좋은 무난한 점심 코스.", distance: "도보 4분", price: "9,500원", tags: ["혼밥 가능", "든든함"] },
  { name: "고기한상", category: "한식", menu: "뚝배기 불고기", copy: "따뜻하고 든든하게 먹고 싶은 날 잘 맞아요.", distance: "도보 9분", price: "11,000원", tags: ["뜨끈함", "밥집"] },
  { name: "홍콩반점거리", category: "중식", menu: "짬뽕밥", copy: "국물 당기는 날 실패 확률 낮은 선택이에요.", distance: "도보 5분", price: "10,000원", tags: ["국물", "매콤"] },
  { name: "마라정원", category: "중식", menu: "마라샹궈", copy: "자극적인 메뉴가 당길 때 기분 전환용으로 좋아요.", distance: "도보 11분", price: "14,000원", tags: ["향신료", "스트레스 해소"] },
  { name: "미소면가", category: "일식", menu: "냉모밀 + 돈가스", copy: "가볍게 먹고 오후 업무 들어가기 좋은 조합이에요.", distance: "도보 6분", price: "11,000원", tags: ["빠른 식사", "면"] },
  { name: "스시하루", category: "일식", menu: "연어덮밥", copy: "깔끔하고 너무 무겁지 않은 점심 메뉴예요.", distance: "도보 10분", price: "12,000원", tags: ["깔끔함", "덮밥"] },
  { name: "파스타 공방", category: "양식", menu: "치킨 크림 파스타", copy: "조금 여유 있는 점심에 기분 전환하기 좋아요.", distance: "도보 8분", price: "13,000원", tags: ["분위기", "양식"] },
  { name: "브레드앤스프", category: "양식", menu: "치아바타 샌드위치", copy: "회의 많은 날 가볍고 빠르게 먹기 좋아요.", distance: "도보 5분", price: "9,800원", tags: ["샌드위치", "테이크아웃"] },
  { name: "학교앞분식", category: "분식", menu: "라볶이 + 참치김밥", copy: "간단하지만 만족감 높은 조합이에요.", distance: "도보 3분", price: "8,000원", tags: ["가성비", "빠름"] },
  { name: "떡볶이 작업실", category: "분식", menu: "즉석떡볶이", copy: "둘 이상이 같이 갈 때 만족도가 높은 편이에요.", distance: "도보 6분", price: "10,500원", tags: ["2인 추천", "매콤"] },
  { name: "포케웨이브", category: "샐러드", menu: "연어 포케", copy: "오후에 덜 졸리고 싶을 때 고르기 좋아요.", distance: "도보 7분", price: "12,500원", tags: ["가벼움", "건강식"] },
  { name: "그린볼키친", category: "샐러드", menu: "닭가슴살 시저 샐러드", copy: "가볍지만 단백질 챙기고 싶을 때 무난해요.", distance: "도보 4분", price: "10,900원", tags: ["저탄수", "단백질"] }
];


// FILE: .\v1.4\app\core\storage.js
const STORAGE_KEY = "salary_local_dashboard_split_v1";
function loadFromStorage(fallback) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(fallback);

  try {
    return { ...structuredClone(fallback), ...JSON.parse(saved) };
  } catch (error) {
    console.error("state load error", error);
    return structuredClone(fallback);
  }
}
function saveToStorage(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}


// FILE: .\v1.4\app\core\state.js
const defaultState = {
  activeTab: "tracker",
  monthlySalary: 3000000,
  monthlyGoal: "",
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),
  leaveAllowance: 15,
  lunchCategory: "한식",
  lunchSearchQuery: "",
  lunchKakaoApiKey: "",
  lunchFavorites: [],
  lunchFavoritesOnly: false,
  lunchStartTime: "",
  lunchEndTime: "",
  lunchLastFetchAt: "",
  lunchLastLocation: null,
  lunchCachedPlaces: [],
  lunchCustomPlaces: [],
  todoItems: [],
  todoViewMode: "list",
  todoCalendarMode: "month",
  todoSelectedDate: getDateKey(new Date()),
  todoShowFavoritesOnly: false,
  todoShowCompleted: true,
  bookmarks: [],
  bookmarkGroups: [],
  bookmarkViewMode: "card",
  bookmarkShowUrl: false,
  bookmarkActiveGroup: "전체",
  bookmarkLabels: [],
  trackerAfterWorkMessageDate: "",
  trackerAutoStoppedDate: "",
  trackerAfterWorkAlertAt: 0,
  trackerAutoStoppedAt: 0,
  fortuneSelectedZodiac: "",
  ladderNames: "민수\n지연\n현우\n서연",
  ladderPlayerCount: 4,
  ladderPlayerNames: ["민수", "지연", "현우", "서연", "유진", "태민", "하린", "도윤", "소연", "준호", "나연", "지후", "세아"],
  ladderResultLabels: ["통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "꽝"],
  ladderBridgeCount: 7,
  ladderFailCount: 1,
  ladderOrientation: "vertical",
  ladderSavedFormats: [],
  pendingSalaryAppliedToast: false,
  pendingSalaryAppliedValue: 0,
  pendingSalaryPreviousValue: 0,
  weatherCache: null,
  entries: {},
  annualMin: 2800,
  annualMax: 10000,
  annualStep: 100,
  dependents: 1,
  nontaxMeal: 200000
};
const state = loadFromStorage(defaultState);
function persist() {
  saveToStorage(state);
}


// FILE: .\v1.4\app\core\utils.js
function $(selector, root = document) {
  return root.querySelector(selector);
}
function pad(num) {
  return String(num).padStart(2, "0");
}
function getDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
function getNow() {
  return new Date();
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function isPast(date) {
  return date.getTime() < getToday().getTime();
}
function isFuture(date) {
  return date.getTime() > getToday().getTime();
}
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}
function getWeekdayLabel(date) {
  return ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
}
function formatMoney(value, digits = 0) {
  const formatted = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value || 0);
  return formatted.replace(/^₩/, "₩ ");
}
function formatNumber(value) {
  return Math.round(value || 0).toLocaleString("ko-KR");
}
function formatTimeFromSeconds(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  return `${pad(Math.floor(safe / 3600))}:${pad(Math.floor((safe % 3600) / 60))}:${pad(safe % 60)}`;
}
function formatLeaveDays(value) {
  const safe = Math.round(Math.max(0, value || 0) * 100) / 100;
  const text = Number.isInteger(safe) ? String(safe) : safe.toFixed(2).replace(/\.?0+$/, "");
  return `${text}일`;
}
function timeToSeconds(timeStr) {
  if (!timeStr || !timeStr.includes(":")) return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 3600 + minutes * 60;
}
function isAutoHoliday(date) {
  const key = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const yearMap = extraHolidayMap[date.getFullYear()] || {};
  return Boolean(fixedSolarHolidays[key] || yearMap[getDateKey(date)]);
}
function isHoliday(date, entry) {
  return Boolean(entry?.customHoliday || isAutoHoliday(date));
}
function getHolidayLabel(date, entry) {
  if (entry?.customHoliday) return "수동 공휴일";
  const key = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const yearMap = extraHolidayMap[date.getFullYear()] || {};
  return yearMap[getDateKey(date)] || fixedSolarHolidays[key] || "";
}


// FILE: .\v1.4\app\core\tabs.js
async function loadTabs(host, tabConfigs, appContext) {
  const tabs = [];

  for (const config of tabConfigs) {
    const section = document.createElement("section");
    section.id = config.id;
    section.className = "tab-panel";
    section.innerHTML = config.template;
    host.appendChild(section);
    tabs.push({
      id: config.id,
      section,
      init: config.init,
      appContext,
      controller: {},
      initialized: false
    });
  }

  return tabs;
}

function ensureTabIndicator() {
  const tabBar = document.querySelector(".tab-bar");
  if (!tabBar) return null;

  let indicator = tabBar.querySelector(".tab-indicator");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.className = "tab-indicator";
    tabBar.appendChild(indicator);
  }

  return indicator;
}

function updateTabIndicator(activeTabId) {
  const indicator = ensureTabIndicator();
  const activeButton = document.querySelector(`.tab-btn[data-tab="${activeTabId}"]`);

  if (!indicator || !activeButton) return;

  indicator.style.width = `${activeButton.offsetWidth}px`;
  indicator.style.height = `${activeButton.offsetHeight}px`;
  indicator.style.transform = `translate(${activeButton.offsetLeft}px, ${activeButton.offsetTop}px)`;
}

function ensureTabInitialized(tab) {
  if (tab.initialized) return;
  tab.initialized = true;

  try {
    tab.controller = tab.init(tab.section, tab.appContext) || {};
  } catch (error) {
    console.error(`tab init error: ${tab.id}`, error);
    tab.controller = {};
    tab.section.innerHTML = `
      <section class="card">
        <h2>이 탭을 불러오지 못했어요</h2>
        <p class="hint">잠시 후 다시 시도하거나 다른 탭을 먼저 이용해 주세요.</p>
      </section>
    `;
  }
}
function setActiveTab(tabs, activeTabId) {
  const currentActiveTab = tabs.find((tab) => tab.section.classList.contains("active"));
  const nextActiveTab = tabs.find((tab) => tab.id === activeTabId);
  const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
  const currentIndex = currentActiveTab ? tabButtons.findIndex((button) => button.dataset.tab === currentActiveTab.id) : -1;
  const nextIndex = nextActiveTab ? tabButtons.findIndex((button) => button.dataset.tab === nextActiveTab.id) : -1;
  const direction = currentIndex === -1 || nextIndex === -1 || nextIndex >= currentIndex ? 1 : -1;

  tabs.forEach((tab) => {
    const { id, section } = tab;
    const isActive = id === activeTabId;
    if (isActive) ensureTabInitialized(tab);

    if (isActive) {
      section.classList.add("active");
      section.classList.remove("slide-out-left", "slide-out-right");
      section.classList.toggle("slide-in-left", direction < 0);
      section.classList.toggle("slide-in-right", direction > 0);
      section.animate(
        [
          { opacity: 0, transform: `translateX(${direction > 0 ? 28 : -28}px)` },
          { opacity: 1, transform: "translateX(0)" }
        ],
        {
          duration: 320,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)"
        }
      );
    } else if (section.classList.contains("active")) {
      section.classList.remove("slide-in-left", "slide-in-right");
      section.classList.toggle("slide-out-left", direction > 0);
      section.classList.toggle("slide-out-right", direction < 0);
      const animation = section.animate(
        [
          { opacity: 1, transform: "translateX(0)" },
          { opacity: 0, transform: `translateX(${direction > 0 ? -22 : 22}px)` }
        ],
        {
          duration: 220,
          easing: "ease-out"
        }
      );
      animation.onfinish = () => {
        section.classList.remove("active", "slide-out-left", "slide-out-right");
      };
    } else {
      section.classList.remove("active", "slide-in-left", "slide-in-right", "slide-out-left", "slide-out-right");
    }

    const controller = tab.controller || {};
    if (typeof controller.onTabChange === "function") {
      controller.onTabChange(isActive);
    }
  });

  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === activeTabId);
  });

  requestAnimationFrame(() => updateTabIndicator(activeTabId));
  updateSeoMeta(activeTabId);
}
function bindTabButtons(onSelect) {
  ensureTabIndicator();
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => onSelect(button.dataset.tab));
  });
  window.addEventListener("resize", () => {
    const activeButton = document.querySelector(".tab-btn.active");
    if (activeButton) updateTabIndicator(activeButton.dataset.tab);
  });
}

function setTabAlert(tabId, alertKey, active) {
  const button = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (!button) return;
  const className = `tab-alert-${alertKey}`;
  button.classList.toggle(className, Boolean(active));
}

function setGlobalLunchAlert(active, text = "점심시간 임박!!") {
  const badge = document.getElementById("globalLunchAlert");
  if (!badge) return;
  badge.hidden = !active;
  badge.classList.toggle("active", Boolean(active));
  badge.style.display = active ? "inline-flex" : "none";
  badge.textContent = text;
}

function ensureGlobalTodoAlertBadge() {
  let badge = document.getElementById("globalTodoAlert");
  const title = document.querySelector(".hero-copy h1");
  if (!title) return null;
  if (!badge) {
    badge = document.createElement("span");
    badge.id = "globalTodoAlert";
    badge.className = "global-todo-alert";
    badge.hidden = true;
    title.appendChild(badge);
  } else if (!title.contains(badge)) {
    title.appendChild(badge);
  }
  return badge;
}

function setGlobalTodoAlert(text = "", tone = "") {
  const badge = ensureGlobalTodoAlertBadge();
  if (!badge) return;
  badge.hidden = !text;
  badge.textContent = text;
  badge.dataset.tone = tone || "";
  badge.classList.toggle("active", Boolean(text));
}

function ensureGlobalTrackerAlertBadge() {
  let badge = document.getElementById("globalTrackerAlert");
  const title = document.querySelector(".hero-copy h1");
  if (!title) return null;
  if (!badge) {
    badge = document.createElement("span");
    badge.id = "globalTrackerAlert";
    badge.className = "global-tracker-alert";
    badge.hidden = true;
    title.appendChild(badge);
  } else if (!title.contains(badge)) {
    title.appendChild(badge);
  }
  return badge;
}

function setGlobalTrackerAlert(text = "", tone = "", pulse = true) {
  const badge = ensureGlobalTrackerAlertBadge();
  if (!badge) return;
  badge.hidden = !text;
  badge.textContent = text;
  badge.dataset.tone = tone || "";
  badge.classList.toggle("active", Boolean(text));
  badge.classList.toggle("pulse", Boolean(text && pulse));
}

function placeGlobalLunchAlertNearTitle() {
  const badge = document.getElementById("globalLunchAlert");
  const title = document.querySelector(".hero-copy h1");
  if (!badge || !title || title.contains(badge)) return;
  title.appendChild(document.createTextNode(" "));
  title.appendChild(badge);
}

function moveHomeGuideButtonToTabBar() {
  const button = document.getElementById("setHomeGuideBtn");
  const tabBar = document.querySelector(".tab-bar");
  if (!button || !tabBar) return;
  button.classList.add("tab-home-btn");
  tabBar.appendChild(button);
}

const SEO_TAB_META = {
  tracker: {
    title: "슬기로운 월루생활 | 직딩심체요절",
    description: "출근, 퇴근, 근무시간, 손해 금액, 휴가와 근무 기록을 한눈에 관리하는 슬기로운 월루생활 탭입니다."
  },
  income: {
    title: "실수령액표 | 직딩심체요절",
    description: "연봉과 월급 기준으로 실수령액을 빠르게 계산하고 비교할 수 있는 실수령액표 탭입니다."
  },
  bookmarks: {
    title: "북마크 관리 | 직딩심체요절",
    description: "자주 쓰는 사이트를 그룹과 라벨로 정리하고 새 탭으로 빠르게 여는 북마크 관리 탭입니다."
  },
  todo: {
    title: "오늘 할 일 캘린더 | 직딩심체요절",
    description: "할 일과 일정을 목록과 캘린더로 관리하고 반복 작업, 미리 알림, 중요 표시까지 지원하는 오늘 할 일 탭입니다."
  },
  lunch: {
    title: "점메추 | 직딩심체요절",
    description: "근처 식당 탐색, 즐겨찾기, 카테고리 필터, 오늘 메뉴 랜덤 뽑기를 지원하는 점메추 탭입니다."
  },
  fortune: {
    title: "오늘의 운세 | 직딩심체요절",
    description: "띠별 오늘의 운세를 확인하고 한 줄 운세, 업무운, 금전운, 관계운을 볼 수 있는 탭입니다."
  },
  ladder: {
    title: "사다리게임 | 직딩심체요절",
    description: "참가자와 결과를 자유롭게 설정하고 세로형과 가로형으로 즐길 수 있는 사다리게임 탭입니다."
  }
};

function updateSeoMeta(activeTabId) {
  const meta = SEO_TAB_META[activeTabId] || {
    title: "직딩심체요절 | 월급 계산, 점메추, 오늘 할 일, 북마크, 운세, 사다리게임",
    description: "직장인을 위한 올인원 업무 보조 대시보드. 월급 계산과 점메추, 오늘 할 일, 북마크, 운세, 사다리게임을 한 곳에서 관리하세요."
  };
  document.title = meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", meta.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", meta.description);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", meta.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", meta.description);

  const canonical = document.getElementById("canonicalLink");
  const url = new URL(window.location.href);
  url.hash = activeTabId ? `#${activeTabId}` : "";
  canonical?.setAttribute("href", url.toString());
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", url.toString());

  const structuredData = document.getElementById("structuredData");
  if (structuredData) {
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "직딩심체요절",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "ko-KR",
      url: url.toString(),
      description: meta.description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "KRW"
      },
      featureList: [
        "슬기로운 월루생활",
        "실수령액 계산표",
        "점메추",
        "오늘 할 일 캘린더",
        "북마크 관리",
        "오늘의 운세",
        "사다리게임"
      ]
    });
  }
}

function bindGlobalAlertBadges(tabs, state, persist) {
  ensureGlobalTodoAlertBadge();
  ensureGlobalTrackerAlertBadge();
  const goToTab = (tabId) => {
    state.activeTab = tabId;
    persist();
    setActiveTab(tabs, tabId);
  };

  document.getElementById("globalLunchAlert")?.addEventListener("click", () => {
    goToTab("lunch");
    const lunchTab = tabs.find((tab) => tab.id === "lunch");
    lunchTab?.controller?.focusAlert?.();
  });

  document.getElementById("globalTodoAlert")?.addEventListener("click", () => {
    goToTab("todo");
    const todoTab = tabs.find((tab) => tab.id === "todo");
    todoTab?.controller?.focusAlert?.();
  });

  document.getElementById("globalTrackerAlert")?.addEventListener("click", () => {
    goToTab("tracker");
    const trackerTab = tabs.find((tab) => tab.id === "tracker");
    trackerTab?.controller?.focusAlert?.();
  });
}


// FILE: .\v1.4\app\tracker\view.js
const trackerTemplate = `
<div class="tracker-layout">
  <section class="card tracker-main">
    <h2>월급 설정</h2>
    <div class="form-grid">
      <label class="field">
        <span class="field-label-row">
          <span>월급 (원)</span>
          <button id="openIncomeTabBtn" type="button" class="inline-link-btn" aria-label="실수령액표 확인하러 가기" data-tooltip="실수령액표 확인하러 가기!">↗</button>
        </span>
        <div class="currency-input-wrap">
          <span class="currency-prefix">₩</span>
          <input id="monthlySalary" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" value="3,000,000" />
        </div>
        <div id="salaryAppliedToast" class="inline-field-toast" aria-live="polite"></div>
      </label>
      <label class="field">
        <span>이번 달 메모</span>
        <input id="monthlyGoal" type="text" placeholder="예: 250만 원 모으기" />
      </label>
    </div>
    <div class="form-grid tracker-time-grid">
      <label class="field">
        <span>출근시간</span>
        <input id="todayStartTime" type="time" />
      </label>
      <label class="field">
        <span>퇴근시간</span>
        <input id="todayEndTime" type="time" />
      </label>
      <div class="field tracker-action-field">
        <button id="workToggleBtn" class="btn btn-start tracker-action-btn">지금 출근</button>
      </div>
    </div>
    <div class="summary-grid">
      <article class="summary-card">
        <div class="summary-label">오늘 회사에 끼친 손해</div>
        <div id="todayMoney" class="summary-value">₩ 0</div>
        <div id="todaySub" class="summary-sub">오늘 근무시간 00:00:00</div>
      </article>
      <article class="summary-card">
        <div class="summary-label">이번 달 회사에 끼친 손해</div>
        <div id="monthMoney" class="summary-value">₩ 0</div>
        <div id="monthSub" class="summary-sub">완료된 근무일 0일 / 0일</div>
      </article>
    </div>
    <div class="stats-grid">
      <article class="stat-card">
        <div class="stat-label">초당 증가액</div>
        <div id="perSecondValue" class="stat-value">₩ 0</div>
      </article>
      <article class="stat-card">
        <div class="stat-label">시급</div>
        <div id="hourlyValue" class="stat-value">₩ 0</div>
      </article>
      <article class="stat-card">
        <div class="stat-label">일급</div>
        <div id="dailyValue" class="stat-value">₩ 0</div>
      </article>
      <article class="stat-card">
        <div class="stat-label">이번 달 근무일</div>
        <div id="workdayValue" class="stat-value">0일</div>
      </article>
    </div>
    <div id="statusPill" class="status-pill off">
      <span class="status-dot"></span>
      <span id="statusText">퇴근 상태</span>
    </div>
    <p class="hint">하루 8시간 근무, 점심 1시간 제외 기준으로 실제 반영 시급은 하루 8시간으로 계산돼.</p>
  </section>
  <aside class="card calendar-card">
    <div class="calendar-header">
      <h2 id="calendarTitle">2026년 1월</h2>
      <div class="button-row tight">
        <button id="prevMonthBtn" class="btn btn-muted">←</button>
        <button id="todayMonthBtn" class="btn btn-muted">오늘</button>
        <button id="nextMonthBtn" class="btn btn-muted">→</button>
      </div>
    </div>
    <div class="weekday-row">
      <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
    </div>
    <div id="calendarGrid" class="calendar-grid"></div>
    <div class="legend">
      <span><i class="swatch work"></i> 정상근무</span>
      <span><i class="swatch quarter"></i> 반반차</span>
      <span><i class="swatch half"></i> 반차</span>
      <span><i class="swatch full"></i> 휴가</span>
      <span><i class="swatch holiday"></i> 주말/공휴일</span>
    </div>
  </aside>
  <section class="card vacation-summary-card">
    <div class="vacation-summary">
      <div class="vacation-summary-header">
        <h3>휴가 요약</h3>
        <label class="field compact-field">
          <span>총 휴가 수</span>
          <input id="leaveAllowance" type="number" min="0" step="0.5" value="15" />
        </label>
      </div>
      <div class="vacation-summary-grid">
        <article class="vacation-card">
          <div class="summary-label">총 휴가</div>
          <div id="leaveTotalValue" class="summary-value">15일</div>
          <div class="summary-sub">현재 연도 기준</div>
        </article>
        <article class="vacation-card">
          <div class="summary-label">사용량</div>
          <div id="leaveUsedValue" class="summary-value">0일</div>
          <div id="leaveUsedSub" class="summary-sub">예정 포함</div>
        </article>
        <article class="vacation-card">
          <div class="summary-label">남은 휴가</div>
          <div id="leaveRemainingValue" class="summary-value">15일</div>
          <div class="summary-sub">추가 사용 가능</div>
        </article>
        <article class="vacation-card">
          <div class="summary-label">이번 달 사용</div>
          <div id="leaveMonthUsedValue" class="summary-value">0일</div>
          <div id="leaveMonthUsedSub" class="summary-sub">해당 달 기록 기준</div>
        </article>
      </div>
    </div>
  </section>
  <section class="card log-card">
    <h2>출퇴근기록 상세</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>날짜</th><th>상태</th><th>출근</th><th>퇴근</th><th>휴게시간</th><th>반영시간</th><th>반영급여</th>
          </tr>
        </thead>
        <tbody id="workLogBody"></tbody>
      </table>
    </div>
  </section>
</div>
<div id="workConfirmModal" class="tracker-confirm-modal" aria-hidden="true">
  <div class="tracker-confirm-panel">
    <div class="tracker-confirm-kicker">출퇴근 확인</div>
    <h3 id="workConfirmTitle" class="tracker-confirm-title">처리할까요?</h3>
    <p id="workConfirmText" class="tracker-confirm-text"></p>
    <div class="tracker-confirm-actions">
      <button id="workConfirmCancelBtn" type="button" class="btn btn-muted">취소</button>
      <button id="workConfirmOkBtn" type="button" class="btn btn-primary">확인</button>
    </div>
  </div>
</div>
<div id="dayModal" class="modal" aria-hidden="true">
  <div class="modal-panel">
    <div class="modal-header">
      <h3 id="modalTitle">날짜 수정</h3>
      <button id="closeModalBtn" class="btn btn-muted icon-btn">×</button>
    </div>
    <div class="form-grid form-grid-2">
      <label class="field">
        <span>상태</span>
        <select id="modalLeaveType">
          <option value="none">정상근무</option>
          <option value="quarter">반반차 (0.25일)</option>
          <option value="half">반차 (0.5일)</option>
          <option value="full">휴가 (1일)</option>
        </select>
      </label>
      <label class="field">
        <span>수동 공휴일</span>
        <select id="modalCustomHoliday">
          <option value="false">아니오</option>
          <option value="true">예</option>
        </select>
      </label>
      <label class="field">
        <span>출근시간</span>
        <input id="modalStartTime" type="time" />
      </label>
      <label class="field">
        <span>퇴근시간</span>
        <input id="modalEndTime" type="time" />
      </label>
    </div>
    <label class="field">
      <span>메모</span>
      <textarea id="modalNote" placeholder="예: 오전 병원, 반차 사용"></textarea>
    </label>
    <div class="button-row">
      <button id="saveDayBtn" class="btn btn-primary">저장</button>
      <button id="clearDayBtn" class="btn btn-muted">이 날짜 설정 초기화</button>
      <button id="deleteNoteBtn" class="btn btn-stop">메모만 삭제</button>
    </div>
  </div>
</div>
`;


// FILE: .\v1.4\app\tracker\tracker.js
function initTrackerTab(root, { state, persist }) {
  const els = {
    monthlySalary: $("#monthlySalary", root),
    salaryAppliedToast: $("#salaryAppliedToast", root),
    monthlyGoal: $("#monthlyGoal", root),
    leaveAllowance: $("#leaveAllowance", root),
    workToggleBtn: $("#workToggleBtn", root),
    todayStartTime: $("#todayStartTime", root),
    todayEndTime: $("#todayEndTime", root),
    openIncomeTabBtn: $("#openIncomeTabBtn", root),
    todayMoney: $("#todayMoney", root),
    monthMoney: $("#monthMoney", root),
    todaySub: $("#todaySub", root),
    monthSub: $("#monthSub", root),
    perSecondValue: $("#perSecondValue", root),
    hourlyValue: $("#hourlyValue", root),
    dailyValue: $("#dailyValue", root),
    workdayValue: $("#workdayValue", root),
    leaveTotalValue: $("#leaveTotalValue", root),
    leaveUsedValue: $("#leaveUsedValue", root),
    leaveUsedSub: $("#leaveUsedSub", root),
    leaveRemainingValue: $("#leaveRemainingValue", root),
    leaveMonthUsedValue: $("#leaveMonthUsedValue", root),
    leaveMonthUsedSub: $("#leaveMonthUsedSub", root),
    statusPill: $("#statusPill", root),
    statusText: $("#statusText", root),
    calendarTitle: $("#calendarTitle", root),
    calendarGrid: $("#calendarGrid", root),
    prevMonthBtn: $("#prevMonthBtn", root),
    todayMonthBtn: $("#todayMonthBtn", root),
    nextMonthBtn: $("#nextMonthBtn", root),
    workLogBody: $("#workLogBody", root),
    workConfirmModal: $("#workConfirmModal", root),
    workConfirmTitle: $("#workConfirmTitle", root),
    workConfirmText: $("#workConfirmText", root),
    workConfirmCancelBtn: $("#workConfirmCancelBtn", root),
    workConfirmOkBtn: $("#workConfirmOkBtn", root),
    modal: $("#dayModal", root),
    modalTitle: $("#modalTitle", root),
    closeModalBtn: $("#closeModalBtn", root),
    modalLeaveType: $("#modalLeaveType", root),
    modalCustomHoliday: $("#modalCustomHoliday", root),
    modalStartTime: $("#modalStartTime", root),
    modalEndTime: $("#modalEndTime", root),
    modalNote: $("#modalNote", root),
    saveDayBtn: $("#saveDayBtn", root),
    clearDayBtn: $("#clearDayBtn", root),
    deleteNoteBtn: $("#deleteNoteBtn", root)
  };

  let selectedDateKey = null;
  let toastTimer = null;
  let salaryValueAnimationFrame = null;
  let salaryFeedbackTimer = null;
  let summaryAnimationFrame = null;
  let lastAnimatedSalary = Number(state.monthlySalary) || 0;
  let isSummaryAnimating = false;
  let deferSalaryDrivenSummaryAnimation = false;
  let pendingSummaryTargets = null;
  let isWaitingForSalaryFeedback = false;
  let forceSummaryTransition = false;
  let pendingWorkAction = null;

  function cloneEntry(entry = {}) {
    return {
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
      leaveType: entry.leaveType || "none",
      note: entry.note || "",
      customHoliday: Boolean(entry.customHoliday),
      running: Boolean(entry.running),
      liveStartTimestamp: entry.liveStartTimestamp || null
    };
  }

  function getEntry(dateKey) {
    if (!state.entries[dateKey]) state.entries[dateKey] = cloneEntry();
    return state.entries[dateKey];
  }

  function formatTimeValue(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function getEntryStartDate(entry, date = getToday()) {
    if (entry.liveStartTimestamp) {
      return new Date(entry.liveStartTimestamp);
    }
    const startSeconds = timeToSeconds(entry.startTime);
    if (startSeconds == null) return null;
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      Math.floor(startSeconds / 3600),
      Math.floor((startSeconds % 3600) / 60),
      0,
      0
    );
  }

  function getAutoStopDate(entry, date = getToday()) {
    const startDate = getEntryStartDate(entry, date);
    if (!startDate) return null;
    return new Date(startDate.getTime() + (PAID_WORK_SECONDS_PER_DAY + 60 * 60) * 1000);
  }
  function isLiveWorkSession(entry, date = getToday()) {
    if (!isSameDay(date, getToday())) return false;
    return Boolean((entry.running || entry.liveStartTimestamp || entry.startTime) && !entry.endTime);
  }

  function syncTrackerHeaderAlert() {
    const today = getToday();
    const todayKey = getDateKey(today);
    if (state.trackerAfterWorkMessageDate && state.trackerAfterWorkMessageDate !== todayKey) {
      state.trackerAfterWorkMessageDate = "";
      state.trackerAutoStoppedDate = "";
      state.trackerAfterWorkAlertAt = 0;
      state.trackerAutoStoppedAt = 0;
      persist();
    }

    const entry = getEntry(todayKey);
    const autoStopDate = getAutoStopDate(entry, today);
    const now = getNow();
    const leaveSoonStart = autoStopDate ? new Date(autoStopDate.getTime() - 60 * 60 * 1000) : null;
    const shouldPulseAfterWork = state.trackerAfterWorkAlertAt > 0 && (now.getTime() - state.trackerAfterWorkAlertAt) < 12000;

    if (state.trackerAfterWorkMessageDate === todayKey) {
      setGlobalTrackerAlert("고민 말고 나가세요. 고민은 퇴근만 늦출 뿐...", "clocked-out", shouldPulseAfterWork);
      return;
    }

    if (isLiveWorkSession(entry, today) && leaveSoonStart && now.getTime() >= leaveSoonStart.getTime() && now.getTime() < autoStopDate.getTime()) {
      setGlobalTrackerAlert("슬슬 퇴근 준비하세요~!! 칼퇴는 직장인의 미덕😘", "leave-soon", true);
      return;
    }

    setGlobalTrackerAlert("", "", false);
  }

  function syncInputsFromState() {
    els.monthlySalary.value = formatNumber(state.monthlySalary);
    els.monthlyGoal.value = state.monthlyGoal;
    els.leaveAllowance.value = state.leaveAllowance;
  }

  function syncTodayTimeInputs(force = false) {
    const todayEntry = getEntry(getDateKey(getToday()));
    const activeElement = document.activeElement;
    if (force || activeElement !== els.todayStartTime) {
      els.todayStartTime.value = todayEntry.startTime || "";
    }
    if (force || activeElement !== els.todayEndTime) {
      els.todayEndTime.value = todayEntry.endTime || "";
    }
  }

  function syncStateFromInputs() {
    state.monthlySalary = Math.max(0, Number(String(els.monthlySalary.value).replace(/[^\d]/g, "")) || 0);
    state.monthlyGoal = els.monthlyGoal.value || "";
    state.leaveAllowance = Math.max(0, Number(els.leaveAllowance.value) || 0);
    persist();
  }

  function formatSalaryInputValue() {
    const numericValue = Math.max(0, Number(String(els.monthlySalary.value).replace(/[^\d]/g, "")) || 0);
    els.monthlySalary.value = numericValue ? formatNumber(numericValue) : "";
  }

  function showSalaryAppliedToast() {
    if (!els.salaryAppliedToast) return;
    if (toastTimer) clearTimeout(toastTimer);
    els.salaryAppliedToast.textContent = "실수령액 기준 월급이 반영됐어요.";
    els.salaryAppliedToast.classList.add("show");
    toastTimer = setTimeout(() => {
      els.salaryAppliedToast.classList.remove("show");
    }, 2200);
  }

  function easeOutExpo(progress) {
    if (progress >= 1) return 1;
    return 1 - 2 ** (-10 * progress);
  }

  function animateSummaryMoneyFields(targets, duration = 1900) {
    const currentValues = {
      todayMoney: Number(els.todayMoney.dataset.value || 0),
      monthMoney: Number(els.monthMoney.dataset.value || 0),
      perSecondValue: Number(els.perSecondValue.dataset.value || 0),
      hourlyValue: Number(els.hourlyValue.dataset.value || 0),
      dailyValue: Number(els.dailyValue.dataset.value || 0)
    };

    if (summaryAnimationFrame) cancelAnimationFrame(summaryAnimationFrame);
    isSummaryAnimating = true;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = easeOutExpo(progress);

      Object.entries(targets).forEach(([key, value]) => {
        const nextValue = currentValues[key] + (value - currentValues[key]) * eased;
        const el = els[key];
        if (!el) return;
        el.dataset.value = String(value);
        el.textContent = formatMoney(nextValue, 0);
      });

      if (progress < 1) {
        summaryAnimationFrame = requestAnimationFrame(step);
      } else {
        Object.entries(targets).forEach(([key, value]) => {
          const el = els[key];
          if (!el) return;
          el.dataset.value = String(value);
          el.textContent = formatMoney(value, 0);
        });
        isSummaryAnimating = false;
        summaryAnimationFrame = null;
      }
    };

    summaryAnimationFrame = requestAnimationFrame(step);
  }

  function animateSalaryInputValue(fromValue, toValue) {
    if (!els.monthlySalary) return;
    if (salaryValueAnimationFrame) cancelAnimationFrame(salaryValueAnimationFrame);

    const startTime = performance.now();
    const duration = 1800;

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = easeOutExpo(progress);
      const nextValue = Math.round(fromValue + (toValue - fromValue) * eased);
      els.monthlySalary.value = formatNumber(nextValue);

      if (progress < 1) {
        salaryValueAnimationFrame = requestAnimationFrame(step);
      } else {
        els.monthlySalary.value = formatNumber(toValue);
        salaryValueAnimationFrame = null;
      }
    };

    salaryValueAnimationFrame = requestAnimationFrame(step);
  }

  function runSalaryAppliedFeedback() {
    const nextValue = Number(state.pendingSalaryAppliedValue) || Number(state.monthlySalary) || 0;
    const previousValue = Number(state.pendingSalaryPreviousValue) || 0;
    const salaryWrap = els.monthlySalary.closest(".currency-input-wrap");

    if (salaryFeedbackTimer) clearTimeout(salaryFeedbackTimer);
    els.monthlySalary.scrollIntoView({ behavior: "smooth", block: "center" });
    salaryFeedbackTimer = setTimeout(() => {
      salaryWrap?.classList.remove("salary-input-flash");
      void els.monthlySalary.offsetWidth;
      salaryWrap?.classList.add("salary-input-flash");
      animateSalaryInputValue(previousValue, nextValue);
      els.calendarGrid.classList.remove("salary-update-pending");
      els.calendarGrid.classList.remove("salary-update-reveal");
      void els.calendarGrid.offsetWidth;
      els.calendarGrid.classList.add("salary-update-reveal");
      els.calendarGrid.querySelectorAll(".day-money").forEach((el, index) => {
        el.style.animationDelay = `${Math.min(index * 12, 160)}ms`;
      });
      if (pendingSummaryTargets) {
        lastAnimatedSalary = state.monthlySalary;
        animateSummaryMoneyFields(pendingSummaryTargets);
        pendingSummaryTargets = null;
      }
      isWaitingForSalaryFeedback = false;
      showSalaryAppliedToast();
      setTimeout(() => {
        els.calendarGrid.classList.remove("salary-update-reveal");
        els.calendarGrid.querySelectorAll(".day-money").forEach((el) => {
          el.style.animationDelay = "";
        });
      }, 1100);
      salaryFeedbackTimer = null;
    }, 520);
  }

  function computeWorkedSecondsFromTimes(startTime, endTime) {
    const startSeconds = timeToSeconds(startTime);
    const endSeconds = timeToSeconds(endTime);
    if (startSeconds == null || endSeconds == null || endSeconds <= startSeconds) return 0;
    const raw = endSeconds - startSeconds;
    const lunchDeduction = raw >= 4 * 3600 ? 3600 : 0;
    return Math.max(0, Math.min(PAID_WORK_SECONDS_PER_DAY, raw - lunchDeduction));
  }

  function getBreakSecondsForEntry(entry) {
    const startSeconds = timeToSeconds(entry?.startTime || "");
    const endSeconds = timeToSeconds(entry?.endTime || "");
    if (startSeconds == null || endSeconds == null || endSeconds <= startSeconds) return 0;
    return endSeconds - startSeconds >= 4 * 3600 ? 3600 : 0;
  }

  function leaveTypeToFraction(type) {
    return type === "full" ? 1 : type === "half" ? 0.5 : type === "quarter" ? 0.25 : 0;
  }

  function getBusinessDaysInMonth(year, month) {
    const lastDate = new Date(year, month + 1, 0).getDate();
    let count = 0;
    for (let day = 1; day <= lastDate; day += 1) {
      const date = new Date(year, month, day);
      if (!isWeekend(date) && !isHoliday(date, getEntry(getDateKey(date)))) count += 1;
    }
    return count;
  }

  const getDailyWage = () => {
    const today = getToday();
    const businessDays = getBusinessDaysInMonth(today.getFullYear(), today.getMonth());
    return businessDays > 0 ? state.monthlySalary / businessDays : 0;
  };

  const getHourlyWage = () => getDailyWage() / (PAID_WORK_SECONDS_PER_DAY / 3600);
  const getPerSecondWage = () => getDailyWage() / PAID_WORK_SECONDS_PER_DAY;

  function getDayStatus(date, entry) {
    if (isWeekend(date)) return "주말";
    if (isHoliday(date, entry)) return getHolidayLabel(date, entry) || "공휴일";
    if (entry.leaveType === "full") return isFuture(date) ? "휴가 예정" : "휴가";
    if (entry.leaveType === "half") return isFuture(date) ? "반차 예정" : "반차";
    if (entry.leaveType === "quarter") return isFuture(date) ? "반반차 예정" : "반반차";
    if (isLiveWorkSession(entry, date)) return "근무 중";
    if (isPast(date)) return "정상근무";
    if (isSameDay(date, getToday())) return "오늘";
    return "예정";
  }

  function getDayResult(date) {
    const entry = getEntry(getDateKey(date));
    const holiday = isHoliday(date, entry);
    const weekend = isWeekend(date);
    const leaveFraction = leaveTypeToFraction(entry.leaveType);
    let paidSeconds = 0;

    if (weekend || holiday) {
      paidSeconds = 0;
    } else if (leaveFraction > 0) {
      paidSeconds = isFuture(date) ? 0 : PAID_WORK_SECONDS_PER_DAY * leaveFraction;
    } else if (isPast(date)) {
      paidSeconds = entry.startTime || entry.endTime
        ? computeWorkedSecondsFromTimes(entry.startTime || DEFAULT_START, entry.endTime || DEFAULT_END)
        : PAID_WORK_SECONDS_PER_DAY;
    } else if (isSameDay(date, getToday())) {
      if (isLiveWorkSession(entry, date)) {
        const startDate = getEntryStartDate(entry, date);
        if (startDate) {
          const now = getNow();
          const autoStopDate = getAutoStopDate(entry, date);
          const effectiveNow = autoStopDate ? new Date(Math.min(now.getTime(), autoStopDate.getTime())) : now;
          const raw = Math.floor((effectiveNow.getTime() - startDate.getTime()) / 1000);
          const lunchDeduction = raw >= 4 * 3600 ? 3600 : 0;
          paidSeconds = Math.max(0, Math.min(PAID_WORK_SECONDS_PER_DAY, raw - lunchDeduction));
        }
      } else if (entry.startTime || entry.endTime) {
        paidSeconds = computeWorkedSecondsFromTimes(entry.startTime || DEFAULT_START, entry.endTime || DEFAULT_END);
      }
    }

    paidSeconds = Math.max(0, Math.min(PAID_WORK_SECONDS_PER_DAY, paidSeconds));
    return {
      dateKey: getDateKey(date),
      entry,
      weekend,
      holiday,
      paidSeconds,
      earnings: paidSeconds * getPerSecondWage(),
      status: getDayStatus(date, entry)
    };
  }

  function getMonthSummary(year, month) {
    const lastDate = new Date(year, month + 1, 0).getDate();
    let earnings = 0;
    let fullDays = 0;
    let businessDays = 0;
    for (let day = 1; day <= lastDate; day += 1) {
      const date = new Date(year, month, day);
      if (!isWeekend(date) && !isHoliday(date, getEntry(getDateKey(date)))) businessDays += 1;
      const result = getDayResult(date);
      earnings += result.earnings;
      if (result.paidSeconds >= PAID_WORK_SECONDS_PER_DAY) fullDays += 1;
    }
    return { earnings, fullDays, businessDays };
  }

  function getLeaveSummary(year, month) {
    let used = 0;
    let monthUsed = 0;
    Object.entries(state.entries).forEach(([dateKey, entry]) => {
      const fraction = leaveTypeToFraction(entry.leaveType);
      if (!fraction) return;
      const date = parseDateKey(dateKey);
      if (date.getFullYear() === year) used += fraction;
      if (date.getFullYear() === year && date.getMonth() === month) monthUsed += fraction;
    });
    const total = Math.max(0, Number(state.leaveAllowance) || 0);
    return { total, used, remaining: Math.max(0, total - used), monthUsed };
  }

  function renderSummary() {
    if (autoStopWorkIfComplete()) return;
    const today = getToday();
    const todayEntry = getEntry(getDateKey(today));
    const todayResult = getDayResult(today);
    const monthSummary = getMonthSummary(today.getFullYear(), today.getMonth());
    const businessDays = getBusinessDaysInMonth(today.getFullYear(), today.getMonth());
    const leaveSummary = getLeaveSummary(state.calendarYear, state.calendarMonth);

    const salaryChanged = lastAnimatedSalary !== state.monthlySalary;
    const moneyTargets = {
      todayMoney: todayResult.earnings,
      monthMoney: monthSummary.earnings,
      perSecondValue: getPerSecondWage(),
      hourlyValue: getHourlyWage(),
      dailyValue: getDailyWage()
    };

    const currentAnimatedValues = {
      todayMoney: Number(els.todayMoney.dataset.value || 0),
      monthMoney: Number(els.monthMoney.dataset.value || 0),
      perSecondValue: Number(els.perSecondValue.dataset.value || 0),
      hourlyValue: Number(els.hourlyValue.dataset.value || 0),
      dailyValue: Number(els.dailyValue.dataset.value || 0)
    };
    const hasLiveTickChange = isLiveWorkSession(todayEntry)
      && (
        Math.abs(currentAnimatedValues.todayMoney - moneyTargets.todayMoney) >= 1
        || Math.abs(currentAnimatedValues.monthMoney - moneyTargets.monthMoney) >= 1
      );

    if (salaryChanged) {
      if (deferSalaryDrivenSummaryAnimation || isWaitingForSalaryFeedback) {
        pendingSummaryTargets = moneyTargets;
      } else {
        lastAnimatedSalary = state.monthlySalary;
        animateSummaryMoneyFields(moneyTargets);
      }
    } else if (forceSummaryTransition) {
      forceSummaryTransition = false;
      animateSummaryMoneyFields(moneyTargets);
    } else if (hasLiveTickChange) {
      animateSummaryMoneyFields(moneyTargets, 650);
    } else if (!isSummaryAnimating) {
      els.todayMoney.dataset.value = String(moneyTargets.todayMoney);
      els.monthMoney.dataset.value = String(moneyTargets.monthMoney);
      els.perSecondValue.dataset.value = String(moneyTargets.perSecondValue);
      els.hourlyValue.dataset.value = String(moneyTargets.hourlyValue);
      els.dailyValue.dataset.value = String(moneyTargets.dailyValue);
      els.todayMoney.textContent = formatMoney(moneyTargets.todayMoney, 0);
      els.monthMoney.textContent = formatMoney(moneyTargets.monthMoney, 0);
      els.perSecondValue.textContent = formatMoney(moneyTargets.perSecondValue, 0);
      els.hourlyValue.textContent = formatMoney(moneyTargets.hourlyValue, 0);
      els.dailyValue.textContent = formatMoney(moneyTargets.dailyValue, 0);
    }

    els.todaySub.textContent = `${todayResult.status} · ${formatTimeFromSeconds(todayResult.paidSeconds)} 반영`;
    els.monthSub.textContent = `완료된 근무일 ${monthSummary.fullDays}일 / ${businessDays}일${state.monthlyGoal ? ` · ${state.monthlyGoal}` : ""}`;
    els.workdayValue.textContent = `${businessDays}일`;
    els.leaveTotalValue.textContent = formatLeaveDays(leaveSummary.total);
    els.leaveUsedValue.textContent = formatLeaveDays(leaveSummary.used);
    els.leaveUsedSub.textContent = `${state.calendarYear}년 일정 포함`;
    els.leaveRemainingValue.textContent = formatLeaveDays(leaveSummary.remaining);
    els.leaveMonthUsedValue.textContent = formatLeaveDays(leaveSummary.monthUsed);
    els.leaveMonthUsedSub.textContent = `${state.calendarYear}년 ${state.calendarMonth + 1}월 기준`;
    const todayMoneyCard = els.todayMoney?.closest(".summary-card");
    const autoStoppedToday = state.trackerAutoStoppedDate === getDateKey(today) && state.trackerAutoStoppedAt > 0 && (getNow().getTime() - state.trackerAutoStoppedAt) < 12000;
    todayMoneyCard?.classList.toggle("auto-stop-highlight", autoStoppedToday);
    syncTodayTimeInputs();
    updateStatusPill();
    updateWorkToggleButton();
    syncTrackerHeaderAlert();
  }

  function updateStatusPill() {
    const result = getDayResult(getToday());
    const entry = getEntry(getDateKey(getToday()));
    els.statusPill.className = "status-pill";
    if (entry.leaveType !== "none") {
      els.statusPill.classList.add("leave");
      els.statusText.textContent = result.status;
    } else if (isLiveWorkSession(entry)) {
      els.statusPill.classList.add("working");
      els.statusText.textContent = "출근 상태";
    } else if (result.paidSeconds >= PAID_WORK_SECONDS_PER_DAY) {
      els.statusPill.classList.add("done");
      els.statusText.textContent = "근무 끝";
    } else {
      els.statusPill.classList.add("off");
      els.statusText.textContent = "퇴근 상태";
    }
  }

  function updateWorkToggleButton() {
    const entry = getEntry(getDateKey(getToday()));
    const result = getDayResult(getToday());
    const button = els.workToggleBtn;
    if (!button) return;
    button.disabled = false;
    button.classList.remove("btn-start", "btn-stop", "btn-muted");

    if (isLiveWorkSession(entry)) {
      button.textContent = "지금 퇴근";
      button.classList.add("btn-stop");
      button.dataset.action = "stop";
      return;
    }

    if (result.paidSeconds >= PAID_WORK_SECONDS_PER_DAY) {
      button.textContent = "근무 끝";
      button.classList.add("btn-muted");
      button.dataset.action = "done";
      button.disabled = true;
      return;
    }

    button.textContent = "지금 출근";
    button.classList.add("btn-start");
    button.dataset.action = "start";
  }

  function renderCalendar() {
    const year = state.calendarYear;
    const month = state.calendarMonth;
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();

    els.calendarTitle.textContent = `${year}년 ${month + 1}월`;
    els.calendarGrid.innerHTML = "";
    const cells = [];
    for (let i = startWeekday - 1; i >= 0; i -= 1) cells.push({ date: new Date(year, month - 1, prevLastDate - i), current: false });
    for (let day = 1; day <= lastDate; day += 1) cells.push({ date: new Date(year, month, day), current: true });
    while (cells.length % 7 !== 0) cells.push({ date: new Date(year, month + 1, cells.length - (startWeekday + lastDate) + 1), current: false });

    cells.forEach(({ date, current }) => {
      const result = getDayResult(date);
      const dayEl = document.createElement("button");
      dayEl.type = "button";
      dayEl.className = "day";
      if (!current) dayEl.classList.add("other-month");
      if (isSameDay(date, getToday())) dayEl.classList.add("today");
      if (date.getDay() === 6) dayEl.classList.add("saturday");
      if (date.getDay() === 0) dayEl.classList.add("sunday");
      if (result.weekend) dayEl.classList.add("weekend");
      if (result.holiday) dayEl.classList.add("holiday");
      if (result.entry.leaveType === "quarter") dayEl.classList.add("leave-quarter");
      else if (result.entry.leaveType === "half") dayEl.classList.add("leave-half");
      else if (result.entry.leaveType === "full") dayEl.classList.add("leave-full");
      else if (result.paidSeconds > 0) dayEl.classList.add("worked");

      const tag = result.weekend ? "주말" : result.holiday ? getHolidayLabel(date, result.entry) || "공휴일" : result.entry.leaveType === "full" ? (isFuture(date) ? "휴가 예정" : "휴가") : result.entry.leaveType === "half" ? (isFuture(date) ? "반차 예정" : "반차") : result.entry.leaveType === "quarter" ? (isFuture(date) ? "반반차 예정" : "반반차") : isLiveWorkSession(result.entry, date) ? "근무 중" : result.paidSeconds > 0 ? "근무 반영" : "";
      const tagClass = result.weekend ? "tag-weekend" : result.holiday ? "tag-holiday" : result.entry.leaveType === "full" ? "tag-leave-full" : result.entry.leaveType === "half" ? "tag-leave-half" : result.entry.leaveType === "quarter" ? "tag-leave-quarter" : isLiveWorkSession(result.entry, date) ? "tag-running" : result.paidSeconds > 0 ? "tag-worked" : "";
      const timeText = result.entry.startTime || result.entry.endTime ? `${result.entry.startTime || "--:--"} ~ ${result.entry.endTime || (isLiveWorkSession(result.entry, date) ? "진행중" : "--:--")}` : "";
      dayEl.innerHTML = `
        <div class="day-date">${date.getDate()}</div>
        ${tag ? `<div class="day-tag ${tagClass}">${tag}</div>` : ""}
        ${timeText ? `<div class="day-time">${timeText}</div>` : ""}
        <div class="day-money">${current && !result.weekend && !result.holiday ? formatMoney(result.earnings, 0) : ""}</div>
      `;
      if (current) dayEl.addEventListener("click", () => openDayModal(getDateKey(date)));
      els.calendarGrid.appendChild(dayEl);
    });
  }

  function renderWorkLog() {
    const year = state.calendarYear;
    const month = state.calendarMonth;
    const lastDate = new Date(year, month + 1, 0).getDate();
    els.workLogBody.innerHTML = "";
    for (let day = 1; day <= lastDate; day += 1) {
      const date = new Date(year, month, day);
      if (isFuture(date)) continue;
      const result = getDayResult(date);
      const hasWork = Boolean(isLiveWorkSession(result.entry, date) || result.entry.startTime || result.entry.endTime);
      const onClosedDay = result.weekend || result.holiday;
      const breakText = hasWork && getBreakSecondsForEntry(result.entry) > 0 ? formatTimeFromSeconds(getBreakSecondsForEntry(result.entry)) : "-";
      const timeText = onClosedDay && !hasWork ? "-" : formatTimeFromSeconds(result.paidSeconds);
      const moneyText = onClosedDay && !hasWork ? "-" : formatMoney(result.earnings, 0);
      const dateClass = result.holiday || date.getDay() === 0 ? "date-sunday" : date.getDay() === 6 ? "date-saturday" : "";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="${dateClass}">${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} (${getWeekdayLabel(date)})</td>
        <td>${result.status}</td>
        <td>${result.entry.startTime || "-"}</td>
        <td>${result.entry.endTime || (isLiveWorkSession(result.entry, date) ? "진행중" : "-")}</td>
        <td>${breakText}</td>
        <td>${timeText}</td>
        <td>${moneyText}</td>
      `;
      tr.style.cursor = "pointer";
      tr.addEventListener("click", () => openDayModal(getDateKey(date)));
      els.workLogBody.appendChild(tr);
    }
  }

  function openDayModal(dateKey) {
    selectedDateKey = dateKey;
    const date = parseDateKey(dateKey);
    const entry = getEntry(dateKey);
    els.modalTitle.textContent = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 수정`;
    els.modalLeaveType.value = entry.leaveType || "none";
    els.modalCustomHoliday.value = entry.customHoliday ? "true" : "false";
    els.modalStartTime.value = entry.startTime || "";
    els.modalEndTime.value = entry.endTime || "";
    els.modalNote.value = entry.note || "";
    els.modal.classList.add("open");
    els.modal.setAttribute("aria-hidden", "false");
  }

  function closeDayModal() {
    selectedDateKey = null;
    els.modal.classList.remove("open");
    els.modal.setAttribute("aria-hidden", "true");
  }

  function saveDayModal() {
    if (!selectedDateKey) return;
    const entry = getEntry(selectedDateKey);
    entry.leaveType = els.modalLeaveType.value;
    entry.customHoliday = els.modalCustomHoliday.value === "true";
    entry.startTime = els.modalStartTime.value || "";
    entry.endTime = els.modalEndTime.value || "";
    entry.note = els.modalNote.value || "";
    entry.running = false;
    entry.liveStartTimestamp = null;
    persist();
    closeDayModal();
    renderAll();
  }

  function clearDaySettings() {
    if (!selectedDateKey) return;
    state.entries[selectedDateKey] = cloneEntry();
    persist();
    closeDayModal();
    renderAll();
  }

  function clearDayNote() {
    if (!selectedDateKey) return;
    getEntry(selectedDateKey).note = "";
    persist();
    openDayModal(selectedDateKey);
  }
  function closeWorkConfirmModal() {
    pendingWorkAction = null;
    els.workConfirmModal.classList.remove("open");
    els.workConfirmModal.setAttribute("aria-hidden", "true");
  }
  function openWorkConfirmModal(action) {
    pendingWorkAction = action;
    const isStart = action === "start";
    els.workConfirmTitle.textContent = isStart ? "출근 처리할까요?" : "퇴근 처리할까요?";
    els.workConfirmText.textContent = isStart
      ? "지금 시각 기준으로 출근 상태로 전환합니다."
      : "지금 시각 기준으로 퇴근 상태로 전환합니다.";
    els.workConfirmModal.classList.add("open");
    els.workConfirmModal.setAttribute("aria-hidden", "false");
  }
  function confirmWorkAction() {
    const action = pendingWorkAction;
    closeWorkConfirmModal();
    if (action === "start") {
      startWorkNow();
      return;
    }
    if (action === "stop") {
      stopWorkNow(getNow(), { manual: true });
    }
  }

  function updateTodayTimesInline() {
    const today = getToday();
    const entry = getEntry(getDateKey(today));
    entry.startTime = els.todayStartTime.value || "";
    entry.endTime = els.todayEndTime.value || "";
    if (isLiveWorkSession(entry, today)) {
      if (!entry.startTime) {
        const now = getNow();
        entry.startTime = formatTimeValue(now);
        entry.liveStartTimestamp = now.getTime();
      } else {
        const startSeconds = timeToSeconds(entry.startTime);
        const startDate = startSeconds == null
          ? null
          : new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              Math.floor(startSeconds / 3600),
              Math.floor((startSeconds % 3600) / 60),
              0,
              0
            );
        entry.liveStartTimestamp = startDate ? startDate.getTime() : getNow().getTime();
      }
      if (entry.endTime) {
        entry.running = false;
        entry.liveStartTimestamp = null;
      }
    } else {
      entry.liveStartTimestamp = null;
    }
    persist();
    syncTodayTimeInputs(true);
    forceSummaryTransition = true;
    renderAll();
  }

  function startWorkNow() {
    const entry = getEntry(getDateKey(getToday()));
    const now = getNow();
    state.trackerAfterWorkMessageDate = "";
    state.trackerAutoStoppedDate = "";
    state.trackerAfterWorkAlertAt = 0;
    state.trackerAutoStoppedAt = 0;
    entry.leaveType = "none";
    entry.customHoliday = false;
    entry.running = true;
    entry.liveStartTimestamp = now.getTime();
    if (!entry.startTime) entry.startTime = formatTimeValue(now);
    entry.endTime = "";
    persist();
    renderAll();
  }

  function stopWorkNow(stopDate = getNow(), options = {}) {
    const entry = getEntry(getDateKey(getToday()));
    entry.running = false;
    entry.liveStartTimestamp = null;
    entry.endTime = formatTimeValue(stopDate);
    if (!entry.startTime) entry.startTime = DEFAULT_START;
    if (isSameDay(stopDate, getToday())) {
      state.trackerAfterWorkMessageDate = getDateKey(getToday());
      state.trackerAfterWorkAlertAt = stopDate.getTime();
      state.trackerAutoStoppedDate = options.auto ? getDateKey(getToday()) : "";
      state.trackerAutoStoppedAt = options.auto ? stopDate.getTime() : 0;
    }
    persist();
    renderAll();
  }

  function autoStopWorkIfComplete() {
    const entry = getEntry(getDateKey(getToday()));
    if (!isLiveWorkSession(entry)) return false;
    const autoStopDate = getAutoStopDate(entry, getToday());
    if (!autoStopDate || getNow().getTime() < autoStopDate.getTime()) return false;
    stopWorkNow(autoStopDate, { manual: false, auto: true });
    return true;
  }

  function handleWorkToggle() {
    if (els.workToggleBtn?.dataset.action === "stop") {
      openWorkConfirmModal("stop");
      return;
    }
    if (els.workToggleBtn?.dataset.action === "start") {
      openWorkConfirmModal("start");
    }
  }

  function renderAll() {
    renderSummary();
    renderCalendar();
    renderWorkLog();
  }

  [els.monthlySalary, els.monthlyGoal, els.leaveAllowance].forEach((el) => {
    const handler = () => {
      syncStateFromInputs();
      if (el === els.monthlySalary) formatSalaryInputValue();
      renderAll();
    };
    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  });
  [els.todayStartTime, els.todayEndTime].forEach((el) => {
    el.addEventListener("change", updateTodayTimesInline);
    el.addEventListener("blur", updateTodayTimesInline);
  });
  els.workToggleBtn.addEventListener("click", handleWorkToggle);
  els.workConfirmCancelBtn.addEventListener("click", closeWorkConfirmModal);
  els.workConfirmOkBtn.addEventListener("click", confirmWorkAction);
  els.workConfirmModal.addEventListener("click", (event) => {
    if (event.target === els.workConfirmModal) closeWorkConfirmModal();
  });
  els.openIncomeTabBtn.addEventListener("click", () => {
    document.querySelector('.tab-btn[data-tab="income"]')?.click();
  });
  els.prevMonthBtn.addEventListener("click", () => {
    state.calendarMonth -= 1;
    if (state.calendarMonth < 0) {
      state.calendarMonth = 11;
      state.calendarYear -= 1;
    }
    persist();
    renderAll();
  });
  els.nextMonthBtn.addEventListener("click", () => {
    state.calendarMonth += 1;
    if (state.calendarMonth > 11) {
      state.calendarMonth = 0;
      state.calendarYear += 1;
    }
    persist();
    renderAll();
  });
  els.todayMonthBtn.addEventListener("click", () => {
    const today = getToday();
    state.calendarYear = today.getFullYear();
    state.calendarMonth = today.getMonth();
    persist();
    renderAll();
  });
  els.closeModalBtn.addEventListener("click", closeDayModal);
  els.modal.addEventListener("click", (event) => {
    if (event.target === els.modal) closeDayModal();
  });
  els.saveDayBtn.addEventListener("click", saveDayModal);
  els.clearDayBtn.addEventListener("click", clearDaySettings);
  els.deleteNoteBtn.addEventListener("click", clearDayNote);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.workConfirmModal.classList.contains("open")) {
      closeWorkConfirmModal();
      return;
    }
    if (event.key === "Escape") closeDayModal();
  });

  syncInputsFromState();
  syncTodayTimeInputs(true);
  renderAll();
  const timer = setInterval(renderSummary, 1000);
  return {
    focusAlert() {
      els.workToggleBtn?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    destroy() {
      clearInterval(timer);
      if (toastTimer) clearTimeout(toastTimer);
      if (salaryFeedbackTimer) clearTimeout(salaryFeedbackTimer);
      if (salaryValueAnimationFrame) cancelAnimationFrame(salaryValueAnimationFrame);
      if (summaryAnimationFrame) cancelAnimationFrame(summaryAnimationFrame);
    },
    onTabChange(isActive) {
      if (!isActive) return;
      const shouldDeferSalaryAnimation = state.pendingSalaryAppliedToast;
      deferSalaryDrivenSummaryAnimation = shouldDeferSalaryAnimation;
      isWaitingForSalaryFeedback = shouldDeferSalaryAnimation;
      els.calendarGrid.classList.toggle("salary-update-pending", shouldDeferSalaryAnimation);
      syncInputsFromState();
      renderAll();
      deferSalaryDrivenSummaryAnimation = false;
      if (state.pendingSalaryAppliedToast) {
        const appliedValue = state.pendingSalaryAppliedValue;
        const previousValue = state.pendingSalaryPreviousValue;
        state.pendingSalaryAppliedToast = false;
        state.pendingSalaryPreviousValue = 0;
        state.pendingSalaryAppliedValue = 0;
        persist();
        state.pendingSalaryAppliedValue = appliedValue;
        state.pendingSalaryPreviousValue = previousValue;
        runSalaryAppliedFeedback();
        state.pendingSalaryAppliedValue = 0;
        state.pendingSalaryPreviousValue = 0;
      }
    }
  };
}


// FILE: .\v1.4\app\income\view.js
const incomeTemplate = `
<section class="card income-card">
  <h2>2026년 연봉 실수령액표</h2>
  <p class="hint">입력값을 바꾸면 표가 자동으로 다시 계산돼. 목표 연봉 감을 빠르게 보는 용도로 쓸 수 있어.</p>
  <div id="incomeCurrentSummary" class="income-current-summary"></div>
  <div class="income-controls">
    <label class="field"><span>시작 연봉 (만원)</span><input id="annualMin" type="number" min="1000" step="100" value="2800" /></label>
    <label class="field"><span>끝 연봉 (만원)</span><input id="annualMax" type="number" min="1000" step="100" value="10000" /></label>
    <label class="field"><span>간격 (만원)</span><input id="annualStep" type="number" min="100" step="100" value="100" /></label>
    <label class="field"><span>부양가족 수</span><select id="dependents"><option value="1">1명</option><option value="2">2명</option><option value="3">3명</option><option value="4">4명</option></select></label>
    <label class="field"><span>비과세 식대 (원)</span><input id="nontaxMeal" type="number" min="0" step="10000" value="200000" /></label>
  </div>
  <div class="table-wrap income-table-wrap">
    <table class="income-table">
      <thead><tr><th>연봉</th><th>월급여</th><th>비과세</th><th>국민연금</th><th>건강보험</th><th>장기요양</th><th>고용보험</th><th>소득세</th><th>지방소득세</th><th>실수령액</th></tr></thead>
      <tbody id="incomeTableBody"></tbody>
    </table>
  </div>
</section>
`;


// FILE: .\v1.4\app\income\income.js
function initIncomeTab(root, { state, persist }) {
  const els = {
    annualMin: root.querySelector("#annualMin"),
    annualMax: root.querySelector("#annualMax"),
    annualStep: root.querySelector("#annualStep"),
    dependents: root.querySelector("#dependents"),
    nontaxMeal: root.querySelector("#nontaxMeal"),
    currentSummary: root.querySelector("#incomeCurrentSummary"),
    incomeTableBody: root.querySelector("#incomeTableBody")
  };

  let expandedAnnualManwon = null;

  function syncInputsFromState() {
    els.annualMin.value = state.annualMin;
    els.annualMax.value = state.annualMax;
    els.annualStep.value = state.annualStep;
    els.dependents.value = state.dependents;
    els.nontaxMeal.value = state.nontaxMeal;
  }

  function syncStateFromInputs() {
    state.annualMin = Number(els.annualMin.value) || 2800;
    state.annualMax = Number(els.annualMax.value) || 10000;
    state.annualStep = Math.max(100, Number(els.annualStep.value) || 100);
    state.dependents = Number(els.dependents.value) || 1;
    state.nontaxMeal = Math.max(0, Number(els.nontaxMeal.value) || 0);
    persist();
  }

  function earnedIncomeDeduction(annualGross) {
    if (annualGross <= 5000000) return annualGross * 0.7;
    if (annualGross <= 15000000) return 3500000 + (annualGross - 5000000) * 0.4;
    if (annualGross <= 45000000) return 7500000 + (annualGross - 15000000) * 0.15;
    if (annualGross <= 100000000) return 12000000 + (annualGross - 45000000) * 0.05;
    return 14750000 + (annualGross - 100000000) * 0.02;
  }

  function progressiveTax(taxBase) {
    if (taxBase <= 14000000) return taxBase * 0.06;
    if (taxBase <= 50000000) return taxBase * 0.15 - 1260000;
    if (taxBase <= 88000000) return taxBase * 0.24 - 5760000;
    if (taxBase <= 150000000) return taxBase * 0.35 - 15440000;
    if (taxBase <= 300000000) return taxBase * 0.38 - 19940000;
    if (taxBase <= 500000000) return taxBase * 0.4 - 25940000;
    if (taxBase <= 1000000000) return taxBase * 0.42 - 35940000;
    return taxBase * 0.45 - 65940000;
  }

  function taxCredit(annualCalculatedTax) {
    const credit = annualCalculatedTax <= 1300000
      ? annualCalculatedTax * 0.55
      : 715000 + (annualCalculatedTax - 1300000) * 0.3;
    return Math.min(credit, 740000);
  }

  function estimateMonthlyIncomeTax(monthlyGross, monthlyNontax, dependents) {
    const annualGross = monthlyGross * 12;
    const annualNontax = monthlyNontax * 12;
    const annualTaxableWage = Math.max(0, annualGross - annualNontax);
    const annualEarnedIncome = Math.max(0, annualTaxableWage - earnedIncomeDeduction(annualTaxableWage));
    const basicDeduction = dependents * 1500000;
    const taxBase = Math.max(0, annualEarnedIncome - basicDeduction);
    const annualCalculatedTax = Math.max(0, progressiveTax(taxBase));
    const annualFinalTax = Math.max(0, annualCalculatedTax - taxCredit(annualCalculatedTax));
    return annualFinalTax / 12;
  }

  function render() {
    syncStateFromInputs();
    els.incomeTableBody.innerHTML = "";
    const min = Math.min(state.annualMin, state.annualMax);
    const max = Math.max(state.annualMin, state.annualMax);
    const step = Math.max(100, state.annualStep);
    const currentMonthlyNet = Number(state.monthlySalary) || 0;
    const rows = [];

    for (let annualManwon = min; annualManwon <= max; annualManwon += step) {
      const annual = annualManwon * 10000;
      const monthlyGross = annual / 12;
      const monthlyNontax = Math.min(state.nontaxMeal, monthlyGross);
      const pension = monthlyGross * 0.045;
      const health = monthlyGross * 0.03545;
      const longTermCare = health * 0.1295;
      const employment = monthlyGross * 0.009;
      const incomeTax = estimateMonthlyIncomeTax(monthlyGross, monthlyNontax, state.dependents);
      const localTax = incomeTax * 0.1;
      const net = monthlyGross - pension - health - longTermCare - employment - incomeTax - localTax;
      rows.push({ annualManwon, monthlyGross, monthlyNontax, pension, health, longTermCare, employment, incomeTax, localTax, net });
    }

    const nearestRow = currentMonthlyNet > 0
      ? rows.reduce((best, row) => {
          if (!best) return row;
          return Math.abs(row.net - currentMonthlyNet) < Math.abs(best.net - currentMonthlyNet) ? row : best;
        }, null)
      : null;

    rows.forEach(({ annualManwon, monthlyGross, monthlyNontax, pension, health, longTermCare, employment, incomeTax, localTax, net }) => {
      const tr = document.createElement("tr");
      if (nearestRow?.annualManwon === annualManwon) tr.classList.add("current-salary-row");
      tr.dataset.annualManwon = String(annualManwon);
      tr.innerHTML = `
        <td>${annualManwon.toLocaleString()}만</td>
        <td>${formatNumber(monthlyGross)}</td>
        <td>${formatNumber(monthlyNontax)}</td>
        <td>${formatNumber(pension)}</td>
        <td>${formatNumber(health)}</td>
        <td>${formatNumber(longTermCare)}</td>
        <td>${formatNumber(employment)}</td>
        <td>${formatNumber(incomeTax)}</td>
        <td>${formatNumber(localTax)}</td>
        <td class="highlight">${formatNumber(net)}</td>
      `;
      tr.addEventListener("click", () => {
        expandedAnnualManwon = expandedAnnualManwon === annualManwon ? null : annualManwon;
        render();
      });
      els.incomeTableBody.appendChild(tr);

      if (expandedAnnualManwon === annualManwon) {
        const actionRow = document.createElement("tr");
        actionRow.className = "income-action-row";
        actionRow.innerHTML = `
          <td colspan="10">
            <div class="income-row-menu">
              <div class="income-row-menu-copy">
                이 구간의 월 실수령액은 <strong>${formatNumber(net)}</strong>원이에요.
              </div>
              <button type="button" class="btn btn-primary" data-apply-net="${Math.round(net)}">슬기로운 월루생활 월급으로 적용</button>
            </div>
          </td>
        `;
        actionRow.querySelector("[data-apply-net]")?.addEventListener("click", (event) => {
          event.stopPropagation();
          state.pendingSalaryPreviousValue = Number(state.monthlySalary) || 0;
          state.monthlySalary = Number(event.currentTarget.dataset.applyNet) || 0;
          state.pendingSalaryAppliedToast = true;
          state.pendingSalaryAppliedValue = state.monthlySalary;
          state.activeTab = "tracker";
          persist();
          expandedAnnualManwon = annualManwon;
          render();
          document.querySelector('.tab-btn[data-tab="tracker"]')?.click();
        });
        els.incomeTableBody.appendChild(actionRow);
      }
    });

    if (currentMonthlyNet > 0) {
      const inRange = nearestRow != null && nearestRow.annualManwon >= min && nearestRow.annualManwon <= max;
      els.currentSummary.innerHTML = `
        <div class="income-current-kicker">슬기로운 월루생활 기준</div>
        <div class="income-current-copy">
          현재 월급 <strong>${formatNumber(state.monthlySalary)}</strong>원은 실수령액 기준으로 보고 있어요.
          ${nearestRow != null ? `표에서는 월 실수령액이 가장 가까운 <strong>${nearestRow.annualManwon.toLocaleString()}만 원</strong> 구간${inRange ? "이" : "이"} 강조돼요.` : ""}
        </div>
        <div class="income-current-meta">예상 월 실수령액 기준 약 <strong>${formatNumber(nearestRow?.net || 0)}</strong>원</div>
      `;
      els.currentSummary.classList.toggle("out-of-range", !inRange);
    } else {
      els.currentSummary.innerHTML = `
        <div class="income-current-copy">슬기로운 월루생활 탭에 월급을 입력하면 현재 연봉 위치를 여기서 바로 보여줘요.</div>
      `;
      els.currentSummary.classList.remove("out-of-range");
    }
  }

  [els.annualMin, els.annualMax, els.annualStep, els.dependents, els.nontaxMeal].forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  syncInputsFromState();
  render();
  return {
    onTabChange(isActive) {
      if (isActive) render();
    }
  };
}


// FILE: .\v1.4\app\bookmarks\view.js
const bookmarksTemplate = `
<section class="card bookmarks-card">
  <div class="bookmarks-header">
    <div>
      <h2>북마크</h2>
      <p class="hint">브라우저 북마크를 드래그 앤 드롭으로 가져와 추가할 수 있어요!</p>
    </div>
    <div class="bookmarks-header-actions">
      <div class="bookmarks-view-toggle" aria-label="북마크 보기 방식">
        <button id="bookmarkCardViewBtn" type="button" class="bookmark-view-btn" aria-pressed="true" title="카드로 보기">◫</button>
        <button id="bookmarkListViewBtn" type="button" class="bookmark-view-btn" aria-pressed="false" title="목록으로 보기">☰</button>
      </div>
      <div class="bookmark-group-create">
        <button id="bookmarkAddGroupBtn" type="button" class="btn btn-muted">그룹 추가</button>
      </div>
      <button id="bookmarkManageLabelsBtn" type="button" class="btn btn-muted bookmark-manage-labels-btn">라벨 관리</button>
      <button id="bookmarkUrlToggleBtn" type="button" class="btn btn-muted bookmark-url-toggle-btn" aria-pressed="false">주소 가리기</button>
    </div>
  </div>
  <div class="bookmark-drop-hint" aria-hidden="true">
    <strong>북마크 추가!</strong>
    <span>링크나 HTML을 여기 놓으면 새 북마크로 추가할 수 있어요.</span>
  </div>
  <div id="bookmarkList" class="bookmark-list"></div>
  <div id="bookmarkModal" class="bookmark-modal" aria-hidden="true">
    <div class="bookmark-modal-panel">
      <button id="bookmarkModalCloseBtn" type="button" class="btn btn-muted bookmark-modal-close" aria-label="북마크 팝업 닫기">×</button>
      <div class="bookmark-modal-kicker">북마크 설정</div>
      <h3 id="bookmarkModalTitle" class="bookmark-modal-title">북마크 추가</h3>
      <div class="form-grid">
        <label class="field">
          <span>이름</span>
          <input id="bookmarkNameInput" type="text" placeholder="예: 네이버 메일" />
        </label>
        <label class="field">
          <span>주소</span>
          <input id="bookmarkUrlInput" type="url" placeholder="https://..." />
        </label>
      </div>
      <div class="form-grid">
        <label class="field">
          <span>대표 이미지 URL</span>
          <input id="bookmarkImageUrlInput" type="url" placeholder="https://.../image.png" />
        </label>
        <label class="field bookmark-color-field">
          <span>대표 색상</span>
          <div class="bookmark-color-control">
            <input id="bookmarkColorInput" class="bookmark-color-input" type="color" value="#93c5fd" />
            <button id="bookmarkColorResetBtn" type="button" class="bookmark-color-reset">기본색</button>
          </div>
        </label>
      </div>
      <label class="field">
        <span>메모</span>
        <input id="bookmarkNoteInput" type="text" placeholder="예: 회사 메일 확인" />
      </label>
      <label class="field">
        <span>그룹</span>
        <input id="bookmarkGroupInput" type="text" list="bookmarkGroupOptions" placeholder="예: 업무 / 포털 / 자주씀" />
        <datalist id="bookmarkGroupOptions"></datalist>
      </label>
      <label class="field">
        <span>라벨</span>
        <div id="bookmarkLabelPicker" class="bookmark-label-picker"></div>
        <div class="bookmark-label-select-row">
          <select id="bookmarkLabelSelect" class="bookmark-label-select">
            <option value="">라벨 선택</option>
          </select>
          <button id="bookmarkLabelAddBtn" type="button" class="btn btn-muted">추가</button>
        </div>
      </label>
      <div id="bookmarkModalError" class="bookmark-modal-error" aria-live="polite"></div>
      <div class="button-row">
        <button id="bookmarkSaveBtn" type="button" class="btn btn-primary">저장</button>
        <button id="bookmarkDeleteBtn" type="button" class="btn btn-stop">삭제</button>
      </div>
    </div>
  </div>
  <div id="bookmarkDeleteConfirmModal" class="bookmark-delete-confirm-modal" aria-hidden="true">
    <div class="bookmark-delete-confirm-panel">
      <div class="bookmark-modal-kicker">북마크 삭제</div>
      <h3 class="bookmark-delete-confirm-title">이 북마크를 삭제할까요?</h3>
      <p id="bookmarkDeleteConfirmText" class="bookmark-delete-confirm-text"></p>
      <div class="button-row">
        <button id="bookmarkDeleteConfirmCancelBtn" type="button" class="btn btn-muted">취소</button>
        <button id="bookmarkDeleteConfirmOkBtn" type="button" class="btn btn-stop">삭제</button>
      </div>
    </div>
  </div>
  <div id="bookmarkLabelsModal" class="bookmark-modal" aria-hidden="true">
    <div class="bookmark-modal-panel">
      <button id="bookmarkLabelsModalCloseBtn" type="button" class="btn btn-muted bookmark-modal-close" aria-label="라벨 관리 팝업 닫기">×</button>
      <div class="bookmark-modal-kicker">라벨 관리</div>
      <h3 class="bookmark-modal-title">라벨과 색상 관리</h3>
      <div id="bookmarkLabelsEditorList" class="bookmark-labels-editor-list"></div>
      <div class="bookmark-labels-add-row">
        <input id="bookmarkNewLabelNameInput" type="text" placeholder="새 라벨 이름" />
        <input id="bookmarkNewLabelColorInput" class="bookmark-label-color-input" type="color" value="#60a5fa" />
        <button id="bookmarkAddLabelBtn" type="button" class="btn btn-primary">추가</button>
      </div>
      <div id="bookmarkLabelsModalError" class="bookmark-modal-error" aria-live="polite"></div>
    </div>
  </div>
</section>
`;


// FILE: .\v1.4\app\bookmarks\bookmarks.js
const MAX_BOOKMARKS = 12;
const DEFAULT_BOOKMARK_COLOR = "#93c5fd";
const DEFAULT_BOOKMARKS = [
  { id: "bookmark-default-naver", name: "네이버", url: "https://www.naver.com/", note: "포털", imageUrl: "", color: "", group: "기본", labels: ["포털"] },
  { id: "bookmark-default-google", name: "구글", url: "https://www.google.com/", note: "검색", imageUrl: "", color: "", group: "기본", labels: ["검색"] }
];
const BOOKMARK_LABEL_COLOR_PALETTE = ["#60a5fa", "#34d399", "#f59e0b", "#f472b6", "#a78bfa", "#fb7185", "#2dd4bf", "#facc15"];
const DEFAULT_BOOKMARK_GROUP = "기타";
function ensureBookmarksState(state) {
  state.bookmarks = Array.isArray(state.bookmarks) ? state.bookmarks.filter((item) => item && typeof item === "object").slice(0, MAX_BOOKMARKS).map((item) => ({
    id: String(item.id || `bookmark-${Date.now()}`),
    name: String(item.name || "").trim(),
    url: String(item.url || "").trim(),
    note: String(item.note || "").trim(),
    imageUrl: String(item.imageUrl || "").trim(),
    color: String(item.color || "").trim(),
    group: normalizeBookmarkGroup(item.group),
    labels: normalizeBookmarkSelection(item.labels || item.tags)
  })) : [];
  state.bookmarkGroups = normalizeBookmarkGroups(state.bookmarkGroups, state.bookmarks);
  state.bookmarkViewMode = state.bookmarkViewMode === "list" ? "list" : "card";
  state.bookmarkShowUrl = state.bookmarkShowUrl !== false;
  state.bookmarkActiveGroup = normalizeBookmarkActiveGroup(state.bookmarkActiveGroup);
  state.bookmarkLabels = normalizeBookmarkLabelDefinitions(state.bookmarkLabels, state.bookmarks, state.bookmarkLabelColors);
}
function normalizeBookmarkGroup(rawValue) {
  return String(rawValue || "").trim().slice(0, 20);
}
function normalizeBookmarkGroups(rawValue, bookmarks = []) {
  const groups = Array.isArray(rawValue) ? rawValue : [];
  const values = groups.map((value) => normalizeBookmarkGroup(value)).filter(Boolean);
  bookmarks.forEach((bookmark) => {
    const group = normalizeBookmarkGroup(bookmark.group) || DEFAULT_BOOKMARK_GROUP;
    values.push(group);
  });
  if (!values.length) values.push(DEFAULT_BOOKMARK_GROUP);
  return values.filter((value, index, array) => array.indexOf(value) === index).slice(0, 24);
}
function normalizeBookmarkActiveGroup(rawValue) {
  const value = String(rawValue || "전체").trim();
  return value || "전체";
}
function getBookmarkGroups(bookmarks) {
  return normalizeBookmarkGroups(state.bookmarkGroups, bookmarks);
}
function normalizeBookmarkSelection(rawValue) {
  const values = Array.isArray(rawValue) ? rawValue : String(rawValue || "").split(",");
  return values.map((value) => String(value || "").trim()).filter(Boolean).filter((value, index, array) => array.indexOf(value) === index).slice(0, 3);
}
function normalizeBookmarkLabelDefinitions(rawValue, bookmarks = [], legacyColors = {}) {
  const definitions = Array.isArray(rawValue) ? rawValue : [];
  const map = new Map();
  definitions.forEach((item) => {
    const name = String(item?.name || "").trim();
    if (!name) return;
    map.set(name, {
      name,
      color: normalizeBookmarkColor(item?.color) || getAutoBookmarkLabelColor(name)
    });
  });
  bookmarks.forEach((bookmark) => {
    normalizeBookmarkSelection(bookmark.labels).forEach((name) => {
      if (!map.has(name)) {
        map.set(name, {
          name,
          color: normalizeBookmarkColor(legacyColors?.[name]) || getAutoBookmarkLabelColor(name)
        });
      }
    });
  });
  Object.entries(legacyColors && typeof legacyColors === "object" ? legacyColors : {}).forEach(([name, color]) => {
    const trimmed = String(name || "").trim();
    const normalized = normalizeBookmarkColor(color);
    if (!trimmed || !normalized) return;
    map.set(trimmed, { name: trimmed, color: normalized });
  });
  return [...map.values()].slice(0, 24);
}
function renderBookmarkTagBadges(labels) {
  const items = normalizeBookmarkSelection(labels);
  if (!items.length) return "";
  return `<div class="bookmark-tags">${items.map((label) => `<span class="bookmark-tag" style="${getBookmarkTagStyle(label, state.bookmarkLabels)}">${escapeHtml(label)}</span>`).join("")}</div>`;
}
function getBookmarkTagStyle(labelName, labelDefs = []) {
  const label = labelDefs.find((item) => item.name === labelName);
  return `--bookmark-tag-custom:${normalizeBookmarkColor(label?.color) || getAutoBookmarkLabelColor(labelName)};`;
}
function getAutoBookmarkLabelColor(label) {
  let hash = 0;
  String(label || "").split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  return BOOKMARK_LABEL_COLOR_PALETTE[Math.abs(hash) % BOOKMARK_LABEL_COLOR_PALETTE.length];
}
function applyDefaultBookmarksIfEmpty(state) {
  ensureBookmarksState(state);
  if (state.bookmarks.length) return false;
  state.bookmarks = DEFAULT_BOOKMARKS.map((item) => ({ ...item }));
  return true;
}
function normalizeBookmarkUrl(rawValue) {
  const trimmed = String(rawValue || "").trim();
  if (!trimmed) return "";
  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProtocol).toString();
  } catch (error) {
    return "";
  }
}
function getBookmarkHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch (error) {
    return "";
  }
}
function hasBookmarkDropPayload(dataTransfer) {
  if (!dataTransfer?.types) return false;
  const types = Array.from(dataTransfer.types);
  return types.includes("text/uri-list") || types.includes("text/plain") || types.includes("text/html");
}
function parseDroppedBookmarkData(dataTransfer) {
  if (!dataTransfer) return null;
  const uriList = String(dataTransfer.getData("text/uri-list") || "").split(/\r?\n/).map((line) => line.trim()).find((line) => line && !line.startsWith("#"));
  const plainText = String(dataTransfer.getData("text/plain") || "").trim();
  const htmlText = String(dataTransfer.getData("text/html") || "").trim();
  let title = "";
  let url = normalizeBookmarkUrl(uriList);
  if (htmlText) {
    const htmlDoc = new DOMParser().parseFromString(htmlText, "text/html");
    const anchor = htmlDoc.querySelector("a[href]");
    if (anchor) {
      if (!url) url = normalizeBookmarkUrl(anchor.getAttribute("href"));
      title = String(anchor.textContent || "").trim();
    }
  }
  if (!url && plainText) {
    const plainLines = plainText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const plainUrl = plainLines.find((line) => normalizeBookmarkUrl(line));
    if (plainUrl) {
      url = normalizeBookmarkUrl(plainUrl);
      title = title || plainLines.find((line) => line !== plainUrl) || "";
    } else {
      url = normalizeBookmarkUrl(plainText);
    }
  }
  if (!url) return null;
  return {
    url,
    name: title || getBookmarkHostname(url) || "북마크"
  };
}
function getBookmarkFaviconCandidates(url) {
  try {
    const parsed = new URL(url);
    return [
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsed.hostname)}&sz=128`,
      `https://icons.duckduckgo.com/ip3/${parsed.hostname}.ico`,
      new URL("/favicon.ico", parsed).toString()
    ].filter(Boolean);
  } catch (error) {
    return [];
  }
}
function getBookmarkInitial(name, url) {
  const base = String(name || getBookmarkHostname(url) || "B").trim();
  return base.charAt(0).toUpperCase();
}
function normalizeBookmarkColor(rawValue) {
  const trimmed = String(rawValue || "").trim();
  if (!trimmed) return "";
  const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : "";
}
function hexToRgb(hex) {
  const normalized = normalizeBookmarkColor(hex);
  if (!normalized) return null;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16)
  };
}
function mixBookmarkChannel(value, target, ratio) {
  return Math.round(value + (target - value) * ratio);
}
function toBookmarkRgbString(rgb) {
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}
function getBookmarkSeedColor(seed) {
  let hash = 0;
  String(seed || "bookmark").split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  void hash;
  return null;
}
function getBookmarkThemeStyle(bookmark) {
  const base = hexToRgb(bookmark.color) || getBookmarkSeedColor(bookmark.name || bookmark.url);
  if (!base) return "";
  const soft = {
    r: mixBookmarkChannel(base.r, 255, 0.84),
    g: mixBookmarkChannel(base.g, 255, 0.84),
    b: mixBookmarkChannel(base.b, 255, 0.84)
  };
  const border = {
    r: mixBookmarkChannel(base.r, 255, 0.58),
    g: mixBookmarkChannel(base.g, 255, 0.58),
    b: mixBookmarkChannel(base.b, 255, 0.58)
  };
  return `--bookmark-accent:${toBookmarkRgbString(base)};--bookmark-soft:${toBookmarkRgbString(soft)};--bookmark-border:${toBookmarkRgbString(border)};`;
}
function initBookmarksTab(root, { state, persist }) {
  const panel = root.querySelector(".bookmarks-card") || root;
  const els = {
    list: panel.querySelector("#bookmarkList"),
    urlToggleBtn: panel.querySelector("#bookmarkUrlToggleBtn"),
    addGroupBtn: panel.querySelector("#bookmarkAddGroupBtn"),
    cardViewBtn: panel.querySelector("#bookmarkCardViewBtn"),
    listViewBtn: panel.querySelector("#bookmarkListViewBtn"),
    manageLabelsBtn: panel.querySelector("#bookmarkManageLabelsBtn"),
    modal: panel.querySelector("#bookmarkModal"),
    modalTitle: panel.querySelector("#bookmarkModalTitle"),
    modalCloseBtn: panel.querySelector("#bookmarkModalCloseBtn"),
    nameInput: panel.querySelector("#bookmarkNameInput"),
    urlInput: panel.querySelector("#bookmarkUrlInput"),
    imageUrlInput: panel.querySelector("#bookmarkImageUrlInput"),
    colorInput: panel.querySelector("#bookmarkColorInput"),
    colorResetBtn: panel.querySelector("#bookmarkColorResetBtn"),
    noteInput: panel.querySelector("#bookmarkNoteInput"),
    groupInput: panel.querySelector("#bookmarkGroupInput"),
    groupOptions: panel.querySelector("#bookmarkGroupOptions"),
    labelPicker: panel.querySelector("#bookmarkLabelPicker"),
    labelSelect: panel.querySelector("#bookmarkLabelSelect"),
    labelAddBtn: panel.querySelector("#bookmarkLabelAddBtn"),
    labelsModal: panel.querySelector("#bookmarkLabelsModal"),
    labelsModalCloseBtn: panel.querySelector("#bookmarkLabelsModalCloseBtn"),
    labelsEditorList: panel.querySelector("#bookmarkLabelsEditorList"),
    labelsModalError: panel.querySelector("#bookmarkLabelsModalError"),
    newLabelNameInput: panel.querySelector("#bookmarkNewLabelNameInput"),
    newLabelColorInput: panel.querySelector("#bookmarkNewLabelColorInput"),
    addLabelBtn: panel.querySelector("#bookmarkAddLabelBtn"),
    labelEditor: panel.querySelector("#bookmarkLabelEditor"),
    error: panel.querySelector("#bookmarkModalError"),
    saveBtn: panel.querySelector("#bookmarkSaveBtn"),
    deleteBtn: panel.querySelector("#bookmarkDeleteBtn"),
    deleteConfirmModal: panel.querySelector("#bookmarkDeleteConfirmModal"),
    deleteConfirmText: panel.querySelector("#bookmarkDeleteConfirmText"),
    deleteConfirmCancelBtn: panel.querySelector("#bookmarkDeleteConfirmCancelBtn"),
    deleteConfirmOkBtn: panel.querySelector("#bookmarkDeleteConfirmOkBtn")
  };
  let editingBookmarkId = null;
  let pendingDeleteBookmarkId = null;
  let draggedBookmarkId = null;
  let draggedGroupName = null;
  let pendingFocusGroupName = "";
  let didDragReorder = false;
  let dropHoverDepth = 0;
  let draftSelectedLabels = [];
  if (applyDefaultBookmarksIfEmpty(state)) {
    persist();
  }
  function openModal(bookmarkId = null, preset = null) {
    ensureBookmarksState(state);
    editingBookmarkId = bookmarkId;
    const bookmark = state.bookmarks.find((item) => item.id === bookmarkId);
    const draft = bookmark || preset || null;
    els.modalTitle.textContent = bookmark ? "북마크 수정" : "북마크 추가";
    els.nameInput.value = draft?.name || "";
    els.urlInput.value = draft?.url || "";
    els.imageUrlInput.value = draft?.imageUrl || "";
    els.colorInput.value = draft?.color || DEFAULT_BOOKMARK_COLOR;
    els.colorInput.dataset.isDefault = draft?.color ? "false" : "true";
    els.noteInput.value = draft?.note || "";
    els.groupInput.value = draft?.group || "";
    renderGroupOptions();
    draftSelectedLabels = normalizeBookmarkSelection(draft?.labels);
    renderLabelPicker();
    els.error.textContent = "";
    els.deleteBtn.hidden = !bookmark;
    els.modal.classList.add("open");
    els.modal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => els.nameInput.focus());
  }
  function closeModal() {
    editingBookmarkId = null;
    draftSelectedLabels = [];
    els.modal.classList.remove("open");
    els.modal.setAttribute("aria-hidden", "true");
  }
  function renderGroupOptions() {
    if (!els.groupOptions) return;
    const groups = getBookmarkGroups(state.bookmarks);
    els.groupOptions.innerHTML = groups.map((group) => `<option value="${escapeHtml(group)}"></option>`).join("");
  }
  function addBookmarkGroup(rawGroup) {
    const group = normalizeBookmarkGroup(rawGroup);
    if (!group) {
      els.error.textContent = "그룹 이름을 입력해 주세요.";
      return false;
    }
    if (state.bookmarkGroups.includes(group)) {
      els.error.textContent = "이미 있는 그룹이에요.";
      return false;
    }
    state.bookmarkGroups = normalizeBookmarkGroups([...state.bookmarkGroups, group], state.bookmarks);
    persist();
    renderGroupOptions();
    render();
    return true;
  }
  function createPendingBookmarkGroup() {
    const tempGroup = `새 그룹 ${Date.now()}`;
    state.bookmarkGroups = normalizeBookmarkGroups([...state.bookmarkGroups, tempGroup], state.bookmarks);
    pendingFocusGroupName = tempGroup;
    persist();
    render();
  }
  function renameBookmarkGroup(previousGroup, nextGroupRaw) {
    const oldName = normalizeBookmarkGroup(previousGroup) || DEFAULT_BOOKMARK_GROUP;
    const nextName = normalizeBookmarkGroup(nextGroupRaw) || DEFAULT_BOOKMARK_GROUP;
    if (!nextName) return false;
    if (oldName === nextName) return true;
    if (state.bookmarkGroups.includes(nextName)) {
      els.error.textContent = "같은 이름의 그룹이 이미 있어요.";
      return false;
    }
    state.bookmarkGroups = state.bookmarkGroups.map((group) => group === oldName ? nextName : group);
    state.bookmarks = state.bookmarks.map((bookmark) => ({
      ...bookmark,
      group: (normalizeBookmarkGroup(bookmark.group) || DEFAULT_BOOKMARK_GROUP) === oldName ? nextName : bookmark.group
    }));
    persist();
    pendingFocusGroupName = nextName;
    renderGroupOptions();
    render();
    return true;
  }
  function renderLabelSelectOptions() {
    if (!els.labelSelect) return;
    const availableLabels = state.bookmarkLabels.filter((label) => !draftSelectedLabels.includes(label.name));
    els.labelSelect.innerHTML = [
      `<option value="">${state.bookmarkLabels.length ? "라벨 선택" : "라벨 없음"}</option>`,
      ...availableLabels.map((label) => `<option value="${escapeHtml(label.name)}">${escapeHtml(label.name)}</option>`)
    ].join("");
    els.labelSelect.disabled = !availableLabels.length;
    if (!availableLabels.length) {
      els.labelSelect.value = "";
    }
  }
  function renderLabelPicker() {
    if (!els.labelPicker) return;
    if (!state.bookmarkLabels.length) {
      els.labelPicker.innerHTML = `<div class="bookmark-label-picker-empty">라벨 관리에서 먼저 라벨을 만들어 주세요.</div>`;
      renderLabelSelectOptions();
      return;
    }
    els.labelPicker.innerHTML = "";
    if (!draftSelectedLabels.length) {
      els.labelPicker.innerHTML = `<div class="bookmark-label-picker-empty">선택된 라벨이 없어요.</div>`;
      renderLabelSelectOptions();
      return;
    }
    draftSelectedLabels.forEach((labelName) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bookmark-label-option selected";
      button.dataset.bookmarkLabelOption = labelName;
      button.title = "클릭하면 라벨 선택이 해제돼요.";
      const chip = document.createElement("span");
      chip.className = "bookmark-tag";
      chip.setAttribute("style", getBookmarkTagStyle(labelName, state.bookmarkLabels));
      chip.textContent = labelName;
      button.appendChild(chip);

      button.addEventListener("click", () => {
        draftSelectedLabels = draftSelectedLabels.filter((item) => item !== labelName);
        els.error.textContent = "";
        renderLabelPicker();
      });

      els.labelPicker.appendChild(button);
    });
    renderLabelSelectOptions();
  }
  function openLabelsModal() {
    ensureBookmarksState(state);
    renderLabelsEditor();
    els.labelsModal.classList.add("open");
    els.labelsModal.setAttribute("aria-hidden", "false");
  }
  function closeLabelsModal() {
    els.labelsModal.classList.remove("open");
    els.labelsModal.setAttribute("aria-hidden", "true");
    els.labelsModalError.textContent = "";
    els.newLabelNameInput.value = "";
    els.newLabelColorInput.value = "#60a5fa";
  }
  function renderLabelsEditor() {
    ensureBookmarksState(state);
    els.labelsEditorList.innerHTML = "";
    state.bookmarkLabels.forEach((label) => {
      const row = document.createElement("div");
      row.className = "bookmark-managed-label-row";
      row.dataset.bookmarkManagedLabel = label.name;

      const chip = document.createElement("span");
      chip.className = "bookmark-tag";
      chip.setAttribute("style", getBookmarkTagStyle(label.name, state.bookmarkLabels));
      chip.textContent = label.name;

      const nameInput = document.createElement("input");
      nameInput.className = "bookmark-managed-label-name";
      nameInput.type = "text";
      nameInput.value = label.name;

      const colorInput = document.createElement("input");
      colorInput.className = "bookmark-label-color-input";
      colorInput.type = "color";
      colorInput.value = normalizeBookmarkColor(label.color) || getAutoBookmarkLabelColor(label.name);

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-muted bookmark-managed-label-delete";
      deleteBtn.textContent = "삭제";

      colorInput.addEventListener("change", () => {
        const color = normalizeBookmarkColor(colorInput.value);
        if (!color) return;
        state.bookmarkLabels = state.bookmarkLabels.map((item) => item.name === label.name ? { ...item, color } : item);
        persist();
        renderLabelsEditor();
        renderLabelPicker();
        render();
      });

      nameInput.addEventListener("change", () => {
        const previousName = label.name;
        const nextName = String(nameInput.value || "").trim();
        if (!previousName || !nextName || previousName === nextName) {
          renderLabelsEditor();
          return;
        }
        if (state.bookmarkLabels.some((item) => item.name === nextName)) {
          els.labelsModalError.textContent = "같은 이름의 라벨이 이미 있어요.";
          renderLabelsEditor();
          return;
        }
        state.bookmarkLabels = state.bookmarkLabels.map((item) => item.name === previousName ? { ...item, name: nextName } : item);
        state.bookmarks = state.bookmarks.map((bookmark) => ({
          ...bookmark,
          labels: normalizeBookmarkSelection(bookmark.labels).map((item) => item === previousName ? nextName : item)
        }));
        draftSelectedLabels = draftSelectedLabels.map((item) => item === previousName ? nextName : item);
        persist();
        els.labelsModalError.textContent = "";
        renderLabelsEditor();
        renderLabelPicker();
        render();
      });

      deleteBtn.addEventListener("click", () => {
        const name = label.name;
        state.bookmarkLabels = state.bookmarkLabels.filter((item) => item.name !== name);
        state.bookmarks = state.bookmarks.map((bookmark) => ({
          ...bookmark,
          labels: normalizeBookmarkSelection(bookmark.labels).filter((item) => item !== name)
        }));
        draftSelectedLabels = draftSelectedLabels.filter((item) => item !== name);
        persist();
        renderLabelsEditor();
        renderLabelPicker();
        render();
      });

      row.append(chip, nameInput, colorInput, deleteBtn);
      els.labelsEditorList.appendChild(row);
    });
  }
  function openDeleteConfirm(bookmarkId) {
    const bookmark = state.bookmarks.find((item) => item.id === bookmarkId);
    if (!bookmark) return;
    pendingDeleteBookmarkId = bookmarkId;
    els.deleteConfirmText.textContent = `${bookmark.name} 북마크를 목록에서 삭제합니다.`;
    els.deleteConfirmModal.classList.add("open");
    els.deleteConfirmModal.setAttribute("aria-hidden", "false");
  }
  function closeDeleteConfirm() {
    pendingDeleteBookmarkId = null;
    els.deleteConfirmModal.classList.remove("open");
    els.deleteConfirmModal.setAttribute("aria-hidden", "true");
  }
  function saveBookmark() {
    ensureBookmarksState(state);
    const name = String(els.nameInput.value || "").trim();
    const url = normalizeBookmarkUrl(els.urlInput.value);
    const imageUrl = normalizeBookmarkUrl(els.imageUrlInput.value);
    const color = els.colorInput.dataset.isDefault === "true" ? "" : normalizeBookmarkColor(els.colorInput.value);
    const note = String(els.noteInput.value || "").trim();
    const group = normalizeBookmarkGroup(els.groupInput.value) || DEFAULT_BOOKMARK_GROUP;
    const labels = normalizeBookmarkSelection(draftSelectedLabels);
    if (!name) {
      els.error.textContent = "북마크 이름을 입력해 주세요.";
      els.nameInput.focus();
      return;
    }
    if (!url) {
      els.error.textContent = "열 수 있는 주소를 입력해 주세요.";
      els.urlInput.focus();
      return;
    }
    if (editingBookmarkId) {
      state.bookmarks = state.bookmarks.map((item) => item.id === editingBookmarkId ? { ...item, name, url, note, imageUrl, color, group, labels } : item);
    } else {
      if (state.bookmarks.length >= MAX_BOOKMARKS) {
        els.error.textContent = `북마크는 최대 ${MAX_BOOKMARKS}개까지 저장할 수 있어요.`;
        return;
      }
      state.bookmarks = [...state.bookmarks, { id: `bookmark-${Date.now()}`, name, url, note, imageUrl, color, group, labels }];
    }
    state.bookmarkGroups = normalizeBookmarkGroups([...state.bookmarkGroups, group], state.bookmarks);
    persist();
    closeModal();
    render();
  }
  function confirmDeleteBookmark() {
    const targetId = pendingDeleteBookmarkId || editingBookmarkId;
    if (!targetId) return;
    state.bookmarks = state.bookmarks.filter((item) => item.id !== targetId);
    persist();
    closeDeleteConfirm();
    closeModal();
    render();
  }
  function openBookmark(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  function reorderBookmarks(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return;
    const sourceIndex = state.bookmarks.findIndex((item) => item.id === fromId);
    const targetIndex = state.bookmarks.findIndex((item) => item.id === toId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const next = [...state.bookmarks];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    state.bookmarks = next;
    persist();
    didDragReorder = true;
    render();
  }
  function moveBookmarkToGroup(bookmarkId, nextGroup) {
    const group = normalizeBookmarkGroup(nextGroup) || DEFAULT_BOOKMARK_GROUP;
    state.bookmarks = state.bookmarks.map((item) => item.id === bookmarkId ? { ...item, group } : item);
    state.bookmarkGroups = normalizeBookmarkGroups([...state.bookmarkGroups, group], state.bookmarks);
    persist();
    didDragReorder = true;
    render();
  }
  function reorderBookmarkGroups(fromGroup, toGroup) {
    if (!fromGroup || !toGroup || fromGroup === toGroup) return;
    const sourceIndex = state.bookmarkGroups.findIndex((group) => group === fromGroup);
    const targetIndex = state.bookmarkGroups.findIndex((group) => group === toGroup);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const next = [...state.bookmarkGroups];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    state.bookmarkGroups = next;
    persist();
    didDragReorder = true;
    render();
  }
  function clearExternalDropState() {
    dropHoverDepth = 0;
    panel.classList.remove("drop-target");
  }
  function addDroppedBookmarkToGroup(dropped, groupName) {
    const group = normalizeBookmarkGroup(groupName) || DEFAULT_BOOKMARK_GROUP;
    ensureBookmarksState(state);
    const existing = state.bookmarks.find((item) => item.url === dropped.url);
    if (existing) {
      state.bookmarks = state.bookmarks.map((item) => item.id === existing.id ? { ...item, group } : item);
      state.bookmarkGroups = normalizeBookmarkGroups([...state.bookmarkGroups, group], state.bookmarks);
      persist();
      render();
      return;
    }
    if (state.bookmarks.length >= MAX_BOOKMARKS) {
      return;
    }
    state.bookmarks = [...state.bookmarks, {
      id: `bookmark-${Date.now()}`,
      name: dropped.name || getBookmarkHostname(dropped.url) || "북마크",
      url: dropped.url,
      note: "",
      imageUrl: "",
      color: "",
      group,
      labels: []
    }];
    state.bookmarkGroups = normalizeBookmarkGroups([...state.bookmarkGroups, group], state.bookmarks);
    persist();
    render();
  }
  function handleExternalBookmarkDrop(event, groupName) {
    event.preventDefault();
    event.stopPropagation();
    clearExternalDropState();
    const dropped = parseDroppedBookmarkData(event.dataTransfer);
    if (!dropped) return;
    addDroppedBookmarkToGroup(dropped, groupName);
  }
  function bindBookmarkFaviconFallback() {
    els.list.querySelectorAll("[data-bookmark-favicon]").forEach((img) => {
      const media = img.closest(".bookmark-media");
      if (!media) return;
      const fallbackCandidates = JSON.parse(img.dataset.bookmarkFallbacks || "[]");
      let currentIndex = Number(img.dataset.bookmarkIndex || 0);
      const handleLoaded = () => {
        if (img.naturalWidth > 0) {
          media.classList.add("loaded");
          media.classList.remove("failed");
        }
      };
      const handleFailed = () => {
        currentIndex += 1;
        img.dataset.bookmarkIndex = String(currentIndex);
        const nextSrc = fallbackCandidates[currentIndex];
        if (nextSrc) {
          img.src = nextSrc;
          return;
        }
        media.classList.remove("loaded");
        media.classList.add("failed");
        img.removeAttribute("src");
      };
      img.addEventListener("load", handleLoaded, { once: true });
      img.addEventListener("error", handleFailed, { once: true });
      if (img.complete) {
        if (img.naturalWidth > 0) handleLoaded();
        else handleFailed();
      }
    });
  }
  function render() {
    ensureBookmarksState(state);
    panel.classList.toggle("bookmark-list-mode", state.bookmarkViewMode === "list");
    panel.classList.toggle("bookmark-hide-url", !state.bookmarkShowUrl);
    els.cardViewBtn?.setAttribute("aria-pressed", String(state.bookmarkViewMode === "card"));
    els.listViewBtn?.setAttribute("aria-pressed", String(state.bookmarkViewMode === "list"));
    els.urlToggleBtn?.setAttribute("aria-pressed", String(state.bookmarkShowUrl));
    if (els.urlToggleBtn) {
      els.urlToggleBtn.textContent = state.bookmarkShowUrl ? "주소 보이기" : "주소 가리기";
    }
    renderGroupOptions();
    const groups = getBookmarkGroups(state.bookmarks);
    const sectionHtml = groups.map((group) => {
      const groupBookmarks = state.bookmarks.filter((bookmark) => (normalizeBookmarkGroup(bookmark.group) || DEFAULT_BOOKMARK_GROUP) === group);
      const bookmarkCards = groupBookmarks.map((bookmark) => {
        const hostname = getBookmarkHostname(bookmark.url);
        const faviconCandidates = getBookmarkFaviconCandidates(bookmark.url);
        return `
          <article class="bookmark-item" data-bookmark-open="${bookmark.id}" data-bookmark-id="${bookmark.id}" data-bookmark-group="${escapeHtml(group)}" draggable="true" style="${getBookmarkThemeStyle(bookmark)}">
            ${bookmark.imageUrl ? `<img class="bookmark-cover" src="${escapeHtml(bookmark.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" />` : ""}
            <div class="bookmark-item-top">
              <div class="bookmark-media">
                <img
                  class="bookmark-favicon"
                  data-bookmark-favicon
                  data-bookmark-index="0"
                  data-bookmark-fallbacks='${escapeHtml(JSON.stringify(faviconCandidates))}'
                  src="${escapeHtml(faviconCandidates[0] || "")}"
                  alt=""
                  loading="lazy"
                  referrerpolicy="no-referrer"
                />
                <div class="bookmark-badge">${escapeHtml(getBookmarkInitial(bookmark.name, bookmark.url))}</div>
              </div>
              <div class="bookmark-item-actions">
                <button type="button" class="bookmark-icon-btn" data-bookmark-edit="${bookmark.id}" aria-label="북마크 수정">✎</button>
              </div>
            </div>
            <h3>${escapeHtml(bookmark.name)}</h3>
            ${renderBookmarkTagBadges(bookmark.labels)}
            ${state.bookmarkShowUrl ? `<div class="bookmark-host">${escapeHtml(hostname || bookmark.url)}</div>` : ""}
            ${bookmark.note ? `<p class="bookmark-note">${escapeHtml(bookmark.note)}</p>` : ""}
          </article>
        `;
      }).join("");
      const addCard = state.bookmarks.length < MAX_BOOKMARKS ? `
        <button type="button" class="bookmark-item bookmark-item-add" data-bookmark-add-group="${escapeHtml(group)}" aria-label="${escapeHtml(group)} 그룹에 북마크 추가">
          <span class="bookmark-add-plus">+</span>
          <span class="bookmark-add-text">${escapeHtml(group)}에 추가</span>
        </button>
      ` : "";
      return `
        <section class="bookmark-group-section" data-bookmark-section="${escapeHtml(group)}" data-bookmark-group-order="${escapeHtml(group)}" draggable="true">
          <div class="bookmark-group-section-header">
            <div class="bookmark-group-title-row">
              <h3>${escapeHtml(group)}</h3>
              <input type="text" class="bookmark-group-title-input" data-bookmark-group-input="${escapeHtml(group)}" value="${escapeHtml(group)}" ${pendingFocusGroupName === group ? "" : "hidden"} />
              <button type="button" class="bookmark-group-edit-btn" data-bookmark-group-edit="${escapeHtml(group)}" aria-label="그룹 이름 수정">✎</button>
            </div>
          </div>
          <div class="bookmark-group-list" data-bookmark-group-drop="${escapeHtml(group)}">
            ${bookmarkCards || `<div class="bookmark-group-empty">이 그룹엔 아직 북마크가 없어요.</div>`}
            ${addCard}
          </div>
        </section>
      `;
    }).join("");
    els.list.innerHTML = sectionHtml || `<div class="bookmark-empty-copy">그룹을 먼저 추가해보세요.</div>`;
    els.list.querySelectorAll("[data-bookmark-add-group]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openModal(null, { group: button.dataset.bookmarkAddGroup || DEFAULT_BOOKMARK_GROUP });
      });
    });
    els.list.querySelectorAll("[data-bookmark-group-edit]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const group = button.dataset.bookmarkGroupEdit || "";
        const section = button.closest("[data-bookmark-section]");
        const input = section?.querySelector("[data-bookmark-group-input]");
        const title = section?.querySelector(".bookmark-group-title-row h3");
        if (!input || !title) return;
        input.hidden = false;
        title.hidden = true;
        button.hidden = true;
        requestAnimationFrame(() => {
          input.focus();
          input.select();
        });
      });
    });
    els.list.querySelectorAll("[data-bookmark-group-input]").forEach((input) => {
      const finishEdit = () => {
        const section = input.closest("[data-bookmark-section]");
        const currentGroup = section?.dataset.bookmarkSection || "";
        renameBookmarkGroup(currentGroup, input.value);
      };
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          finishEdit();
        }
        if (event.key === "Escape") {
          render();
        }
      });
      input.addEventListener("blur", finishEdit);
    });
    if (pendingFocusGroupName) {
      const section = els.list.querySelector(`[data-bookmark-section="${pendingFocusGroupName}"]`);
      const input = section?.querySelector("[data-bookmark-group-input]");
      const title = section?.querySelector(".bookmark-group-title-row h3");
      const editBtn = section?.querySelector("[data-bookmark-group-edit]");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (input && title && editBtn) {
        input.hidden = false;
        title.hidden = true;
        editBtn.hidden = true;
        requestAnimationFrame(() => {
          input.focus();
          input.select();
        });
      }
      pendingFocusGroupName = "";
    }
    els.list.querySelectorAll("[data-bookmark-open]").forEach((card) => {
      card.addEventListener("click", () => {
        if (didDragReorder) {
          didDragReorder = false;
          return;
        }
        const bookmark = state.bookmarks.find((item) => item.id === card.dataset.bookmarkOpen);
        if (bookmark) openBookmark(bookmark.url);
      });
      card.addEventListener("dragstart", () => {
        draggedBookmarkId = card.dataset.bookmarkId;
        card.classList.add("dragging");
      });
      card.addEventListener("dragend", () => {
        draggedBookmarkId = null;
        card.classList.remove("dragging");
        requestAnimationFrame(() => {
          didDragReorder = false;
        });
      });
      card.addEventListener("dragover", (event) => {
        event.preventDefault();
        if (!draggedBookmarkId || draggedBookmarkId === card.dataset.bookmarkId) return;
        card.classList.add("drag-over");
      });
      card.addEventListener("dragleave", () => {
        card.classList.remove("drag-over");
      });
      card.addEventListener("drop", (event) => {
        if (draggedBookmarkId) {
          event.preventDefault();
          card.classList.remove("drag-over");
          const targetGroup = card.dataset.bookmarkGroup || DEFAULT_BOOKMARK_GROUP;
          state.bookmarks = state.bookmarks.map((item) => item.id === draggedBookmarkId ? { ...item, group: targetGroup } : item);
          reorderBookmarks(draggedBookmarkId, card.dataset.bookmarkId);
        }
      });
    });
    els.list.querySelectorAll("[data-bookmark-group-drop]").forEach((section) => {
      section.addEventListener("dragover", (event) => {
        if (draggedBookmarkId) {
          event.preventDefault();
          section.classList.add("drag-over");
          return;
        }
        if (!hasBookmarkDropPayload(event.dataTransfer)) return;
        event.preventDefault();
        section.classList.add("drag-over");
      });
      section.addEventListener("dragleave", () => {
        section.classList.remove("drag-over");
      });
      section.addEventListener("drop", (event) => {
        section.classList.remove("drag-over");
        if (draggedBookmarkId) {
          event.preventDefault();
          moveBookmarkToGroup(draggedBookmarkId, section.dataset.bookmarkGroupDrop || DEFAULT_BOOKMARK_GROUP);
          return;
        }
        if (!hasBookmarkDropPayload(event.dataTransfer)) return;
        handleExternalBookmarkDrop(event, section.dataset.bookmarkGroupDrop || DEFAULT_BOOKMARK_GROUP);
      });
    });
    els.list.querySelectorAll("[data-bookmark-group-order]").forEach((section) => {
      section.addEventListener("dragstart", () => {
        if (draggedBookmarkId) return;
        draggedGroupName = section.dataset.bookmarkGroupOrder;
        section.classList.add("dragging");
      });
      section.addEventListener("dragend", () => {
        draggedGroupName = null;
        section.classList.remove("dragging");
        requestAnimationFrame(() => {
          didDragReorder = false;
        });
      });
      section.addEventListener("dragover", (event) => {
        if (!draggedGroupName || draggedGroupName === section.dataset.bookmarkGroupOrder) return;
        event.preventDefault();
        section.classList.add("drag-over");
      });
      section.addEventListener("dragleave", () => {
        section.classList.remove("drag-over");
      });
      section.addEventListener("drop", (event) => {
        if (!draggedGroupName) return;
        event.preventDefault();
        section.classList.remove("drag-over");
        reorderBookmarkGroups(draggedGroupName, section.dataset.bookmarkGroupOrder || "");
      });
    });
    els.list.querySelectorAll("[data-bookmark-edit]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openModal(button.dataset.bookmarkEdit);
      });
    });
    bindBookmarkFaviconFallback();
  }
  els.modalCloseBtn.addEventListener("click", closeModal);
  els.cardViewBtn?.addEventListener("click", () => {
    if (state.bookmarkViewMode === "card") return;
    state.bookmarkViewMode = "card";
    persist();
    render();
  });
  els.listViewBtn?.addEventListener("click", () => {
    if (state.bookmarkViewMode === "list") return;
    state.bookmarkViewMode = "list";
    persist();
    render();
  });
  els.urlToggleBtn?.addEventListener("click", () => {
    state.bookmarkShowUrl = !state.bookmarkShowUrl;
    persist();
    render();
  });
  els.addGroupBtn?.addEventListener("click", () => {
    createPendingBookmarkGroup();
  });
  els.manageLabelsBtn?.addEventListener("click", openLabelsModal);
  els.labelAddBtn?.addEventListener("click", () => {
    const labelName = String(els.labelSelect?.value || "").trim();
    if (!labelName) return;
    if (draftSelectedLabels.includes(labelName)) {
      els.error.textContent = "이미 선택한 라벨이에요.";
      return;
    }
    if (draftSelectedLabels.length >= 3) {
      els.error.textContent = "라벨은 최대 3개까지 선택할 수 있어요.";
      return;
    }
    draftSelectedLabels = [...draftSelectedLabels, labelName];
    els.error.textContent = "";
    renderLabelPicker();
  });
  els.modal.addEventListener("click", (event) => {
    if (event.target === els.modal) closeModal();
  });
  els.labelsModalCloseBtn?.addEventListener("click", closeLabelsModal);
  els.labelsModal?.addEventListener("click", (event) => {
    if (event.target === els.labelsModal) closeLabelsModal();
  });
  els.addLabelBtn?.addEventListener("click", () => {
    const name = String(els.newLabelNameInput.value || "").trim();
    const color = normalizeBookmarkColor(els.newLabelColorInput.value) || "#60a5fa";
    if (!name) {
      els.labelsModalError.textContent = "라벨 이름을 입력해 주세요.";
      return;
    }
    if (state.bookmarkLabels.some((label) => label.name === name)) {
      els.labelsModalError.textContent = "같은 이름의 라벨이 이미 있어요.";
      return;
    }
    state.bookmarkLabels = [...state.bookmarkLabels, { name, color }];
    persist();
    els.labelsModalError.textContent = "";
    els.newLabelNameInput.value = "";
    els.newLabelColorInput.value = "#60a5fa";
    renderLabelsEditor();
    renderLabelPicker();
    render();
  });
  panel.addEventListener("dragenter", (event) => {
    if (draggedBookmarkId || draggedGroupName) return;
    if (!hasBookmarkDropPayload(event.dataTransfer)) return;
    dropHoverDepth += 1;
  });
  panel.addEventListener("dragleave", () => {
    if (draggedBookmarkId || draggedGroupName) return;
    dropHoverDepth = Math.max(0, dropHoverDepth - 1);
  });
  els.colorInput?.addEventListener("input", () => {
    els.colorInput.dataset.isDefault = "false";
  });
  els.colorResetBtn?.addEventListener("click", () => {
    els.colorInput.value = DEFAULT_BOOKMARK_COLOR;
    els.colorInput.dataset.isDefault = "true";
  });
  els.saveBtn.addEventListener("click", saveBookmark);
  els.deleteBtn.addEventListener("click", () => {
    if (!editingBookmarkId) return;
    openDeleteConfirm(editingBookmarkId);
  });
  els.deleteConfirmCancelBtn.addEventListener("click", closeDeleteConfirm);
  els.deleteConfirmOkBtn.addEventListener("click", confirmDeleteBookmark);
  els.deleteConfirmModal.addEventListener("click", (event) => {
    if (event.target === els.deleteConfirmModal) closeDeleteConfirm();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLabelsModal();
      closeDeleteConfirm();
      closeModal();
    }
  });
  render();
  return {
    onTabChange(isActive) {
      if (!isActive) {
        closeDeleteConfirm();
        closeModal();
      }
    }
  };
}


// FILE: .\v1.4\app\lunch\view.js
const todoTemplate = `
<section class="card todo-card">
  <div class="todo-header">
    <div>
      <div class="todo-title-row">
        <h2>오늘 할 일</h2>
        <span id="todoAlertBadge" class="todo-alert-badge" hidden></span>
      </div>
      <p class="hint">기한, 반복 작업, 메모, 미리 알림까지 한 번에 관리하고 목록과 캘린더로 볼 수 있어요.</p>
    </div>
    <div class="todo-header-actions">
      <div class="todo-view-toggle" aria-label="오늘 할 일 보기 방식">
        <button id="todoListViewBtn" type="button" class="todo-view-btn active">☰</button>
        <button id="todoCalendarViewBtn" type="button" class="todo-view-btn">◫</button>
      </div>
      <button id="todoAddBtn" type="button" class="btn btn-primary">할 일 추가</button>
      <button id="todoAddEventBtn" type="button" class="btn btn-muted">일정 추가</button>
    </div>
  </div>

  <div id="todoReminderBanner" class="todo-reminder-banner" hidden></div>

  <div id="todoListView" class="todo-view-panel">
    <div class="todo-filter-card">
      <div class="todo-filter-card-label">필터</div>
      <div class="todo-list-filters">
        <button id="todoFavoritesFilterBtn" type="button" class="todo-filter-btn" aria-pressed="false" title="중요 표시된 일정만 보여줘" data-tooltip="중요 표시된 일정만 보여줘">★</button>
        <button id="todoCompletedFilterBtn" type="button" class="todo-filter-btn todo-filter-btn-check" aria-pressed="true" title="완료된 일정도 함께 보여줘" data-tooltip="완료된 일정도 함께 보여줘"><span class="todo-filter-check-icon" aria-hidden="true"></span></button>
      </div>
    </div>
    <div id="todoBoard" class="todo-board"></div>
  </div>

  <div id="todoCalendarView" class="todo-view-panel" hidden>
    <div class="todo-calendar-toolbar">
      <div class="todo-calendar-nav">
        <button id="todoCalendarPrevBtn" type="button" class="btn btn-muted">이전</button>
        <button id="todoCalendarTodayBtn" type="button" class="btn btn-muted">오늘</button>
        <button id="todoCalendarNextBtn" type="button" class="btn btn-muted">다음</button>
      </div>
      <h3 id="todoCalendarTitle" class="todo-calendar-title"></h3>
      <div class="todo-calendar-mode-toggle">
        <button id="todoCalendarMonthBtn" type="button" class="todo-calendar-mode-btn active">월</button>
        <button id="todoCalendarWeekBtn" type="button" class="todo-calendar-mode-btn">주</button>
        <button id="todoCalendarDayBtn" type="button" class="todo-calendar-mode-btn">일</button>
      </div>
    </div>
    <div id="todoCalendarBody" class="todo-calendar-body"></div>
  </div>

  <div id="todoQuickAddBar" class="todo-quick-add-bar" aria-label="빠른 할 일 추가">
    <div class="todo-quick-add-inner">
      <input id="todoQuickAddInput" type="text" placeholder="할 일을 빠르게 추가해보세요. Enter로 바로 저장" />
      <button id="todoQuickAddBtn" type="button" class="btn btn-primary">추가</button>
    </div>
  </div>

  <div id="todoModal" class="todo-modal" aria-hidden="true">
    <div class="todo-modal-panel">
      <button id="todoModalCloseBtn" type="button" class="btn btn-muted todo-modal-close" aria-label="오늘 할 일 팝업 닫기">✕</button>
      <div id="todoModalKicker" class="bookmark-modal-kicker">할 일 관리</div>
      <h3 id="todoModalTitle" class="bookmark-modal-title">할 일 추가</h3>
      <div class="todo-form-grid">
        <label class="field">
          <span id="todoTitleLabel">할 일 이름</span>
          <input id="todoTitleInput" type="text" placeholder="예: 보고서 초안 정리" />
        </label>
        <label class="field">
          <span id="todoDateLabel">날짜/시간</span>
          <input id="todoDueInput" type="datetime-local" />
        </label>
        <label class="field">
          <span>반복 작업</span>
          <select id="todoRecurrenceSelect">
            <option value="none">반복 없음</option>
            <option value="daily">매일</option>
            <option value="every-other-day">격일</option>
            <option value="weekly">매주</option>
            <option value="biweekly">격주</option>
            <option value="monthly">매월</option>
          </select>
        </label>
        <label class="field">
          <span>미리 알림</span>
          <input id="todoReminderInput" type="datetime-local" />
        </label>
        <label class="field">
          <span>장소</span>
          <input id="todoLocationInput" type="text" placeholder="예: 5층 회의실 / 고객사 미팅룸" />
        </label>
        <label class="field field-span-2">
          <span>메모</span>
          <textarea id="todoNoteInput" rows="4" placeholder="세부 내용이나 체크 포인트를 적어둘 수 있어요."></textarea>
        </label>
      </div>
      <div class="todo-modal-options">
        <label class="todo-check">
          <input id="todoFavoriteInput" type="checkbox" />
          <span>중요 표시</span>
        </label>
        <label class="todo-check">
          <input id="todoCompletedInput" type="checkbox" />
          <span>완료 처리</span>
        </label>
      </div>
      <div id="todoModalError" class="bookmark-modal-error" aria-live="polite"></div>
      <div class="todo-modal-actions">
        <button id="todoDeleteBtn" type="button" class="btn btn-muted" hidden>삭제</button>
        <div class="todo-modal-actions-right">
          <button id="todoCompleteBtn" type="button" class="btn btn-primary" hidden>완료</button>
          <button id="todoCopyBtn" type="button" class="btn btn-muted" hidden>일정 복사</button>
          <button id="todoCancelBtn" type="button" class="btn btn-muted">취소</button>
          <button id="todoSaveBtn" type="button" class="btn btn-primary">저장</button>
        </div>
      </div>
    </div>
  </div>

  <div id="todoDeleteConfirmModal" class="todo-modal" aria-hidden="true">
    <div class="todo-modal-panel todo-delete-confirm-panel">
      <div class="bookmark-modal-kicker">삭제 확인</div>
      <h3 class="bookmark-modal-title">이 항목을 삭제할까요?</h3>
      <p id="todoDeleteConfirmText" class="todo-delete-confirm-text"></p>
      <div class="todo-modal-actions">
        <div></div>
        <div class="todo-modal-actions-right">
          <button id="todoDeleteConfirmCancelBtn" type="button" class="btn btn-muted">취소</button>
          <button id="todoDeleteConfirmOkBtn" type="button" class="btn btn-primary">삭제</button>
        </div>
      </div>
    </div>
  </div>
</section>
`;

function initTodoTab(root, { state, persist }) {
  const els = {
    listViewBtn: root.querySelector("#todoListViewBtn"),
    calendarViewBtn: root.querySelector("#todoCalendarViewBtn"),
    addBtn: root.querySelector("#todoAddBtn"),
    addEventBtn: root.querySelector("#todoAddEventBtn"),
    reminderBanner: root.querySelector("#todoReminderBanner"),
    alertBadge: root.querySelector("#todoAlertBadge"),
    listView: root.querySelector("#todoListView"),
    favoritesFilterBtn: root.querySelector("#todoFavoritesFilterBtn"),
    completedFilterBtn: root.querySelector("#todoCompletedFilterBtn"),
    calendarView: root.querySelector("#todoCalendarView"),
    board: root.querySelector("#todoBoard"),
    quickAddBar: root.querySelector("#todoQuickAddBar"),
    quickAddInput: root.querySelector("#todoQuickAddInput"),
    quickAddBtn: root.querySelector("#todoQuickAddBtn"),
    calendarTitle: root.querySelector("#todoCalendarTitle"),
    calendarBody: root.querySelector("#todoCalendarBody"),
    calendarPrevBtn: root.querySelector("#todoCalendarPrevBtn"),
    calendarTodayBtn: root.querySelector("#todoCalendarTodayBtn"),
    calendarNextBtn: root.querySelector("#todoCalendarNextBtn"),
    calendarMonthBtn: root.querySelector("#todoCalendarMonthBtn"),
    calendarWeekBtn: root.querySelector("#todoCalendarWeekBtn"),
    calendarDayBtn: root.querySelector("#todoCalendarDayBtn"),
    modal: root.querySelector("#todoModal"),
    modalCloseBtn: root.querySelector("#todoModalCloseBtn"),
    modalKicker: root.querySelector("#todoModalKicker"),
    modalTitle: root.querySelector("#todoModalTitle"),
    titleLabel: root.querySelector("#todoTitleLabel"),
    dateLabel: root.querySelector("#todoDateLabel"),
    titleInput: root.querySelector("#todoTitleInput"),
    dueInput: root.querySelector("#todoDueInput"),
    recurrenceSelect: root.querySelector("#todoRecurrenceSelect"),
    reminderInput: root.querySelector("#todoReminderInput"),
    locationInput: root.querySelector("#todoLocationInput"),
    noteInput: root.querySelector("#todoNoteInput"),
    favoriteInput: root.querySelector("#todoFavoriteInput"),
    completedInput: root.querySelector("#todoCompletedInput"),
    modalError: root.querySelector("#todoModalError"),
    saveBtn: root.querySelector("#todoSaveBtn"),
    cancelBtn: root.querySelector("#todoCancelBtn"),
    completeBtn: root.querySelector("#todoCompleteBtn"),
    deleteBtn: root.querySelector("#todoDeleteBtn"),
    copyBtn: root.querySelector("#todoCopyBtn"),
    deleteConfirmModal: root.querySelector("#todoDeleteConfirmModal"),
    deleteConfirmText: root.querySelector("#todoDeleteConfirmText"),
    deleteConfirmCancelBtn: root.querySelector("#todoDeleteConfirmCancelBtn"),
    deleteConfirmOkBtn: root.querySelector("#todoDeleteConfirmOkBtn")
  };

  const TODO_SECTIONS = [
    { key: "today", label: "오늘 할 일", description: "오늘 안에 끝내기" },
    { key: "next-week", label: "다음 주", description: "7일 안쪽 일정" },
    { key: "next-month", label: "다음 달", description: "30일 안쪽 일정" }
  ];
  let editingTodoId = "";
  let editingTodoType = "todo";
  let dragTodoId = "";
  let reminderTimer = null;
  let tabAlertTimer = null;
  let isTabActive = false;
  let pendingDeleteTodoId = "";
  let currentAlertTodoId = "";

  if (els.quickAddBar && els.quickAddBar.parentElement !== document.body) {
    document.body.appendChild(els.quickAddBar);
  }
  if (els.modal && els.modal.parentElement !== document.body) {
    document.body.appendChild(els.modal);
  }
  if (els.deleteConfirmModal && els.deleteConfirmModal.parentElement !== document.body) {
    document.body.appendChild(els.deleteConfirmModal);
  }

  function ensureTodoState() {
    state.todoItems = Array.isArray(state.todoItems) ? state.todoItems.filter((item) => item && typeof item === "object").map((item) => ({
      id: String(item.id || `todo-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`),
      type: item.type === "event" ? "event" : "todo",
      title: String(item.title || "").trim(),
      dueAt: String(item.dueAt || ""),
      recurrence: ["none", "daily", "every-other-day", "weekly", "biweekly", "monthly"].includes(item.recurrence) ? item.recurrence : "none",
      reminderAt: String(item.reminderAt || ""),
      location: String(item.location || ""),
      note: String(item.note || ""),
      favorite: Boolean(item.favorite),
      completed: Boolean(item.completed),
      createdAt: String(item.createdAt || new Date().toISOString()),
      updatedAt: String(item.updatedAt || new Date().toISOString()),
      remindedAt: String(item.remindedAt || "")
    })) : [];
    state.todoViewMode = state.todoViewMode === "calendar" ? "calendar" : "list";
    state.todoCalendarMode = ["month", "week", "day"].includes(state.todoCalendarMode) ? state.todoCalendarMode : "month";
    state.todoSelectedDate = /^\d{4}-\d{2}-\d{2}$/.test(state.todoSelectedDate || "") ? state.todoSelectedDate : getDateKey(getToday());
    state.todoShowFavoritesOnly = Boolean(state.todoShowFavoritesOnly);
    state.todoShowCompleted = state.todoShowCompleted !== false;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseLocalDateTime(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function toInputDateTime(value) {
    const date = parseLocalDateTime(value);
    if (!date) return "";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatTodoDue(value) {
    const date = parseLocalDateTime(value);
    if (!date) return "일시 미정";
    return `${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function getRecurrenceLabel(recurrence) {
    return recurrence === "daily" ? "매일"
      : recurrence === "every-other-day" ? "격일"
      : recurrence === "weekly" ? "매주"
      : recurrence === "biweekly" ? "격주"
      : recurrence === "monthly" ? "매월"
      : "";
  }

  function getTrashIconMarkup() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="todo-trash-icon">
        <path d="M7.75 7.5h8.5l-.6 9.35a1.7 1.7 0 0 1-1.7 1.6h-3.9a1.7 1.7 0 0 1-1.7-1.6L7.75 7.5Z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>
        <path d="M6.8 7.5h10.4M9.9 7.5V5.95c0-.55.45-1 1-1h2.2c.55 0 1 .45 1 1V7.5M10.35 10.2v5.1M13.65 10.2v5.1" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  function formatReminder(value) {
    const date = parseLocalDateTime(value);
    if (!date) return "";
    return `알림 ${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function getCalendarAnchorDate() {
    return parseDateKey(state.todoSelectedDate || getDateKey(getToday()));
  }

  function setCalendarAnchorDate(date) {
    state.todoSelectedDate = getDateKey(date);
  }

  function sortTodos(items) {
    return [...items].sort((left, right) => {
      if (left.completed !== right.completed) return left.completed ? 1 : -1;
      if (left.favorite !== right.favorite) return left.favorite ? -1 : 1;
      const leftDue = parseLocalDateTime(left.dueAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const rightDue = parseLocalDateTime(right.dueAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      if (leftDue !== rightDue) return leftDue - rightDue;
      return left.createdAt.localeCompare(right.createdAt);
    });
  }

  function isInToday(date) {
    if (!date) return false;
    return getDateKey(date) === getDateKey(getToday());
  }

  function isWithinDays(date, days) {
    if (!date) return false;
    const start = getToday();
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    end.setHours(23, 59, 59, 999);
    return date > start && date <= end;
  }

  function getTodoSection(todo) {
    const due = parseLocalDateTime(todo.dueAt);
    if (!due) return "next-month";
    if (isInToday(due)) return "today";
    if (isWithinDays(due, 7)) return "next-week";
    if (isWithinDays(due, 30)) return "next-month";
    return "next-month";
  }

  function getSectionTodos(sectionKey) {
    const items = sortTodos(state.todoItems);
    return items.filter((item) => {
      if (getTodoSection(item) !== sectionKey) return false;
      if (state.todoShowFavoritesOnly && !item.favorite) return false;
      if (!state.todoShowCompleted && item.completed) return false;
      return true;
    });
  }

  function getOccurrenceDueAt(baseDate, targetDate) {
    const next = new Date(targetDate);
    next.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0);
    return toInputDateTime(next);
  }

  function matchesRecurringDate(item, targetDate) {
    const baseDate = parseLocalDateTime(item.dueAt);
    if (!baseDate) return false;
    const targetStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const baseStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    const diffDays = Math.floor((targetStart.getTime() - baseStart.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays < 0) return false;

    if (item.recurrence === "daily") return true;
    if (item.recurrence === "every-other-day") return diffDays % 2 === 0;
    if (item.recurrence === "weekly") return diffDays % 7 === 0;
    if (item.recurrence === "biweekly") return diffDays % 14 === 0;
    if (item.recurrence === "monthly") {
      return targetDate.getDate() === baseDate.getDate()
        && (
          targetDate.getFullYear() > baseDate.getFullYear()
          || (targetDate.getFullYear() === baseDate.getFullYear() && targetDate.getMonth() >= baseDate.getMonth())
        );
    }
    return false;
  }

  function getTodoAlertClass(todo) {
    if (todo.completed) return "";
    const due = parseLocalDateTime(todo.dueAt);
    if (!due) return "";
    const now = Date.now();
    const dueTime = due.getTime();
    if (dueTime < now) return " overdue";
    if (dueTime <= now + (3 * 60 * 60 * 1000)) return " imminent";
    return "";
  }

  function buildTodoRow(todo) {
    const recurrenceLabel = getRecurrenceLabel(todo.recurrence);
    const reminderLabel = formatReminder(todo.reminderAt);
    return `
      <article class="todo-item${todo.favorite ? " favorite" : ""}${todo.completed ? " completed" : ""}${getTodoAlertClass(todo)}" draggable="true" data-todo-id="${todo.id}">
        <label class="todo-item-check">
          <input type="checkbox" data-todo-complete="${todo.id}" ${todo.completed ? "checked" : ""} />
        </label>
        <button type="button" class="todo-favorite-btn${todo.favorite ? " active" : ""}" data-todo-favorite="${todo.id}" aria-label="중요 표시">★</button>
        <div class="todo-item-main" data-todo-edit="${todo.id}">
          <div class="todo-item-title-row">
            <strong class="todo-item-title">${todo.type === "event" ? `<span class="todo-type-badge">일정</span> ` : ""}${escapeHtml(todo.title)}</strong>
            <span class="todo-item-due">${escapeHtml(formatTodoDue(todo.dueAt))}</span>
          </div>
          <div class="todo-item-meta-row">
            <span class="todo-item-note">${escapeHtml(todo.location || todo.note || "메모 없음")}</span>
            <span class="todo-item-tags">${recurrenceLabel ? `<span class="todo-pill">${recurrenceLabel}</span>` : ""}${todo.location ? `<span class="todo-pill location">${escapeHtml(todo.location)}</span>` : ""}${reminderLabel ? `<span class="todo-pill reminder">${escapeHtml(reminderLabel)}</span>` : ""}</span>
          </div>
        </div>
        <div class="todo-item-row-actions">
          <button type="button" class="icon-btn todo-edit-btn" data-todo-edit="${todo.id}" aria-label="할 일 수정">✎</button>
          <button type="button" class="icon-btn todo-trash-btn" data-todo-trash="${todo.id}" aria-label="할 일 삭제">${getTrashIconMarkup()}</button>
        </div>
      </article>
    `;
  }

  function buildCalendarTodoCard(todo, compact = false) {
    return `
      <button
        type="button"
        class="todo-calendar-item${todo.completed ? " completed" : ""}${todo.favorite ? " favorite" : ""}${todo.type === "event" ? " event" : ""}${getTodoAlertClass(todo)}${compact ? " compact" : ""}"
        data-calendar-todo-id="${todo.id}"
        draggable="true"
        title="${escapeHtml(todo.title)}"
      >
        <span class="todo-calendar-item-title">${escapeHtml(todo.title)}</span>
      </button>
    `;
  }

  function getTrackerScheduleItems(dateKey) {
    const date = parseDateKey(dateKey);
    const entry = state.entries?.[dateKey] || {};
    const items = [];

    if (isHoliday(date, entry)) {
      items.push({
        id: `tracker-holiday-${dateKey}`,
        kind: "holiday",
        title: getHolidayLabel(date, entry) || "공휴일",
        dateKey
      });
    }

    if (entry.leaveType === "full" || entry.leaveType === "half" || entry.leaveType === "quarter") {
      const leaveTitle = entry.leaveType === "full" ? "휴가" : entry.leaveType === "half" ? "반차" : "반반차";
      items.push({
        id: `tracker-leave-${dateKey}`,
        kind: "leave",
        title: leaveTitle,
        dateKey
      });
    }

    if (entry.startTime || entry.endTime || entry.running || entry.liveStartTimestamp) {
      items.push({
        id: `tracker-work-${dateKey}`,
        kind: "work",
        title: entry.startTime || entry.endTime
          ? `근무 ${entry.startTime || "--:--"} ~ ${entry.endTime || (getDateKey(getToday()) === dateKey ? "진행중" : "--:--")}`
          : "근무 일정",
        dateKey
      });
    }

    return items;
  }

  function buildTrackerCalendarItem(item, compact = false) {
    return `
      <button
        type="button"
        class="todo-calendar-item todo-calendar-item-sync ${item.kind}${compact ? " compact" : ""}"
        data-tracker-date="${item.dateKey}"
        title="${escapeHtml(item.title)}"
      >
        <span class="todo-calendar-item-title">${escapeHtml(item.title)}</span>
      </button>
    `;
  }

  function openTrackerDate(dateKey) {
    const date = parseDateKey(dateKey);
    state.calendarYear = date.getFullYear();
    state.calendarMonth = date.getMonth();
    state.activeTab = "tracker";
    persist();
    document.querySelector('.tab-btn[data-tab="tracker"]')?.click();
  }

  function moveTodoToDate(todoId, dateKey) {
    const targetDate = parseDateKey(dateKey);
    state.todoItems = state.todoItems.map((item) => {
      if (item.id !== todoId) return item;
      const currentDue = parseLocalDateTime(item.dueAt) || new Date();
      const nextDue = new Date(targetDate);
      nextDue.setHours(currentDue.getHours(), currentDue.getMinutes(), 0, 0);
      return {
        ...item,
        dueAt: toInputDateTime(nextDue),
        updatedAt: new Date().toISOString()
      };
    });
    state.todoSelectedDate = dateKey;
    persist();
    render();
  }

  function applySectionDueDate(todo, sectionKey) {
    const base = parseLocalDateTime(todo.dueAt) || new Date();
    const next = new Date(base);
    if (sectionKey === "today") {
      const today = getToday();
      next.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
      if (!todo.dueAt) next.setHours(18, 0, 0, 0);
    }
    if (sectionKey === "next-week") {
      const today = getToday();
      today.setDate(today.getDate() + 7);
      next.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
      if (!todo.dueAt) next.setHours(18, 0, 0, 0);
    }
    if (sectionKey === "next-month") {
      const today = getToday();
      today.setMonth(today.getMonth() + 1);
      next.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
      if (!todo.dueAt) next.setHours(18, 0, 0, 0);
    }
    return { ...todo, dueAt: toInputDateTime(next), updatedAt: new Date().toISOString() };
  }

  function buildNextRecurringTodo(todo) {
    const due = parseLocalDateTime(todo.dueAt);
    if (!due || todo.recurrence === "none") return null;
    const nextDue = new Date(due);
    if (todo.recurrence === "daily") nextDue.setDate(nextDue.getDate() + 1);
    if (todo.recurrence === "every-other-day") nextDue.setDate(nextDue.getDate() + 2);
    if (todo.recurrence === "weekly") nextDue.setDate(nextDue.getDate() + 7);
    if (todo.recurrence === "biweekly") nextDue.setDate(nextDue.getDate() + 14);
    if (todo.recurrence === "monthly") nextDue.setMonth(nextDue.getMonth() + 1);
    const reminder = parseLocalDateTime(todo.reminderAt);
    const nextReminder = reminder ? new Date(reminder) : null;
    if (nextReminder) {
      if (todo.recurrence === "daily") nextReminder.setDate(nextReminder.getDate() + 1);
      if (todo.recurrence === "every-other-day") nextReminder.setDate(nextReminder.getDate() + 2);
      if (todo.recurrence === "weekly") nextReminder.setDate(nextReminder.getDate() + 7);
      if (todo.recurrence === "biweekly") nextReminder.setDate(nextReminder.getDate() + 14);
      if (todo.recurrence === "monthly") nextReminder.setMonth(nextReminder.getMonth() + 1);
    }
    return {
      ...todo,
      id: `todo-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      dueAt: toInputDateTime(nextDue),
      reminderAt: nextReminder ? toInputDateTime(nextReminder) : "",
      completed: false,
      remindedAt: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function toggleComplete(todoId, completed) {
    const target = state.todoItems.find((item) => item.id === todoId);
    if (!target) return;
    const shouldGenerateNext = completed && !target.completed && target.recurrence !== "none";
    state.todoItems = state.todoItems.map((item) => item.id === todoId ? { ...item, completed, updatedAt: new Date().toISOString() } : item);
    if (shouldGenerateNext) {
      const next = buildNextRecurringTodo(target);
      if (next) state.todoItems = [...state.todoItems, next];
    }
    persist();
    render();
  }

  function toggleFavorite(todoId) {
    state.todoItems = state.todoItems.map((item) => item.id === todoId ? { ...item, favorite: !item.favorite, updatedAt: new Date().toISOString() } : item);
    persist();
    render();
  }

  function openModal(todoId = "") {
    ensureTodoState();
    editingTodoId = todoId;
    const todo = state.todoItems.find((item) => item.id === todoId);
    const baseDate = state.todoViewMode === "calendar" ? getCalendarAnchorDate() : getToday();
    const defaultDue = toInputDateTime(new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 18, 0, 0, 0));
    editingTodoType = todo?.type || editingTodoType || "todo";
    const isEvent = editingTodoType === "event";
    els.modalKicker.textContent = isEvent ? "일정 관리" : "할 일 관리";
    els.modalTitle.textContent = todo ? (isEvent ? "일정 수정" : "할 일 수정") : (isEvent ? "일정 추가" : "할 일 추가");
    els.titleLabel.textContent = isEvent ? "일정 이름" : "할 일 이름";
    els.dateLabel.textContent = "날짜/시간";
    els.titleInput.value = todo?.title || "";
    els.dueInput.value = todo?.dueAt || defaultDue;
    els.recurrenceSelect.value = todo?.recurrence || "none";
    els.reminderInput.value = todo?.reminderAt || "";
    els.locationInput.value = todo?.location || "";
    els.noteInput.value = todo?.note || "";
    els.favoriteInput.checked = Boolean(todo?.favorite);
    els.completedInput.checked = Boolean(todo?.completed);
    els.modalError.textContent = "";
    els.deleteBtn.hidden = !todo;
    els.completeBtn.hidden = !(todo && !todo.completed);
    els.copyBtn.hidden = !(todo && isEvent);
    els.modal.classList.add("open");
    els.modal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => els.titleInput.focus());
  }

  function closeModal() {
    editingTodoId = "";
    editingTodoType = "todo";
    els.modal.classList.remove("open");
    els.modal.setAttribute("aria-hidden", "true");
    els.modalError.textContent = "";
  }

  function openDeleteConfirm(todoId) {
    const todo = state.todoItems.find((item) => item.id === todoId);
    if (!todo) return;
    pendingDeleteTodoId = todoId;
    els.deleteConfirmText.textContent = `"${todo.title}" 항목을 삭제합니다.`;
    els.deleteConfirmModal.classList.add("open");
    els.deleteConfirmModal.setAttribute("aria-hidden", "false");
  }

  function closeDeleteConfirm() {
    pendingDeleteTodoId = "";
    els.deleteConfirmModal.classList.remove("open");
    els.deleteConfirmModal.setAttribute("aria-hidden", "true");
  }

  function saveTodo() {
    const title = els.titleInput.value.trim();
    const dueAt = els.dueInput.value;
    if (!title) {
      els.modalError.textContent = editingTodoType === "event" ? "일정 이름을 입력해 주세요." : "할 일 이름을 입력해 주세요.";
      return;
    }
    if (!dueAt) {
      els.modalError.textContent = "날짜와 시간을 입력해 주세요.";
      return;
    }
    const nextTodo = {
      id: editingTodoId || `todo-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      type: editingTodoType,
      title,
      dueAt,
      recurrence: els.recurrenceSelect.value,
      reminderAt: els.reminderInput.value,
      location: els.locationInput.value.trim(),
      note: els.noteInput.value.trim(),
      favorite: els.favoriteInput.checked,
      completed: els.completedInput.checked,
      createdAt: editingTodoId ? (state.todoItems.find((item) => item.id === editingTodoId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      remindedAt: editingTodoId ? (state.todoItems.find((item) => item.id === editingTodoId)?.remindedAt || "") : ""
    };
    if (editingTodoId) {
      state.todoItems = state.todoItems.map((item) => item.id === editingTodoId ? nextTodo : item);
    } else {
      state.todoItems = [...state.todoItems, nextTodo];
    }
    persist();
    closeModal();
    render();
  }

  function copySchedule() {
    if (!editingTodoId) return;
    const source = state.todoItems.find((item) => item.id === editingTodoId);
    if (!source) return;
    state.todoItems = [...state.todoItems, {
      ...source,
      id: `todo-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      title: `${source.title} 복사본`,
      completed: false,
      remindedAt: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }];
    persist();
    closeModal();
    render();
  }

  function getQuickAddDueAt() {
    const now = new Date();
    const baseDate = state.todoViewMode === "calendar" ? getCalendarAnchorDate() : getToday();
    const due = new Date(baseDate);
    due.setHours(18, 0, 0, 0);
    if (due < now) {
      due.setTime(now.getTime());
      due.setMinutes(Math.ceil(now.getMinutes() / 10) * 10, 0, 0);
    }
    return toInputDateTime(due);
  }

  function saveQuickTodo() {
    const title = els.quickAddInput.value.trim();
    if (!title) return;
    state.todoItems = [...state.todoItems, {
      id: `todo-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      type: "todo",
      title,
      dueAt: getQuickAddDueAt(),
      recurrence: "none",
      reminderAt: "",
      location: "",
      note: "",
      favorite: false,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      remindedAt: ""
    }];
    els.quickAddInput.value = "";
    persist();
    render();
  }

  function deleteTodo() {
    if (!editingTodoId) return;
    openDeleteConfirm(editingTodoId);
  }

  function completeFromModal() {
    if (!editingTodoId) return;
    toggleComplete(editingTodoId, true);
    closeModal();
  }

  function confirmDeleteTodo() {
    if (!pendingDeleteTodoId) return;
    state.todoItems = state.todoItems.filter((item) => item.id !== pendingDeleteTodoId);
    persist();
    if (editingTodoId === pendingDeleteTodoId) {
      closeModal();
    }
    closeDeleteConfirm();
    render();
  }

  function renderBoard() {
    els.board.innerHTML = `
      ${TODO_SECTIONS.map((section) => {
        const items = getSectionTodos(section.key);
        return `
          <section class="todo-section todo-section-focused" data-todo-drop-section="${section.key}">
            <div class="todo-section-header">
              <div>
                <h3>${section.label}</h3>
                <p>${section.description}</p>
              </div>
              <span class="todo-section-count">${items.length}</span>
            </div>
            <div class="todo-section-list">
              ${items.length ? items.map(buildTodoRow).join("") : `<div class="todo-empty">아직 할 일이 없어요.</div>`}
            </div>
          </section>
        `;
      }).join("")}
    `;

    els.board.querySelectorAll("[data-todo-edit]").forEach((button) => {
      button.addEventListener("click", () => openModal(button.dataset.todoEdit));
    });
    els.board.querySelectorAll("[data-todo-favorite]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleFavorite(button.dataset.todoFavorite);
      });
    });
    els.board.querySelectorAll("[data-todo-trash]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openDeleteConfirm(button.dataset.todoTrash);
      });
    });
    els.board.querySelectorAll("[data-todo-complete]").forEach((input) => {
      input.addEventListener("change", () => toggleComplete(input.dataset.todoComplete, input.checked));
    });
    els.board.querySelectorAll("[data-todo-id]").forEach((item) => {
      item.addEventListener("dragstart", () => {
        dragTodoId = item.dataset.todoId;
        item.classList.add("dragging");
      });
      item.addEventListener("dragend", () => {
        dragTodoId = "";
        item.classList.remove("dragging");
        els.board.querySelectorAll(".todo-section.drop-target").forEach((section) => section.classList.remove("drop-target"));
      });
    });
    els.board.querySelectorAll("[data-todo-drop-section]").forEach((section) => {
      section.addEventListener("dragover", (event) => {
        event.preventDefault();
      });
      section.addEventListener("dragenter", (event) => {
        event.preventDefault();
        section.classList.add("drop-target");
      });
      section.addEventListener("dragleave", (event) => {
        if (!section.contains(event.relatedTarget)) {
          section.classList.remove("drop-target");
        }
      });
      section.addEventListener("drop", (event) => {
        event.preventDefault();
        section.classList.remove("drop-target");
        if (!dragTodoId) return;
        state.todoItems = state.todoItems.map((item) => item.id === dragTodoId ? applySectionDueDate(item, section.dataset.todoDropSection) : item);
        persist();
        render();
      });
    });
  }

  function getTodosForDateKey(dateKey) {
    const targetDate = parseDateKey(dateKey);
    return sortTodos(
      state.todoItems.flatMap((item) => {
        const due = parseLocalDateTime(item.dueAt);
        if (!due) return [];

        if (getDateKey(due) === dateKey) {
          return [item];
        }

        if (item.completed) {
          return [];
        }

        if (item.recurrence === "none" || !matchesRecurringDate(item, targetDate)) {
          return [];
        }

        return [{
          ...item,
          dueAt: getOccurrenceDueAt(due, targetDate),
          completed: false,
          isRecurringPreview: true
        }];
      })
    );
  }

  function renderAgenda(dateKey, titleText = "") {
    const items = getTodosForDateKey(dateKey);
    return `
      <div class="todo-agenda">
        <div class="todo-agenda-title">${titleText || `${dateKey} 일정`}</div>
        ${items.length
          ? items.map((item) => `
            <button type="button" class="todo-agenda-item${item.completed ? " completed" : ""}" data-todo-edit="${item.id}">
              <span class="todo-agenda-item-time">${escapeHtml(formatTodoDue(item.dueAt))}</span>
              <span class="todo-agenda-item-title">${escapeHtml(item.title)}</span>
            </button>
          `).join("")
          : `<div class="todo-empty">선택한 날짜 일정이 없어요.</div>`}
      </div>
    `;
  }

  function getVisibleTimelineDateKeys(anchorDate) {
    if (state.todoCalendarMode === "day") {
      return [getDateKey(anchorDate)];
    }
    if (state.todoCalendarMode === "week") {
      const weekStart = getWeekStart(anchorDate);
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        return getDateKey(date);
      });
    }
    const year = anchorDate.getFullYear();
    const month = anchorDate.getMonth();
    const lastDate = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDate }, (_, index) => getDateKey(new Date(year, month, index + 1)));
  }

  function formatTimelineDate(dateKey) {
    const date = parseDateKey(dateKey);
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${getWeekdayLabel(date)})`;
  }

  function buildTimelineItem(todo) {
    return `
      <button
        type="button"
        class="todo-timeline-item${todo.completed ? " completed" : ""}${todo.favorite ? " favorite" : ""}${todo.type === "event" ? " event" : ""}${getTodoAlertClass(todo)}"
        data-todo-edit="${todo.id}"
        data-calendar-todo-id="${todo.id}"
        draggable="true"
      >
        <span class="todo-timeline-item-time">${escapeHtml(formatTodoDue(todo.dueAt))}</span>
        <span class="todo-timeline-item-main">
          ${todo.favorite ? `<span class="todo-important-star" aria-hidden="true">★</span>` : ""}
          ${todo.type === "event" ? `<span class="todo-type-badge timeline">일정</span>` : ""}
          <span class="todo-timeline-item-title">${escapeHtml(todo.title)}</span>
        </span>
      </button>
    `;
  }

  function buildTrackerTimelineItem(item) {
    return `
      <button type="button" class="todo-timeline-item sync ${item.kind}" data-tracker-date="${item.dateKey}">
        <span class="todo-timeline-item-time">월루생활</span>
        <span class="todo-timeline-item-main">
          <span class="todo-timeline-item-title">${escapeHtml(item.title)}</span>
        </span>
      </button>
    `;
  }

  function renderCalendarTimeline(anchorDate) {
    const groups = getVisibleTimelineDateKeys(anchorDate)
      .map((dateKey) => ({
        dateKey,
        items: getTodosForDateKey(dateKey)
      }))
      .filter((group) => group.items.length);

    return `
      <div class="todo-timeline">
        <div class="todo-timeline-header">날짜별 일정</div>
        ${groups.length
          ? groups.map((group) => `
            <section class="todo-timeline-group" data-todo-drop-date="${group.dateKey}">
              <div class="todo-timeline-date">${formatTimelineDate(group.dateKey)}</div>
              <div class="todo-timeline-list">
                ${[
                  ...getTrackerScheduleItems(group.dateKey).map((item) => buildTrackerTimelineItem(item)),
                  ...group.items.map((item) => buildTimelineItem(item))
                ].join("")}
              </div>
            </section>
          `).join("")
          : `<div class="todo-empty">보이는 기간 안에 등록된 일정이 없어요.</div>`}
      </div>
    `;
  }

  function renderMonthCalendar(anchorDate) {
    const year = anchorDate.getFullYear();
    const month = anchorDate.getMonth();
    els.calendarTitle.textContent = `${year}년 ${month + 1}월`;
    const monthStart = new Date(year, month, 1);
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());
    const cells = [];
    for (let index = 0; index < 42; index += 1) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const dateKey = getDateKey(date);
      const items = getTodosForDateKey(dateKey);
      const trackerItems = getTrackerScheduleItems(dateKey);
      const mergedCount = items.length + trackerItems.length;
      cells.push(`
        <section class="todo-calendar-cell${date.getMonth() !== month ? " is-other" : ""}${dateKey === state.todoSelectedDate ? " active" : ""}${date.getDay() === 0 ? " sunday" : ""}${date.getDay() === 6 ? " saturday" : ""}" data-todo-drop-date="${dateKey}" data-todo-date="${dateKey}">
          <button type="button" class="todo-calendar-date-btn" data-todo-date="${dateKey}">
            <span class="todo-calendar-date">${date.getDate()}</span>
            <span class="todo-calendar-count">${mergedCount ? `${mergedCount}개` : ""}</span>
          </button>
          <div class="todo-calendar-items">
            ${[...trackerItems.map((item) => buildTrackerCalendarItem(item, true)), ...items.map((item) => buildCalendarTodoCard(item, true))].length
              ? [...trackerItems.map((item) => buildTrackerCalendarItem(item, true)), ...items.map((item) => buildCalendarTodoCard(item, true))].slice(0, 3).join("")
              : `<div class="todo-calendar-empty-slot"></div>`}
            ${mergedCount > 3 ? `<div class="todo-calendar-more">+${mergedCount - 3}</div>` : ""}
          </div>
        </section>
      `);
    }
    els.calendarBody.innerHTML = `
      <div class="todo-calendar-grid todo-calendar-grid-month">
        <div class="todo-calendar-weekdays">${["일", "월", "화", "수", "목", "금", "토"].map((label) => `<span>${label}</span>`).join("")}</div>
        <div class="todo-calendar-cells">${cells.join("")}</div>
      </div>
      ${renderCalendarTimeline(anchorDate)}
    `;
  }

  function getWeekStart(date) {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  function renderWeekCalendar(anchorDate) {
    const weekStart = getWeekStart(anchorDate);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateKey = getDateKey(date);
      const items = getTodosForDateKey(dateKey);
      const trackerItems = getTrackerScheduleItems(dateKey);
      return `
        <section class="todo-week-column${date.getDay() === 0 ? " sunday" : ""}${date.getDay() === 6 ? " saturday" : ""}" data-todo-drop-date="${dateKey}">
          <button type="button" class="todo-week-heading${dateKey === state.todoSelectedDate ? " active" : ""}" data-todo-date="${dateKey}">
            <span>${date.getMonth() + 1}/${date.getDate()}</span>
            <strong>${getWeekdayLabel(date)}</strong>
          </button>
          <div class="todo-week-list">
            ${[...trackerItems.map((item) => buildTrackerCalendarItem(item)), ...items.map((item) => buildCalendarTodoCard(item))].length
              ? [...trackerItems.map((item) => buildTrackerCalendarItem(item)), ...items.map((item) => buildCalendarTodoCard(item))].join("")
              : `<div class="todo-empty small">없음</div>`}
          </div>
        </section>
      `;
    });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    els.calendarTitle.textContent = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
    els.calendarBody.innerHTML = `
      <div class="todo-week-grid">${days.join("")}</div>
      ${renderCalendarTimeline(anchorDate)}
    `;
  }

  function renderDayCalendar(anchorDate) {
    const dateKey = getDateKey(anchorDate);
    const weekday = getWeekdayLabel(anchorDate);
    const weekdayClass = anchorDate.getDay() === 0 || anchorDate.getDay() === 6 ? " weekend" : "";
    els.calendarTitle.innerHTML = `${anchorDate.getFullYear()}년 ${anchorDate.getMonth() + 1}월 ${anchorDate.getDate()}일 <span class="todo-calendar-title-weekday${weekdayClass}">(${weekday})</span>`;
    els.calendarBody.innerHTML = `
      <section class="todo-day-board" data-todo-drop-date="${dateKey}">
        ${renderAgenda(dateKey, `${getWeekdayLabel(anchorDate)}요일 일정`)}
      </section>
      ${renderCalendarTimeline(anchorDate)}
    `;
  }

  function renderCalendar() {
    const anchorDate = getCalendarAnchorDate();
    if (state.todoCalendarMode === "month") renderMonthCalendar(anchorDate);
    if (state.todoCalendarMode === "week") renderWeekCalendar(anchorDate);
    if (state.todoCalendarMode === "day") renderDayCalendar(anchorDate);
    els.calendarBody.querySelectorAll("[data-todo-date]").forEach((button) => {
      button.addEventListener("click", () => {
        state.todoSelectedDate = button.dataset.todoDate;
        persist();
        render();
      });
    });
    els.calendarBody.querySelectorAll("[data-todo-edit], [data-calendar-todo-id]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openModal(button.dataset.todoEdit || button.dataset.calendarTodoId);
      });
    });
    els.calendarBody.querySelectorAll("[data-tracker-date]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openTrackerDate(button.dataset.trackerDate);
      });
    });
    els.calendarBody.querySelectorAll("[data-calendar-todo-id]").forEach((item) => {
      item.addEventListener("dragstart", () => {
        dragTodoId = item.dataset.calendarTodoId;
        item.classList.add("dragging");
      });
      item.addEventListener("dragend", () => {
        dragTodoId = "";
        item.classList.remove("dragging");
        els.calendarBody.querySelectorAll(".todo-drop-target").forEach((zone) => zone.classList.remove("todo-drop-target"));
      });
    });
    els.calendarBody.querySelectorAll("[data-todo-drop-date]").forEach((zone) => {
      zone.addEventListener("dragover", (event) => {
        event.preventDefault();
      });
      zone.addEventListener("dragenter", (event) => {
        event.preventDefault();
        zone.classList.add("todo-drop-target");
      });
      zone.addEventListener("dragleave", (event) => {
        if (!zone.contains(event.relatedTarget)) {
          zone.classList.remove("todo-drop-target");
        }
      });
      zone.addEventListener("drop", (event) => {
        event.preventDefault();
        zone.classList.remove("todo-drop-target");
        if (!dragTodoId) return;
        moveTodoToDate(dragTodoId, zone.dataset.todoDropDate);
      });
    });
  }

  function renderReminderBanner() {
    const now = new Date();
    const dueItems = state.todoItems.filter((item) => {
      const reminder = parseLocalDateTime(item.reminderAt);
      return reminder && !item.completed && reminder <= now;
    });
    if (!dueItems.length) {
      els.reminderBanner.hidden = true;
      els.reminderBanner.textContent = "";
      return;
    }
    els.reminderBanner.hidden = false;
    els.reminderBanner.textContent = `미리 알림: ${dueItems.slice(0, 2).map((item) => item.title).join(", ")}${dueItems.length > 2 ? ` 외 ${dueItems.length - 2}개` : ""}`;
  }

  function getTodoAlertState() {
    const now = Date.now();
    const threshold = now + (3 * 60 * 60 * 1000);
    const pendingItems = state.todoItems
      .filter((item) => !item.completed)
      .map((item) => ({ item, due: parseLocalDateTime(item.dueAt) }))
      .filter((entry) => entry.due);

    const overdue = pendingItems
      .filter((entry) => entry.due.getTime() < now)
      .sort((left, right) => right.due.getTime() - left.due.getTime())[0];
    if (overdue) {
      return {
        tone: "overdue",
        text: `${overdue.item.title} 종료 시간 초과!!`,
        todoId: overdue.item.id
      };
    }

    const imminent = pendingItems
      .filter((entry) => {
        const dueTime = entry.due.getTime();
        return dueTime >= now && dueTime <= threshold;
      })
      .sort((left, right) => left.due.getTime() - right.due.getTime())[0];
    if (imminent) {
      return {
        tone: "imminent",
        text: `${imminent.item.title} 종료 임박!`,
        todoId: imminent.item.id
      };
    }

    return { tone: "", text: "", todoId: "" };
  }

  function syncElapsedEvents() {
    const now = Date.now();
    const generatedItems = [];
    let changed = false;

    state.todoItems = state.todoItems.map((item) => {
      if (item.type !== "event" || item.completed) return item;
      const due = parseLocalDateTime(item.dueAt);
      if (!due || due.getTime() > now) return item;

      changed = true;
      if (item.recurrence !== "none") {
        const nextItem = buildNextRecurringTodo(item);
        if (nextItem) generatedItems.push(nextItem);
      }

      return {
        ...item,
        completed: true,
        updatedAt: new Date().toISOString()
      };
    });

    if (generatedItems.length) {
      state.todoItems = [...state.todoItems, ...generatedItems];
    }

    if (changed) {
      persist();
    }
  }

  function updateTodoTabAlert() {
    const alertState = getTodoAlertState();
    currentAlertTodoId = alertState.todoId || "";
    setTabAlert("todo", "todo", alertState.tone === "imminent");
    setTabAlert("todo", "todo-overdue", alertState.tone === "overdue");
    if (els.alertBadge) {
      els.alertBadge.hidden = !alertState.text;
      els.alertBadge.textContent = alertState.text;
      els.alertBadge.dataset.tone = alertState.tone || "";
    }
    setGlobalTodoAlert(alertState.text, alertState.tone);
  }

  function render() {
    ensureTodoState();
    syncElapsedEvents();
    const isCalendar = state.todoViewMode === "calendar";
    els.listView.hidden = isCalendar;
    els.calendarView.hidden = !isCalendar;
    els.listViewBtn.classList.toggle("active", !isCalendar);
    els.calendarViewBtn.classList.toggle("active", isCalendar);
    els.favoritesFilterBtn.classList.toggle("active", state.todoShowFavoritesOnly);
    els.favoritesFilterBtn.setAttribute("aria-pressed", state.todoShowFavoritesOnly ? "true" : "false");
    els.completedFilterBtn.classList.toggle("active", state.todoShowCompleted);
    els.completedFilterBtn.setAttribute("aria-pressed", state.todoShowCompleted ? "true" : "false");
    els.calendarMonthBtn.classList.toggle("active", state.todoCalendarMode === "month");
    els.calendarWeekBtn.classList.toggle("active", state.todoCalendarMode === "week");
    els.calendarDayBtn.classList.toggle("active", state.todoCalendarMode === "day");
    els.calendarTitle.classList.toggle("wide", state.todoCalendarMode === "day");
    els.quickAddBar?.classList.toggle("active", isTabActive);
    renderReminderBanner();
    updateTodoTabAlert();
    renderBoard();
    renderCalendar();
  }

  function shiftCalendar(step) {
    const anchor = getCalendarAnchorDate();
    if (state.todoCalendarMode === "month") anchor.setMonth(anchor.getMonth() + step);
    if (state.todoCalendarMode === "week") anchor.setDate(anchor.getDate() + (7 * step));
    if (state.todoCalendarMode === "day") anchor.setDate(anchor.getDate() + step);
    setCalendarAnchorDate(anchor);
    persist();
    render();
  }

  function startReminderLoop() {
    if (reminderTimer) clearInterval(reminderTimer);
    reminderTimer = setInterval(() => {
      syncElapsedEvents();
      renderReminderBanner();
      updateTodoTabAlert();
      render();
    }, 30000);
  }

  els.addBtn.addEventListener("click", () => {
    editingTodoType = "todo";
    openModal();
  });
  els.addEventBtn.addEventListener("click", () => {
    editingTodoType = "event";
    openModal();
  });
  els.quickAddBtn.addEventListener("click", saveQuickTodo);
  els.quickAddInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveQuickTodo();
    }
  });
  els.listViewBtn.addEventListener("click", () => {
    state.todoViewMode = "list";
    persist();
    render();
  });
  els.favoritesFilterBtn.addEventListener("click", () => {
    state.todoShowFavoritesOnly = !state.todoShowFavoritesOnly;
    persist();
    render();
  });
  els.completedFilterBtn.addEventListener("click", () => {
    state.todoShowCompleted = !state.todoShowCompleted;
    persist();
    render();
  });
  els.calendarViewBtn.addEventListener("click", () => {
    state.todoViewMode = "calendar";
    persist();
    render();
  });
  els.calendarMonthBtn.addEventListener("click", () => {
    state.todoCalendarMode = "month";
    persist();
    render();
  });
  els.calendarWeekBtn.addEventListener("click", () => {
    state.todoCalendarMode = "week";
    persist();
    render();
  });
  els.calendarDayBtn.addEventListener("click", () => {
    state.todoCalendarMode = "day";
    persist();
    render();
  });
  els.calendarPrevBtn.addEventListener("click", () => shiftCalendar(-1));
  els.calendarNextBtn.addEventListener("click", () => shiftCalendar(1));
  els.calendarTodayBtn.addEventListener("click", () => {
    setCalendarAnchorDate(getToday());
    persist();
    render();
  });
  els.modalCloseBtn.addEventListener("click", closeModal);
  els.cancelBtn.addEventListener("click", closeModal);
  els.saveBtn.addEventListener("click", saveTodo);
  els.completeBtn.addEventListener("click", completeFromModal);
  els.copyBtn.addEventListener("click", copySchedule);
  els.deleteBtn.addEventListener("click", deleteTodo);
  els.deleteConfirmCancelBtn.addEventListener("click", closeDeleteConfirm);
  els.deleteConfirmOkBtn.addEventListener("click", confirmDeleteTodo);
  els.deleteConfirmModal.addEventListener("click", (event) => {
    if (event.target === els.deleteConfirmModal) closeDeleteConfirm();
  });
  els.modal.addEventListener("click", (event) => {
    if (event.target === els.modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.deleteConfirmModal.classList.contains("open")) {
      closeDeleteConfirm();
      return;
    }
    if (event.key === "Escape" && els.modal.classList.contains("open")) {
      closeModal();
    }
  });

  ensureTodoState();
  render();
  startReminderLoop();
  tabAlertTimer = setInterval(updateTodoTabAlert, 30000);

  return {
    onTabChange(isActive) {
      isTabActive = isActive;
      if (!isActive) {
        closeModal();
      }
      render();
    },
    focusAlert() {
      if (currentAlertTodoId) {
        openModal(currentAlertTodoId);
      }
    },
    destroy() {
      if (tabAlertTimer) clearInterval(tabAlertTimer);
      if (reminderTimer) clearInterval(reminderTimer);
      setTabAlert("todo", "todo", false);
      setTabAlert("todo", "todo-overdue", false);
      setGlobalTodoAlert("", "");
    }
  };
}

// FILE: .\v1.4\app\lunch\view.js
const lunchTemplate = `
<section class="card lunch-card">
  <div class="lunch-top-layout">
    <div class="lunch-top-main">
      <div class="lunch-header">
        <h2>점메추</h2>
        <span id="lunchAlertBadge" class="lunch-alert-badge" hidden>점심시간 임박!!</span>
        <button id="lunchScheduleBtn" type="button" class="lunch-schedule-inline">
          <span class="lunch-schedule-inline-label">회사 점심시간</span>
          <strong id="lunchTimeSummary" class="lunch-schedule-inline-value">등록해주세요!</strong>
        </button>
      </div>
    </div>
    <div class="lunch-top-side">
      <div class="lunch-actions">
        <button id="lunchDrawBtn" class="btn btn-primary">오늘 메뉴 뽑기</button>
        <button id="lunchRefreshBtn" class="btn btn-muted">위치 새로고침</button>
        <button id="lunchLocateBtn" class="btn btn-primary">현재 위치로 불러오기</button>
      </div>
    </div>
  </div>
  <div class="lunch-category-row">
    <div class="lunch-category-stack">
      <div id="lunchCategoryBar" class="lunch-category-bar" role="tablist" aria-label="점심 카테고리"></div>
      <div id="lunchResultMeta" class="lunch-result-meta"></div>
    </div>
    <div class="lunch-search-controls">
      <div class="lunch-filter-tools">
        <div class="todo-filter-card lunch-filter-card">
          <div class="todo-filter-card-label">필터</div>
          <div class="lunch-list-filters">
            <button id="lunchFavoritesOnlyBtn" type="button" class="todo-filter-btn" aria-pressed="false" title="즐겨찾는 장소만 보여줘" data-tooltip="즐겨찾는 장소만 보여줘">★</button>
          </div>
        </div>
      </div>
      <div class="lunch-filter-row">
        <label class="field lunch-search-field">
          <span>결과 내 검색</span>
          <input id="lunchSearchInput" type="search" placeholder="식당명, 메뉴, 주소로 검색" />
        </label>
      </div>
      <button id="lunchAddPlaceBtn" class="btn btn-muted lunch-add-place-btn">식당 추가</button>
    </div>
  </div>
  <div id="lunchList" class="lunch-list"></div>
  <div id="lunchPagination" class="lunch-pagination"></div>

  <div id="lunchDrawModal" class="lunch-draw-modal" aria-hidden="true">
    <div class="lunch-draw-panel">
      <button id="lunchDrawCloseBtn" type="button" class="btn btn-muted lunch-draw-close" aria-label="점메추 뽑기 닫기">✕</button>
      <div class="bookmark-modal-kicker">오늘의 선택</div>
      <h3 class="lunch-draw-title">오늘 메뉴 뽑기</h3>
      <div class="lunch-draw-controls">
        <label class="lunch-draw-check">
          <input id="lunchDrawFavoritesOnlyInput" type="checkbox" />
          <span>즐겨찾는 장소만 뽑기</span>
        </label>
        <label class="field lunch-draw-category-field">
          <span>카테고리</span>
          <select id="lunchDrawCategorySelect"></select>
        </label>
      </div>
      <div id="lunchDrawError" class="bookmark-modal-error" aria-live="polite"></div>
      <div id="lunchDrawStage" class="lunch-draw-stage">
        <div class="lunch-draw-stage-label">랜덤 선택 중</div>
        <div id="lunchDrawPreview" class="lunch-draw-preview">
          <div class="lunch-draw-preview-name">식당 목록을 불러오면 뽑기를 시작할 수 있어요.</div>
          <div class="lunch-draw-preview-meta">현재 위치 식당 데이터가 필요해요.</div>
        </div>
      </div>
      <div id="lunchDrawResult" class="lunch-draw-result" hidden></div>
      <div class="button-row">
        <button id="lunchDrawStartBtn" type="button" class="btn btn-primary">뽑기 시작</button>
        <button id="lunchDrawMapBtn" type="button" class="btn btn-muted" hidden>지도보기</button>
      </div>
    </div>
  </div>

  <div id="lunchScheduleModal" class="lunch-draw-modal" aria-hidden="true">
    <div class="lunch-draw-panel lunch-schedule-panel">
      <button id="lunchScheduleCloseBtn" type="button" class="btn btn-muted lunch-draw-close" aria-label="회사 점심시간 설정 닫기">✕</button>
      <div class="bookmark-modal-kicker">회사 설정</div>
      <h3 class="lunch-draw-title">회사 점심시간 설정</h3>
      <div class="lunch-draw-controls lunch-schedule-controls">
        <label class="field">
          <span>회사 점심 시작</span>
          <input id="lunchScheduleStartInput" type="time" />
        </label>
        <label class="field">
          <span>회사 점심 종료</span>
          <input id="lunchScheduleEndInput" type="time" />
        </label>
      </div>
      <div id="lunchScheduleError" class="bookmark-modal-error" aria-live="polite"></div>
      <div class="button-row">
        <button id="lunchScheduleCancelBtn" type="button" class="btn btn-muted">취소</button>
        <button id="lunchScheduleSaveBtn" type="button" class="btn btn-primary">저장</button>
      </div>
    </div>
  </div>

  <div id="lunchPlaceModal" class="lunch-draw-modal" aria-hidden="true">
    <div class="lunch-draw-panel lunch-schedule-panel">
      <button id="lunchPlaceCloseBtn" type="button" class="btn btn-muted lunch-draw-close" aria-label="직접 추가 식당 설정 닫기">✕</button>
      <div class="bookmark-modal-kicker">직접 추가</div>
      <h3 class="lunch-draw-title">음식점 추가</h3>
      <div class="todo-form-grid">
        <label class="field">
          <span>식당 이름</span>
          <input id="lunchPlaceNameInput" type="text" placeholder="예: 우리끼리분식" />
        </label>
        <label class="field">
          <span>카테고리</span>
          <select id="lunchPlaceCategoryInput"></select>
        </label>
        <label class="field field-span-2">
          <span>주소</span>
          <input id="lunchPlaceAddressInput" type="text" placeholder="예: 서울시 강남구 ..." />
        </label>
        <label class="field">
          <span>지도 링크</span>
          <input id="lunchPlaceMapUrlInput" type="url" placeholder="https://..." />
        </label>
        <label class="field">
          <span>메모</span>
          <input id="lunchPlaceNoteInput" type="text" placeholder="예: 사내 추천, 숨은 맛집" />
        </label>
      </div>
      <div id="lunchPlaceError" class="bookmark-modal-error" aria-live="polite"></div>
      <div class="button-row">
        <button id="lunchPlaceDeleteBtn" type="button" class="btn btn-stop" hidden>삭제</button>
        <div class="button-row" style="margin-left:auto;">
        <button id="lunchPlaceCancelBtn" type="button" class="btn btn-muted">취소</button>
        <button id="lunchPlaceSaveBtn" type="button" class="btn btn-primary">저장</button>
        </div>
      </div>
    </div>
  </div>
</section>
`;


// FILE: .\v1.4\app\lunch\lunch.js
const PAGE_SIZE = 12;
const SEARCH_RADIUS_METERS = 1800;
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const CATEGORY_ALL = "전체";
const CATEGORY_KOREAN = "한식";
const CATEGORY_CHINESE = "중식";
const CATEGORY_JAPANESE = "일식";
const CATEGORY_WESTERN = "양식";
const CATEGORY_BUNSIK = "분식";
const CATEGORY_SALAD = "샐러드";
const CATEGORY_OTHER = "기타";

const cuisineMatchers = {
  [CATEGORY_KOREAN]: [/korean/i, /bibimbap/i, /bulgogi/i, /jjigae/i, /gukbap/i, /naengmyeon/i, /samgyeopsal/i],
  [CATEGORY_CHINESE]: [/chinese/i, /jajang/i, /jjamppong/i, /dim_sum/i, /mala/i],
  [CATEGORY_JAPANESE]: [/japanese/i, /sushi/i, /ramen/i, /udon/i, /soba/i, /tempura/i, /donburi/i, /tonkatsu/i],
  [CATEGORY_WESTERN]: [/italian/i, /pizza/i, /pasta/i, /burger/i, /steak/i, /western/i, /sandwich/i, /french/i, /mexican/i, /brunch/i],
  [CATEGORY_BUNSIK]: [/snack/i, /street_food/i, /kimbap/i, /tteokbokki/i, /mandu/i, /noodle/i],
  [CATEGORY_SALAD]: [/salad/i, /vegetarian/i, /vegan/i, /poke/i]
};

// Later option:
// Kakao Local category search can replace Overpass here if this project
// ever wants higher place coverage and the team is okay with API key usage/quota.
function initLunchTab(root, { state, persist }) {
  const els = {
    addPlaceBtn: root.querySelector("#lunchAddPlaceBtn"),
    drawBtn: root.querySelector("#lunchDrawBtn"),
    alertBadge: root.querySelector("#lunchAlertBadge"),
    locateBtn: root.querySelector("#lunchLocateBtn"),
    refreshBtn: root.querySelector("#lunchRefreshBtn"),
    favoritesOnlyBtn: root.querySelector("#lunchFavoritesOnlyBtn"),
    scheduleBtn: root.querySelector("#lunchScheduleBtn"),
    timeSummary: root.querySelector("#lunchTimeSummary"),
    searchInput: root.querySelector("#lunchSearchInput"),
    locationStatus: root.querySelector("#lunchLocationStatus"),
    categoryBar: root.querySelector("#lunchCategoryBar"),
    resultMeta: root.querySelector("#lunchResultMeta"),
    list: root.querySelector("#lunchList"),
    pagination: root.querySelector("#lunchPagination"),
    drawModal: root.querySelector("#lunchDrawModal"),
    drawCloseBtn: root.querySelector("#lunchDrawCloseBtn"),
    drawFavoritesOnlyInput: root.querySelector("#lunchDrawFavoritesOnlyInput"),
    drawCategorySelect: root.querySelector("#lunchDrawCategorySelect"),
    drawError: root.querySelector("#lunchDrawError"),
    drawPreview: root.querySelector("#lunchDrawPreview"),
    drawResult: root.querySelector("#lunchDrawResult"),
    drawStartBtn: root.querySelector("#lunchDrawStartBtn"),
    drawMapBtn: root.querySelector("#lunchDrawMapBtn"),
    scheduleModal: root.querySelector("#lunchScheduleModal"),
    scheduleCloseBtn: root.querySelector("#lunchScheduleCloseBtn"),
    scheduleCancelBtn: root.querySelector("#lunchScheduleCancelBtn"),
    scheduleSaveBtn: root.querySelector("#lunchScheduleSaveBtn"),
    scheduleStartInput: root.querySelector("#lunchScheduleStartInput"),
    scheduleEndInput: root.querySelector("#lunchScheduleEndInput"),
    scheduleError: root.querySelector("#lunchScheduleError"),
    placeModal: root.querySelector("#lunchPlaceModal"),
    placeCloseBtn: root.querySelector("#lunchPlaceCloseBtn"),
    placeCancelBtn: root.querySelector("#lunchPlaceCancelBtn"),
    placeSaveBtn: root.querySelector("#lunchPlaceSaveBtn"),
    placeDeleteBtn: root.querySelector("#lunchPlaceDeleteBtn"),
    placeNameInput: root.querySelector("#lunchPlaceNameInput"),
    placeCategoryInput: root.querySelector("#lunchPlaceCategoryInput"),
    placeAddressInput: root.querySelector("#lunchPlaceAddressInput"),
    placeMapUrlInput: root.querySelector("#lunchPlaceMapUrlInput"),
    placeNoteInput: root.querySelector("#lunchPlaceNoteInput"),
    placeError: root.querySelector("#lunchPlaceError")
  };

  let isFetching = false;
  let activePage = 1;
  let allPlaces = [];
  let didAutoLoad = false;
  let categoryBarInitialized = false;
  let isDrawing = false;
  let selectedDrawPlaceId = "";
  let tabAlertTimer = null;
  let editingCustomPlaceId = "";

  if (els.drawModal && els.drawModal.parentElement !== document.body) {
    document.body.appendChild(els.drawModal);
  }
  if (els.scheduleModal && els.scheduleModal.parentElement !== document.body) {
    document.body.appendChild(els.scheduleModal);
  }
  if (els.placeModal && els.placeModal.parentElement !== document.body) {
    document.body.appendChild(els.placeModal);
  }

  function getFavoriteIconMarkup(active) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="lunch-favorite-icon">
        <path
          d="M12 3.8l2.35 4.76a1.4 1.4 0 0 0 1.05.77l5.25.76-3.8 3.71a1.4 1.4 0 0 0-.4 1.23l.9 5.23-4.7-2.47a1.4 1.4 0 0 0-1.3 0l-4.7 2.47.9-5.23a1.4 1.4 0 0 0-.4-1.23l-3.8-3.71 5.25-.76a1.4 1.4 0 0 0 1.05-.77Z"
          ${active ? 'fill="currentColor" stroke="none"' : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"'}
        />
      </svg>
    `;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getRegisteredImageUrl(tags = {}) {
    const directImage = [
      tags.image,
      tags["image:0"],
      tags["contact:image"]
    ].find((value) => /^https?:\/\//i.test(String(value || "").trim()));
    if (directImage) return directImage;
    const wikimediaCommons = String(tags.wikimedia_commons || "").trim();
    if (wikimediaCommons) {
      const fileName = wikimediaCommons.replace(/^File:/i, "").replace(/ /g, "_");
      if (fileName) {
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
      }
    }
    return "";
  }

  function ensureLunchState() {
    state.lunchCategory = lunchCategories.includes(state.lunchCategory) ? state.lunchCategory : CATEGORY_KOREAN;
    state.lunchSearchQuery = state.lunchSearchQuery || "";
    state.lunchFavorites = Array.isArray(state.lunchFavorites) ? state.lunchFavorites : [];
    state.lunchFavoritesOnly = Boolean(state.lunchFavoritesOnly);
    state.lunchStartTime = /^\d{2}:\d{2}$/.test(state.lunchStartTime || "") ? state.lunchStartTime : "";
    state.lunchEndTime = /^\d{2}:\d{2}$/.test(state.lunchEndTime || "") ? state.lunchEndTime : "";
    state.lunchCachedPlaces = Array.isArray(state.lunchCachedPlaces) ? state.lunchCachedPlaces : [];
    state.lunchLastLocation = state.lunchLastLocation && typeof state.lunchLastLocation === "object" ? state.lunchLastLocation : null;
    state.lunchLastFetchAt = state.lunchLastFetchAt || "";
    state.lunchCustomPlaces = Array.isArray(state.lunchCustomPlaces) ? state.lunchCustomPlaces.map((item) => ({
      id: String(item?.id || `custom-${Date.now()}`),
      name: String(item?.name || "").trim(),
      category: lunchCategories.includes(item?.category) && item?.category !== CATEGORY_ALL ? item.category : CATEGORY_OTHER,
      address: String(item?.address || "").trim(),
      mapUrl: String(item?.mapUrl || "").trim(),
      note: String(item?.note || "").trim()
    })).filter((item) => item.name) : [];
  }

  function categoryToCuisine(category) {
    const map = {
      [CATEGORY_KOREAN]: "korean",
      [CATEGORY_CHINESE]: "chinese",
      [CATEGORY_JAPANESE]: "japanese",
      [CATEGORY_WESTERN]: "western",
      [CATEGORY_BUNSIK]: "street_food",
      [CATEGORY_SALAD]: "salad",
      [CATEGORY_OTHER]: "restaurant"
    };
    return map[category] || "restaurant";
  }

  function normalizeCustomPlace(place, index = 0) {
    return {
      id: place.id,
      lat: 0,
      lon: 0,
      custom: true,
      mapUrl: place.mapUrl || "",
      address: place.address || "주소 정보 없음",
      cuisineLabel: place.note || place.category,
      distanceMeters: 999999 + index,
      tags: {
        name: place.name,
        amenity: "restaurant",
        cuisine: categoryToCuisine(place.category)
      }
    };
  }

  function rebuildAllPlaces(basePlaces = state.lunchCachedPlaces) {
    allPlaces = [
      ...(Array.isArray(basePlaces) ? basePlaces : []),
      ...state.lunchCustomPlaces.map((place, index) => normalizeCustomPlace(place, index))
    ];
  }

  function updateCategoryIndicator() {
    const indicator = els.categoryBar.querySelector(".category-chip-indicator");
    const activeButton = els.categoryBar.querySelector(".category-chip.active");

    if (!indicator || !activeButton) return;

    indicator.style.width = `${activeButton.offsetWidth}px`;
    indicator.style.height = `${activeButton.offsetHeight}px`;
    indicator.style.transform = `translate(${activeButton.offsetLeft}px, ${activeButton.offsetTop}px)`;
  }

  function setStatus(text, tone = "default") {
    if (!els.locationStatus) return;
    els.locationStatus.textContent = text;
    els.locationStatus.dataset.tone = tone;
  }

  function normalizeCuisine(tags) {
    return `${tags.cuisine || ""};${tags["cuisine:ja"] || ""};${tags["cuisine:ko"] || ""}`.toLowerCase();
  }

  function matchesCategory(place, category) {
    if (category === CATEGORY_ALL) return true;

    const matchers = cuisineMatchers[category] || [];
    const cuisine = normalizeCuisine(place.tags);
    const amenity = String(place.tags.amenity || "").toLowerCase();

    if (category === CATEGORY_BUNSIK) {
      return amenity === "fast_food" || matchers.some((matcher) => matcher.test(cuisine));
    }

    if (category === CATEGORY_SALAD) {
      return matchers.some((matcher) => matcher.test(cuisine));
    }

    if (category === CATEGORY_OTHER) {
      const primaryCategories = [CATEGORY_KOREAN, CATEGORY_CHINESE, CATEGORY_JAPANESE, CATEGORY_WESTERN, CATEGORY_BUNSIK, CATEGORY_SALAD];
      return !primaryCategories.some((primaryCategory) => matchesCategory(place, primaryCategory));
    }

    return matchers.some((matcher) => matcher.test(cuisine));
  }

  function getPlaceCategoryLabel(place) {
    const primaryCategories = [CATEGORY_KOREAN, CATEGORY_CHINESE, CATEGORY_JAPANESE, CATEGORY_WESTERN, CATEGORY_BUNSIK, CATEGORY_SALAD];
    return primaryCategories.find((category) => matchesCategory(place, category)) || CATEGORY_OTHER;
  }

  function matchesSearch(place, query) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;

    const haystack = [
      place.tags.name,
      place.cuisineLabel,
      place.address,
      place.tags.cuisine,
      place.tags.amenity
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  }

  function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const earthRadius = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistance(distanceMeters) {
    return distanceMeters < 1000
      ? `도보 약 ${Math.max(1, Math.round(distanceMeters / 80))}분`
      : `${(distanceMeters / 1000).toFixed(1)}km`;
  }

  function formatUpdatedAt() {
    if (!state.lunchLastFetchAt) return "";
    const date = new Date(state.lunchLastFetchAt);
    if (Number.isNaN(date.getTime())) return "";
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function buildAddress(tags) {
    return [
      tags["addr:full"],
      [tags["addr:city"], tags["addr:suburb"], tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ")
    ].find(Boolean) || "주소 정보 없음";
  }

  function getOpenStreetMapLink(place) {
    if (place?.custom && place?.mapUrl) return place.mapUrl;
    return `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=18/${place.lat}/${place.lon}`;
  }

  function getPlaceById(placeId) {
    return allPlaces.find((place) => place.id === placeId) || null;
  }

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
  function mapElementToPlace(element) {
    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;
    if (lat == null || lon == null || !element.tags?.name) return null;

    return {
      id: `${element.type}-${element.id}`,
      lat,
      lon,
      tags: element.tags
    };
  }

  function dedupePlaces(places) {
    const deduped = new Map();

    places.forEach((place) => {
      const roundedLat = Number(place.lat).toFixed(5);
      const roundedLon = Number(place.lon).toFixed(5);
      const key = `${place.tags.name.trim().toLowerCase()}|${roundedLat}|${roundedLon}`;
      const existing = deduped.get(key);

      if (!existing || place.distanceMeters < existing.distanceMeters) {
        deduped.set(key, place);
      }
    });

    return Array.from(deduped.values());
  }

  function isFavorite(placeId) {
    ensureLunchState();
    return state.lunchFavorites.includes(placeId);
  }

  function toggleFavorite(placeId) {
    ensureLunchState();
    if (isFavorite(placeId)) {
      state.lunchFavorites = state.lunchFavorites.filter((id) => id !== placeId);
    } else {
      state.lunchFavorites = [...state.lunchFavorites, placeId];
    }
    persist();
    render();
  }

  async function fetchNearbyPlaces(lat, lon) {
    const query = `
[out:json][timeout:25];
(
  node(around:${SEARCH_RADIUS_METERS},${lat},${lon})["amenity"~"restaurant|fast_food|cafe|food_court"];
  way(around:${SEARCH_RADIUS_METERS},${lat},${lon})["amenity"~"restaurant|fast_food|cafe|food_court"];
  relation(around:${SEARCH_RADIUS_METERS},${lat},${lon})["amenity"~"restaurant|fast_food|cafe|food_court"];
);
out center tags;
    `.trim();

    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: query
    });

    if (!response.ok) {
      throw new Error(`overpass-${response.status}`);
    }

    const data = await response.json();

    return dedupePlaces(
      (data.elements || [])
        .map(mapElementToPlace)
        .filter(Boolean)
        .map((place) => ({
          ...place,
          distanceMeters: haversineDistance(lat, lon, place.lat, place.lon),
          address: buildAddress(place.tags),
          cuisineLabel: place.tags.cuisine || place.tags.amenity || "정보 없음"
        }))
        .sort((left, right) => left.distanceMeters - right.distanceMeters)
    );
  }

  function restoreCachedPlaces() {
    ensureLunchState();
    if (!state.lunchCachedPlaces.length && !state.lunchCustomPlaces.length) return false;

    rebuildAllPlaces(state.lunchCachedPlaces);
    setStatus(
      state.lunchLastLocation
        ? `저장된 식당 데이터를 먼저 표시하고 있어요. 마지막 업데이트 ${formatUpdatedAt() || "--:--"}`
        : state.lunchCustomPlaces.length ? "직접 추가한 식당과 저장된 식당 데이터를 표시하고 있어요." : "저장된 식당 데이터를 표시하고 있어요.",
      "default"
    );
    render();
    return true;
  }

  function rememberPlaces(lat, lon, places) {
    state.lunchLastLocation = { lat, lon };
    state.lunchLastFetchAt = new Date().toISOString();
    state.lunchCachedPlaces = places;
    persist();
    rebuildAllPlaces(places);
  }

  function getFilteredPlaces() {
    ensureLunchState();

    return allPlaces
      .filter((place) => {
        if (!matchesCategory(place, state.lunchCategory)) return false;
        if (state.lunchFavoritesOnly && !isFavorite(place.id)) return false;
        if (!matchesSearch(place, state.lunchSearchQuery)) return false;
        return true;
      })
      .sort((left, right) => {
        const leftFavorite = isFavorite(left.id) ? 1 : 0;
        const rightFavorite = isFavorite(right.id) ? 1 : 0;

        if (leftFavorite !== rightFavorite) {
          return rightFavorite - leftFavorite;
        }

        return left.distanceMeters - right.distanceMeters;
      });
  }

  function syncLunchScheduleUi() {
    const hasLunchSchedule = Boolean(state.lunchStartTime && state.lunchEndTime);

    if (els.timeSummary) {
      els.timeSummary.textContent = hasLunchSchedule ? `${state.lunchStartTime}~${state.lunchEndTime}` : "회사 점심시간을 등록해주세요!";
    }

    if (els.scheduleBtn) {
      els.scheduleBtn.classList.toggle("needs-input", !hasLunchSchedule);
    }

    if (els.scheduleStartInput && els.scheduleStartInput.value !== state.lunchStartTime) {
      els.scheduleStartInput.value = state.lunchStartTime;
    }
    if (els.scheduleEndInput && els.scheduleEndInput.value !== state.lunchEndTime) {
      els.scheduleEndInput.value = state.lunchEndTime;
    }
  }

  function getLunchAlertState() {
    ensureLunchState();
    if (!state.lunchStartTime || !state.lunchEndTime) return { active: false, imminent: false, text: "" };

    const startSeconds = timeToSeconds(state.lunchStartTime);
    const endSeconds = timeToSeconds(state.lunchEndTime);
    if (startSeconds == null || endSeconds == null) return { active: false, imminent: false, text: "" };

    const startMinutes = Math.floor(startSeconds / 60);
    const endMinutes = Math.floor(endSeconds / 60);
    if (endMinutes <= startMinutes) return { active: false, imminent: false, text: "" };

    const now = new Date();
    const currentMinutes = (now.getHours() * 60) + now.getMinutes();
    if (currentMinutes >= (startMinutes - 30) && currentMinutes < startMinutes) {
      return { active: true, imminent: true, text: "점심시간 임박!!" };
    }
    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      return { active: true, imminent: false, text: "점심시간" };
    }
    return { active: false, imminent: false, text: "" };
  }

  function updateLunchTabAlert() {
    const alertState = getLunchAlertState();
    setTabAlert("lunch", "lunch", alertState.active);
    setGlobalLunchAlert(alertState.active, alertState.text || "점심시간 임박!!");
    els.drawBtn?.classList.toggle("lunch-cta-alert", alertState.imminent);
    if (els.alertBadge) {
      els.alertBadge.hidden = !alertState.active;
      els.alertBadge.style.display = alertState.active ? "inline-flex" : "none";
      els.alertBadge.textContent = alertState.text || "점심시간 임박!!";
    }
  }

  function openScheduleModal() {
    ensureLunchState();
    syncLunchScheduleUi();
    if (els.scheduleError) els.scheduleError.textContent = "";
    els.scheduleModal?.classList.add("open");
    els.scheduleModal?.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => els.scheduleStartInput?.focus());
  }

  function closeScheduleModal() {
    els.scheduleModal?.classList.remove("open");
    els.scheduleModal?.setAttribute("aria-hidden", "true");
    if (els.scheduleError) els.scheduleError.textContent = "";
  }

  function syncPlaceCategoryOptions() {
    if (!els.placeCategoryInput) return;
    const options = lunchCategories
      .filter((category) => category !== CATEGORY_ALL)
      .map((category) => `<option value="${category}">${category}</option>`)
      .join("");
    if (els.placeCategoryInput.innerHTML !== options) {
      els.placeCategoryInput.innerHTML = options;
    }
  }

  function openPlaceModal(placeId = "") {
    ensureLunchState();
    syncPlaceCategoryOptions();
    editingCustomPlaceId = placeId;
    const place = state.lunchCustomPlaces.find((item) => item.id === placeId) || null;
    if (els.placeError) els.placeError.textContent = "";
    if (els.placeNameInput) els.placeNameInput.value = place?.name || "";
    if (els.placeCategoryInput) els.placeCategoryInput.value = place?.category || CATEGORY_KOREAN;
    if (els.placeAddressInput) els.placeAddressInput.value = place?.address || "";
    if (els.placeMapUrlInput) els.placeMapUrlInput.value = place?.mapUrl || "";
    if (els.placeNoteInput) els.placeNoteInput.value = place?.note || "";
    if (els.placeDeleteBtn) els.placeDeleteBtn.hidden = !place;
    els.placeModal?.classList.add("open");
    els.placeModal?.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => els.placeNameInput?.focus());
  }

  function closePlaceModal() {
    editingCustomPlaceId = "";
    els.placeModal?.classList.remove("open");
    els.placeModal?.setAttribute("aria-hidden", "true");
    if (els.placeError) els.placeError.textContent = "";
  }

  function saveCustomPlace() {
    const name = String(els.placeNameInput?.value || "").trim();
    const category = els.placeCategoryInput?.value || CATEGORY_KOREAN;
    const address = String(els.placeAddressInput?.value || "").trim();
    const mapUrl = normalizeBookmarkUrl(els.placeMapUrlInput?.value || "");
    const note = String(els.placeNoteInput?.value || "").trim();

    if (!name) {
      if (els.placeError) els.placeError.textContent = "식당 이름을 입력해 주세요.";
      return;
    }

    const nextPlace = {
      id: editingCustomPlaceId || `custom-place-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      name,
      category,
      address,
      mapUrl,
      note
    };

    if (editingCustomPlaceId) {
      state.lunchCustomPlaces = state.lunchCustomPlaces.map((item) => item.id === editingCustomPlaceId ? nextPlace : item);
    } else {
      state.lunchCustomPlaces = [...state.lunchCustomPlaces, nextPlace];
    }
    persist();
    rebuildAllPlaces(state.lunchCachedPlaces);
    render();
    closePlaceModal();
  }

  function deleteCustomPlace() {
    if (!editingCustomPlaceId) return;
    state.lunchCustomPlaces = state.lunchCustomPlaces.filter((item) => item.id !== editingCustomPlaceId);
    state.lunchFavorites = state.lunchFavorites.filter((id) => id !== editingCustomPlaceId);
    persist();
    rebuildAllPlaces(state.lunchCachedPlaces);
    render();
    closePlaceModal();
  }

  function saveSchedule() {
    const startValue = els.scheduleStartInput?.value || "";
    const endValue = els.scheduleEndInput?.value || "";

    if (!startValue || !endValue) {
      if (els.scheduleError) els.scheduleError.textContent = "회사 점심 시작과 종료 시간을 모두 입력해 주세요.";
      return;
    }

    if (timeToSeconds(endValue) <= timeToSeconds(startValue)) {
      if (els.scheduleError) els.scheduleError.textContent = "점심 종료 시간은 시작 시간보다 뒤여야 해요.";
      return;
    }

    state.lunchStartTime = startValue;
    state.lunchEndTime = endValue;
    persist();
    syncLunchScheduleUi();
    updateLunchTabAlert();
    render();
    closeScheduleModal();
  }

  function getDrawCandidates() {
    const category = els.drawCategorySelect?.value || CATEGORY_ALL;
    const favoritesOnly = Boolean(els.drawFavoritesOnlyInput?.checked);

    return allPlaces.filter((place) => {
      if (category !== CATEGORY_ALL && !matchesCategory(place, category)) return false;
      if (favoritesOnly && !isFavorite(place.id)) return false;
      return true;
    });
  }

  function populateDrawCategorySelect() {
    if (!els.drawCategorySelect) return;
    const currentValue = els.drawCategorySelect.value || CATEGORY_ALL;
    els.drawCategorySelect.innerHTML = lunchCategories
      .map((category) => `<option value="${category}" ${category === currentValue ? "selected" : ""}>${category}</option>`)
      .join("");
  }

  function setDrawError(message = "") {
    if (els.drawError) {
      els.drawError.textContent = message;
    }
  }

  function setDrawPreview(place = null) {
    if (!els.drawPreview) return;

    if (!place) {
      els.drawPreview.innerHTML = `
        <div class="lunch-draw-preview-name">식당 목록을 불러오면 뽑기를 시작할 수 있어요.</div>
        <div class="lunch-draw-preview-meta">현재 위치 식당 데이터가 필요해요.</div>
      `;
      return;
    }

    els.drawPreview.innerHTML = `
      <div class="lunch-draw-preview-name">${escapeHtml(place.tags.name)}</div>
      <div class="lunch-draw-preview-meta">${escapeHtml(getPlaceCategoryLabel(place))} · ${escapeHtml(formatDistance(place.distanceMeters))} · ${escapeHtml(place.address)}</div>
    `;
  }

  function setDrawResult(place = null) {
    if (!els.drawResult || !els.drawMapBtn) return;

    if (!place) {
      els.drawResult.hidden = true;
      els.drawResult.innerHTML = "";
      els.drawMapBtn.hidden = true;
      return;
    }

    els.drawResult.hidden = false;
    els.drawResult.innerHTML = `
      <div class="lunch-draw-result-kicker">오늘의 점심</div>
      <div class="lunch-draw-result-name">${escapeHtml(place.tags.name)}</div>
      <div class="lunch-draw-result-meta">${escapeHtml(getPlaceCategoryLabel(place))} · ${escapeHtml(place.cuisineLabel)}</div>
      <div class="lunch-draw-result-copy">${escapeHtml(place.address)}</div>
    `;
    els.drawMapBtn.hidden = false;
  }

  function syncDrawControls() {
    if (els.drawFavoritesOnlyInput) {
      els.drawFavoritesOnlyInput.disabled = isDrawing;
    }
    if (els.drawCategorySelect) {
      els.drawCategorySelect.disabled = isDrawing;
    }
    if (els.drawStartBtn) {
      els.drawStartBtn.disabled = isDrawing;
      els.drawStartBtn.textContent = isDrawing ? "뽑는 중..." : "뽑기 시작";
    }
  }

  function clearDrawState({ keepResult = false } = {}) {
    isDrawing = false;
    selectedDrawPlaceId = "";
    if (!keepResult) {
      setDrawResult(null);
    }
    syncDrawControls();
  }

  function openDrawModal() {
    populateDrawCategorySelect();
    clearDrawState();
    setDrawError("");
    setDrawPreview(null);
    els.drawFavoritesOnlyInput.checked = false;
    els.drawModal.classList.add("open");
    els.drawModal.setAttribute("aria-hidden", "false");
  }

  function closeDrawModal() {
    clearDrawState();
    els.drawModal.classList.remove("open");
    els.drawModal.setAttribute("aria-hidden", "true");
    render();
  }

  function captureItemPositions() {
    return new Map(
      Array.from(els.list.querySelectorAll("[data-place-id]")).map((item) => [
        item.dataset.placeId,
        item.getBoundingClientRect()
      ])
    );
  }

  function animateListReorder(previousPositions) {
    if (!previousPositions?.size) return;

    els.list.querySelectorAll("[data-place-id]").forEach((item) => {
      const previous = previousPositions.get(item.dataset.placeId);
      if (!previous) return;

      const next = item.getBoundingClientRect();
      const deltaX = previous.left - next.left;
      const deltaY = previous.top - next.top;

      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;

      item.animate(
        [
          { transform: `translate(${deltaX}px, ${deltaY}px)` },
          { transform: "translate(0, 0)" }
        ],
        {
          duration: 420,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)"
        }
      );
    });
  }

  function renderCategoryBar() {
    if (!categoryBarInitialized) {
      els.categoryBar.innerHTML = "";
      const indicator = document.createElement("div");
      indicator.className = "category-chip-indicator";
      els.categoryBar.appendChild(indicator);

      lunchCategories.forEach((category) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "category-chip";
        button.textContent = category;
        button.dataset.category = category;
        button.addEventListener("click", () => {
          if (state.lunchCategory === category) return;
          state.lunchCategory = category;
          activePage = 1;
          persist();
          render();
        });
        els.categoryBar.appendChild(button);
      });

      categoryBarInitialized = true;
    }

    els.categoryBar.querySelectorAll(".category-chip").forEach((button) => {
      button.classList.toggle("active", button.dataset.category === state.lunchCategory);
    });

    requestAnimationFrame(updateCategoryIndicator);
  }

  function renderPagination(totalCount) {
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    activePage = Math.min(activePage, totalPages);

    if (totalCount <= PAGE_SIZE) {
      els.pagination.innerHTML = "";
      return;
    }

    els.pagination.innerHTML = `
      <button type="button" class="btn btn-muted" ${activePage === 1 ? "disabled" : ""} data-page-action="prev">이전</button>
      <span class="lunch-page-indicator">${activePage} / ${totalPages}</span>
      <button type="button" class="btn btn-muted" ${activePage === totalPages ? "disabled" : ""} data-page-action="next">다음</button>
    `;

    els.pagination.querySelector('[data-page-action="prev"]')?.addEventListener("click", () => {
      activePage = Math.max(1, activePage - 1);
      render();
    });
    els.pagination.querySelector('[data-page-action="next"]')?.addEventListener("click", () => {
      activePage = Math.min(totalPages, activePage + 1);
      render();
    });
  }

  function render() {
    ensureLunchState();
    rebuildAllPlaces(state.lunchCachedPlaces);
    const previousPositions = captureItemPositions();
    renderCategoryBar();
    syncLunchScheduleUi();
    updateLunchTabAlert();

    if (els.searchInput.value !== state.lunchSearchQuery) {
      els.searchInput.value = state.lunchSearchQuery;
    }

    els.favoritesOnlyBtn.classList.toggle("active", state.lunchFavoritesOnly);
    els.favoritesOnlyBtn.setAttribute("aria-pressed", state.lunchFavoritesOnly ? "true" : "false");

    const filtered = getFilteredPlaces();
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    activePage = Math.min(activePage, totalPages);
    const startIndex = (activePage - 1) * PAGE_SIZE;
    const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE);

    const updatedText = formatUpdatedAt() ? ` · 마지막 업데이트 ${formatUpdatedAt()}` : "";
    const searchText = state.lunchSearchQuery ? ` · 검색어 "${state.lunchSearchQuery}"` : "";
    els.resultMeta.textContent = totalCount
      ? `${state.lunchCategory} 카테고리 ${state.lunchFavoritesOnly ? "즐겨찾기 " : ""}식당 ${totalCount}곳${searchText}${updatedText}`
      : `${state.lunchCategory} 카테고리${state.lunchFavoritesOnly ? " 즐겨찾기" : ""}${searchText} 결과가 아직 없어요.`;

    if (!visible.length) {
      els.list.innerHTML = `
        <div class="lunch-empty">
          ${state.lunchFavoritesOnly
            ? "즐겨찾기한 식당이 아직 없어요."
            : "현재 조건에 맞는 식당이 아직 없어요. 카테고리나 검색어를 바꿔보세요."}
        </div>
      `;
      renderPagination(totalCount);
      return;
    }

    els.list.innerHTML = visible.map((place) => `
      <article class="lunch-item${isFavorite(place.id) ? " favorite" : ""}" data-place-id="${place.id}">
        ${getRegisteredImageUrl(place.tags)
          ? `<img class="lunch-thumb" src="${getRegisteredImageUrl(place.tags)}" alt="${place.tags.name} 대표 이미지" loading="lazy" />`
          : ""}
        <div class="lunch-item-top">
          <div>
            <h3>${place.tags.name}</h3>
            <div class="lunch-menu">${place.cuisineLabel}</div>
          </div>
          <div class="lunch-item-actions">
            ${place.custom ? `<span class="lunch-badge lunch-custom-badge">직접 추가</span>` : ""}
            <span class="lunch-badge">${state.lunchCategory === CATEGORY_ALL ? getPlaceCategoryLabel(place) : state.lunchCategory}</span>
            <button type="button" class="lunch-favorite-btn${isFavorite(place.id) ? " active" : ""}" data-favorite-id="${place.id}" aria-label="즐겨찾기">${getFavoriteIconMarkup(isFavorite(place.id))}</button>
          </div>
        </div>
        <p class="lunch-copy">${place.address}</p>
        <div class="lunch-meta">
          <span>${place.custom ? "직접 추가" : formatDistance(place.distanceMeters)}</span>
          <span>${place.tags.amenity || "eatery"}</span>
        </div>
        <div class="lunch-card-footer">
          ${place.custom ? `<button type="button" class="btn btn-muted lunch-edit-btn" data-custom-place-edit="${place.id}">수정</button>` : ""}
          ${place.custom && !place.mapUrl
            ? `<button type="button" class="btn btn-muted lunch-map-btn" disabled>지도 없음</button>`
            : `<a class="btn btn-muted lunch-map-btn" href="${getOpenStreetMapLink(place)}" target="_blank" rel="noreferrer">지도보기</a>`}
        </div>
      </article>
    `).join("");

    els.list.querySelectorAll("[data-favorite-id]").forEach((button) => {
      button.addEventListener("click", () => toggleFavorite(button.dataset.favoriteId));
    });
    els.list.querySelectorAll("[data-custom-place-edit]").forEach((button) => {
      button.addEventListener("click", () => openPlaceModal(button.dataset.customPlaceEdit));
    });
    animateListReorder(previousPositions);
    renderPagination(totalCount);
  }

  async function runLunchDraw() {
    if (isDrawing) return;

    const candidates = getDrawCandidates();
    if (!candidates.length) {
      setDrawError("조건에 맞는 식당이 없어요. 즐겨찾기나 카테고리를 다시 골라보세요.");
      setDrawResult(null);
      setDrawPreview(null);
      return;
    }

    isDrawing = true;
    selectedDrawPlaceId = "";
    setDrawError("");
    setDrawResult(null);
    syncDrawControls();

    const sequence = [];
    const stepCount = 24;
    for (let index = 0; index < stepCount; index += 1) {
      sequence.push(candidates[Math.floor(Math.random() * candidates.length)]);
    }
    const winner = candidates[Math.floor(Math.random() * candidates.length)];
    sequence.push(winner);
    const startDelay = 45;
    const endDelay = 210;
    const delays = sequence.map((_, index) => {
      const progress = sequence.length === 1 ? 1 : index / (sequence.length - 1);
      const eased = progress ** 2.2;
      return Math.round(startDelay + (endDelay - startDelay) * eased);
    });

    for (let index = 0; index < sequence.length; index += 1) {
      const place = sequence[index];
      selectedDrawPlaceId = place.id;
      setDrawPreview(place);
      await wait(delays[index]);
    }

    isDrawing = false;
    selectedDrawPlaceId = winner.id;
    setDrawPreview(winner);
    setDrawResult(winner);
    syncDrawControls();
  }

  function requestCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("geolocation-unavailable"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      });
    });
  }

  async function loadNearbyRestaurants(forceRefresh = false) {
    if (isFetching) return;

    isFetching = true;
    els.locateBtn.disabled = true;
    els.refreshBtn.disabled = true;

    if (forceRefresh) {
      state.lunchSearchQuery = "";
    }

    setStatus(
      forceRefresh
        ? "현재 위치를 다시 확인하고 식당 데이터를 새로 가져오는 중이에요."
        : "현재 위치를 확인하고 근처 식당을 불러오는 중이에요.",
      "loading"
    );

    try {
      const position = await requestCurrentPosition();
      const { latitude, longitude } = position.coords;

      allPlaces = await fetchNearbyPlaces(latitude, longitude);
      rememberPlaces(latitude, longitude, allPlaces);
      activePage = 1;
      setStatus(`현재 위치 기준 반경 ${Math.round(SEARCH_RADIUS_METERS / 100) / 10}km 식당 데이터를 불러왔어요.`, "success");
      render();
    } catch (error) {
      console.error(error);

      if (restoreCachedPlaces()) {
        setStatus("실시간 위치 갱신은 실패했지만, 저장해 둔 식당 데이터를 표시했어요.", "error");
      } else if (error?.code === 1) {
        setStatus("위치 권한이 거부되어 근처 식당을 불러올 수 없어요.", "error");
      } else {
        setStatus("근처 식당 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.", "error");
      }

      if (!allPlaces.length) {
        els.resultMeta.textContent = "";
        els.list.innerHTML = `<div class="lunch-empty">위치 정보를 가져오면 근처 식당 리스트가 여기에 표시돼요.</div>`;
        els.pagination.innerHTML = "";
      }
    } finally {
      isFetching = false;
      els.locateBtn.disabled = false;
      els.refreshBtn.disabled = false;
    }
  }

  els.locateBtn.addEventListener("click", () => loadNearbyRestaurants(false));
  els.refreshBtn.addEventListener("click", () => loadNearbyRestaurants(true));
  els.addPlaceBtn?.addEventListener("click", openPlaceModal);
  els.drawBtn?.addEventListener("click", openDrawModal);
  els.scheduleBtn?.addEventListener("click", openScheduleModal);
  els.drawCloseBtn?.addEventListener("click", closeDrawModal);
  els.scheduleCloseBtn?.addEventListener("click", closeScheduleModal);
  els.scheduleCancelBtn?.addEventListener("click", closeScheduleModal);
  els.scheduleSaveBtn?.addEventListener("click", saveSchedule);
  els.placeCloseBtn?.addEventListener("click", closePlaceModal);
  els.placeCancelBtn?.addEventListener("click", closePlaceModal);
  els.placeSaveBtn?.addEventListener("click", saveCustomPlace);
  els.placeDeleteBtn?.addEventListener("click", deleteCustomPlace);
  els.drawModal?.addEventListener("click", (event) => {
    if (event.target === els.drawModal) {
      closeDrawModal();
    }
  });
  els.scheduleModal?.addEventListener("click", (event) => {
    if (event.target === els.scheduleModal) {
      closeScheduleModal();
    }
  });
  els.placeModal?.addEventListener("click", (event) => {
    if (event.target === els.placeModal) {
      closePlaceModal();
    }
  });
  els.drawStartBtn?.addEventListener("click", () => {
    runLunchDraw();
  });
  els.drawMapBtn?.addEventListener("click", () => {
    const place = getPlaceById(selectedDrawPlaceId || winnerPlaceId);
    if (!place) return;
    window.open(getOpenStreetMapLink(place), "_blank", "noopener,noreferrer");
  });
  els.drawCategorySelect?.addEventListener("change", () => {
    setDrawError("");
    setDrawResult(null);
  });
  els.drawFavoritesOnlyInput?.addEventListener("change", () => {
    setDrawError("");
    setDrawResult(null);
  });
  els.favoritesOnlyBtn.addEventListener("click", () => {
    ensureLunchState();
    state.lunchFavoritesOnly = !state.lunchFavoritesOnly;
    activePage = 1;
    persist();
    render();
  });
  els.searchInput.addEventListener("input", (event) => {
    state.lunchSearchQuery = event.target.value;
    activePage = 1;
    persist();
    render();
  });
  window.addEventListener("resize", updateCategoryIndicator);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.drawModal?.classList.contains("open")) {
      closeDrawModal();
      return;
    }
    if (event.key === "Escape" && els.scheduleModal?.classList.contains("open")) {
      closeScheduleModal();
      return;
    }
    if (event.key === "Escape" && els.placeModal?.classList.contains("open")) {
      closePlaceModal();
    }
  });

  restoreCachedPlaces();
  render();
  tabAlertTimer = setInterval(updateLunchTabAlert, 30000);

  return {
    onTabChange(isActive) {
      if (!isActive && els.drawModal?.classList.contains("open")) {
        closeDrawModal();
      }
      if (!isActive && els.scheduleModal?.classList.contains("open")) {
        closeScheduleModal();
      }
      if (!isActive && els.placeModal?.classList.contains("open")) {
        closePlaceModal();
      }
      if (isActive && !didAutoLoad) {
        didAutoLoad = true;
        if (!allPlaces.length) {
          loadNearbyRestaurants(false);
        }
      }
    },
    focusAlert() {
      els.drawBtn?.focus();
      root.querySelector(".lunch-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    destroy() {
      if (tabAlertTimer) clearInterval(tabAlertTimer);
      setTabAlert("lunch", "lunch", false);
      setGlobalLunchAlert(false);
    }
  };
}


// FILE: .\v1.4\app\fortune\view.js
const fortuneTemplate = `
<section class="card fortune-card">
  <div class="fortune-header">
    <div>
      <h2>오늘의 운세</h2>
      <p class="hint">오늘 날짜 기준으로 가볍게 보는 직장인 운세야. 너무 진지하게 보기보단 흐름 체크용으로 보면 좋아.</p>
    </div>
  </div>
  <div id="fortuneZodiacBar" class="fortune-zodiac-bar" aria-label="띠 선택"></div>
  <div class="fortune-hero">
    <div id="fortuneEmoji" class="fortune-emoji">🐴</div>
    <div>
      <div id="fortuneDate" class="fortune-date"></div>
      <div id="fortuneHeadline" class="fortune-headline"></div>
    </div>
  </div>
  <div class="fortune-grid">
    <article class="fortune-panel">
      <div class="fortune-label">오늘의 한 줄</div>
      <div id="fortuneOneLine" class="fortune-copy"></div>
    </article>
    <article class="fortune-panel">
      <div class="fortune-label">업무운</div>
      <div id="fortuneWork" class="fortune-copy"></div>
    </article>
    <article class="fortune-panel">
      <div class="fortune-label">금전운</div>
      <div id="fortuneMoney" class="fortune-copy"></div>
    </article>
    <article class="fortune-panel">
      <div class="fortune-label">관계운</div>
      <div id="fortuneRelation" class="fortune-copy"></div>
    </article>
  </div>
</section>
`;


// FILE: .\v1.4\app\fortune\fortune.js
const zodiacs = [
  { key: "rat", label: "쥐띠", emoji: "🐭" },
  { key: "ox", label: "소띠", emoji: "🐮" },
  { key: "tiger", label: "호랑이띠", emoji: "🐯" },
  { key: "rabbit", label: "토끼띠", emoji: "🐰" },
  { key: "dragon", label: "용띠", emoji: "🐲" },
  { key: "snake", label: "뱀띠", emoji: "🐍" },
  { key: "horse", label: "말띠", emoji: "🐴" },
  { key: "goat", label: "양띠", emoji: "🐑" },
  { key: "monkey", label: "원숭이띠", emoji: "🐵" },
  { key: "rooster", label: "닭띠", emoji: "🐔" },
  { key: "dog", label: "개띠", emoji: "🐶" },
  { key: "pig", label: "돼지띠", emoji: "🐷" }
];

const headlines = [
  "흐름이 부드럽게 풀리는 날",
  "작게 움직여도 성과가 남는 날",
  "말보다 타이밍이 중요한 날",
  "정리만 잘해도 반은 이기는 날",
  "한 번의 집중이 크게 먹히는 날",
  "욕심보다 밸런스가 중요한 날"
];

const oneLines = [
  "미뤄둔 작은 일 하나를 끝내면 전체 리듬이 살아나요.",
  "오늘은 속도보다 방향이 중요해요. 한 번 더 확인한 선택이 유리해요.",
  "괜히 힘주기보다 익숙한 루틴을 지키는 쪽이 더 좋은 결과를 줘요.",
  "점심 이후 집중력이 오르니 중요한 일은 오후에 몰아도 괜찮아요.",
  "주변 페이스에 휩쓸리기보다 내 템포를 지키는 쪽이 운을 살려줘요."
];

const workFortunes = [
  "회의보다 실무에서 존재감이 드러나요. 정리 잘 된 한 문장이 포인트예요.",
  "메신저 답장은 짧고 명확하게 가는 게 좋아요. 오해가 줄어요.",
  "오전엔 가볍게, 오후엔 몰입형으로 가면 리듬이 잘 맞아요.",
  "새로운 일보다 이미 잡힌 일을 마감하는 쪽에서 만족도가 커요.",
  "도움 요청을 미루지 않으면 일이 예상보다 빨리 풀려요."
];

const moneyFortunes = [
  "충동 지출만 피하면 만족도 높은 하루가 돼요.",
  "작은 할인이나 쿠폰 운이 괜찮은 편이에요.",
  "오늘은 아끼는 것보다 잘 쓸 곳에 쓰는 게 더 중요해요.",
  "점심이나 커피 지출이 생각보다 커질 수 있으니 한 번 체크해 보세요.",
  "금전운은 무난하지만, 정기결제 확인하기 좋은 날이에요."
];

const relationFortunes = [
  "가벼운 농담 하나가 분위기를 풀어줘요.",
  "말을 아끼는 편이 오히려 센스 있게 보이는 날이에요.",
  "오늘은 먼저 다가가기보다 반응을 보고 맞추는 게 좋아요.",
  "동료와의 작은 협업에서 예상보다 좋은 호흡이 나와요.",
  "연락을 미뤘던 사람에게 짧게 안부를 보내기 괜찮은 날이에요."
];

function getTodayZodiacIndex() {
  const year = new Date().getFullYear();
  return ((year - 2016) % 12 + 12) % 12;
}

function hashFortuneSeed(zodiacKey) {
  const today = new Date();
  const dateSeed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${zodiacKey}`;
  return Array.from(dateSeed).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function pickBySeed(list, seed, offset = 0) {
  return list[(seed + offset) % list.length];
}
function initFortuneTab(root, { state, persist }) {
  const els = {
    zodiacBar: root.querySelector("#fortuneZodiacBar"),
    emoji: root.querySelector("#fortuneEmoji"),
    date: root.querySelector("#fortuneDate"),
    headline: root.querySelector("#fortuneHeadline"),
    oneLine: root.querySelector("#fortuneOneLine"),
    work: root.querySelector("#fortuneWork"),
    money: root.querySelector("#fortuneMoney"),
    relation: root.querySelector("#fortuneRelation")
  };

  function updateZodiacIndicator() {
    const indicator = els.zodiacBar.querySelector(".fortune-zodiac-indicator");
    const activeButton = els.zodiacBar.querySelector(".fortune-zodiac-chip.active");
    if (!indicator || !activeButton) return;

    indicator.style.width = `${activeButton.offsetWidth}px`;
    indicator.style.height = `${activeButton.offsetHeight}px`;
    indicator.style.transform = `translate(${activeButton.offsetLeft}px, ${activeButton.offsetTop}px)`;
  }

  if (!state.fortuneSelectedZodiac) {
    state.fortuneSelectedZodiac = zodiacs[getTodayZodiacIndex()].key;
  }

  const indicator = document.createElement("div");
  indicator.className = "fortune-zodiac-indicator";
  els.zodiacBar.appendChild(indicator);

  zodiacs.forEach((zodiac) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "fortune-zodiac-chip";
    button.dataset.zodiac = zodiac.key;
    button.setAttribute("aria-label", zodiac.label);
    button.innerHTML = `<span class="fortune-zodiac-chip-emoji">${zodiac.emoji}</span><span class="fortune-zodiac-chip-label">${zodiac.label}</span>`;
    button.addEventListener("click", () => {
      state.fortuneSelectedZodiac = zodiac.key;
      persist();
      render();
    });
    els.zodiacBar.appendChild(button);
  });

  function render() {
    const zodiac = zodiacs.find((item) => item.key === state.fortuneSelectedZodiac) || zodiacs[getTodayZodiacIndex()];
    const seed = hashFortuneSeed(zodiac.key);
    const today = new Date();

    els.zodiacBar.querySelectorAll(".fortune-zodiac-chip").forEach((button) => {
      button.classList.toggle("active", button.dataset.zodiac === zodiac.key);
    });

    els.emoji.textContent = zodiac.emoji;
    els.date.textContent = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 · ${zodiac.label}`;
    els.headline.textContent = pickBySeed(headlines, seed);
    els.oneLine.textContent = pickBySeed(oneLines, seed, 1);
    els.work.textContent = pickBySeed(workFortunes, seed, 2);
    els.money.textContent = pickBySeed(moneyFortunes, seed, 3);
    els.relation.textContent = pickBySeed(relationFortunes, seed, 4);
    requestAnimationFrame(updateZodiacIndicator);
  }

  window.addEventListener("resize", updateZodiacIndicator);
  render();

  return {};
}


// FILE: .\v1.4\app\ladder\view.js
const ladderTemplate = `
<section class="card ladder-card">
  <div class="ladder-header">
    <div class="ladder-heading">
      <h2>사다리게임</h2>
      <p class="hint">커피내기나 점심내기처럼 빠르게 돌리고, 이름과 결과를 바로 수정할 수 있는 깔끔한 사다리판</p>
    </div>
    <div class="ladder-actions">
      <div id="ladderPresetList" class="ladder-preset-list"></div>
      <div class="ladder-control-row">
        <div class="ladder-orientation-toggle" role="tablist" aria-label="사다리 방향">
          <button type="button" class="ladder-mode-btn active" data-ladder-mode="vertical">세로형</button>
          <button type="button" class="ladder-mode-btn" data-ladder-mode="horizontal">가로형</button>
        </div>
        <div class="ladder-control-grid">
        <label class="field compact-field">
          <span>참여 인원</span>
          <input id="ladderPlayerCount" type="number" min="2" max="13" step="1" value="4" />
        </label>
        <label class="field compact-field">
          <span id="ladderBridgeCountLabel">가로줄 수</span>
          <input id="ladderBridgeCount" type="number" min="3" max="65" step="1" value="7" />
        </label>
        <label class="field compact-field">
          <span>꽝 수</span>
          <input id="ladderFailCount" type="number" min="1" max="1" step="1" value="1" />
        </label>
        </div>
        <button id="ladderStartAllBtn" class="btn btn-muted">전체 출발</button>
        <button id="ladderGenerateBtn" class="btn btn-primary ladder-refresh-btn" aria-label="사다리 다시 만들기" title="사다리 다시 만들기">↻</button>
      </div>
    </div>
  </div>
  <div class="ladder-layout">
    <section class="ladder-board-card">
      <div id="ladderBoard" class="ladder-board"></div>
    </section>
  </div>
  <div id="ladderResultModal" class="ladder-result-modal" aria-hidden="true">
    <div class="ladder-result-panel">
      <div class="ladder-result-kicker">사다리 결과</div>
      <h3 id="ladderResultTitle" class="ladder-result-title">결과가 나왔어요</h3>
      <p id="ladderResultText" class="ladder-result-text"></p>
      <button id="ladderResultCloseBtn" type="button" class="btn btn-primary">확인</button>
    </div>
  </div>
</section>
`;


// FILE: .\v1.4\app\ladder\ladder.js
const MAX_PLAYERS = 13;
const MAX_PRESETS = 5;
const SINGLE_ANIMATION_MS = 3000;
const DEFAULT_NAMES = ["민수", "지연", "현우", "서연", "유진", "태민", "하린", "도윤", "소연", "준호", "나연", "지후", "세아"];
const DEFAULT_RESULTS = ["통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "꽝"];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function initLadderTab(root, { state, persist }) {
  const els = {
    playerCount: root.querySelector("#ladderPlayerCount"),
    bridgeCountLabel: root.querySelector("#ladderBridgeCountLabel"),
    bridgeCount: root.querySelector("#ladderBridgeCount"),
    failCount: root.querySelector("#ladderFailCount"),
    startAllBtn: root.querySelector("#ladderStartAllBtn"),
    generateBtn: root.querySelector("#ladderGenerateBtn"),
    modeButtons: [...root.querySelectorAll("[data-ladder-mode]")],
    presetList: root.querySelector("#ladderPresetList"),
    board: root.querySelector("#ladderBoard"),
    resultModal: root.querySelector("#ladderResultModal"),
    resultTitle: root.querySelector("#ladderResultTitle"),
    resultText: root.querySelector("#ladderResultText"),
    resultCloseBtn: root.querySelector("#ladderResultCloseBtn")
  };

  let ladderData = null;
  let activePlayerIndex = null;
  let activePresetId = null;
  let editingTarget = null;
  let editingPresetId = null;
  let showAllPaths = false;
  let reverseTravel = false;
  let resultTimer = null;

  function buildFallbackNames() {
    const legacy = String(state.ladderNames || "")
      .split(/\r?\n/)
      .map((name) => name.trim())
      .filter(Boolean);
    return legacy.length ? legacy : DEFAULT_NAMES.slice(0, 4);
  }

  function ensureStateShape() {
    const fallbackNames = buildFallbackNames();
    const fallbackCount = Math.min(MAX_PLAYERS, Math.max(2, Number(state.ladderPlayerCount) || fallbackNames.length || 4));
    const names = Array.isArray(state.ladderPlayerNames) ? state.ladderPlayerNames.slice(0, MAX_PLAYERS) : [];
    const results = Array.isArray(state.ladderResultLabels) ? state.ladderResultLabels.slice(0, MAX_PLAYERS) : [];

    while (names.length < MAX_PLAYERS) {
      names.push(fallbackNames[names.length] || DEFAULT_NAMES[names.length] || `참가자 ${names.length + 1}`);
    }
    while (results.length < MAX_PLAYERS) {
      results.push(DEFAULT_RESULTS[results.length] || "통과");
    }

    if (!results.some((label) => String(label).trim() === "꽝")) {
      results[Math.max(0, fallbackCount - 1)] = "꽝";
    }

    state.ladderPlayerCount = fallbackCount;
    state.ladderPlayerNames = names;
    state.ladderResultLabels = results;
    state.ladderBridgeCount = Math.min(fallbackCount * 5, Math.max(3, Number(state.ladderBridgeCount) || 7));
    state.ladderFailCount = Math.min(Math.max(1, fallbackCount - 1), Math.max(1, Number(state.ladderFailCount) || 1));
    state.ladderOrientation = state.ladderOrientation === "horizontal" ? "horizontal" : "vertical";
    state.ladderSavedFormats = Array.isArray(state.ladderSavedFormats) ? state.ladderSavedFormats.slice(0, MAX_PRESETS) : [];
  }

  function getPlayerCount() {
    return Math.min(MAX_PLAYERS, Math.max(2, Number(state.ladderPlayerCount) || 4));
  }

  function syncInputsFromState() {
    ensureStateShape();
    els.playerCount.value = state.ladderPlayerCount;
    els.bridgeCount.max = String(getPlayerCount() * 5);
    els.bridgeCount.value = state.ladderBridgeCount;
    els.failCount.max = String(Math.max(1, getPlayerCount() - 1));
    els.failCount.value = state.ladderFailCount;
    els.bridgeCountLabel.textContent = state.ladderOrientation === "horizontal" ? "세로줄 수" : "가로줄 수";
    els.modeButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.ladderMode === state.ladderOrientation);
    });
  }

  function syncStateFromInputs() {
    state.ladderPlayerCount = Math.min(MAX_PLAYERS, Math.max(2, Number(els.playerCount.value) || 4));
    els.bridgeCount.max = String(state.ladderPlayerCount * 5);
    state.ladderBridgeCount = Math.min(state.ladderPlayerCount * 5, Math.max(3, Number(els.bridgeCount.value) || 7));
    els.failCount.max = String(Math.max(1, state.ladderPlayerCount - 1));
    state.ladderFailCount = Math.min(Math.max(1, state.ladderPlayerCount - 1), Math.max(1, Number(els.failCount.value) || 1));
    persist();
  }

  function getNames() {
    return state.ladderPlayerNames
      .slice(0, getPlayerCount())
      .map((name, index) => name?.trim() || DEFAULT_NAMES[index]);
  }

  function getResults() {
    const playerCount = getPlayerCount();
    const failCount = Math.min(Math.max(1, Number(state.ladderFailCount) || 1), Math.max(1, playerCount - 1));
    return Array.from({ length: playerCount }, (_, index) => (index >= playerCount - failCount ? "꽝" : "통과"));
  }

  function buildSnapshot(id = `preset-${Date.now()}`) {
    const usedIndexes = new Set(
      (state.ladderSavedFormats || [])
        .map((preset) => Number(String(preset.name || "").replace(/[^\d]/g, "")))
        .filter(Boolean)
    );
    let nextIndex = 1;
    while (usedIndexes.has(nextIndex)) nextIndex += 1;

    return {
      id,
      name: activePresetId
        ? (state.ladderSavedFormats.find((preset) => preset.id === activePresetId)?.name || `포맷 ${nextIndex}`)
        : `포맷 ${nextIndex}`,
      playerCount: getPlayerCount(),
      bridgeCount: Math.min(getPlayerCount() * 5, Math.max(3, Number(state.ladderBridgeCount) || 7)),
      failCount: Math.min(Math.max(1, Number(state.ladderFailCount) || 1), Math.max(1, getPlayerCount() - 1)),
      orientation: state.ladderOrientation,
      playerNames: [...state.ladderPlayerNames.slice(0, MAX_PLAYERS)],
      resultLabels: [...state.ladderResultLabels.slice(0, MAX_PLAYERS)]
    };
  }

  function saveActivePresetIfNeeded() {
    if (!activePresetId) return;
    const index = state.ladderSavedFormats.findIndex((preset) => preset.id === activePresetId);
    if (index < 0) return;
    state.ladderSavedFormats[index] = buildSnapshot(activePresetId);
    persist();
    renderPresetList();
  }

  function clearResultTimer() {
    if (resultTimer) {
      clearTimeout(resultTimer);
      resultTimer = null;
    }
  }

  function resetTransientRunState(shouldRender = true) {
    clearResultTimer();
    closeResultModal();
    activePlayerIndex = null;
    showAllPaths = false;
    reverseTravel = false;
    if (shouldRender) {
      renderBoard();
    }
  }

  function closeResultModal() {
    els.resultModal.classList.remove("open");
    els.resultModal.setAttribute("aria-hidden", "true");
  }

  function openResultModal(title, text) {
    els.resultTitle.textContent = title;
    els.resultText.textContent = text;
    els.resultModal.classList.add("open");
    els.resultModal.setAttribute("aria-hidden", "false");
  }

  function scheduleSingleResultPopup(playerIndex) {
    clearResultTimer();
    const trace = tracePath(playerIndex);
    const result = ladderData.results[trace.endIndex];
    const player = ladderData.names[playerIndex];
    resultTimer = setTimeout(() => {
      if (String(result).trim() === "꽝") {
        openResultModal("꽝 당첨 🤣", `${player} 님이 꽝에 도착했어요.`);
      } else {
        openResultModal("통과 😘", `${player} 님은 ${result}입니다.`);
      }
    }, SINGLE_ANIMATION_MS);
  }

  function scheduleAllResultPopup() {
    clearResultTimer();
    const losers = ladderData.names.filter((_, index) => {
      const trace = tracePath(index);
      return String(ladderData.results[trace.endIndex] || "").trim() === "꽝";
    });
    const winnerText = losers.join(", ");
    resultTimer = setTimeout(() => {
      if (losers.length === 1) {
        openResultModal("꽝 당첨자 🤣", `${winnerText} 님이 오늘의 꽝입니다.`);
      } else {
        openResultModal("꽝 당첨자 🤣", `${winnerText} 님이 꽝에 걸렸어요.`);
      }
    }, SINGLE_ANIMATION_MS);
  }

  function addPreset() {
    ensureStateShape();
    if ((state.ladderSavedFormats || []).length >= MAX_PRESETS) return;
    const snapshot = buildSnapshot();
    state.ladderSavedFormats = [...state.ladderSavedFormats, snapshot].slice(0, MAX_PRESETS);
    activePresetId = snapshot.id;
    persist();
    renderPresetList();
  }

  function loadPreset(presetId) {
    const preset = (state.ladderSavedFormats || []).find((item) => item.id === presetId);
    if (!preset) return;

    activePresetId = preset.id;
    state.ladderPlayerCount = Math.min(MAX_PLAYERS, Math.max(2, Number(preset.playerCount) || 4));
    state.ladderBridgeCount = Math.min(state.ladderPlayerCount * 5, Math.max(3, Number(preset.bridgeCount) || 7));
    state.ladderFailCount = Math.min(Math.max(1, state.ladderPlayerCount - 1), Math.max(1, Number(preset.failCount) || 1));
    state.ladderOrientation = preset.orientation === "horizontal" ? "horizontal" : "vertical";
    state.ladderPlayerNames = [...preset.playerNames];
    state.ladderResultLabels = [...preset.resultLabels];
    syncInputsFromState();
    persist();
    renderPresetList();
    generateLadder();
  }

  function deletePreset(presetId) {
    state.ladderSavedFormats = (state.ladderSavedFormats || []).filter((preset) => preset.id !== presetId);
    if (activePresetId === presetId) activePresetId = null;
    persist();
    renderPresetList();
  }

  function renderPresetList() {
    const presets = state.ladderSavedFormats || [];
    const presetCards = presets.map((preset) => `
      <div class="ladder-preset-card${preset.id === activePresetId ? " active" : ""}" data-preset-card="${preset.id}">
        <button type="button" class="ladder-preset-main" data-preset-load="${preset.id}">
          ${renderPresetName(preset)}
          <span class="ladder-preset-meta">${preset.playerCount}명 / ${preset.bridgeCount}줄</span>
        </button>
        <button type="button" class="ladder-preset-trash" data-preset-delete="${preset.id}" aria-label="포맷 삭제">🗑</button>
      </div>
    `).join("");

    const addCard = presets.length < MAX_PRESETS ? `
      <button type="button" class="ladder-preset-card ladder-preset-add" id="ladderPresetAddBtn" aria-label="포맷 추가">
        <span class="ladder-preset-plus">+</span>
      </button>
    ` : "";

    els.presetList.innerHTML = presetCards + addCard;

    els.presetList.querySelectorAll("[data-preset-load]").forEach((button) => {
      button.addEventListener("click", () => loadPreset(button.dataset.presetLoad));
    });

    els.presetList.querySelectorAll("[data-preset-delete]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        deletePreset(button.dataset.presetDelete);
      });
    });

    els.presetList.querySelectorAll("[data-preset-edit]").forEach((button) => {
      const startEdit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        editingPresetId = button.dataset.presetEdit;
        renderPresetList();
      };

      button.addEventListener("click", startEdit);
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") startEdit(event);
      });
    });

    const presetInput = els.presetList.querySelector(".ladder-preset-name-input");
    if (presetInput) {
      presetInput.focus();
      presetInput.select();
      presetInput.addEventListener("click", (event) => event.stopPropagation());
      presetInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commitPresetNameEdit(presetInput.dataset.presetId, presetInput.value);
        }
        if (event.key === "Escape") {
          editingPresetId = null;
          renderPresetList();
        }
      });
      presetInput.addEventListener("blur", () => {
        commitPresetNameEdit(presetInput.dataset.presetId, presetInput.value);
      });
    }

    els.presetList.querySelectorAll("[data-preset-card]").forEach((card) => {
      card.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        deletePreset(card.dataset.presetCard);
      });
    });

    els.presetList.querySelector("#ladderPresetAddBtn")?.addEventListener("click", addPreset);
  }

  function renderPresetName(preset) {
    if (editingPresetId === preset.id) {
      return `<input class="ladder-preset-name-input" data-preset-id="${preset.id}" type="text" value="${escapeHtml(preset.name)}" />`;
    }

    return `
      <span class="ladder-preset-name-row">
        <span class="ladder-preset-name">${escapeHtml(preset.name)}</span>
        <span class="ladder-preset-edit" data-preset-edit="${preset.id}" role="button" tabindex="0" aria-label="포맷 이름 수정">✎</span>
      </span>
    `;
  }

  function commitPresetNameEdit(presetId, rawValue) {
    const preset = (state.ladderSavedFormats || []).find((item) => item.id === presetId);
    if (!preset) {
      editingPresetId = null;
      renderPresetList();
      return;
    }

    preset.name = String(rawValue || "").trim() || preset.name || "포맷";
    if (activePresetId === presetId) {
      activePresetId = presetId;
    }
    editingPresetId = null;
    persist();
    renderPresetList();
  }

  function createBridgeRows(playerCount, bridgeCount) {
    const rows = [];
    for (let row = 0; row < bridgeCount; row += 1) {
      const columns = new Array(Math.max(0, playerCount - 1)).fill(false);
      for (let col = 0; col < columns.length; col += 1) {
        if (columns[col - 1]) continue;
        columns[col] = Math.random() > 0.55;
      }
      if (!columns.some(Boolean)) {
        columns[Math.floor(Math.random() * columns.length)] = true;
      }
      rows.push(columns);
    }
    return rows;
  }

  function tracePath(startIndex) {
    let current = startIndex;
    const steps = [{ row: -1, col: current }];

    ladderData.rows.forEach((row, rowIndex) => {
      if (row[current]) {
        steps.push({ row: rowIndex, col: current, horizontalTo: current + 1 });
        current += 1;
      } else if (current > 0 && row[current - 1]) {
        steps.push({ row: rowIndex, col: current, horizontalTo: current - 1 });
        current -= 1;
      } else {
        steps.push({ row: rowIndex, col: current });
      }
    });

    return { endIndex: current, steps };
  }

  function generateLadder() {
    syncStateFromInputs();
    resetTransientRunState(false);
    ladderData = {
      names: getNames(),
      results: getResults(),
      rows: createBridgeRows(getPlayerCount(), state.ladderBridgeCount)
    };
    activePlayerIndex = null;
    showAllPaths = false;
    reverseTravel = false;
    saveActivePresetIfNeeded();
    renderBoard();
  }

  function renderNodeValue(type, index, value) {
    const isEditing = editingTarget && editingTarget.type === type && editingTarget.index === index;
    if (isEditing) {
      return `<input class="ladder-node-input" data-edit-type="${type}" data-edit-index="${index}" type="text" value="${escapeHtml(value)}" />`;
    }
    return `
      <span class="ladder-node-value">
        <strong>${escapeHtml(value)}</strong>
        <span class="ladder-node-edit-inline" data-edit-trigger="true" data-edit-type="${type}" data-edit-index="${index}" role="button" tabindex="0" aria-label="수정">✎</span>
      </span>
    `;
  }

  function commitNodeEdit(type, index, rawValue) {
    const fallback = type === "player"
      ? (DEFAULT_NAMES[index] || `참가자 ${index + 1}`)
      : (index === getPlayerCount() - 1 ? "꽝" : "통과");
    const value = String(rawValue || "").trim() || fallback;

    if (type === "player") {
      state.ladderPlayerNames[index] = value;
      ladderData.names = getNames();
    } else {
      state.ladderResultLabels[index] = value;
      ladderData.results = getResults();
    }

    editingTarget = null;
    persist();
    saveActivePresetIfNeeded();
    renderBoard();
  }

  function renderBoard() {
    if (!ladderData) return;

    const activeTrace = activePlayerIndex == null ? null : tracePath(activePlayerIndex);
    const activeEndsFail = Boolean(
      activeTrace &&
      String(ladderData.results[activeTrace.endIndex] || "").trim() === "꽝"
    );
    const activeEndsSuccess = Boolean(activeTrace && !activeEndsFail);
    const failPlayerIndexes = new Set(
      ladderData.names
        .map((_, index) => ({ index, trace: tracePath(index) }))
        .filter(({ trace }) => String(ladderData.results[trace.endIndex] || "").trim() === "꽝")
        .map(({ index }) => index)
    );
    const playerCount = ladderData.names.length;
    const compact = playerCount >= 10;
    const orientation = state.ladderOrientation;
    const svgHeight = compact ? 460 : 520;
    const horizontalMainLength = compact ? 620 : 720;
    const railPadding = orientation === "horizontal" ? 2 : (compact ? 22 : 26);
    const railStart = railPadding;
    const railEnd = (orientation === "horizontal" ? horizontalMainLength : svgHeight) - railPadding;
    const rowGap = (railEnd - railStart) / Math.max(1, ladderData.rows.length);
    const nodeGap = compact ? 6 : 10;
    const cardWidth = compact ? 70 : 120;
    const cardHeight = compact ? 52 : 70;
    const laneSize = orientation === "vertical" ? cardWidth : cardHeight;
    const laneStride = laneSize + nodeGap;
    const svgWidth = playerCount * laneSize + Math.max(0, playerCount - 1) * nodeGap;
    const xFor = (index) => laneStride * index + laneSize / 2;
    const yForRow = (rowIndex) => railStart + rowGap * rowIndex + rowGap / 2;

    const topHtml = ladderData.names.map((name, index) => `
      <button type="button" class="ladder-node top${activePlayerIndex === index && !showAllPaths ? " pending-active" : ""}${activePlayerIndex === index && activeEndsFail && !showAllPaths ? " fail-delayed" : ""}${activePlayerIndex === index && activeEndsSuccess && !showAllPaths ? " success-delayed" : ""}${showAllPaths && failPlayerIndexes.has(index) ? " fail-delayed" : ""}${showAllPaths && !failPlayerIndexes.has(index) ? " success-delayed" : ""}" data-player-index="${index}" data-node-position="top">
        <span class="ladder-node-label">참가자</span>
        ${renderNodeValue("player", index, name)}
      </button>
    `).join("");

    const railsSvg = ladderData.names.map((_, index) => `
      ${orientation === "vertical"
        ? `<line class="ladder-svg-rail" x1="${xFor(index)}" y1="${railStart}" x2="${xFor(index)}" y2="${railEnd}"></line>`
        : `<line class="ladder-svg-rail" x1="${railStart}" y1="${xFor(index)}" x2="${railEnd}" y2="${xFor(index)}"></line>`}
    `).join("");

    const bridgesSvg = ladderData.rows.map((row, rowIndex) => row.map((hasBridge, colIndex) => {
      if (!hasBridge) return "";
      const y = yForRow(rowIndex);
      return orientation === "vertical"
        ? `<line class="ladder-svg-bridge" x1="${xFor(colIndex)}" y1="${y}" x2="${xFor(colIndex + 1)}" y2="${y}"></line>`
        : `<line class="ladder-svg-bridge" x1="${y}" y1="${xFor(colIndex)}" x2="${y}" y2="${xFor(colIndex + 1)}"></line>`;
    }).join("")).join("");

    function buildAnimatedPath(playerIndex, className = "ladder-svg-path animate", reverse = false) {
      const trace = tracePath(playerIndex);
      const endsFail = String(ladderData.results[trace.endIndex] || "").trim() === "꽝";
      const pointFor = (col, y) => orientation === "vertical" ? `${xFor(col)} ${y}` : `${y} ${xFor(col)}`;
      const pathParts = [];

      if (!reverse) {
        pathParts.push(`M ${pointFor(trace.steps[0].col, railStart)}`);
        trace.steps.slice(1).forEach((step) => {
          const y = yForRow(step.row);
          pathParts.push(`L ${pointFor(step.col, y)}`);
          if (typeof step.horizontalTo === "number") {
            pathParts.push(`L ${pointFor(step.horizontalTo, y)}`);
          }
        });
        pathParts.push(`L ${pointFor(trace.endIndex, railEnd)}`);
      } else {
        pathParts.push(`M ${pointFor(trace.endIndex, railEnd)}`);
        for (let i = trace.steps.length - 1; i >= 1; i -= 1) {
          const step = trace.steps[i];
          const y = yForRow(step.row);
          const currentCol = typeof step.horizontalTo === "number" ? step.horizontalTo : step.col;
          pathParts.push(`L ${pointFor(currentCol, y)}`);
          if (typeof step.horizontalTo === "number") {
            pathParts.push(`L ${pointFor(step.col, y)}`);
          }
        }
        pathParts.push(`L ${pointFor(trace.steps[0].col, railStart)}`);
      }

      return `<path class="${className}${endsFail ? " fail" : " success"}${reverse ? " reverse" : ""}" d="${pathParts.join(" ")}" pathLength="100"></path>`;
    }

    let activePath = "";
    if (showAllPaths) {
      const successIndexes = [];
      const failIndexes = [];
      ladderData.names.forEach((_, index) => {
        if (failPlayerIndexes.has(index)) failIndexes.push(index);
        else successIndexes.push(index);
      });
      activePath = successIndexes
        .map((index) => buildAnimatedPath(index, "ladder-svg-path ladder-svg-path-all animate"))
        .concat(failIndexes.map((index) => buildAnimatedPath(index, "ladder-svg-path ladder-svg-path-all animate")))
        .join("");
    } else if (activePlayerIndex != null) {
      activePath = buildAnimatedPath(activePlayerIndex, "ladder-svg-path animate", reverseTravel);
    }

    const bottomHtml = ladderData.results.map((label, index) => {
      const linkedPlayerIndex = ladderData.names.findIndex((_, playerIndex) => tracePath(playerIndex).endIndex === index);
      const isActive = !showAllPaths && activePlayerIndex != null && activeTrace && activeTrace.endIndex === index;
      const isFail = String(label).trim() === "꽝";
      const isSuccess = !isFail;
      const baseResultTone = showAllPaths ? (isFail ? " fail" : " success") : "";
      return `
        <button type="button" class="ladder-node bottom${isActive ? " pending-active" : ""}${baseResultTone}${isActive && isFail ? " fail-delayed" : ""}${isActive && isSuccess ? " success-delayed" : ""}" data-player-index="${linkedPlayerIndex}" data-node-position="bottom">
          <span class="ladder-node-label">도착</span>
          <strong>${label}</strong>
        </button>
      `;
    }).join("");
    const stageVars = `--ladder-card-width:${cardWidth}px;--ladder-card-height:${cardHeight}px;--ladder-node-gap:${nodeGap}px;`;

    els.board.innerHTML = orientation === "vertical" ? `
      <div class="ladder-stage${compact ? " compact" : ""}" style="${stageVars}width:${svgWidth}px;">
        <div class="ladder-node-row" style="grid-template-columns:repeat(${playerCount}, ${cardWidth}px);gap:${nodeGap}px;">
          ${topHtml}
        </div>
        <div class="ladder-diagram" style="width:${svgWidth}px;">
          <svg class="ladder-svg" style="width:${svgWidth}px;height:${svgHeight}px;" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none" aria-hidden="true">
            ${railsSvg}
            ${bridgesSvg}
            ${activePath}
          </svg>
        </div>
        <div class="ladder-node-row" style="grid-template-columns:repeat(${ladderData.results.length}, ${cardWidth}px);gap:${nodeGap}px;">
          ${bottomHtml}
        </div>
      </div>
    ` : `
      <div class="ladder-stage horizontal${compact ? " compact" : ""}" style="${stageVars}grid-template-columns:${cardWidth}px minmax(0, 1fr) ${cardWidth}px;">
        <div class="ladder-side-column" style="grid-template-rows:repeat(${playerCount}, ${cardHeight}px);gap:${nodeGap}px;width:${cardWidth}px;">
          ${topHtml}
        </div>
        <div class="ladder-diagram horizontal" style="width:100%;height:${svgWidth}px;">
          <svg class="ladder-svg horizontal" style="width:100%;height:${svgWidth}px;" viewBox="0 0 ${horizontalMainLength} ${svgWidth}" preserveAspectRatio="none" aria-hidden="true">
            ${railsSvg}
            ${bridgesSvg}
            ${activePath}
          </svg>
        </div>
        <div class="ladder-side-column" style="grid-template-rows:repeat(${ladderData.results.length}, ${cardHeight}px);gap:${nodeGap}px;width:${cardWidth}px;">
          ${bottomHtml}
        </div>
      </div>
    `;

    els.board.querySelectorAll("[data-player-index]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.querySelector(".ladder-node-input")) return;
        showAllPaths = false;
        reverseTravel = button.dataset.nodePosition === "bottom";
        activePlayerIndex = Number(button.dataset.playerIndex);
        renderBoard();
        scheduleSingleResultPopup(activePlayerIndex);
      });
    });

    els.board.querySelectorAll("[data-edit-trigger='true']").forEach((button) => {
      const startEdit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        editingTarget = {
          type: button.dataset.editType,
          index: Number(button.dataset.editIndex)
        };
        renderBoard();
      };

      button.addEventListener("click", startEdit);
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") startEdit(event);
      });
    });

    const editInput = els.board.querySelector(".ladder-node-input");
    if (editInput) {
      editInput.focus();
      editInput.select();
      editInput.addEventListener("click", (event) => event.stopPropagation());
      editInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commitNodeEdit(editInput.dataset.editType, Number(editInput.dataset.editIndex), editInput.value);
        }
        if (event.key === "Escape") {
          editingTarget = null;
          renderBoard();
        }
      });
      editInput.addEventListener("blur", () => {
        commitNodeEdit(editInput.dataset.editType, Number(editInput.dataset.editIndex), editInput.value);
      });
    }
  }

  els.playerCount.addEventListener("change", generateLadder);
  els.bridgeCount.addEventListener("change", generateLadder);
  els.failCount.addEventListener("change", generateLadder);
  els.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.ladderOrientation = button.dataset.ladderMode === "horizontal" ? "horizontal" : "vertical";
      persist();
      resetTransientRunState(false);
      syncInputsFromState();
      saveActivePresetIfNeeded();
      renderPresetList();
      renderBoard();
    });
  });
  els.startAllBtn.addEventListener("click", () => {
    clearResultTimer();
    closeResultModal();
    activePlayerIndex = null;
    showAllPaths = true;
    renderBoard();
    scheduleAllResultPopup();
  });
  els.generateBtn.addEventListener("click", generateLadder);
  els.resultCloseBtn.addEventListener("click", closeResultModal);
  els.resultModal.addEventListener("click", (event) => {
    if (event.target === els.resultModal) closeResultModal();
  });

  syncInputsFromState();
  renderPresetList();
  generateLadder();

  return {
    onTabChange(isActive) {
      if (isActive) return;
      resetTransientRunState();
    }
  };
}


// FILE: .\v1.4\app\main.js
const tabConfigs = [
  { id: "tracker", template: trackerTemplate, init: initTrackerTab },
  { id: "income", template: incomeTemplate, init: initIncomeTab },
  { id: "bookmarks", template: bookmarksTemplate, init: initBookmarksTab },
  { id: "todo", template: todoTemplate, init: initTodoTab },
  { id: "lunch", template: lunchTemplate, init: initLunchTab },
  { id: "fortune", template: fortuneTemplate, init: initFortuneTab },
  { id: "ladder", template: ladderTemplate, init: initLadderTab }
];

function initHeroZodiacMark() {
  const heroMark = document.getElementById("heroMark");
  if (!heroMark) return;

  const zodiacMarks = ["🐵", "🐔", "🐶", "🐷", "🐭", "🐮", "🐯", "🐰", "🐲", "🐍", "🐴", "🐑"];
  const zodiacLabels = ["원숭이띠", "닭띠", "개띠", "돼지띠", "쥐띠", "소띠", "호랑이띠", "토끼띠", "용띠", "뱀띠", "말띠", "양띠"];
  const year = new Date().getFullYear();
  const index = ((year - 2016) % 12 + 12) % 12;

  heroMark.textContent = zodiacMarks[index];
  heroMark.setAttribute("title", `${year}년 ${zodiacLabels[index]}`);
  heroMark.setAttribute("aria-label", `${year}년 ${zodiacLabels[index]}`);
}

function buildWeatherIcon(condition = "sunny") {
  const icons = {
    sunny: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="12" fill="#fbbf24"/>
        <g stroke="#fbbf24" stroke-linecap="round" stroke-width="4">
          <path d="M32 6v8"/><path d="M32 50v8"/><path d="M6 32h8"/><path d="M50 32h8"/>
          <path d="M13 13l6 6"/><path d="M45 45l6 6"/><path d="M13 51l6-6"/><path d="M45 19l6-6"/>
        </g>
      </svg>
    `,
    cloud: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path fill="#cbd5e1" d="M22 48h22a10 10 0 0 0 1-20 14 14 0 0 0-27-2A9 9 0 0 0 22 48Z"/>
      </svg>
    `,
    rain: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path fill="#cbd5e1" d="M22 42h22a10 10 0 0 0 1-20 14 14 0 0 0-27-2A9 9 0 0 0 22 42Z"/>
        <g stroke="#60a5fa" stroke-linecap="round" stroke-width="4">
          <path d="M24 48l-2 8"/><path d="M34 48l-2 8"/><path d="M44 48l-2 8"/>
        </g>
      </svg>
    `,
    snow: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path fill="#cbd5e1" d="M22 42h22a10 10 0 0 0 1-20 14 14 0 0 0-27-2A9 9 0 0 0 22 42Z"/>
        <g fill="#e0f2fe">
          <circle cx="24" cy="52" r="3"/><circle cx="34" cy="54" r="3"/><circle cx="44" cy="52" r="3"/>
        </g>
      </svg>
    `,
    storm: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path fill="#cbd5e1" d="M22 42h22a10 10 0 0 0 1-20 14 14 0 0 0-27-2A9 9 0 0 0 22 42Z"/>
        <path fill="#fbbf24" d="M34 44h-8l4-8h-4l-6 12h8l-4 10 10-14Z"/>
      </svg>
    `,
    fog: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path fill="#cbd5e1" d="M22 36h22a10 10 0 0 0 1-20 14 14 0 0 0-27-2A9 9 0 0 0 22 36Z"/>
        <g stroke="#94a3b8" stroke-linecap="round" stroke-width="4">
          <path d="M16 46h32"/><path d="M20 54h24"/>
        </g>
      </svg>
    `
  };

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(icons[condition] || icons.sunny)}`;
}

function getWeatherVisual(weatherCode) {
  if ([0, 1].includes(weatherCode)) return { label: "맑음", icon: "sunny" };
  if ([2, 3].includes(weatherCode)) return { label: "구름 많음", icon: "cloud" };
  if ([45, 48].includes(weatherCode)) return { label: "안개", icon: "fog" };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return { label: "비", icon: "rain" };
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return { label: "눈", icon: "snow" };
  if ([95, 96, 99].includes(weatherCode)) return { label: "뇌우", icon: "storm" };
  return { label: "날씨", icon: "cloud" };
}

async function initWeatherWidget() {
  const summaryEl = document.getElementById("weatherSummary");
  const updatedAtEl = document.getElementById("weatherUpdatedAt");
  const tempEl = document.getElementById("weatherTemp");
  const iconEl = document.getElementById("weatherIcon");
  const refreshBtn = document.getElementById("weatherRefreshBtn");

  if (!summaryEl || !updatedAtEl || !tempEl || !iconEl || !refreshBtn) return;

  const formatUpdatedAt = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `업데이트 ${hours}:${minutes}`;
  };

  const setWeatherState = (summary, temperature = "--°", icon = "cloud", updatedAt = "") => {
    summaryEl.textContent = summary;
    tempEl.textContent = temperature;
    iconEl.src = buildWeatherIcon(icon);
    iconEl.alt = summary;
    updatedAtEl.textContent = formatUpdatedAt(updatedAt);
  };

  const setRefreshState = (disabled) => {
    refreshBtn.disabled = disabled;
  };

  const renderFromCache = () => {
    const cache = state.weatherCache;
    if (!cache) return false;

    setWeatherState(cache.summary, cache.temperature, cache.icon, cache.updatedAt);
    return true;
  };

  const loadWeather = async (forceRefresh = false) => {
    if (!forceRefresh && renderFromCache()) {
      return;
    }

    if (!navigator.geolocation) {
      setWeatherState("위치 허용 시 날씨 표시", "--°", "cloud");
      return;
    }

    try {
      setRefreshState(true);
      if (forceRefresh) {
        setWeatherState("날씨 새로고침 중...", tempEl.textContent, "cloud");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1800000
        });
      });

      const { latitude, longitude } = position.coords;
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current: "temperature_2m,weather_code",
        timezone: "auto"
      });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
      if (!response.ok) throw new Error(`weather-${response.status}`);

      const data = await response.json();
      const weatherCode = Number(data?.current?.weather_code ?? -1);
      const temperature = Math.round(Number(data?.current?.temperature_2m ?? 0));
      const visual = getWeatherVisual(weatherCode);
      const nextCache = {
        summary: `현재 위치 · ${visual.label}`,
        temperature: `${temperature}°`,
        icon: visual.icon,
        latitude,
        longitude,
        updatedAt: new Date().toISOString()
      };

      state.weatherCache = nextCache;
      persist();
      setWeatherState(nextCache.summary, nextCache.temperature, nextCache.icon, nextCache.updatedAt);
    } catch (error) {
      console.error(error);
      if (!renderFromCache()) {
        setWeatherState("날씨 불러오기 실패", "--°", "cloud");
      }
    } finally {
      setRefreshState(false);
    }
  };

  refreshBtn.addEventListener("click", () => loadWeather(true));

  if (!renderFromCache()) {
    await loadWeather(true);
  }
}

function getHomeGuideContent() {
  const ua = navigator.userAgent || "";
  const isEdge = /Edg\//.test(ua);
  const isChrome = /Chrome\//.test(ua) && !isEdge;
  const isFirefox = /Firefox\//.test(ua);
  if (isEdge) {
    return {
      description: "Edge 설정에서 시작 페이지를 직접 지정하면 브라우저를 켤 때 이 화면이 바로 열려요.",
      steps: [
        "Edge 우측 상단 메뉴를 열고 설정으로 들어가세요.",
        "시작, 홈 및 새 탭 페이지에서 브라우저 시작 시 항목을 찾으세요.",
        "\"특정 페이지 열기\"를 선택하고 아래 주소를 추가하세요."
      ]
    };
  }
  if (isChrome) {
    return {
      description: "Chrome에서는 시작 그룹에 이 주소를 넣으면 브라우저 실행 직후 이 페이지가 열려요.",
      steps: [
        "Chrome 우측 상단 메뉴를 열고 설정으로 들어가세요.",
        "시작 그룹에서 \"특정 페이지 또는 페이지 모음 열기\"를 선택하세요.",
        "새 페이지 추가를 눌러 아래 주소를 붙여넣으세요."
      ]
    };
  }
  if (isFirefox) {
    return {
      description: "Firefox에서는 홈 설정에 이 주소를 넣으면 시작 페이지로 쓸 수 있어요.",
      steps: [
        "Firefox 메뉴를 열고 설정으로 들어가세요.",
        "홈 탭에서 홈페이지 및 새 창 항목을 찾으세요.",
        "\"사용자 지정 URL\"을 선택하고 아래 주소를 붙여넣으세요."
      ]
    };
  }
  return {
    description: "브라우저마다 이름은 조금 다르지만, 보통 설정의 시작 페이지 또는 홈 항목에서 이 주소를 등록하면 됩니다.",
    steps: [
      "브라우저 설정을 여세요.",
      "시작 페이지, 홈, 또는 브라우저 시작 시 항목을 찾으세요.",
      "아래 주소를 복사해서 시작 페이지로 등록하세요."
    ]
  };
}

function initHomeGuide() {
  const openBtn = document.getElementById("setHomeGuideBtn");
  const modal = document.getElementById("homeGuideModal");
  const closeBtn = document.getElementById("homeGuideCloseBtn");
  const descriptionEl = document.getElementById("homeGuideDescription");
  const stepsEl = document.getElementById("homeGuideSteps");
  const urlInput = document.getElementById("homeGuideUrl");
  const copyBtn = document.getElementById("copyHomeUrlBtn");
  const toastEl = document.getElementById("homeGuideToast");
  if (!openBtn || !modal || !closeBtn || !descriptionEl || !stepsEl || !urlInput || !copyBtn || !toastEl) return;
  let toastTimer = null;
  const pageUrl = window.location.href;
  const content = getHomeGuideContent();
  descriptionEl.textContent = content.description;
  stepsEl.innerHTML = content.steps.map((step) => `<li>${step}</li>`).join("");
  urlInput.value = pageUrl;
  const showToast = (text) => {
    if (toastTimer) clearTimeout(toastTimer);
    toastEl.textContent = text;
    toastEl.classList.add("show");
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 1800);
  };
  const openModal = () => {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  };
  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };
  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      urlInput.select();
      showToast("시작페이지 주소를 복사했어요.");
    } catch (error) {
      console.error(error);
      urlInput.focus();
      urlInput.select();
      showToast("복사가 막혀 있어요. 주소를 직접 복사해 주세요.");
    }
  });
}

async function bootstrap() {
  const host = document.getElementById("tabHost");
  initHeroZodiacMark();
  placeGlobalLunchAlertNearTitle();
  moveHomeGuideButtonToTabBar();
  initHomeGuide();
  const tabs = await loadTabs(host, tabConfigs, { state, persist });
  ["tracker", "todo", "lunch"].forEach((tabId) => {
    const tab = tabs.find((entry) => entry.id === tabId);
    if (tab) ensureTabInitialized(tab);
  });
  bindGlobalAlertBadges(tabs, state, persist);
  const validTabIds = new Set(tabConfigs.map((tab) => tab.id));
  const initialTab = validTabIds.has(state.activeTab) ? state.activeTab : "tracker";

  bindTabButtons((tabId) => {
    state.activeTab = tabId;
    persist();
    setActiveTab(tabs, tabId);
  });

  state.activeTab = initialTab;
  persist();
  setActiveTab(tabs, initialTab);
  initWeatherWidget();
}

bootstrap().catch((error) => {
  console.error(error);
  document.getElementById("tabHost").innerHTML = `
    <section class="card">
      <h2>화면을 불러오지 못했어요</h2>
      <p class="hint">파일 경로와 스크립트 구성을 다시 확인해 주세요.</p>
    </section>
  `;
});

})();

