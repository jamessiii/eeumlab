import { DEFAULT_END, DEFAULT_START, PAID_WORK_SECONDS_PER_DAY } from "../core/data.js";
import { $, formatLeaveDays, formatMoney, formatNumber, formatTimeFromSeconds, getDateKey, getHolidayLabel, getNow, getToday, getWeekdayLabel, isFuture, isHoliday, isPast, isSameDay, isWeekend, pad, parseDateKey, timeToSeconds } from "../core/utils.js";

export function initTrackerTab(root, { state, persist }) {
  const els = {
    monthlySalary: $("#monthlySalary", root),
    salaryAppliedToast: $("#salaryAppliedToast", root),
    monthlyGoal: $("#monthlyGoal", root),
    leaveAllowance: $("#leaveAllowance", root),
    workToggleBtn: $("#workToggleBtn", root),
    todayStartTime: $("#todayStartTime", root),
    todayEndTime: $("#todayEndTime", root),
    openIncomeTabBtn: $("#openIncomeTabBtn", root),
    todayMoney: $("#todayMoney", root),
    monthMoney: $("#monthMoney", root),
    todaySub: $("#todaySub", root),
    monthSub: $("#monthSub", root),
    perSecondValue: $("#perSecondValue", root),
    hourlyValue: $("#hourlyValue", root),
    dailyValue: $("#dailyValue", root),
    workdayValue: $("#workdayValue", root),
    leaveTotalValue: $("#leaveTotalValue", root),
    leaveUsedValue: $("#leaveUsedValue", root),
    leaveUsedSub: $("#leaveUsedSub", root),
    leaveRemainingValue: $("#leaveRemainingValue", root),
    leaveMonthUsedValue: $("#leaveMonthUsedValue", root),
    leaveMonthUsedSub: $("#leaveMonthUsedSub", root),
    statusPill: $("#statusPill", root),
    statusText: $("#statusText", root),
    calendarTitle: $("#calendarTitle", root),
    calendarGrid: $("#calendarGrid", root),
    prevMonthBtn: $("#prevMonthBtn", root),
    todayMonthBtn: $("#todayMonthBtn", root),
    nextMonthBtn: $("#nextMonthBtn", root),
    workLogBody: $("#workLogBody", root),
    workConfirmModal: $("#workConfirmModal", root),
    workConfirmTitle: $("#workConfirmTitle", root),
    workConfirmText: $("#workConfirmText", root),
    workConfirmCancelBtn: $("#workConfirmCancelBtn", root),
    workConfirmOkBtn: $("#workConfirmOkBtn", root),
    modal: $("#dayModal", root),
    modalTitle: $("#modalTitle", root),
    closeModalBtn: $("#closeModalBtn", root),
    modalLeaveType: $("#modalLeaveType", root),
    modalCustomHoliday: $("#modalCustomHoliday", root),
    modalStartTime: $("#modalStartTime", root),
    modalEndTime: $("#modalEndTime", root),
    modalNote: $("#modalNote", root),
    saveDayBtn: $("#saveDayBtn", root),
    clearDayBtn: $("#clearDayBtn", root),
    deleteNoteBtn: $("#deleteNoteBtn", root)
  };

  let selectedDateKey = null;
  let toastTimer = null;
  let salaryValueAnimationFrame = null;
  let salaryFeedbackTimer = null;
  let summaryAnimationFrame = null;
  let lastAnimatedSalary = Number(state.monthlySalary) || 0;
  let isSummaryAnimating = false;
  let deferSalaryDrivenSummaryAnimation = false;
  let pendingSummaryTargets = null;
  let isWaitingForSalaryFeedback = false;
  let forceSummaryTransition = false;
  let pendingWorkAction = null;

  function cloneEntry(entry = {}) {
    return {
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
      leaveType: entry.leaveType || "none",
      note: entry.note || "",
      customHoliday: Boolean(entry.customHoliday),
      running: Boolean(entry.running),
      liveStartTimestamp: entry.liveStartTimestamp || null
    };
  }

  function getEntry(dateKey) {
    if (!state.entries[dateKey]) state.entries[dateKey] = cloneEntry();
    return state.entries[dateKey];
  }

  function formatTimeValue(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function getEntryStartDate(entry, date = getToday()) {
    if (entry.liveStartTimestamp) {
      return new Date(entry.liveStartTimestamp);
    }

    const startSeconds = timeToSeconds(entry.startTime);
    if (startSeconds == null) return null;

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      Math.floor(startSeconds / 3600),
      Math.floor((startSeconds % 3600) / 60),
      0,
      0
    );
  }

  function getAutoStopDate(entry, date = getToday()) {
    const startDate = getEntryStartDate(entry, date);
    if (!startDate) return null;

    return new Date(startDate.getTime() + (PAID_WORK_SECONDS_PER_DAY + 60 * 60) * 1000);
  }

  function isLiveWorkSession(entry, date = getToday()) {
    if (!isSameDay(date, getToday())) return false;
    return Boolean((entry.running || entry.liveStartTimestamp || entry.startTime) && !entry.endTime);
  }

  function syncInputsFromState() {
    els.monthlySalary.value = formatNumber(state.monthlySalary);
    els.monthlyGoal.value = state.monthlyGoal;
    els.leaveAllowance.value = state.leaveAllowance;
  }

  function syncTodayTimeInputs(force = false) {
    const todayEntry = getEntry(getDateKey(getToday()));
    const activeElement = document.activeElement;

    if (force || activeElement !== els.todayStartTime) {
      els.todayStartTime.value = todayEntry.startTime || "";
    }

    if (force || activeElement !== els.todayEndTime) {
      els.todayEndTime.value = todayEntry.endTime || "";
    }
  }

  function syncStateFromInputs() {
    state.monthlySalary = Math.max(0, Number(String(els.monthlySalary.value).replace(/[^\d]/g, "")) || 0);
    state.monthlyGoal = els.monthlyGoal.value || "";
    state.leaveAllowance = Math.max(0, Number(els.leaveAllowance.value) || 0);
    persist();
  }

  function formatSalaryInputValue() {
    const numericValue = Math.max(0, Number(String(els.monthlySalary.value).replace(/[^\d]/g, "")) || 0);
    els.monthlySalary.value = numericValue ? formatNumber(numericValue) : "";
  }

  function showSalaryAppliedToast() {
    if (!els.salaryAppliedToast) return;
    if (toastTimer) clearTimeout(toastTimer);
    els.salaryAppliedToast.textContent = "실수령액 기준 월급이 반영됐어요.";
    els.salaryAppliedToast.classList.add("show");
    toastTimer = setTimeout(() => {
      els.salaryAppliedToast.classList.remove("show");
    }, 2200);
  }

  function easeOutExpo(progress) {
    if (progress >= 1) return 1;
    return 1 - 2 ** (-10 * progress);
  }

  function animateSummaryMoneyFields(targets, duration = 1900) {
    const currentValues = {
      todayMoney: Number(els.todayMoney.dataset.value || 0),
      monthMoney: Number(els.monthMoney.dataset.value || 0),
      perSecondValue: Number(els.perSecondValue.dataset.value || 0),
      hourlyValue: Number(els.hourlyValue.dataset.value || 0),
      dailyValue: Number(els.dailyValue.dataset.value || 0)
    };

    if (summaryAnimationFrame) cancelAnimationFrame(summaryAnimationFrame);
    isSummaryAnimating = true;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = easeOutExpo(progress);

      Object.entries(targets).forEach(([key, value]) => {
        const nextValue = currentValues[key] + (value - currentValues[key]) * eased;
        const el = els[key];
        if (!el) return;
        el.dataset.value = String(value);
        el.textContent = formatMoney(nextValue, 0);
      });

      if (progress < 1) {
        summaryAnimationFrame = requestAnimationFrame(step);
      } else {
        Object.entries(targets).forEach(([key, value]) => {
          const el = els[key];
          if (!el) return;
          el.dataset.value = String(value);
          el.textContent = formatMoney(value, 0);
        });
        isSummaryAnimating = false;
        summaryAnimationFrame = null;
      }
    };

    summaryAnimationFrame = requestAnimationFrame(step);
  }

  function animateSalaryInputValue(fromValue, toValue) {
    if (!els.monthlySalary) return;
    if (salaryValueAnimationFrame) cancelAnimationFrame(salaryValueAnimationFrame);

    const startTime = performance.now();
    const duration = 1800;

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = easeOutExpo(progress);
      const nextValue = Math.round(fromValue + (toValue - fromValue) * eased);
      els.monthlySalary.value = formatNumber(nextValue);

      if (progress < 1) {
        salaryValueAnimationFrame = requestAnimationFrame(step);
      } else {
        els.monthlySalary.value = formatNumber(toValue);
        salaryValueAnimationFrame = null;
      }
    };

    salaryValueAnimationFrame = requestAnimationFrame(step);
  }

  function runSalaryAppliedFeedback() {
    const nextValue = Number(state.pendingSalaryAppliedValue) || Number(state.monthlySalary) || 0;
    const previousValue = Number(state.pendingSalaryPreviousValue) || 0;
    const salaryWrap = els.monthlySalary.closest(".currency-input-wrap");

    if (salaryFeedbackTimer) clearTimeout(salaryFeedbackTimer);
    els.monthlySalary.scrollIntoView({ behavior: "smooth", block: "center" });
    salaryFeedbackTimer = setTimeout(() => {
      salaryWrap?.classList.remove("salary-input-flash");
      void els.monthlySalary.offsetWidth;
      salaryWrap?.classList.add("salary-input-flash");
      animateSalaryInputValue(previousValue, nextValue);
      els.calendarGrid.classList.remove("salary-update-pending");
      els.calendarGrid.classList.remove("salary-update-reveal");
      void els.calendarGrid.offsetWidth;
      els.calendarGrid.classList.add("salary-update-reveal");
      els.calendarGrid.querySelectorAll(".day-money").forEach((el, index) => {
        el.style.animationDelay = `${Math.min(index * 12, 160)}ms`;
      });
      if (pendingSummaryTargets) {
        lastAnimatedSalary = state.monthlySalary;
        animateSummaryMoneyFields(pendingSummaryTargets);
        pendingSummaryTargets = null;
      }
      isWaitingForSalaryFeedback = false;
      showSalaryAppliedToast();
      setTimeout(() => {
        els.calendarGrid.classList.remove("salary-update-reveal");
        els.calendarGrid.querySelectorAll(".day-money").forEach((el) => {
          el.style.animationDelay = "";
        });
      }, 1100);
      salaryFeedbackTimer = null;
    }, 520);
  }

  function computeWorkedSecondsFromTimes(startTime, endTime) {
    const startSeconds = timeToSeconds(startTime);
    const endSeconds = timeToSeconds(endTime);
    if (startSeconds == null || endSeconds == null || endSeconds <= startSeconds) return 0;
    const raw = endSeconds - startSeconds;
    const lunchDeduction = raw >= 4 * 3600 ? 3600 : 0;
    return Math.max(0, Math.min(PAID_WORK_SECONDS_PER_DAY, raw - lunchDeduction));
  }

  function getBreakSecondsForEntry(entry) {
    const startSeconds = timeToSeconds(entry?.startTime || "");
    const endSeconds = timeToSeconds(entry?.endTime || "");
    if (startSeconds == null || endSeconds == null || endSeconds <= startSeconds) return 0;
    return endSeconds - startSeconds >= 4 * 3600 ? 3600 : 0;
  }

  function leaveTypeToFraction(type) {
    return type === "full" ? 1 : type === "half" ? 0.5 : type === "quarter" ? 0.25 : 0;
  }

  function getBusinessDaysInMonth(year, month) {
    const lastDate = new Date(year, month + 1, 0).getDate();
    let count = 0;
    for (let day = 1; day <= lastDate; day += 1) {
      const date = new Date(year, month, day);
      if (!isWeekend(date) && !isHoliday(date, getEntry(getDateKey(date)))) count += 1;
    }
    return count;
  }

  const getDailyWage = () => {
    const today = getToday();
    const businessDays = getBusinessDaysInMonth(today.getFullYear(), today.getMonth());
    return businessDays > 0 ? state.monthlySalary / businessDays : 0;
  };

  const getHourlyWage = () => getDailyWage() / (PAID_WORK_SECONDS_PER_DAY / 3600);
  const getPerSecondWage = () => getDailyWage() / PAID_WORK_SECONDS_PER_DAY;

  function getDayStatus(date, entry) {
    if (isWeekend(date)) return "주말";
    if (isHoliday(date, entry)) return getHolidayLabel(date, entry) || "공휴일";
    if (entry.leaveType === "full") return isFuture(date) ? "휴가 예정" : "휴가";
    if (entry.leaveType === "half") return isFuture(date) ? "반차 예정" : "반차";
    if (entry.leaveType === "quarter") return isFuture(date) ? "반반차 예정" : "반반차";
    if (isLiveWorkSession(entry, date)) return "근무 중";
    if (isPast(date)) return "정상근무";
    if (isSameDay(date, getToday())) return "오늘";
    return "예정";
  }

  function getDayResult(date) {
    const entry = getEntry(getDateKey(date));
    const holiday = isHoliday(date, entry);
    const weekend = isWeekend(date);
    const leaveFraction = leaveTypeToFraction(entry.leaveType);
    let paidSeconds = 0;

    if (weekend || holiday) {
      paidSeconds = 0;
    } else if (leaveFraction > 0) {
      paidSeconds = isFuture(date) ? 0 : PAID_WORK_SECONDS_PER_DAY * leaveFraction;
    } else if (isPast(date)) {
      paidSeconds = entry.startTime || entry.endTime
        ? computeWorkedSecondsFromTimes(entry.startTime || DEFAULT_START, entry.endTime || DEFAULT_END)
        : PAID_WORK_SECONDS_PER_DAY;
    } else if (isSameDay(date, getToday())) {
      if (isLiveWorkSession(entry, date)) {
        const startDate = getEntryStartDate(entry, date);
        if (startDate) {
          const now = getNow();
          const autoStopDate = getAutoStopDate(entry, date);
          const effectiveNow = autoStopDate ? new Date(Math.min(now.getTime(), autoStopDate.getTime())) : now;
          const raw = Math.floor((effectiveNow.getTime() - startDate.getTime()) / 1000);
          const lunchDeduction = raw >= 4 * 3600 ? 3600 : 0;
          paidSeconds = Math.max(0, Math.min(PAID_WORK_SECONDS_PER_DAY, raw - lunchDeduction));
        }
      } else if (entry.startTime || entry.endTime) {
        paidSeconds = computeWorkedSecondsFromTimes(entry.startTime || DEFAULT_START, entry.endTime || DEFAULT_END);
      }
    }

    paidSeconds = Math.max(0, Math.min(PAID_WORK_SECONDS_PER_DAY, paidSeconds));
    return {
      dateKey: getDateKey(date),
      entry,
      weekend,
      holiday,
      paidSeconds,
      earnings: paidSeconds * getPerSecondWage(),
      status: getDayStatus(date, entry)
    };
  }

  function getMonthSummary(year, month) {
    const lastDate = new Date(year, month + 1, 0).getDate();
    let earnings = 0;
    let fullDays = 0;
    let businessDays = 0;
    for (let day = 1; day <= lastDate; day += 1) {
      const date = new Date(year, month, day);
      if (!isWeekend(date) && !isHoliday(date, getEntry(getDateKey(date)))) businessDays += 1;
      const result = getDayResult(date);
      earnings += result.earnings;
      if (result.paidSeconds >= PAID_WORK_SECONDS_PER_DAY) fullDays += 1;
    }
    return { earnings, fullDays, businessDays };
  }

  function getLeaveSummary(year, month) {
    let used = 0;
    let monthUsed = 0;
    Object.entries(state.entries).forEach(([dateKey, entry]) => {
      const fraction = leaveTypeToFraction(entry.leaveType);
      if (!fraction) return;
      const date = parseDateKey(dateKey);
      if (date.getFullYear() === year) used += fraction;
      if (date.getFullYear() === year && date.getMonth() === month) monthUsed += fraction;
    });
    const total = Math.max(0, Number(state.leaveAllowance) || 0);
    return { total, used, remaining: Math.max(0, total - used), monthUsed };
  }

  function renderSummary() {
    if (autoStopWorkIfComplete()) return;
    const today = getToday();
    const todayEntry = getEntry(getDateKey(today));
    const todayResult = getDayResult(today);
    const monthSummary = getMonthSummary(today.getFullYear(), today.getMonth());
    const businessDays = getBusinessDaysInMonth(today.getFullYear(), today.getMonth());
    const leaveSummary = getLeaveSummary(state.calendarYear, state.calendarMonth);

    const salaryChanged = lastAnimatedSalary !== state.monthlySalary;
    const moneyTargets = {
      todayMoney: todayResult.earnings,
      monthMoney: monthSummary.earnings,
      perSecondValue: getPerSecondWage(),
      hourlyValue: getHourlyWage(),
      dailyValue: getDailyWage()
    };

    const currentAnimatedValues = {
      todayMoney: Number(els.todayMoney.dataset.value || 0),
      monthMoney: Number(els.monthMoney.dataset.value || 0),
      perSecondValue: Number(els.perSecondValue.dataset.value || 0),
      hourlyValue: Number(els.hourlyValue.dataset.value || 0),
      dailyValue: Number(els.dailyValue.dataset.value || 0)
    };
    const hasLiveTickChange = isLiveWorkSession(todayEntry)
      && (
        Math.abs(currentAnimatedValues.todayMoney - moneyTargets.todayMoney) >= 1
        || Math.abs(currentAnimatedValues.monthMoney - moneyTargets.monthMoney) >= 1
      );

    if (salaryChanged) {
      if (deferSalaryDrivenSummaryAnimation || isWaitingForSalaryFeedback) {
        pendingSummaryTargets = moneyTargets;
      } else {
        lastAnimatedSalary = state.monthlySalary;
        animateSummaryMoneyFields(moneyTargets);
      }
    } else if (forceSummaryTransition) {
      forceSummaryTransition = false;
      animateSummaryMoneyFields(moneyTargets);
    } else if (hasLiveTickChange) {
      animateSummaryMoneyFields(moneyTargets, 650);
    } else if (!isSummaryAnimating) {
      els.todayMoney.dataset.value = String(moneyTargets.todayMoney);
      els.monthMoney.dataset.value = String(moneyTargets.monthMoney);
      els.perSecondValue.dataset.value = String(moneyTargets.perSecondValue);
      els.hourlyValue.dataset.value = String(moneyTargets.hourlyValue);
      els.dailyValue.dataset.value = String(moneyTargets.dailyValue);
      els.todayMoney.textContent = formatMoney(moneyTargets.todayMoney, 0);
      els.monthMoney.textContent = formatMoney(moneyTargets.monthMoney, 0);
      els.perSecondValue.textContent = formatMoney(moneyTargets.perSecondValue, 0);
      els.hourlyValue.textContent = formatMoney(moneyTargets.hourlyValue, 0);
      els.dailyValue.textContent = formatMoney(moneyTargets.dailyValue, 0);
    }

    els.todaySub.textContent = `${todayResult.status} · ${formatTimeFromSeconds(todayResult.paidSeconds)} 반영`;
    els.monthSub.textContent = `완료된 근무일 ${monthSummary.fullDays}일 / ${businessDays}일${state.monthlyGoal ? ` · ${state.monthlyGoal}` : ""}`;
    els.workdayValue.textContent = `${businessDays}일`;
    els.leaveTotalValue.textContent = formatLeaveDays(leaveSummary.total);
    els.leaveUsedValue.textContent = formatLeaveDays(leaveSummary.used);
    els.leaveUsedSub.textContent = `${state.calendarYear}년 일정 포함`;
    els.leaveRemainingValue.textContent = formatLeaveDays(leaveSummary.remaining);
    els.leaveMonthUsedValue.textContent = formatLeaveDays(leaveSummary.monthUsed);
    els.leaveMonthUsedSub.textContent = `${state.calendarYear}년 ${state.calendarMonth + 1}월 기준`;
    syncTodayTimeInputs();
    updateStatusPill();
    updateWorkToggleButton();
  }

  function updateStatusPill() {
    const result = getDayResult(getToday());
    const entry = getEntry(getDateKey(getToday()));
    els.statusPill.className = "status-pill";
    if (entry.leaveType !== "none") {
      els.statusPill.classList.add("leave");
      els.statusText.textContent = result.status;
    } else if (isLiveWorkSession(entry)) {
      els.statusPill.classList.add("working");
      els.statusText.textContent = "출근 상태";
    } else if (result.paidSeconds >= PAID_WORK_SECONDS_PER_DAY) {
      els.statusPill.classList.add("done");
      els.statusText.textContent = "오늘 근무 완료";
    } else {
      els.statusPill.classList.add("off");
      els.statusText.textContent = "퇴근 상태";
    }
  }

  function updateWorkToggleButton() {
    const entry = getEntry(getDateKey(getToday()));
    const result = getDayResult(getToday());
    const button = els.workToggleBtn;
    if (!button) return;

    button.disabled = false;
    button.classList.remove("btn-start", "btn-stop", "btn-muted");

    if (isLiveWorkSession(entry)) {
      button.textContent = "지금 퇴근";
      button.classList.add("btn-stop");
      button.dataset.action = "stop";
      return;
    }

    if (result.paidSeconds >= PAID_WORK_SECONDS_PER_DAY) {
      button.textContent = "오늘 근무 완료";
      button.classList.add("btn-muted");
      button.dataset.action = "done";
      button.disabled = true;
      return;
    }

    button.textContent = "지금 출근";
    button.classList.add("btn-start");
    button.dataset.action = "start";
  }

  function renderCalendar() {
    const year = state.calendarYear;
    const month = state.calendarMonth;
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();

    els.calendarTitle.textContent = `${year}년 ${month + 1}월`;
    els.calendarGrid.innerHTML = "";
    const cells = [];
    for (let i = startWeekday - 1; i >= 0; i -= 1) cells.push({ date: new Date(year, month - 1, prevLastDate - i), current: false });
    for (let day = 1; day <= lastDate; day += 1) cells.push({ date: new Date(year, month, day), current: true });
    while (cells.length % 7 !== 0) cells.push({ date: new Date(year, month + 1, cells.length - (startWeekday + lastDate) + 1), current: false });

    cells.forEach(({ date, current }) => {
      const result = getDayResult(date);
      const dayEl = document.createElement("button");
      dayEl.type = "button";
      dayEl.className = "day";
      if (!current) dayEl.classList.add("other-month");
      if (isSameDay(date, getToday())) dayEl.classList.add("today");
      if (date.getDay() === 6) dayEl.classList.add("saturday");
      if (date.getDay() === 0) dayEl.classList.add("sunday");
      if (result.weekend) dayEl.classList.add("weekend");
      if (result.holiday) dayEl.classList.add("holiday");
      if (result.entry.leaveType === "quarter") dayEl.classList.add("leave-quarter");
      else if (result.entry.leaveType === "half") dayEl.classList.add("leave-half");
      else if (result.entry.leaveType === "full") dayEl.classList.add("leave-full");
      else if (result.paidSeconds > 0) dayEl.classList.add("worked");

      const tag = result.weekend ? "주말" : result.holiday ? getHolidayLabel(date, result.entry) || "공휴일" : result.entry.leaveType === "full" ? (isFuture(date) ? "휴가 예정" : "휴가") : result.entry.leaveType === "half" ? (isFuture(date) ? "반차 예정" : "반차") : result.entry.leaveType === "quarter" ? (isFuture(date) ? "반반차 예정" : "반반차") : isLiveWorkSession(result.entry, date) ? "근무 중" : result.paidSeconds > 0 ? "근무 반영" : "";
      const tagClass = result.weekend ? "tag-weekend" : result.holiday ? "tag-holiday" : result.entry.leaveType === "full" ? "tag-leave-full" : result.entry.leaveType === "half" ? "tag-leave-half" : result.entry.leaveType === "quarter" ? "tag-leave-quarter" : isLiveWorkSession(result.entry, date) ? "tag-running" : result.paidSeconds > 0 ? "tag-worked" : "";
      const timeText = result.entry.startTime || result.entry.endTime ? `${result.entry.startTime || "--:--"} ~ ${result.entry.endTime || (isLiveWorkSession(result.entry, date) ? "진행중" : "--:--")}` : "";
      dayEl.innerHTML = `
        <div class="day-date">${date.getDate()}</div>
        ${tag ? `<div class="day-tag ${tagClass}">${tag}</div>` : ""}
        ${timeText ? `<div class="day-time">${timeText}</div>` : ""}
        <div class="day-money">${current && !result.weekend && !result.holiday ? formatMoney(result.earnings, 0) : ""}</div>
      `;
      if (current) dayEl.addEventListener("click", () => openDayModal(getDateKey(date)));
      els.calendarGrid.appendChild(dayEl);
    });
  }

  function renderWorkLog() {
    const year = state.calendarYear;
    const month = state.calendarMonth;
    const lastDate = new Date(year, month + 1, 0).getDate();
    els.workLogBody.innerHTML = "";
    for (let day = 1; day <= lastDate; day += 1) {
      const date = new Date(year, month, day);
      if (isFuture(date)) continue;
      const result = getDayResult(date);
      const hasWork = Boolean(isLiveWorkSession(result.entry, date) || result.entry.startTime || result.entry.endTime);
      const onClosedDay = result.weekend || result.holiday;
      const breakText = hasWork && getBreakSecondsForEntry(result.entry) > 0 ? formatTimeFromSeconds(getBreakSecondsForEntry(result.entry)) : "-";
      const timeText = onClosedDay && !hasWork ? "-" : formatTimeFromSeconds(result.paidSeconds);
      const moneyText = onClosedDay && !hasWork ? "-" : formatMoney(result.earnings, 0);
      const dateClass = result.holiday || date.getDay() === 0 ? "date-sunday" : date.getDay() === 6 ? "date-saturday" : "";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="${dateClass}">${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} (${getWeekdayLabel(date)})</td>
        <td>${result.status}</td>
        <td>${result.entry.startTime || "-"}</td>
        <td>${result.entry.endTime || (isLiveWorkSession(result.entry, date) ? "진행중" : "-")}</td>
        <td>${breakText}</td>
        <td>${timeText}</td>
        <td>${moneyText}</td>
      `;
      tr.style.cursor = "pointer";
      tr.addEventListener("click", () => openDayModal(getDateKey(date)));
      els.workLogBody.appendChild(tr);
    }
  }

  function openDayModal(dateKey) {
    selectedDateKey = dateKey;
    const date = parseDateKey(dateKey);
    const entry = getEntry(dateKey);
    els.modalTitle.textContent = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 수정`;
    els.modalLeaveType.value = entry.leaveType || "none";
    els.modalCustomHoliday.value = entry.customHoliday ? "true" : "false";
    els.modalStartTime.value = entry.startTime || "";
    els.modalEndTime.value = entry.endTime || "";
    els.modalNote.value = entry.note || "";
    els.modal.classList.add("open");
    els.modal.setAttribute("aria-hidden", "false");
  }

  function closeDayModal() {
    selectedDateKey = null;
    els.modal.classList.remove("open");
    els.modal.setAttribute("aria-hidden", "true");
  }

  function saveDayModal() {
    if (!selectedDateKey) return;
    const entry = getEntry(selectedDateKey);
    entry.leaveType = els.modalLeaveType.value;
    entry.customHoliday = els.modalCustomHoliday.value === "true";
    entry.startTime = els.modalStartTime.value || "";
    entry.endTime = els.modalEndTime.value || "";
    entry.note = els.modalNote.value || "";
    entry.running = false;
    entry.liveStartTimestamp = null;
    persist();
    closeDayModal();
    renderAll();
  }

  function clearDaySettings() {
    if (!selectedDateKey) return;
    state.entries[selectedDateKey] = cloneEntry();
    persist();
    closeDayModal();
    renderAll();
  }

  function clearDayNote() {
    if (!selectedDateKey) return;
    getEntry(selectedDateKey).note = "";
    persist();
    openDayModal(selectedDateKey);
  }

  function closeWorkConfirmModal() {
    pendingWorkAction = null;
    els.workConfirmModal.classList.remove("open");
    els.workConfirmModal.setAttribute("aria-hidden", "true");
  }

  function openWorkConfirmModal(action) {
    pendingWorkAction = action;
    const isStart = action === "start";
    els.workConfirmTitle.textContent = isStart ? "출근 처리할까요?" : "퇴근 처리할까요?";
    els.workConfirmText.textContent = isStart
      ? "지금 시각 기준으로 출근 상태로 전환합니다."
      : "지금 시각 기준으로 퇴근 상태로 전환합니다.";
    els.workConfirmModal.classList.add("open");
    els.workConfirmModal.setAttribute("aria-hidden", "false");
  }

  function confirmWorkAction() {
    const action = pendingWorkAction;
    closeWorkConfirmModal();
    if (action === "start") {
      startWorkNow();
      return;
    }
    if (action === "stop") {
      stopWorkNow();
    }
  }

  function updateTodayTimesInline() {
    const today = getToday();
    const entry = getEntry(getDateKey(today));

    entry.startTime = els.todayStartTime.value || "";
    entry.endTime = els.todayEndTime.value || "";

    if (isLiveWorkSession(entry, today)) {
      if (!entry.startTime) {
        const now = getNow();
        entry.startTime = formatTimeValue(now);
        entry.liveStartTimestamp = now.getTime();
      } else {
        const startSeconds = timeToSeconds(entry.startTime);
        const startDate = startSeconds == null
          ? null
          : new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              Math.floor(startSeconds / 3600),
              Math.floor((startSeconds % 3600) / 60),
              0,
              0
            );
        entry.liveStartTimestamp = startDate ? startDate.getTime() : getNow().getTime();
      }

      if (entry.endTime) {
        entry.running = false;
        entry.liveStartTimestamp = null;
      }
    } else {
      entry.liveStartTimestamp = null;
    }

    persist();
    syncTodayTimeInputs(true);
    forceSummaryTransition = true;
    renderAll();
  }

  function startWorkNow() {
    const entry = getEntry(getDateKey(getToday()));
    const now = getNow();
    entry.leaveType = "none";
    entry.customHoliday = false;
    entry.running = true;
    entry.liveStartTimestamp = now.getTime();
    if (!entry.startTime) entry.startTime = formatTimeValue(now);
    entry.endTime = "";
    persist();
    renderAll();
  }

  function stopWorkNow(stopDate = getNow()) {
    const entry = getEntry(getDateKey(getToday()));
    entry.running = false;
    entry.liveStartTimestamp = null;
    entry.endTime = formatTimeValue(stopDate);
    if (!entry.startTime) entry.startTime = DEFAULT_START;
    persist();
    renderAll();
  }

  function autoStopWorkIfComplete() {
    const entry = getEntry(getDateKey(getToday()));
    if (!isLiveWorkSession(entry)) return false;
    const autoStopDate = getAutoStopDate(entry, getToday());
    if (!autoStopDate || getNow().getTime() < autoStopDate.getTime()) return false;
    stopWorkNow(autoStopDate);
    return true;
  }

  function handleWorkToggle() {
    if (els.workToggleBtn?.dataset.action === "stop") {
      openWorkConfirmModal("stop");
      return;
    }

    if (els.workToggleBtn?.dataset.action === "start") {
      openWorkConfirmModal("start");
    }
  }

  function renderAll() {
    renderSummary();
    renderCalendar();
    renderWorkLog();
  }

  [els.monthlySalary, els.monthlyGoal, els.leaveAllowance].forEach((el) => {
    const handler = () => {
      syncStateFromInputs();
      if (el === els.monthlySalary) formatSalaryInputValue();
      renderAll();
    };
    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  });
  [els.todayStartTime, els.todayEndTime].forEach((el) => {
    el.addEventListener("change", updateTodayTimesInline);
    el.addEventListener("blur", updateTodayTimesInline);
  });
  els.workToggleBtn.addEventListener("click", handleWorkToggle);
  els.workConfirmCancelBtn.addEventListener("click", closeWorkConfirmModal);
  els.workConfirmOkBtn.addEventListener("click", confirmWorkAction);
  els.workConfirmModal.addEventListener("click", (event) => {
    if (event.target === els.workConfirmModal) closeWorkConfirmModal();
  });
  els.openIncomeTabBtn.addEventListener("click", () => {
    document.querySelector('.tab-btn[data-tab="income"]')?.click();
  });
  els.prevMonthBtn.addEventListener("click", () => {
    state.calendarMonth -= 1;
    if (state.calendarMonth < 0) {
      state.calendarMonth = 11;
      state.calendarYear -= 1;
    }
    persist();
    renderAll();
  });
  els.nextMonthBtn.addEventListener("click", () => {
    state.calendarMonth += 1;
    if (state.calendarMonth > 11) {
      state.calendarMonth = 0;
      state.calendarYear += 1;
    }
    persist();
    renderAll();
  });
  els.todayMonthBtn.addEventListener("click", () => {
    const today = getToday();
    state.calendarYear = today.getFullYear();
    state.calendarMonth = today.getMonth();
    persist();
    renderAll();
  });
  els.closeModalBtn.addEventListener("click", closeDayModal);
  els.modal.addEventListener("click", (event) => {
    if (event.target === els.modal) closeDayModal();
  });
  els.saveDayBtn.addEventListener("click", saveDayModal);
  els.clearDayBtn.addEventListener("click", clearDaySettings);
  els.deleteNoteBtn.addEventListener("click", clearDayNote);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.workConfirmModal.classList.contains("open")) {
      closeWorkConfirmModal();
      return;
    }
    if (event.key === "Escape") closeDayModal();
  });

  syncInputsFromState();
  syncTodayTimeInputs(true);
  renderAll();
  const timer = setInterval(renderSummary, 1000);
  return {
    destroy() {
      clearInterval(timer);
      if (toastTimer) clearTimeout(toastTimer);
      if (salaryFeedbackTimer) clearTimeout(salaryFeedbackTimer);
      if (salaryValueAnimationFrame) cancelAnimationFrame(salaryValueAnimationFrame);
      if (summaryAnimationFrame) cancelAnimationFrame(summaryAnimationFrame);
    },
    onTabChange(isActive) {
      if (!isActive) return;
      const shouldDeferSalaryAnimation = state.pendingSalaryAppliedToast;
      deferSalaryDrivenSummaryAnimation = shouldDeferSalaryAnimation;
      isWaitingForSalaryFeedback = shouldDeferSalaryAnimation;
      els.calendarGrid.classList.toggle("salary-update-pending", shouldDeferSalaryAnimation);
      syncInputsFromState();
      renderAll();
      deferSalaryDrivenSummaryAnimation = false;
      if (state.pendingSalaryAppliedToast) {
        const appliedValue = state.pendingSalaryAppliedValue;
        const previousValue = state.pendingSalaryPreviousValue;
        state.pendingSalaryAppliedToast = false;
        state.pendingSalaryPreviousValue = 0;
        state.pendingSalaryAppliedValue = 0;
        persist();
        state.pendingSalaryAppliedValue = appliedValue;
        state.pendingSalaryPreviousValue = previousValue;
        runSalaryAppliedFeedback();
        state.pendingSalaryAppliedValue = 0;
        state.pendingSalaryPreviousValue = 0;
      }
    }
  };
}
