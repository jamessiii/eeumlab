import { state, persist, storageReady } from "./core/state.js";
import { bindTabButtons, loadTabs, setActiveTab } from "./core/tabs.js";
import { initTrackerTab } from "./tracker/tracker.js";
import { trackerTemplate } from "./tracker/view.js";
import { initIncomeTab } from "./income/income.js";
import { incomeTemplate } from "./income/view.js";
import { initBookmarksTab } from "./bookmarks/bookmarks.js";
import { bookmarksTemplate } from "./bookmarks/view.js";
import { initLunchTab } from "./lunch/lunch.js";
import { lunchTemplate } from "./lunch/view.js";
import { initFortuneTab } from "./fortune/fortune.js";
import { fortuneTemplate } from "./fortune/view.js";
import { initLadderTab } from "./ladder/ladder.js";
import { ladderTemplate } from "./ladder/view.js";

const tabConfigs = [
  { id: "tracker", template: trackerTemplate, init: initTrackerTab },
  { id: "income", template: incomeTemplate, init: initIncomeTab },
  { id: "bookmarks", template: bookmarksTemplate, init: initBookmarksTab },
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
  await storageReady;
  initHeroZodiacMark();
  initHomeGuide();
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
