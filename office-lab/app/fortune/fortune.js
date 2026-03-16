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

export function initFortuneTab(root, { state, persist }) {
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
