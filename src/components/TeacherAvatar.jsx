import { useEffect, useRef } from 'react';

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

/* ═══════════════════════════════════════════════════════════════
   스프라이트 시트 설정
   ───────────────────────────────────────────────────────────────
   public/kirby.png 를 원본 이미지 (2816 × 1536 px) 로 가정.
   아래 RAW 좌표는 원본 이미지 픽셀 기준 [x, y] (각 스프라이트 좌상단).
   잘 안 맞으면 RAW 값 + SPRITE_W/H 만 수정하세요.
   ═══════════════════════════════════════════════════════════════ */
const ORIG_W   = 2816;
const ORIG_H   = 1536;
const SPRITE_W = 190;   // 원본에서 스프라이트 1개 가로 크기(px)
const SPRITE_H = 190;   // 원본에서 스프라이트 1개 세로 크기(px)
const DISPLAY  = 80;    // 화면에 표시할 크기(px)

const SC  = DISPLAY / SPRITE_W;                 // 스케일
const BGW = Math.round(ORIG_W * SC);
const BGH = Math.round(ORIG_H * SC);

// 원본 이미지 내 각 스프라이트 좌표 [x, y]
// → 맞지 않으면 여기만 수정
const RAW = {
  // ── Stand ──
  front_idle:   [  38, 133],
  back_idle:    [ 228, 133],
  left_idle:    [ 822, 133],
  right_idle:   [1077, 133],

  // ── Walking (front) 4프레임 ──
  front_walk0:  [  38, 342],
  front_walk1:  [ 229, 342],
  front_walk2:  [ 420, 342],
  front_walk3:  [ 611, 342],

  // ── Walking (left) 4프레임 ──
  left_walk0:   [ 870, 342],
  left_walk1:   [1030, 342],
  left_walk2:   [1190, 342],
  left_walk3:   [1350, 342],

  // ── Walking (right) 4프레임 ──
  right_walk0:  [1678, 342],
  right_walk1:  [1838, 342],
  right_walk2:  [1998, 342],
  right_walk3:  [2158, 342],

  // ── Inhaling (입 벌리기 / talk 애니) ──
  inhale0:      [  38, 700],
  inhale1:      [ 260, 700],
  inhale2:      [ 480, 700],
};

// 화면 좌표로 변환
const POS = Object.fromEntries(
  Object.entries(RAW).map(([k, [x, y]]) => [
    k,
    `${-Math.round(x * SC)}px ${-Math.round(y * SC)}px`,
  ])
);

// 6프레임 걷기 루프 (0→1→2→3→2→1)
const WALK = ['walk0', 'walk1', 'walk2', 'walk3', 'walk2', 'walk1'];

const CW = DISPLAY;
const CH = DISPLAY;

function spawnStar(cx, cy) {
  const syms = ['⭐', '✦', '★', '✨', '💫'];
  const el = document.createElement('span');
  el.textContent = syms[Math.floor(Math.random() * syms.length)];
  const sz = 13 + Math.random() * 11;
  el.style.cssText = [
    'position:fixed;pointer-events:none;z-index:499;',
    `left:${cx + (Math.random() - 0.5) * 60}px;`,
    `top:${cy + (Math.random() - 0.5) * 20}px;`,
    `font-size:${sz}px;`,
    'animation:kirbyStar 1.1s ease-out forwards;',
  ].join('');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

export default function TeacherAvatar() {
  const containerRef = useRef(null);
  const spriteRef    = useRef(null);
  const bubbleRef    = useRef(null);
  const nagTextRef   = useRef(null);
  const rafRef       = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `@keyframes kirbyStar {
      0%   { opacity:1; transform:translate(-50%,-50%) scale(1) rotate(0deg); }
      100% { opacity:0; transform:translate(-50%,calc(-50% - 65px)) scale(0.1) rotate(30deg); }
    }`;
    document.head.appendChild(style);

    const s = {
      x: 220, y: 220,
      vx: 1.0, vy: 0.45,
      dir: 'right', walkFrame: 0,
      phase: 'walk',
      nagVisible: false, nagIdx: 0,
      frameTimer: 0,
      walkTimer: Math.random() * 1500,
      nagTimer: 0, bounceT: 0, last: 0,
    };

    const getKey = () => {
      const { phase, dir, walkFrame, nagTimer } = s;
      const speaking = phase === 'talk_pre' || phase === 'talk';

      if (speaking) {
        // 입 벌리기 4단계 루프 (0→1→2→1→...)
        const t = Math.floor(nagTimer / 320) % 4;
        return `inhale${[0, 1, 2, 1][t]}`;
      }
      if (phase === 'walk') {
        const f = WALK[walkFrame % WALK.length];
        // back 방향은 front walk 프레임 사용 (별도 back-walk 없음)
        return `${dir === 'back' ? 'front' : dir}_${f}`;
      }
      return `${dir}_idle`;
    };

    const tick = (t) => {
      const dt = s.last ? Math.min(t - s.last, 50) : 16;
      s.last = t;

      if (s.phase === 'walk') {
        s.bounceT += dt;
        s.x += s.vx;
        s.y += s.vy;

        const mx = window.innerWidth  - CW - 14;
        const my = window.innerHeight - CH - 14;
        if (s.x < 14) { s.vx =  Math.abs(s.vx); s.x = 14; }
        if (s.x > mx) { s.vx = -Math.abs(s.vx); s.x = mx; }
        if (s.y < 90) { s.vy =  Math.abs(s.vy); s.y = 90; }
        if (s.y > my) { s.vy = -Math.abs(s.vy); s.y = my; }

        const ax = Math.abs(s.vx), ay = Math.abs(s.vy);
        s.dir = ax >= ay
          ? (s.vx > 0 ? 'right' : 'left')
          : (s.vy > 0 ? 'front' : 'back');

        s.frameTimer += dt;
        if (s.frameTimer > 175) {
          s.walkFrame = (s.walkFrame + 1) % WALK.length;
          s.frameTimer = 0;
        }

        s.walkTimer += dt;
        if (s.walkTimer > 2600 + Math.random() * 2800) {
          s.phase = 'talk_pre';
          s.dir = 'front';
          s.nagTimer = 0; s.walkTimer = 0; s.bounceT = 0;
          const cx = s.x + CW / 2, cy = s.y + CH / 2;
          for (let i = 0; i < 6; i++) setTimeout(() => spawnStar(cx, cy), i * 90);
        }

      } else if (s.phase === 'talk_pre') {
        s.nagTimer += dt;
        if (s.nagTimer > 900) {
          s.phase = 'talk';
          s.nagVisible = true;
          s.nagIdx = (s.nagIdx + 1) % NAGS.length;
          s.nagTimer = 0;
        }

      } else if (s.phase === 'talk') {
        s.nagTimer += dt;
        if (s.nagTimer > 3200) {
          s.nagVisible = false;
          s.phase = 'idle_out';
          s.nagTimer = 0;
        }

      } else if (s.phase === 'idle_out') {
        s.nagTimer += dt;
        if (s.nagTimer > 600) {
          s.phase = 'walk';
          const a = Math.random() * Math.PI * 2;
          const spd = 0.85 + Math.random() * 0.85;
          s.vx = Math.cos(a) * spd;
          s.vy = Math.sin(a) * spd * 0.6;
          s.nagTimer = 0;
        }
      }

      // 커비 위아래 통통 바운스
      const yOff = s.phase === 'walk' ? Math.sin(s.bounceT * 0.013) * 3 : 0;
      if (containerRef.current)
        containerRef.current.style.transform = `translate(${s.x}px,${Math.round(s.y + yOff)}px)`;

      if (spriteRef.current) {
        const key = getKey();
        spriteRef.current.style.backgroundPosition = POS[key] || POS.front_idle;
      }

      if (bubbleRef.current)
        bubbleRef.current.style.opacity = s.nagVisible ? '1' : '0';
      if (nagTextRef.current)
        nagTextRef.current.textContent = NAGS[s.nagIdx];

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      style.remove();
    };
  }, []);

  return (
    <div ref={containerRef} style={{
      position: 'fixed', top: 0, left: 0,
      width: CW, height: CH,
      zIndex: 500, pointerEvents: 'none',
      willChange: 'transform',
    }}>
      {/* 말풍선 */}
      <div ref={bubbleRef} style={{
        position: 'absolute',
        bottom: CH + 8,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#fff',
        border: '2.5px solid #FF5673',
        borderRadius: 14,
        padding: '7px 13px',
        fontSize: 12, fontWeight: 700, color: '#3D1A2A',
        whiteSpace: 'nowrap',
        boxShadow: '0 3px 14px rgba(255,86,115,0.22)',
        fontFamily: 'sans-serif',
        opacity: 0, transition: 'opacity 0.3s',
        zIndex: 501,
      }}>
        <span ref={nagTextRef} />
        <span style={{ position:'absolute', bottom:-10, left:'50%', transform:'translateX(-50%)', display:'block', width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderTop:'10px solid #FF5673' }} />
        <span style={{ position:'absolute', bottom:-7,  left:'50%', transform:'translateX(-50%)', display:'block', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'8px solid #fff' }} />
      </div>

      {/* 커비 스프라이트 */}
      <div ref={spriteRef} style={{
        width: CW, height: CH,
        backgroundImage: 'url(/kirby.png)',
        backgroundSize: `${BGW}px ${BGH}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        backgroundPosition: POS.front_idle,
      }} />
    </div>
  );
}
