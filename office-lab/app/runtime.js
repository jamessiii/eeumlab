(function () {
'use strict';
// FILE: .\v1.4\app\core\data.js
const PAID_WORK_SECONDS_PER_DAY = 7 * 60 * 60;
const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";
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
  lunchLastFetchAt: "",
  lunchLastLocation: null,
  lunchCachedPlaces: [],
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
    <div class="button-row">
      <button id="startBtn" class="btn btn-start">지금 출근</button>
      <button id="stopBtn" class="btn btn-stop">지금 퇴근</button>
      <button id="editTodayBtn" class="btn btn-primary">오늘 기록 수정</button>
    </div>
    <div class="summary-grid">
      <article class="summary-card">
        <div class="summary-label">오늘 번 돈</div>
        <div id="todayMoney" class="summary-value">₩ 0</div>
        <div id="todaySub" class="summary-sub">오늘 근무시간 00:00:00</div>
      </article>
      <article class="summary-card">
        <div class="summary-label">이번 달 번 돈</div>
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
    <p class="hint">하루 8시간 근무, 점심 1시간 제외 기준으로 실제 반영 시급은 하루 7시간으로 계산돼.</p>
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
    startBtn: $("#startBtn", root),
    stopBtn: $("#stopBtn", root),
    editTodayBtn: $("#editTodayBtn", root),
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

  function syncInputsFromState() {
    els.monthlySalary.value = formatNumber(state.monthlySalary);
    els.monthlyGoal.value = state.monthlyGoal;
    els.leaveAllowance.value = state.leaveAllowance;
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

  function animateSummaryMoneyFields(targets) {
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
    const duration = 1900;

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

  const getHourlyWage = () => getDailyWage() / 7;
  const getPerSecondWage = () => getDailyWage() / PAID_WORK_SECONDS_PER_DAY;

  function getDayStatus(date, entry) {
    if (isWeekend(date)) return "주말";
    if (isHoliday(date, entry)) return getHolidayLabel(date, entry) || "공휴일";
    if (entry.leaveType === "full") return isFuture(date) ? "휴가 예정" : "휴가";
    if (entry.leaveType === "half") return isFuture(date) ? "반차 예정" : "반차";
    if (entry.leaveType === "quarter") return isFuture(date) ? "반반차 예정" : "반반차";
    if (entry.running && isSameDay(date, getToday())) return "출근 중";
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
      if (entry.running) {
        const startSeconds = timeToSeconds(entry.startTime);
        if (startSeconds != null) {
          const now = getNow();
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Math.floor(startSeconds / 3600), Math.floor((startSeconds % 3600) / 60), 0, 0);
          const raw = Math.floor((now.getTime() - start.getTime()) / 1000);
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

    if (salaryChanged) {
      if (deferSalaryDrivenSummaryAnimation || isWaitingForSalaryFeedback) {
        pendingSummaryTargets = moneyTargets;
      } else {
        lastAnimatedSalary = state.monthlySalary;
        animateSummaryMoneyFields(moneyTargets);
      }
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
    updateStatusPill();
  }

  function updateStatusPill() {
    const result = getDayResult(getToday());
    const entry = getEntry(getDateKey(getToday()));
    els.statusPill.className = "status-pill";
    if (entry.leaveType !== "none") {
      els.statusPill.classList.add("leave");
      els.statusText.textContent = result.status;
    } else if (entry.running) {
      els.statusPill.classList.add("working");
      els.statusText.textContent = "출근 상태";
    } else if (result.paidSeconds >= PAID_WORK_SECONDS_PER_DAY) {
      els.statusPill.classList.add("done");
      els.statusText.textContent = "오늘 근무 완료";
    } else {
      els.statusPill.classList.add("off");
      els.statusText.textContent = "퇴근 상태";
    }
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

      const tag = result.weekend ? "주말" : result.holiday ? getHolidayLabel(date, result.entry) || "공휴일" : result.entry.leaveType === "full" ? (isFuture(date) ? "휴가 예정" : "휴가") : result.entry.leaveType === "half" ? (isFuture(date) ? "반차 예정" : "반차") : result.entry.leaveType === "quarter" ? (isFuture(date) ? "반반차 예정" : "반반차") : result.entry.running ? "출근 중" : result.paidSeconds > 0 ? "근무 반영" : "";
      const tagClass = result.weekend ? "tag-weekend" : result.holiday ? "tag-holiday" : result.entry.leaveType === "full" ? "tag-leave-full" : result.entry.leaveType === "half" ? "tag-leave-half" : result.entry.leaveType === "quarter" ? "tag-leave-quarter" : result.entry.running ? "tag-running" : result.paidSeconds > 0 ? "tag-worked" : "";
      const timeText = result.entry.startTime || result.entry.endTime ? `${result.entry.startTime || "--:--"} ~ ${result.entry.endTime || (result.entry.running ? "진행중" : "--:--")}` : "";
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
      const hasWork = Boolean(result.entry.running || result.entry.startTime || result.entry.endTime);
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
        <td>${result.entry.endTime || (result.entry.running ? "진행중" : "-")}</td>
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

  function startWorkNow() {
    const entry = getEntry(getDateKey(getToday()));
    const now = getNow();
    entry.leaveType = "none";
    entry.customHoliday = false;
    entry.running = true;
    entry.liveStartTimestamp = Date.now();
    if (!entry.startTime) entry.startTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    entry.endTime = "";
    persist();
    renderAll();
  }

  function stopWorkNow() {
    const entry = getEntry(getDateKey(getToday()));
    const now = getNow();
    entry.running = false;
    entry.liveStartTimestamp = null;
    entry.endTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (!entry.startTime) entry.startTime = DEFAULT_START;
    persist();
    renderAll();
  }

  function autoStopWorkIfComplete() {
    const entry = getEntry(getDateKey(getToday()));
    if (!entry.running) return false;
    if (getDayResult(getToday()).paidSeconds < PAID_WORK_SECONDS_PER_DAY) return false;
    stopWorkNow();
    return true;
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
  els.startBtn.addEventListener("click", startWorkNow);
  els.stopBtn.addEventListener("click", stopWorkNow);
  els.editTodayBtn.addEventListener("click", () => openDayModal(getDateKey(getToday())));
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
    if (event.key === "Escape") closeDayModal();
  });

  syncInputsFromState();
  renderAll();
  const timer = setInterval(renderSummary, 1000);
  return {
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


// FILE: .\v1.4\app\lunch\view.js
const lunchTemplate = `
<section class="card lunch-card">
  <div class="lunch-header">
    <div>
      <h2>점메추</h2>
      <p class="hint">현재 위치를 기준으로 근처 식당을 불러오고, 선택한 카테고리에 맞는 곳만 보여줘</p>
    </div>
    <div class="lunch-actions">
      <button id="lunchFavoritesOnlyBtn" class="btn btn-muted">즐겨찾기만 보기</button>
      <button id="lunchRefreshBtn" class="btn btn-muted">위치 새로고침</button>
      <button id="lunchLocateBtn" class="btn btn-primary">현재 위치로 불러오기</button>
    </div>
  </div>
  <div id="lunchLocationStatus" class="lunch-location-status">위치 권한을 허용하면 근처 식당을 실시간으로 불러와요.</div>
  <div class="lunch-filter-row">
    <!-- Kakao Local API key input can be restored here later if the project switches back from Overpass. -->
    <label class="field lunch-search-field">
      <span>결과 내 검색</span>
      <input id="lunchSearchInput" type="search" placeholder="식당명, 메뉴, 주소로 검색" />
    </label>
  </div>
  <div id="lunchCategoryBar" class="lunch-category-bar" role="tablist" aria-label="점심 카테고리"></div>
  <div id="lunchResultMeta" class="lunch-result-meta"></div>
  <div id="lunchList" class="lunch-list"></div>
  <div id="lunchPagination" class="lunch-pagination"></div>
</section>
`;


// FILE: .\v1.4\app\lunch\lunch.js
const PAGE_SIZE = 10;
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
    locateBtn: root.querySelector("#lunchLocateBtn"),
    refreshBtn: root.querySelector("#lunchRefreshBtn"),
    favoritesOnlyBtn: root.querySelector("#lunchFavoritesOnlyBtn"),
    searchInput: root.querySelector("#lunchSearchInput"),
    locationStatus: root.querySelector("#lunchLocationStatus"),
    categoryBar: root.querySelector("#lunchCategoryBar"),
    resultMeta: root.querySelector("#lunchResultMeta"),
    list: root.querySelector("#lunchList"),
    pagination: root.querySelector("#lunchPagination")
  };

  let isFetching = false;
  let activePage = 1;
  let allPlaces = [];
  let didAutoLoad = false;
  let categoryBarInitialized = false;

  function ensureLunchState() {
    state.lunchCategory = lunchCategories.includes(state.lunchCategory) ? state.lunchCategory : CATEGORY_KOREAN;
    state.lunchSearchQuery = state.lunchSearchQuery || "";
    state.lunchFavorites = Array.isArray(state.lunchFavorites) ? state.lunchFavorites : [];
    state.lunchFavoritesOnly = Boolean(state.lunchFavoritesOnly);
    state.lunchCachedPlaces = Array.isArray(state.lunchCachedPlaces) ? state.lunchCachedPlaces : [];
    state.lunchLastLocation = state.lunchLastLocation && typeof state.lunchLastLocation === "object" ? state.lunchLastLocation : null;
    state.lunchLastFetchAt = state.lunchLastFetchAt || "";
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
    return `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=18/${place.lat}/${place.lon}`;
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
    if (!state.lunchCachedPlaces.length) return false;

    allPlaces = [...state.lunchCachedPlaces];
    setStatus(
      state.lunchLastLocation
        ? `저장된 식당 데이터를 먼저 표시하고 있어요. 마지막 업데이트 ${formatUpdatedAt() || "--:--"}`
        : "저장된 식당 데이터를 표시하고 있어요.",
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
    const previousPositions = captureItemPositions();
    renderCategoryBar();

    if (els.searchInput.value !== state.lunchSearchQuery) {
      els.searchInput.value = state.lunchSearchQuery;
    }

    els.favoritesOnlyBtn.classList.toggle("btn-primary", state.lunchFavoritesOnly);
    els.favoritesOnlyBtn.classList.toggle("btn-muted", !state.lunchFavoritesOnly);
    els.favoritesOnlyBtn.textContent = state.lunchFavoritesOnly ? "전체 보기" : "즐겨찾기만 보기";

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
        <div class="lunch-item-top">
          <div>
            <h3>${place.tags.name}</h3>
            <div class="lunch-menu">${place.cuisineLabel}</div>
          </div>
          <div class="lunch-item-actions">
            <span class="lunch-badge">${state.lunchCategory === CATEGORY_ALL ? getPlaceCategoryLabel(place) : state.lunchCategory}</span>
            <button type="button" class="lunch-favorite-btn${isFavorite(place.id) ? " active" : ""}" data-favorite-id="${place.id}" aria-label="즐겨찾기">${isFavorite(place.id) ? "★" : "☆"}</button>
          </div>
        </div>
        <p class="lunch-copy">${place.address}</p>
        <div class="lunch-meta">
          <span>${formatDistance(place.distanceMeters)}</span>
          <span>${place.tags.amenity || "eatery"}</span>
        </div>
        <div class="lunch-links">
          <a href="${getOpenStreetMapLink(place)}" target="_blank" rel="noreferrer">지도 보기</a>
        </div>
      </article>
    `).join("");

    els.list.querySelectorAll("[data-favorite-id]").forEach((button) => {
      button.addEventListener("click", () => toggleFavorite(button.dataset.favoriteId));
    });

    animateListReorder(previousPositions);
    renderPagination(totalCount);
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

  restoreCachedPlaces();
  render();

  return {
    onTabChange(isActive) {
      if (isActive && !didAutoLoad) {
        didAutoLoad = true;
        if (!allPlaces.length) {
          loadNearbyRestaurants(false);
        }
      }
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
    clearResultTimer();
    closeResultModal();
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
    const colSpacing = compact ? 74 : 96;
    const rowGap = compact ? 44 : 52;
    const paddingX = compact ? 26 : 48;
    const railTop = 18;
    const railBottom = railTop + ladderData.rows.length * rowGap;
    const svgWidth = paddingX * 2 + colSpacing * (playerCount - 1);
    const svgHeight = railBottom + 18;
    const xFor = (index) => paddingX + colSpacing * index;
    const yForRow = (rowIndex) => railTop + rowGap * rowIndex + rowGap / 2;

    const topHtml = ladderData.names.map((name, index) => `
      <button type="button" class="ladder-node top${activePlayerIndex === index && !showAllPaths ? " pending-active" : ""}${activePlayerIndex === index && activeEndsFail && !showAllPaths ? " fail-delayed" : ""}${activePlayerIndex === index && activeEndsSuccess && !showAllPaths ? " success-delayed" : ""}${showAllPaths && failPlayerIndexes.has(index) ? " fail-delayed" : ""}${showAllPaths && !failPlayerIndexes.has(index) ? " success-delayed" : ""}" data-player-index="${index}" data-node-position="top">
        <span class="ladder-node-label">참가자</span>
        ${renderNodeValue("player", index, name)}
      </button>
    `).join("");

    const railsSvg = ladderData.names.map((_, index) => `
      ${orientation === "vertical"
        ? `<line class="ladder-svg-rail" x1="${xFor(index)}" y1="${railTop}" x2="${xFor(index)}" y2="${railBottom}"></line>`
        : `<line class="ladder-svg-rail" x1="${railTop}" y1="${xFor(index)}" x2="${railBottom}" y2="${xFor(index)}"></line>`}
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
        pathParts.push(`M ${pointFor(trace.steps[0].col, railTop)}`);
        trace.steps.slice(1).forEach((step) => {
          const y = yForRow(step.row);
          pathParts.push(`L ${pointFor(step.col, y)}`);
          if (typeof step.horizontalTo === "number") {
            pathParts.push(`L ${pointFor(step.horizontalTo, y)}`);
          }
        });
        pathParts.push(`L ${pointFor(trace.endIndex, railBottom)}`);
      } else {
        pathParts.push(`M ${pointFor(trace.endIndex, railBottom)}`);
        for (let i = trace.steps.length - 1; i >= 1; i -= 1) {
          const step = trace.steps[i];
          const y = yForRow(step.row);
          const currentCol = typeof step.horizontalTo === "number" ? step.horizontalTo : step.col;
          pathParts.push(`L ${pointFor(currentCol, y)}`);
          if (typeof step.horizontalTo === "number") {
            pathParts.push(`L ${pointFor(step.col, y)}`);
          }
        }
        pathParts.push(`L ${pointFor(trace.steps[0].col, railTop)}`);
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

    els.board.innerHTML = orientation === "vertical" ? `
      <div class="ladder-stage${compact ? " compact" : ""}">
        <div class="ladder-node-row" style="grid-template-columns:repeat(${playerCount}, minmax(0, 1fr));">
          ${topHtml}
        </div>
        <div class="ladder-diagram">
          <svg class="ladder-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            ${railsSvg}
            ${bridgesSvg}
            ${activePath}
          </svg>
        </div>
        <div class="ladder-node-row" style="grid-template-columns:repeat(${ladderData.results.length}, minmax(0, 1fr));">
          ${bottomHtml}
        </div>
      </div>
    ` : `
      <div class="ladder-stage horizontal${compact ? " compact" : ""}">
        <div class="ladder-side-column" style="grid-template-rows:repeat(${playerCount}, minmax(0, 1fr));">
          ${topHtml}
        </div>
        <div class="ladder-diagram horizontal">
          <svg class="ladder-svg horizontal" viewBox="0 0 ${svgHeight} ${svgWidth}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            ${railsSvg}
            ${bridgesSvg}
            ${activePath}
          </svg>
        </div>
        <div class="ladder-side-column" style="grid-template-rows:repeat(${ladderData.results.length}, minmax(0, 1fr));">
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

  return {};
}


// FILE: .\v1.4\app\main.js
const tabConfigs = [
  { id: "tracker", template: trackerTemplate, init: initTrackerTab },
  { id: "income", template: incomeTemplate, init: initIncomeTab },
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
  const tempEl = document.getElementById("weatherTemp");
  const iconEl = document.getElementById("weatherIcon");
  const refreshBtn = document.getElementById("weatherRefreshBtn");

  if (!summaryEl || !tempEl || !iconEl || !refreshBtn) return;

  const setWeatherState = (summary, temperature = "--°", icon = "cloud") => {
    summaryEl.textContent = summary;
    tempEl.textContent = temperature;
    iconEl.src = buildWeatherIcon(icon);
    iconEl.alt = summary;
  };

  const setRefreshState = (disabled) => {
    refreshBtn.disabled = disabled;
  };

  const renderFromCache = () => {
    const cache = state.weatherCache;
    if (!cache) return false;

    setWeatherState(cache.summary, cache.temperature, cache.icon);
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
      setWeatherState(nextCache.summary, nextCache.temperature, nextCache.icon);
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

async function bootstrap() {
  const host = document.getElementById("tabHost");
  initHeroZodiacMark();
  const tabs = await loadTabs(host, tabConfigs, { state, persist });
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

