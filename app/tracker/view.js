export const trackerTemplate = `
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
    <div class="form-grid tracker-time-grid">
      <label class="field">
        <span>출근시간</span>
        <input id="todayStartTime" type="time" />
      </label>
      <label class="field">
        <span>퇴근시간</span>
        <input id="todayEndTime" type="time" />
      </label>
      <div class="field tracker-action-field">
        <button id="workToggleBtn" class="btn btn-start tracker-action-btn">지금 출근</button>
      </div>
    </div>
    <div class="summary-grid">
      <article class="summary-card">
        <div class="summary-label">오늘 회사에 끼친 손해</div>
        <div id="todayMoney" class="summary-value">₩ 0</div>
        <div id="todaySub" class="summary-sub">오늘 근무시간 00:00:00</div>
      </article>
      <article class="summary-card">
        <div class="summary-label">이번 달 회사에 끼친 손해</div>
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
    <p class="hint">하루 8시간 근무, 점심 1시간 제외 기준으로 실제 반영 시급은 하루 8시간으로 계산돼.</p>
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
<div id="workConfirmModal" class="tracker-confirm-modal" aria-hidden="true">
  <div class="tracker-confirm-panel">
    <div class="tracker-confirm-kicker">출퇴근 확인</div>
    <h3 id="workConfirmTitle" class="tracker-confirm-title">처리할까요?</h3>
    <p id="workConfirmText" class="tracker-confirm-text"></p>
    <div class="tracker-confirm-actions">
      <button id="workConfirmCancelBtn" type="button" class="btn btn-muted">취소</button>
      <button id="workConfirmOkBtn" type="button" class="btn btn-primary">확인</button>
    </div>
  </div>
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
