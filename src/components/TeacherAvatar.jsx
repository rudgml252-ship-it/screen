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

// Pixel size — element is P×P so shadow spread is 0
const P  = 5;
const __ = null;
const BK = '#101018'; // outline
const PK = '#F9A0B8'; // kirby pink
const CP = '#E06080'; // cheek blush
const RD = '#C01858'; // feet / mouth
const WH = '#FFFFFF'; // eye white

const toShadow = (grid) => {
  const s = [];
  grid.forEach((row, y) => row.forEach((c, x) => {
    if (c) s.push(`${x * P}px ${y * P}px 0 0 ${c}`);
  }));
  return s.join(',');
};

/* ────────────────── SPRITES (12 wide × 12 tall) ────────────────── */

// Front body rows 0-7
const FB = [
  [__,__,BK,BK,BK,BK,BK,BK,BK,__,__,__],
  [__,BK,PK,PK,PK,PK,PK,PK,PK,BK,__,__],
  [BK,PK,PK,BK,BK,PK,PK,BK,BK,PK,BK,__],
  [BK,PK,BK,WH,BK,PK,PK,BK,WH,BK,PK,BK],
  [BK,PK,PK,BK,BK,PK,PK,BK,BK,PK,PK,BK],
  [BK,PK,CP,PK,PK,PK,PK,PK,CP,PK,PK,BK],
  [BK,PK,PK,PK,BK,BK,PK,PK,PK,PK,PK,BK],
  [__,BK,PK,PK,PK,PK,PK,PK,PK,PK,BK,__],
];
// Front mouth-open rows 0-7
const FT = [
  ...FB.slice(0, 5),
  [BK,PK,CP,PK,PK,PK,PK,PK,CP,PK,PK,BK],
  [BK,PK,PK,BK,BK,BK,BK,BK,PK,PK,PK,BK],
  [BK,PK,RD,RD,RD,RD,RD,RD,PK,PK,PK,BK],
];

// Back body rows 0-7
const BB = [
  [__,__,BK,BK,BK,BK,BK,BK,BK,__,__,__],
  [__,BK,PK,PK,PK,PK,PK,PK,PK,BK,__,__],
  [BK,PK,PK,PK,PK,PK,PK,PK,PK,PK,BK,__],
  [BK,PK,PK,PK,PK,PK,PK,PK,PK,PK,PK,BK],
  [BK,PK,PK,PK,PK,PK,PK,PK,PK,PK,PK,BK],
  [BK,PK,PK,PK,PK,PK,PK,PK,PK,PK,PK,BK],
  [BK,PK,PK,PK,PK,PK,PK,PK,PK,PK,BK,__],
  [__,BK,PK,PK,PK,PK,PK,PK,PK,BK,__,__],
];

// Left body rows 0-7 (right = CSS scaleX(-1) of left)
const LB = [
  [__,__,BK,BK,BK,BK,BK,BK,__,__,__,__],
  [__,BK,PK,PK,PK,PK,PK,PK,BK,__,__,__],
  [BK,PK,PK,BK,BK,PK,PK,PK,PK,BK,__,__],
  [BK,PK,BK,WH,BK,PK,PK,PK,PK,PK,BK,__],
  [BK,PK,PK,BK,BK,PK,PK,PK,PK,BK,__,__],
  [BK,PK,CP,PK,PK,PK,PK,PK,PK,BK,__,__],
  [BK,PK,PK,BK,PK,PK,PK,PK,BK,__,__,__],
  [__,BK,PK,PK,PK,PK,PK,BK,__,__,__,__],
];

// Shared leg sets (rows 8-11, 12 wide)
const LEG_IDLE = [
  [__,BK,PK,PK,BK,__,__,BK,PK,PK,BK,__],
  [__,BK,BK,RD,RD,BK,BK,RD,RD,BK,BK,__],
  [__,__,BK,RD,RD,BK,BK,RD,RD,BK,__,__],
  [__,__,__,BK,BK,__,__,BK,BK,__,__,__],
];
const LEG_W1 = [
  [__,BK,PK,PK,BK,__,__,BK,PK,PK,BK,__],
  [BK,BK,RD,RD,BK,__,__,BK,RD,RD,BK,BK],
  [BK,RD,RD,BK,__,__,__,__,BK,RD,RD,BK],
  [__,BK,BK,__,__,__,__,__,__,BK,BK,__],
];
const LEG_W2 = [
  [__,BK,PK,PK,BK,__,__,BK,PK,PK,BK,__],
  [__,BK,BK,RD,RD,BK,BK,RD,RD,BK,BK,__],
  [BK,RD,RD,BK,BK,__,__,BK,BK,RD,RD,BK],
  [__,BK,BK,__,__,__,__,__,__,BK,BK,__],
];

// Left-specific legs (character occupies left half of sprite)
const LL_IDLE = [
  [BK,PK,BK,__,__,__,__,BK,PK,PK,BK,__],
  [BK,RD,RD,BK,__,__,BK,RD,RD,BK,__,__],
  [__,BK,RD,RD,BK,__,BK,RD,RD,BK,__,__],
  [__,__,BK,BK,__,__,__,BK,BK,__,__,__],
];
const LL_W1 = [
  [BK,PK,BK,__,__,__,__,BK,PK,PK,BK,__],
  [BK,RD,RD,BK,__,__,__,BK,RD,RD,BK,__],
  [BK,RD,RD,BK,__,__,BK,RD,RD,BK,__,__],
  [__,BK,BK,__,__,__,__,BK,BK,__,__,__],
];
const LL_W2 = [
  [BK,PK,BK,__,__,__,__,BK,PK,PK,BK,__],
  [__,BK,RD,RD,BK,__,BK,RD,RD,BK,__,__],
  [BK,RD,RD,BK,__,__,__,BK,RD,RD,BK,__],
  [__,BK,BK,__,__,__,__,__,BK,BK,__,__],
];

/* precompute all shadow strings once */
const SH_MAP = {
  front_idle: toShadow([...FB, ...LEG_IDLE]),
  front_talk: toShadow([...FT, ...LEG_IDLE]),
  front_0:    toShadow([...FB, ...LEG_W1]),
  front_1:    toShadow([...FB, ...LEG_W2]),
  back_idle:  toShadow([...BB, ...LEG_IDLE]),
  back_0:     toShadow([...BB, ...LEG_W1]),
  back_1:     toShadow([...BB, ...LEG_W2]),
  left_idle:  toShadow([...LB, ...LL_IDLE]),
  left_0:     toShadow([...LB, ...LL_W1]),
  left_1:     toShadow([...LB, ...LL_W2]),
};

const CW = 12 * P; // 60px
const CH = 12 * P; // 60px

/* star particles that pop out when Kirby stops */
function spawnStar(cx, cy) {
  const syms = ['⭐', '✦', '★', '✨', '💫'];
  const el = document.createElement('span');
  el.textContent = syms[Math.floor(Math.random() * syms.length)];
  const sz = 13 + Math.random() * 10;
  const dx = (Math.random() - 0.5) * 60;
  el.style.cssText = `
    position:fixed;pointer-events:none;z-index:499;
    left:${cx + dx}px;top:${cy}px;font-size:${sz}px;
    animation:kirbyStar 1.1s ease-out forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

export default function TeacherAvatar() {
  const containerRef = useRef(null);
  const wrapperRef   = useRef(null);
  const pixelRef     = useRef(null);
  const bubbleRef    = useRef(null);
  const nagTextRef   = useRef(null);
  const rafRef       = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `@keyframes kirbyStar {
      0%   { opacity:1; transform:translate(-50%,-50%) scale(1) rotate(0deg); }
      100% { opacity:0; transform:translate(-50%,calc(-50% - 60px)) scale(0.15) rotate(30deg); }
    }`;
    document.head.appendChild(style);

    const s = {
      x: 200, y: 200,
      vx: 1.0, vy: 0.45,
      dir: 'right', frame: 0,
      // phases: walk → talk_pre → talk → idle_out → walk
      phase: 'walk',
      nagVisible: false, nagIdx: 0,
      frameTimer: 0,
      walkTimer: Math.random() * 1500,
      nagTimer: 0,
      bounceT: 0,
      last: 0,
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
        s.dir = ax >= ay ? (s.vx > 0 ? 'right' : 'left') : (s.vy > 0 ? 'front' : 'back');

        s.frameTimer += dt;
        if (s.frameTimer > 200) { s.frame ^= 1; s.frameTimer = 0; }

        s.walkTimer += dt;
        if (s.walkTimer > 2600 + Math.random() * 2800) {
          s.phase = 'talk_pre';
          s.dir = 'front'; s.frame = 0;
          s.nagTimer = 0; s.walkTimer = 0; s.bounceT = 0;
          const cx = s.x + CW / 2, cy = s.y + CH / 2;
          for (let i = 0; i < 6; i++) setTimeout(() => spawnStar(cx, cy), i * 90);
        }

      } else if (s.phase === 'talk_pre') {
        s.nagTimer += dt;
        if (s.nagTimer > 700) {
          s.phase = 'talk';
          s.nagVisible = true;
          s.nagIdx = (s.nagIdx + 1) % NAGS.length;
          s.nagTimer = 0;
        }

      } else if (s.phase === 'talk') {
        s.nagTimer += dt;
        if (s.nagTimer > 3000) {
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

      // Kirby bob while walking
      const yOff = s.phase === 'walk' ? Math.sin(s.bounceT * 0.014) * 3 : 0;
      if (containerRef.current)
        containerRef.current.style.transform = `translate(${s.x}px,${Math.round(s.y + yOff)}px)`;

      if (wrapperRef.current && pixelRef.current) {
        const speaking = s.phase === 'talk_pre' || s.phase === 'talk';
        const lr  = s.dir === 'right' ? 'left' : s.dir;
        let key;
        if (speaking) {
          key = (Math.floor(s.nagTimer / 400) % 2 === 0) ? 'front_talk' : 'front_idle';
        } else if (s.phase === 'walk') {
          key = `${lr}_${s.frame}`;
        } else {
          key = `${lr}_idle`;
        }
        wrapperRef.current.style.transform = s.dir === 'right' ? 'scaleX(-1)' : 'none';
        pixelRef.current.style.boxShadow   = SH_MAP[key] || SH_MAP.front_idle;
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
        fontSize: 12,
        fontWeight: 700,
        color: '#3D1A2A',
        whiteSpace: 'nowrap',
        boxShadow: '0 3px 14px rgba(255,86,115,0.22)',
        fontFamily: 'sans-serif',
        opacity: 0,
        transition: 'opacity 0.3s',
        zIndex: 501,
      }}>
        <span ref={nagTextRef} />
        <span style={{ position:'absolute', bottom:-10, left:'50%', transform:'translateX(-50%)', display:'block', width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderTop:'10px solid #FF5673' }} />
        <span style={{ position:'absolute', bottom:-7,  left:'50%', transform:'translateX(-50%)', display:'block', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'8px solid #fff' }} />
      </div>

      {/* 픽셀 커비 */}
      <div ref={wrapperRef} style={{ width: CW, height: CH, position: 'relative' }}>
        <div ref={pixelRef} style={{ width: P, height: P, position: 'absolute', top: 0, left: 0 }} />
      </div>
    </div>
  );
}
