import { formatNumber } from "../core/utils.js";

export function initIncomeTab(root, { state, persist }) {
  const els = {
    annualMin: root.querySelector("#annualMin"),
    annualMax: root.querySelector("#annualMax"),
    annualStep: root.querySelector("#annualStep"),
    dependents: root.querySelector("#dependents"),
    nontaxMeal: root.querySelector("#nontaxMeal"),
    currentSummary: root.querySelector("#incomeCurrentSummary"),
    incomeTableBody: root.querySelector("#incomeTableBody")
  };

  let expandedAnnualManwon = null;

  function syncInputsFromState() {
    els.annualMin.value = state.annualMin;
    els.annualMax.value = state.annualMax;
    els.annualStep.value = state.annualStep;
    els.dependents.value = state.dependents;
    els.nontaxMeal.value = state.nontaxMeal;
  }

  function syncStateFromInputs() {
    state.annualMin = Number(els.annualMin.value) || 2800;
    state.annualMax = Number(els.annualMax.value) || 10000;
    state.annualStep = Math.max(100, Number(els.annualStep.value) || 100);
    state.dependents = Number(els.dependents.value) || 1;
    state.nontaxMeal = Math.max(0, Number(els.nontaxMeal.value) || 0);
    persist();
  }

  function earnedIncomeDeduction(annualGross) {
    if (annualGross <= 5000000) return annualGross * 0.7;
    if (annualGross <= 15000000) return 3500000 + (annualGross - 5000000) * 0.4;
    if (annualGross <= 45000000) return 7500000 + (annualGross - 15000000) * 0.15;
    if (annualGross <= 100000000) return 12000000 + (annualGross - 45000000) * 0.05;
    return 14750000 + (annualGross - 100000000) * 0.02;
  }

  function progressiveTax(taxBase) {
    if (taxBase <= 14000000) return taxBase * 0.06;
    if (taxBase <= 50000000) return taxBase * 0.15 - 1260000;
    if (taxBase <= 88000000) return taxBase * 0.24 - 5760000;
    if (taxBase <= 150000000) return taxBase * 0.35 - 15440000;
    if (taxBase <= 300000000) return taxBase * 0.38 - 19940000;
    if (taxBase <= 500000000) return taxBase * 0.4 - 25940000;
    if (taxBase <= 1000000000) return taxBase * 0.42 - 35940000;
    return taxBase * 0.45 - 65940000;
  }

  function taxCredit(annualCalculatedTax) {
    const credit = annualCalculatedTax <= 1300000
      ? annualCalculatedTax * 0.55
      : 715000 + (annualCalculatedTax - 1300000) * 0.3;
    return Math.min(credit, 740000);
  }

  function estimateMonthlyIncomeTax(monthlyGross, monthlyNontax, dependents) {
    const annualGross = monthlyGross * 12;
    const annualNontax = monthlyNontax * 12;
    const annualTaxableWage = Math.max(0, annualGross - annualNontax);
    const annualEarnedIncome = Math.max(0, annualTaxableWage - earnedIncomeDeduction(annualTaxableWage));
    const basicDeduction = dependents * 1500000;
    const taxBase = Math.max(0, annualEarnedIncome - basicDeduction);
    const annualCalculatedTax = Math.max(0, progressiveTax(taxBase));
    const annualFinalTax = Math.max(0, annualCalculatedTax - taxCredit(annualCalculatedTax));
    return annualFinalTax / 12;
  }

  function render() {
    syncStateFromInputs();
    els.incomeTableBody.innerHTML = "";
    const min = Math.min(state.annualMin, state.annualMax);
    const max = Math.max(state.annualMin, state.annualMax);
    const step = Math.max(100, state.annualStep);
    const currentMonthlyNet = Number(state.monthlySalary) || 0;
    const rows = [];

    for (let annualManwon = min; annualManwon <= max; annualManwon += step) {
      const annual = annualManwon * 10000;
      const monthlyGross = annual / 12;
      const monthlyNontax = Math.min(state.nontaxMeal, monthlyGross);
      const pension = monthlyGross * 0.045;
      const health = monthlyGross * 0.03545;
      const longTermCare = health * 0.1295;
      const employment = monthlyGross * 0.009;
      const incomeTax = estimateMonthlyIncomeTax(monthlyGross, monthlyNontax, state.dependents);
      const localTax = incomeTax * 0.1;
      const net = monthlyGross - pension - health - longTermCare - employment - incomeTax - localTax;
      rows.push({ annualManwon, monthlyGross, monthlyNontax, pension, health, longTermCare, employment, incomeTax, localTax, net });
    }

    const nearestRow = currentMonthlyNet > 0
      ? rows.reduce((best, row) => {
          if (!best) return row;
          return Math.abs(row.net - currentMonthlyNet) < Math.abs(best.net - currentMonthlyNet) ? row : best;
        }, null)
      : null;

    rows.forEach(({ annualManwon, monthlyGross, monthlyNontax, pension, health, longTermCare, employment, incomeTax, localTax, net }) => {
      const tr = document.createElement("tr");
      if (nearestRow?.annualManwon === annualManwon) tr.classList.add("current-salary-row");
      tr.dataset.annualManwon = String(annualManwon);
      tr.innerHTML = `
        <td>${annualManwon.toLocaleString()}만</td>
        <td>${formatNumber(monthlyGross)}</td>
        <td>${formatNumber(monthlyNontax)}</td>
        <td>${formatNumber(pension)}</td>
        <td>${formatNumber(health)}</td>
        <td>${formatNumber(longTermCare)}</td>
        <td>${formatNumber(employment)}</td>
        <td>${formatNumber(incomeTax)}</td>
        <td>${formatNumber(localTax)}</td>
        <td class="highlight">${formatNumber(net)}</td>
      `;
      tr.addEventListener("click", () => {
        expandedAnnualManwon = expandedAnnualManwon === annualManwon ? null : annualManwon;
        render();
      });
      els.incomeTableBody.appendChild(tr);

      if (expandedAnnualManwon === annualManwon) {
        const actionRow = document.createElement("tr");
        actionRow.className = "income-action-row";
        actionRow.innerHTML = `
          <td colspan="10">
            <div class="income-row-menu">
              <div class="income-row-menu-copy">
                이 구간의 월 실수령액은 <strong>${formatNumber(net)}</strong>원이에요.
              </div>
              <button type="button" class="btn btn-primary" data-apply-net="${Math.round(net)}">슬기로운 월루생활 월급으로 적용</button>
            </div>
          </td>
        `;
        actionRow.querySelector("[data-apply-net]")?.addEventListener("click", (event) => {
          event.stopPropagation();
          state.pendingSalaryPreviousValue = Number(state.monthlySalary) || 0;
          state.monthlySalary = Number(event.currentTarget.dataset.applyNet) || 0;
          state.pendingSalaryAppliedToast = true;
          state.pendingSalaryAppliedValue = state.monthlySalary;
          state.activeTab = "tracker";
          persist();
          expandedAnnualManwon = annualManwon;
          render();
          document.querySelector('.tab-btn[data-tab="tracker"]')?.click();
        });
        els.incomeTableBody.appendChild(actionRow);
      }
    });

    if (currentMonthlyNet > 0) {
      const inRange = nearestRow != null && nearestRow.annualManwon >= min && nearestRow.annualManwon <= max;
      els.currentSummary.innerHTML = `
        <div class="income-current-kicker">슬기로운 월루생활 기준</div>
        <div class="income-current-copy">
          현재 월급 <strong>${formatNumber(state.monthlySalary)}</strong>원은 실수령액 기준으로 보고 있어요.
          ${nearestRow != null ? `표에서는 월 실수령액이 가장 가까운 <strong>${nearestRow.annualManwon.toLocaleString()}만 원</strong> 구간${inRange ? "이" : "이"} 강조돼요.` : ""}
        </div>
        <div class="income-current-meta">예상 월 실수령액 기준 약 <strong>${formatNumber(nearestRow?.net || 0)}</strong>원</div>
      `;
      els.currentSummary.classList.toggle("out-of-range", !inRange);
    } else {
      els.currentSummary.innerHTML = `
        <div class="income-current-copy">슬기로운 월루생활 탭에 월급을 입력하면 현재 연봉 위치를 여기서 바로 보여줘요.</div>
      `;
      els.currentSummary.classList.remove("out-of-range");
    }
  }

  [els.annualMin, els.annualMax, els.annualStep, els.dependents, els.nontaxMeal].forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  syncInputsFromState();
  render();
  return {
    onTabChange(isActive) {
      if (isActive) render();
    }
  };
}
