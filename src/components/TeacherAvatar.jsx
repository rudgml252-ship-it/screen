import { useEffect, useRef } from 'react';

/* ─── 잔소리 메시지 ─────────────────────────────────────────── */
const NAGS = [
  '🔔 종이 치면 바로 자리에 앉으세요!',
  '🚫 친구에게 과한 장난은 금지예요!',
  '🌸 예쁜 말, 고운 말만 쓰기로 해요~',
  '🙅 욕설은 절대 안 됩니다!',
  '🤝 친구를 존중하는 말을 써요',
  '📚 교과서 미리 꺼내 놓으세요',
  '👀 수업 시간엔 집중해요!',
  '😊 친구에게 항상 친절하게!',
  '🪑 바른 자세로 앉읍시다',
  '🤫 수업 중엔 조용히 해요',
  '💪 오늘도 최선을 다해 봐요!',
  '📝 필기도구 준비됐나요?',
  '🎒 가방 정리 잘 했죠?',
];

/* ─── 스프라이트 시트 설정 (public/kirby.png, 원본 2816×1536) ─
   각 프레임 슬롯: 원본 183px 너비 × 240px 높이
   SC = 80/183 → 화면에 프레임 1개가 딱 80px 너비로 표시됨
   ──────────────────────────────────────────────────────────── */
const ORIG_W  = 2816;
const ORIG_H  = 1536;
const SLOT    = 183;          // 원본 이미지 프레임 슬롯 너비(px)
const SC      = 80 / SLOT;   // ≈ 0.437  (조정 시 여기만 변경)
const CW      = 80;           // 화면 표시 너비(px) = SLOT * SC
const CH      = 96;           // 화면 표시 높이(px)
const BGW     = Math.round(ORIG_W * SC);   // 전체 시트 표시 너비
const BGH     = Math.round(ORIG_H * SC);   // 전체 시트 표시 높이
const SHEET   = 'url(/kirby.png)';

// 각 애니메이션 정의 (x/y = 원본 이미지 좌상단, n = 프레임 수)
// ※ 좌표가 맞지 않으면 x/y 값만 조정하세요
const SPR = {
  idle:       { x:   70, y: 127, n: 1 },
  walk_left:  { x:  800, y: 390, n: 4, dur: '0.52s' },
  walk_right: { x: 1620, y: 390, n: 4, dur: '0.52s' },
  inhale:     { x:   70, y: 670, n: 3, dur: '0.65s' },
};

// 원본 좌표 → 화면 background-position 문자열
const toPos = (x, y) =>
  `${-Math.round(x * SC)}px ${-Math.round(y * SC)}px`;

// CSS keyframes 문자열 생성 (애니메이션 프레임만)
const KEYFRAMES = Object.entries(SPR)
  .filter(([, v]) => v.n > 1)
  .map(([name, { x, y, n }]) => {
    const fy = -Math.round(y * SC);
    const x0 = -Math.round(x * SC);
    const x1 = -Math.round((x + n * SLOT) * SC);
    return `@keyframes k_${name}{from{background-position:${x0}px ${fy}px}to{background-position:${x1}px ${fy}px}}`;
  }).join('');

/* ─── 이펙트 함수 ─────────────────────────────────────────────── */

// 무지개 잔상 (이동 중 80ms마다 생성)
function spawnTrail(x, y, bgPos) {
  const hue = (performance.now() * 0.25) % 360;
  const el = document.createElement('div');
  el.style.cssText =
    `position:fixed;pointer-events:none;z-index:498;`
    + `left:${x}px;top:${y}px;width:${CW}px;height:${CH}px;`
    + `background:${SHEET};background-size:${BGW}px ${BGH}px;`
    + `background-repeat:no-repeat;image-rendering:pixelated;`
    + `background-position:${bgPos};`
    + `filter:hue-rotate(${hue}deg) saturate(2.5) brightness(1.15);`
    + `opacity:0.5;transition:opacity 0.7s ease-out;`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '0'; });
  setTimeout(() => el.remove(), 750);
}

// 빨아들이기 파티클 (마우스오버 시 Kirby 쪽으로 수렴)
function spawnSuction(kx, ky) {
  for (let i = 0; i < 9; i++) {
    const delay = i * 55;
    setTimeout(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 55 + Math.random() * 75;
      const sx = kx + Math.cos(angle) * dist;
      const sy = ky + Math.sin(angle) * dist;
      const hue = Math.round(Math.random() * 360);
      const el = document.createElement('div');
      el.style.cssText =
        `position:fixed;pointer-events:none;z-index:497;`
        + `width:8px;height:8px;border-radius:50%;`
        + `background:hsl(${hue},90%,72%);`
        + `left:${sx}px;top:${sy}px;`
        + `transition:left 0.42s ease-in,top 0.42s ease-in,opacity 0.42s,transform 0.42s ease-in;`
        + `opacity:0.95;`;
      document.body.appendChild(el);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.left      = `${kx}px`;
        el.style.top       = `${ky}px`;
        el.style.opacity   = '0';
        el.style.transform = 'scale(0.1)';
      }));
      setTimeout(() => el.remove(), 480);
    }, delay);
  }
}

/* ─── 컴포넌트 ───────────────────────────────────────────────── */
export default function TeacherAvatar() {
  const wrapRef    = useRef(null);   // 전체 위치 컨테이너
  const spRef      = useRef(null);   // 스프라이트 div
  const bubbleRef  = useRef(null);   // 말풍선 div
  const nagRef     = useRef(null);   // 잔소리 텍스트 span
  const rafRef     = useRef(null);

  useEffect(() => {
    // CSS keyframes 주입
    const styleEl = document.createElement('style');
    styleEl.textContent = KEYFRAMES;
    document.head.appendChild(styleEl);

    // 스프라이트 기본 스타일 설정
    const sp = spRef.current;
    if (sp) {
      sp.style.backgroundImage  = SHEET;
      sp.style.backgroundSize   = `${BGW}px ${BGH}px`;
      sp.style.backgroundRepeat = 'no-repeat';
      sp.style.imageRendering   = 'pixelated';
    }

    // 초기 잔소리 텍스트
    const nagEl = nagRef.current;
    if (nagEl) nagEl.textContent = NAGS[0];

    /* ── 상태 객체 ── */
    const s = {
      x: 200, y: 200,
      vx: 0.85, vy: 0.38,
      curAnim: '',            // 현재 적용된 애니 키
      hovered: false,
      trailTimer: 0,
      suctionTimer: 0,
      bounceT: 0,
      nagTimer: 0,
      nagInterval: 5000 + Math.random() * 2000,
      nagIdx: 0,
      dirChangeTimer: 0,      // 방향 전환 타이머
      last: 0,
    };

    /* ── 마우스 근접 감지 (pointer-events:none 유지하면서 hover 구현) ── */
    const onMouseMove = (e) => {
      const cx = s.x + CW / 2, cy = s.y + CH * 0.45;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      s.hovered = (dx * dx + dy * dy) < 55 * 55;
    };
    document.addEventListener('mousemove', onMouseMove);

    /* ── 애니 적용 (키 변경 시에만 DOM 건드림 → 불필요한 리스타트 방지) ── */
    const applyAnim = (key) => {
      if (!sp || key === s.curAnim) return;
      s.curAnim = key;
      const spr = SPR[key] || SPR.idle;
      sp.style.backgroundPosition = toPos(spr.x, spr.y);
      sp.style.animation = spr.n > 1
        ? `k_${key} ${spr.dur} steps(${spr.n}) infinite`
        : 'none';
    };

    /* ── 잔소리 텍스트 전환 ── */
    const changeNag = () => {
      if (!nagEl || !bubbleRef.current) return;
      nagEl.style.opacity = '0';
      setTimeout(() => {
        s.nagIdx = Math.floor(Math.random() * NAGS.length);
        nagEl.textContent  = NAGS[s.nagIdx];
        nagEl.style.opacity = '1';
      }, 280);
    };

    /* ── 메인 애니메이션 루프 ── */
    const tick = (t) => {
      const dt = s.last ? Math.min(t - s.last, 50) : 16;
      s.last = t;

      if (s.hovered) {
        /* ── Hover: Inhaling 모드 ── */
        applyAnim('inhale');
        s.bounceT = 0;

        s.suctionTimer += dt;
        if (s.suctionTimer > 380) {
          spawnSuction(s.x + CW / 2, s.y + CH * 0.45);
          s.suctionTimer = 0;
        }

        // 말풍선 숨기기
        if (bubbleRef.current) bubbleRef.current.style.opacity = '0';

      } else {
        /* ── 일반: 걷기 모드 ── */
        s.suctionTimer = 0;
        s.bounceT += dt;
        s.x += s.vx;
        s.y += s.vy;

        const mx = window.innerWidth  - CW  - 12;
        const my = window.innerHeight - CH  - 12;
        if (s.x < 12)  { s.vx =  Math.abs(s.vx); s.x = 12; }
        if (s.x > mx)  { s.vx = -Math.abs(s.vx); s.x = mx; }
        if (s.y < 70)  { s.vy =  Math.abs(s.vy); s.y = 70; }
        if (s.y > my)  { s.vy = -Math.abs(s.vy); s.y = my; }

        // 방향에 따라 스프라이트 선택 (수평 이동 우선)
        const walkKey = s.vx >= 0 ? 'walk_right' : 'walk_left';
        applyAnim(walkKey);

        // 무지개 잔상
        s.trailTimer += dt;
        if (s.trailTimer > 80) {
          spawnTrail(s.x, s.y, sp?.style.backgroundPosition ?? '');
          s.trailTimer = 0;
        }

        // 잔소리 교체
        s.nagTimer += dt;
        if (s.nagTimer >= s.nagInterval) {
          s.nagTimer    = 0;
          s.nagInterval = 5000 + Math.random() * 2000;
          changeNag();
        }

        // 말풍선 표시
        if (bubbleRef.current) bubbleRef.current.style.opacity = '1';

        // 주기적 방향 변환 (자연스러운 wandering)
        s.dirChangeTimer += dt;
        if (s.dirChangeTimer > 4000 + Math.random() * 4000) {
          const a = Math.random() * Math.PI * 2;
          const spd = 0.75 + Math.random() * 0.7;
          s.vx = Math.cos(a) * spd;
          s.vy = Math.sin(a) * spd * 0.55;
          s.dirChangeTimer = 0;
        }
      }

      // 위치 적용 (걷기 바운스 포함)
      const yBounce = !s.hovered ? Math.sin(s.bounceT * 0.012) * 3 : 0;
      if (wrapRef.current)
        wrapRef.current.style.transform =
          `translate(${s.x}px,${Math.round(s.y + yBounce)}px)`;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', onMouseMove);
      styleEl.remove();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: CW, height: CH,
        zIndex: 500,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    >
      {/* ── 픽셀 아트 말풍선 ── */}
      <div
        ref={bubbleRef}
        style={{
          position: 'absolute',
          bottom: CH + 8,
          left: '50%',
          transform: 'translateX(-50%)',
          // 레트로 픽셀 스타일: 각진 테두리 + 오프셋 그림자
          background: '#FFF9C4',
          border: '2px solid #1a1a1a',
          borderRadius: 0,                         // 각진 모서리
          padding: '5px 9px',
          fontSize: 11,
          fontWeight: 700,
          color: '#1a1a1a',
          whiteSpace: 'nowrap',
          fontFamily: '"Courier New", Courier, monospace',
          letterSpacing: '0.02em',
          boxShadow: '3px 3px 0 0 #1a1a1a',       // 픽셀 드롭섀도
          opacity: 1,
          transition: 'opacity 0.25s',
          zIndex: 501,
          userSelect: 'none',
        }}
      >
        <span
          ref={nagRef}
          style={{ transition: 'opacity 0.28s' }}
        />

        {/* 말풍선 꼬리 (아래 방향 삼각형, 픽셀 스타일) */}
        <span style={{
          position: 'absolute', bottom: -9, left: '50%',
          marginLeft: -6,
          display: 'block', width: 0, height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid #1a1a1a',
        }} />
        <span style={{
          position: 'absolute', bottom: -6, left: '50%',
          marginLeft: -5,
          display: 'block', width: 0, height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '7px solid #FFF9C4',
        }} />
      </div>

      {/* ── 커비 스프라이트 (CSS steps() 애니메이션) ── */}
      <div ref={spRef} style={{ width: CW, height: CH }} />
    </div>
  );
}
