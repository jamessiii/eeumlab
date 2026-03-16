export const fortuneTemplate = `
<section class="card fortune-card">
  <div class="fortune-header">
    <div>
      <h2>오늘의 운세</h2>
      <p class="hint">오늘 날짜 기준으로 가볍게 보는 직장인 운세야. 너무 진지하게 보기보단 흐름 체크용으로 보면 좋아.</p>
    </div>
  </div>
  <div id="fortuneZodiacBar" class="fortune-zodiac-bar" aria-label="띠 선택"></div>
  <div class="fortune-hero">
    <div id="fortuneEmoji" class="fortune-emoji">🐴</div>
    <div>
      <div id="fortuneDate" class="fortune-date"></div>
      <div id="fortuneHeadline" class="fortune-headline"></div>
    </div>
  </div>
  <div class="fortune-grid">
    <article class="fortune-panel">
      <div class="fortune-label">오늘의 한 줄</div>
      <div id="fortuneOneLine" class="fortune-copy"></div>
    </article>
    <article class="fortune-panel">
      <div class="fortune-label">업무운</div>
      <div id="fortuneWork" class="fortune-copy"></div>
    </article>
    <article class="fortune-panel">
      <div class="fortune-label">금전운</div>
      <div id="fortuneMoney" class="fortune-copy"></div>
    </article>
    <article class="fortune-panel">
      <div class="fortune-label">관계운</div>
      <div id="fortuneRelation" class="fortune-copy"></div>
    </article>
  </div>
</section>
`;
