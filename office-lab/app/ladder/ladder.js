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

export function initLadderTab(root, { state, persist }) {
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
