import { lunchCategories } from "../core/data.js";

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

export function initLunchTab(root, { state, persist }) {
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
