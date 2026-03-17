const MAX_BOOKMARKS = 12;
const DEFAULT_BOOKMARK_COLOR = "#93c5fd";
const DEFAULT_BOOKMARKS = [
  { id: "bookmark-default-naver", name: "네이버", url: "https://www.naver.com/", note: "포털", imageUrl: "", color: "", tags: ["포털"] },
  { id: "bookmark-default-google", name: "구글", url: "https://www.google.com/", note: "검색", imageUrl: "", color: "", tags: ["검색"] }
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function ensureBookmarksState(state) {
  state.bookmarks = Array.isArray(state.bookmarks)
    ? state.bookmarks
        .filter((item) => item && typeof item === "object")
        .slice(0, MAX_BOOKMARKS)
        .map((item) => ({
          id: String(item.id || `bookmark-${Date.now()}`),
          name: String(item.name || "").trim(),
          url: String(item.url || "").trim(),
          note: String(item.note || "").trim(),
          imageUrl: String(item.imageUrl || "").trim(),
          color: String(item.color || "").trim(),
          tags: normalizeTags(item.tags)
        }))
    : [];
  state.bookmarkViewMode = state.bookmarkViewMode === "list" ? "list" : "card";
}

function normalizeTags(rawValue) {
  const values = Array.isArray(rawValue)
    ? rawValue
    : String(rawValue || "").split(",");

  return values
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 6);
}

function tagsToInputValue(tags) {
  return normalizeTags(tags).join(", ");
}

function renderTagBadges(tags) {
  const items = normalizeTags(tags);
  if (!items.length) return "";
  return `<div class="bookmark-tags">${items.map((tag) => `<span class="bookmark-tag" style="${getBookmarkTagStyle(tag)}">${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function getBookmarkTagStyle(tag) {
  let hash = 0;
  String(tag || "").split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  return `--bookmark-tag-index:${Math.abs(hash) % 6};`;
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

function getHostname(url) {
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

  const uriList = String(dataTransfer.getData("text/uri-list") || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#"));
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
    name: title || getHostname(url) || "북마크"
  };
}

function getFaviconCandidates(url) {
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

function getInitial(name, url) {
  const base = String(name || getHostname(url) || "B").trim();
  return base.charAt(0).toUpperCase();
}

function normalizeColor(rawValue) {
  const trimmed = String(rawValue || "").trim();
  if (!trimmed) return "";
  const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : "";
}

function hexToRgb(hex) {
  const normalized = normalizeColor(hex);
  if (!normalized) return null;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16)
  };
}

function mixChannel(value, target, ratio) {
  return Math.round(value + (target - value) * ratio);
}

function toRgbString(rgb) {
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

function getBookmarkThemeStyle(bookmark) {
  const base = hexToRgb(bookmark.color);
  if (!base) return "";
  const soft = {
    r: mixChannel(base.r, 255, 0.84),
    g: mixChannel(base.g, 255, 0.84),
    b: mixChannel(base.b, 255, 0.84)
  };
  const border = {
    r: mixChannel(base.r, 255, 0.58),
    g: mixChannel(base.g, 255, 0.58),
    b: mixChannel(base.b, 255, 0.58)
  };
  return `--bookmark-accent:${toRgbString(base)};--bookmark-soft:${toRgbString(soft)};--bookmark-border:${toRgbString(border)};`;
}

export function initBookmarksTab(root, { state, persist }) {
  const panel = root.querySelector(".bookmarks-card") || root;
  const els = {
    list: panel.querySelector("#bookmarkList"),
    cardViewBtn: panel.querySelector("#bookmarkCardViewBtn"),
    listViewBtn: panel.querySelector("#bookmarkListViewBtn"),
    modal: panel.querySelector("#bookmarkModal"),
    modalTitle: panel.querySelector("#bookmarkModalTitle"),
    modalCloseBtn: panel.querySelector("#bookmarkModalCloseBtn"),
    nameInput: panel.querySelector("#bookmarkNameInput"),
    urlInput: panel.querySelector("#bookmarkUrlInput"),
    imageUrlInput: panel.querySelector("#bookmarkImageUrlInput"),
    colorInput: panel.querySelector("#bookmarkColorInput"),
    colorResetBtn: panel.querySelector("#bookmarkColorResetBtn"),
    noteInput: panel.querySelector("#bookmarkNoteInput"),
    tagsInput: panel.querySelector("#bookmarkTagsInput"),
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
  let didDragReorder = false;
  let dropHoverDepth = 0;

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
    els.tagsInput.value = tagsToInputValue(draft?.tags);
    els.error.textContent = "";
    els.deleteBtn.hidden = !bookmark;
    els.modal.classList.add("open");
    els.modal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => els.nameInput.focus());
  }

  function closeModal() {
    editingBookmarkId = null;
    els.modal.classList.remove("open");
    els.modal.setAttribute("aria-hidden", "true");
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
    const color = els.colorInput.dataset.isDefault === "true"
      ? ""
      : normalizeColor(els.colorInput.value);
    const note = String(els.noteInput.value || "").trim();
    const tags = normalizeTags(els.tagsInput.value);

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
      state.bookmarks = state.bookmarks.map((item) => (
        item.id === editingBookmarkId
          ? { ...item, name, url, note, imageUrl, color, tags }
          : item
      ));
    } else {
      if (state.bookmarks.length >= MAX_BOOKMARKS) {
        els.error.textContent = `북마크는 최대 ${MAX_BOOKMARKS}개까지 저장할 수 있어요.`;
        return;
      }

      state.bookmarks = [
        ...state.bookmarks,
        { id: `bookmark-${Date.now()}`, name, url, note, imageUrl, color, tags }
      ];
    }

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

  function clearExternalDropState() {
    dropHoverDepth = 0;
    panel.classList.remove("drop-target");
  }

  function handleExternalBookmarkDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    clearExternalDropState();

    const dropped = parseDroppedBookmarkData(event.dataTransfer);
    if (!dropped) return;

    ensureBookmarksState(state);
    const existing = state.bookmarks.find((item) => item.url === dropped.url);
    if (existing) {
      openModal(existing.id);
      els.error.textContent = "이미 저장된 북마크예요.";
      return;
    }

    openModal(null, dropped);
  }

  function bindFaviconFallback() {
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
    els.cardViewBtn?.setAttribute("aria-pressed", String(state.bookmarkViewMode === "card"));
    els.listViewBtn?.setAttribute("aria-pressed", String(state.bookmarkViewMode === "list"));
    const bookmarkCards = state.bookmarks.map((bookmark) => {
      const hostname = getHostname(bookmark.url);
      const faviconCandidates = getFaviconCandidates(bookmark.url);
      return `
        <article class="bookmark-item" data-bookmark-open="${bookmark.id}" data-bookmark-id="${bookmark.id}" draggable="true" style="${getBookmarkThemeStyle(bookmark)}">
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
              <div class="bookmark-badge">${escapeHtml(getInitial(bookmark.name, bookmark.url))}</div>
            </div>
            <div class="bookmark-item-actions">
              <button type="button" class="bookmark-icon-btn" data-bookmark-edit="${bookmark.id}" aria-label="북마크 수정">✎</button>
            </div>
          </div>
          <h3>${escapeHtml(bookmark.name)}</h3>
          ${renderTagBadges(bookmark.tags)}
          <div class="bookmark-host">${escapeHtml(hostname || bookmark.url)}</div>
          <p class="bookmark-note">${escapeHtml(bookmark.note || "새 탭으로 열기")}</p>
        </article>
      `;
    }).join("");

    const addCard = state.bookmarks.length < MAX_BOOKMARKS ? `
      <button type="button" class="bookmark-item bookmark-item-add" id="bookmarkAddBtn" aria-label="북마크 추가">
        <span class="bookmark-add-plus">+</span>
        <span class="bookmark-add-text">북마크 추가</span>
      </button>
    ` : "";

    els.list.innerHTML = bookmarkCards + addCard;

    els.list.querySelector("#bookmarkAddBtn")?.addEventListener("click", () => openModal());
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
          reorderBookmarks(draggedBookmarkId, card.dataset.bookmarkId);
        }
      });
    });
    els.list.querySelectorAll("[data-bookmark-edit]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openModal(button.dataset.bookmarkEdit);
      });
    });
    bindFaviconFallback();
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
  els.modal.addEventListener("click", (event) => {
    if (event.target === els.modal) closeModal();
  });
  panel.addEventListener("dragenter", (event) => {
    if (draggedBookmarkId) return;
    if (!hasBookmarkDropPayload(event.dataTransfer)) return;
    dropHoverDepth += 1;
    panel.classList.add("drop-target");
  });
  panel.addEventListener("dragover", (event) => {
    if (draggedBookmarkId) return;
    if (!hasBookmarkDropPayload(event.dataTransfer)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    panel.classList.add("drop-target");
  });
  panel.addEventListener("dragleave", () => {
    if (draggedBookmarkId) return;
    dropHoverDepth = Math.max(0, dropHoverDepth - 1);
    if (!dropHoverDepth) {
      panel.classList.remove("drop-target");
    }
  });
  panel.addEventListener("drop", (event) => {
    if (draggedBookmarkId) return;
    handleExternalBookmarkDrop(event);
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
