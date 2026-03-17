export const bookmarksTemplate = `
<section class="card bookmarks-card">
  <div class="bookmarks-header">
    <div>
      <h2>북마크</h2>
      <p class="hint">브라우저 북마크를 드래그 앤 드롭으로 가져와 추가할 수 있어요!</p>
    </div>
    <div class="bookmarks-view-toggle" aria-label="북마크 보기 방식">
      <button id="bookmarkCardViewBtn" type="button" class="bookmark-view-btn" aria-pressed="true" title="카드로 보기">◫</button>
      <button id="bookmarkListViewBtn" type="button" class="bookmark-view-btn" aria-pressed="false" title="목록으로 보기">☰</button>
    </div>
  </div>
  <div class="bookmark-drop-hint" aria-hidden="true">
    <strong>북마크 추가!</strong>
    <span>링크나 HTML을 여기 놓으면 새 북마크로 추가할 수 있어요.</span>
  </div>
  <div id="bookmarkList" class="bookmark-list"></div>

  <div id="bookmarkModal" class="bookmark-modal" aria-hidden="true">
    <div class="bookmark-modal-panel">
      <button id="bookmarkModalCloseBtn" type="button" class="btn btn-muted bookmark-modal-close" aria-label="북마크 팝업 닫기">✕</button>
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
        <span>태그</span>
        <input id="bookmarkTagsInput" type="text" placeholder="예: 업무, 포털, 자주씀" />
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
</section>
`;
