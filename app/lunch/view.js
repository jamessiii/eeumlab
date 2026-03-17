export const lunchTemplate = `
<section class="card lunch-card">
  <div class="lunch-header">
    <div>
      <h2>점메추</h2>
      <p class="hint">현재 위치를 기준으로 근처 식당을 불러오고, 선택한 카테고리에 맞는 곳만 보여줘</p>
    </div>
    <div class="lunch-actions">
      <button id="lunchDrawBtn" class="btn btn-primary">오늘 메뉴 뽑기</button>
      <button id="lunchFavoritesOnlyBtn" class="btn btn-muted">즐겨찾기만 보기</button>
      <button id="lunchRefreshBtn" class="btn btn-muted">위치 새로고침</button>
      <button id="lunchLocateBtn" class="btn btn-primary">현재 위치로 불러오기</button>
    </div>
  </div>
  <div id="lunchLocationStatus" class="lunch-location-status">위치 권한을 허용하면 근처 식당을 실시간으로 불러와요.</div>
  <div class="lunch-filter-row">
    <label class="field lunch-search-field">
      <span>결과 내 검색</span>
      <input id="lunchSearchInput" type="search" placeholder="식당명, 메뉴, 주소로 검색" />
    </label>
  </div>
  <div id="lunchCategoryBar" class="lunch-category-bar" role="tablist" aria-label="점심 카테고리"></div>
  <div id="lunchResultMeta" class="lunch-result-meta"></div>
  <div id="lunchList" class="lunch-list"></div>
  <div id="lunchPagination" class="lunch-pagination"></div>

  <div id="lunchDrawModal" class="lunch-draw-modal" aria-hidden="true">
    <div class="lunch-draw-panel">
      <button id="lunchDrawCloseBtn" type="button" class="btn btn-muted lunch-draw-close" aria-label="점메추 뽑기 닫기">✕</button>
      <div class="bookmark-modal-kicker">오늘의 점심</div>
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
        <button id="lunchDrawMapBtn" type="button" class="btn btn-muted" hidden>지도 보기</button>
      </div>
    </div>
  </div>
</section>
`;
