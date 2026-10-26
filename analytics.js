// Amplitude 이벤트 추적 (API 키는 amplitude-config.js에서 주입)
(function () {
  var key = window.AMPLITUDE_API_KEY;
  if (!key || !window.amplitude) {
    console.warn('[analytics] Amplitude 키 또는 SDK가 없어 추적을 건너뜁니다. build-config.ps1을 실행하세요.');
    return;
  }

  // 페이지 구분: baedal-itda.html → 가상 브랜드, 그 외 → 배민 시안
  var page = /baedal-itda/.test(location.pathname) ? 'baedal-itda' : 'baemin';

  // 페이지뷰·세션·UTM(광고 채널) 자동 수집
  amplitude.init(key, {
    defaultTracking: { attribution: true, pageViews: true, sessions: true, formInteractions: false, fileDownloads: false }
  });

  function track(name, props) {
    var p = { page: page };
    for (var k in props) p[k] = props[k];
    amplitude.track(name, p);
  }

  // CTA 노출·클릭 (헤더·히어로·절차·하단 고정·스토어 버튼)
  // 노출: 버튼이 화면에 50% 이상 보이면 페이지 로드당 CTA별 1회
  // 클릭: 누를 때마다
  var ctas = document.querySelectorAll('[data-cta]');
  function ctaProps(el) {
    return {
      cta_location: el.dataset.cta,
      cta_text: el.textContent.trim().replace(/\s+/g, ' '),
      store: el.dataset.store || null
    };
  }

  var shown = {};
  var ctaIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var id = e.target.dataset.cta;
      if (e.isIntersecting && !shown[id]) {
        shown[id] = true;
        track('CTA Impression', ctaProps(e.target));
        ctaIo.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  ctas.forEach(function (el) {
    ctaIo.observe(el);
    el.addEventListener('click', function () { track('CTA Clicked', ctaProps(el)); });
  });

  // FAQ 펼침
  document.querySelectorAll('.faq details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) track('FAQ Opened', { question: d.querySelector('summary').textContent.trim() });
    });
  });

  // 섹션 도달 (혜택·절차·다운로드)
  var seen = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !seen[e.target.id]) {
        seen[e.target.id] = true;
        track('Section Viewed', { section: e.target.id });
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('section[id]').forEach(function (s) { io.observe(s); });

  // 스크롤 깊이 25/50/75/100%
  var marks = [25, 50, 75, 100], hit = {};
  window.addEventListener('scroll', function () {
    // doctype 없는 페이지(쿼크 모드)에서도 동작하도록 scrollY 사용
    var total = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    var pct = (window.scrollY + innerHeight + 2) / total * 100; // 맨 아래 소수점 오차 보정
    marks.forEach(function (m) {
      if (pct >= m && !hit[m]) { hit[m] = true; track('Scroll Depth Reached', { percent: m }); }
    });
  }, { passive: true });
})();
