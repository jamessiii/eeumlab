export const ladderTemplate = `
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
