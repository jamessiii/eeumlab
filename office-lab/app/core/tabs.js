export async function loadTabs(host, tabConfigs, appContext) {
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

export function setActiveTab(tabs, activeTabId) {
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

export function bindTabButtons(onSelect) {
  ensureTabIndicator();
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => onSelect(button.dataset.tab));
  });
  window.addEventListener("resize", () => {
    const activeButton = document.querySelector(".tab-btn.active");
    if (activeButton) updateTabIndicator(activeButton.dataset.tab);
  });
}
