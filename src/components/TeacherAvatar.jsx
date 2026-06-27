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

const P  = 4;      // px per pixel unit
const CW = 10 * P; // 40px
const CH = 13 * P; // 52px

const __ = null;
const HR = '#3B1A10';
const HP = '#C4608A';
const SK = '#F5C5A3';
const EY = '#180805';
const BL = '#E87090';
const PU = '#7050B8';
const WH = '#F8F8F8';
const SH = '#3D2810';

const toShadow = (grid) => {
  const s = [];
  grid.forEach((row, y) => row.forEach((c, x) => {
    if (c) s.push(`${x * P}px ${y * P}px 0 ${P - 1}px ${c}`);
  }));
  return s.join(',');
};

/* ── Front ── */
const FB = [
  [__,__,HR,HR,HR,HR,HR,HR,__,__],
  [__,HR,HP,HP,HP,HP,HP,HP,HR,__],
  [__,HR,SK,SK,SK,SK,SK,SK,HR,__],
  [__,__,SK,EY,SK,SK,EY,SK,__,__],
  [__,__,SK,SK,SK,SK,SK,SK,__,__],
  [__,__,SK,WH,WH,WH,WH,SK,__,__],
  [__,BL,BL,BL,BL,BL,BL,BL,BL,__],
  [SK,BL,BL,BL,BL,BL,BL,BL,BL,SK],
  [__,BL,BL,BL,BL,BL,BL,BL,BL,__],
  [__,PU,PU,PU,PU,PU,PU,PU,PU,__],
  [__,PU,PU,PU,PU,PU,PU,PU,PU,__],
];
const F0 = [...FB, [__,__,WH,WH,__,__,WH,WH,__,__],[__,__,SH,SH,__,__,SH,SH,__,__]];
const F1 = [...FB, [__,WH,WH,__,__,__,__,WH,__,__],[__,SH,SH,__,__,__,__,__,SH,__]];
const F2 = [...FB, [__,__,WH,__,__,__,WH,WH,__,__],[__,SH,__,__,__,__,SH,SH,__,__]];

/* ── Back ── */
const BB = [
  [__,__,HR,HR,HR,HR,HR,HR,__,__],
  [__,HR,HR,HR,HR,HR,HR,HR,HR,__],
  [__,HR,HP,HP,HP,HP,HP,HP,HR,__],
  [__,HR,HR,HR,HR,HR,HR,HR,HR,__],
  [__,__,SK,SK,SK,SK,SK,SK,__,__],
  [__,__,SK,SK,SK,SK,SK,SK,__,__],
  [__,BL,BL,BL,BL,BL,BL,BL,BL,__],
  [SK,BL,BL,BL,BL,BL,BL,BL,BL,SK],
  [__,BL,BL,BL,BL,BL,BL,BL,BL,__],
  [__,PU,PU,PU,PU,PU,PU,PU,PU,__],
  [__,PU,PU,PU,PU,PU,PU,PU,PU,__],
];
const B0 = [...BB, [__,__,WH,WH,__,__,WH,WH,__,__],[__,__,SH,SH,__,__,SH,SH,__,__]];
const B1 = [...BB, [__,WH,WH,__,__,__,__,WH,__,__],[__,SH,SH,__,__,__,__,__,SH,__]];
const B2 = [...BB, [__,__,WH,__,__,__,WH,WH,__,__],[__,SH,__,__,__,__,SH,SH,__,__]];

/* ── Left (right = CSS scaleX(-1)) ── */
const LB = [
  [__,__,HR,HR,HR,HR,__,__,__,__],
  [__,HR,HP,HP,HP,HP,HR,__,__,__],
  [__,HR,SK,SK,SK,SK,HR,__,__,__],
  [__,__,SK,EY,SK,SK,__,__,__,__],
  [__,__,SK,SK,SK,SK,__,__,__,__],
  [__,__,SK,WH,SK,__,__,__,__,__],
  [__,BL,BL,BL,BL,BL,__,__,__,__],
  [__,BL,BL,BL,BL,BL,SK,__,__,__],
  [__,BL,BL,BL,BL,BL,__,__,__,__],
  [__,PU,PU,PU,PU,PU,__,__,__,__],
  [__,PU,PU,PU,PU,PU,__,__,__,__],
];
const L0 = [...LB, [__,__,WH,WH,__,__,__,__,__,__],[__,__,SH,SH,__,__,__,__,__,__]];
const L1 = [...LB, [__,WH,WH,__,WH,__,__,__,__,__],[__,SH,SH,__,SH,__,__,__,__,__]];
const L2 = [...LB, [__,__,WH,WH,__,WH,__,__,__,__],[__,__,SH,SH,__,SH,__,__,__,__]];

const SH_MAP = {
  front_idle: toShadow(F0), front_0: toShadow(F1), front_1: toShadow(F2),
  back_idle:  toShadow(B0), back_0:  toShadow(B1), back_1:  toShadow(B2),
  left_idle:  toShadow(L0), left_0:  toShadow(L1), left_1:  toShadow(L2),
};

export default function TeacherAvatar() {
  const containerRef = useRef(null);
  const wrapperRef   = useRef(null);
  const pixelRef     = useRef(null);
  const bubbleRef    = useRef(null);
  const nagTextRef   = useRef(null);
  const rafRef       = useRef(null);

  useEffect(() => {
    const s = {
      x: 180, y: 160,
      vx: 1.1, vy: 0.55,
      dir: 'right', frame: 0,
      walking: true,
      nagVisible: false, nagIdx: 0,
      frameTimer: 0, walkTimer: Math.random() * 1200,
      nagTimer: 0, last: 0,
    };

    const tick = (t) => {
      const dt = s.last ? Math.min(t - s.last, 50) : 16;
      s.last = t;

      if (s.walking) {
        s.x += s.vx;
        s.y += s.vy;

        const mx = window.innerWidth  - CW - 12;
        const my = window.innerHeight - CH - 12;
        if (s.x < 12) { s.vx =  Math.abs(s.vx); s.x = 12; }
        if (s.x > mx) { s.vx = -Math.abs(s.vx); s.x = mx; }
        if (s.y < 90) { s.vy =  Math.abs(s.vy); s.y = 90; }
        if (s.y > my) { s.vy = -Math.abs(s.vy); s.y = my; }

        const ax = Math.abs(s.vx), ay = Math.abs(s.vy);
        s.dir = ax >= ay ? (s.vx > 0 ? 'right' : 'left') : (s.vy > 0 ? 'front' : 'back');

        s.frameTimer += dt;
        if (s.frameTimer > 200) { s.frame ^= 1; s.frameTimer = 0; }

        s.walkTimer += dt;
        if (s.walkTimer > 2400 + Math.random() * 2600) {
          s.walking = false;
          s.dir = 'front'; s.frame = 0;
          s.nagVisible = true;
          s.nagIdx = (s.nagIdx + 1) % NAGS.length;
          s.nagTimer = 0; s.walkTimer = 0;
        }
      } else {
        s.nagTimer += dt;
        if (s.nagTimer > 2800) s.nagVisible = false;
        if (s.nagTimer > 3800) {
          s.walking = true;
          const a = Math.random() * Math.PI * 2;
          const spd = 0.85 + Math.random() * 0.9;
          s.vx = Math.cos(a) * spd;
          s.vy = Math.sin(a) * spd * 0.6;
        }
      }

      if (containerRef.current)
        containerRef.current.style.transform = `translate(${s.x}px,${s.y}px)`;

      if (wrapperRef.current && pixelRef.current) {
        const lr  = s.dir === 'right' ? 'left' : s.dir;
        const key = s.walking ? `${lr}_${s.frame}` : `${lr}_idle`;
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
    return () => cancelAnimationFrame(rafRef.current);
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
        {/* 꼬리 외곽 */}
        <span style={{
          position:'absolute', bottom:-10, left:'50%',
          transform:'translateX(-50%)', display:'block',
          width:0, height:0,
          borderLeft:'7px solid transparent',
          borderRight:'7px solid transparent',
          borderTop:'10px solid #FF5673',
        }}/>
        {/* 꼬리 내부 */}
        <span style={{
          position:'absolute', bottom:-7, left:'50%',
          transform:'translateX(-50%)', display:'block',
          width:0, height:0,
          borderLeft:'5px solid transparent',
          borderRight:'5px solid transparent',
          borderTop:'8px solid #fff',
        }}/>
      </div>

      {/* 픽셀 캐릭터 */}
      <div ref={wrapperRef} style={{ width: CW, height: CH, position: 'relative' }}>
        <div ref={pixelRef} style={{
          width: P, height: P,
          position: 'absolute', top: 0, left: 0,
        }}/>
      </div>
    </div>
  );
}
