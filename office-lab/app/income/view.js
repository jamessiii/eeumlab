export const incomeTemplate = `
<section class="card income-card">
  <h2>2026년 연봉 실수령액표</h2>
  <p class="hint">입력값을 바꾸면 표가 자동으로 다시 계산돼. 목표 연봉 감을 빠르게 보는 용도로 쓸 수 있어.</p>
  <div id="incomeCurrentSummary" class="income-current-summary"></div>
  <div class="income-controls">
    <label class="field"><span>시작 연봉 (만원)</span><input id="annualMin" type="number" min="1000" step="100" value="2800" /></label>
    <label class="field"><span>끝 연봉 (만원)</span><input id="annualMax" type="number" min="1000" step="100" value="10000" /></label>
    <label class="field"><span>간격 (만원)</span><input id="annualStep" type="number" min="100" step="100" value="100" /></label>
    <label class="field"><span>부양가족 수</span><select id="dependents"><option value="1">1명</option><option value="2">2명</option><option value="3">3명</option><option value="4">4명</option></select></label>
    <label class="field"><span>비과세 식대 (원)</span><input id="nontaxMeal" type="number" min="0" step="10000" value="200000" /></label>
  </div>
  <div class="table-wrap income-table-wrap">
    <table class="income-table">
      <thead><tr><th>연봉</th><th>월급여</th><th>비과세</th><th>국민연금</th><th>건강보험</th><th>장기요양</th><th>고용보험</th><th>소득세</th><th>지방소득세</th><th>실수령액</th></tr></thead>
      <tbody id="incomeTableBody"></tbody>
    </table>
  </div>
</section>
`;
