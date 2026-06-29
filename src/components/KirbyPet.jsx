import { useState, useEffect, useRef, useCallback } from 'react';
import './KirbyPet.css';

// ======================================================
// 🌟 커비 잔소리 목록
// ======================================================
const NAGGING_MESSAGES = [
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

// ======================================================
// 🎨 스프라이트 설정
//
// 원본 이미지: public/kirby.png  →  2816 × 1536 px (투명 배경)
// 프레임 슬롯 크기 (원본 기준): 183 × 240 px
// 화면 표시 배율: 128 / 183 ≈ 0.699
//
// ┌─ 프레임 위치 (원본 px) ────────────────────────┐
// │  WALKING LEFT  4프레임  y=390  x=800,983,1166,1349  │
// │  WALKING RIGHT 4프레임  y=390  x=1620,1803,1986,2169 │
// │  INHALING      3프레임  y=670  x=70,253,436          │
// └────────────────────────────────────────────────┘
//
// ※ 좌표가 맞지 않으면 ANIM 상수의 yPx / startX 조정
// ======================================================
const ORIG_SLOT_W = 183;                       // 원본 프레임 너비(px)
const ORIG_SLOT_H = 240;                       // 원본 프레임 높이(px)
const SCALE       = 128 / ORIG_SLOT_W;        // ≈ 0.699
const FRAME_W     = 128;                       // 화면 표시 너비(px)
const FRAME_H     = Math.round(ORIG_SLOT_H * SCALE); // ≈ 168px
const SHEET_W     = Math.round(2816 * SCALE); // ≈ 1968px
const SHEET_H     = Math.round(1536 * SCALE); // ≈ 1074px

const ANIM = {
  // startX, yPx : 원본 좌표 × SCALE 값
  walkLeft:  { yPx: Math.round(390 * SCALE), startX: Math.round(800  * SCALE), frames: 4 },
  walkRight: { yPx: Math.round(390 * SCALE), startX: Math.round(1620 * SCALE), frames: 4 },
  inhaling:  { yPx: Math.round(670 * SCALE), startX: Math.round(70   * SCALE), frames: 3 },
};

// 무지개 잔상 색상
const RAINBOW = [
  'rgba(255, 80,  80,  0.7)',
  'rgba(255, 160, 40,  0.7)',
  'rgba(255, 230, 40,  0.7)',
  'rgba(80,  210, 100, 0.7)',
  'rgba(80,  160, 255, 0.7)',
  'rgba(140, 90,  255, 0.7)',
  'rgba(200, 80,  255, 0.7)',
];

// ── 스프라이트 style 계산 ──
function getSpriteStyle(animKey, frameIdx) {
  const cfg = ANIM[animKey] ?? ANIM.walkRight;
  const x = -(cfg.startX + frameIdx * FRAME_W);
  const y = -cfg.yPx;
  return {
    width:              `${FRAME_W}px`,
    height:             `${FRAME_H}px`,
    backgroundImage:    "url('/kirby.png')",
    backgroundRepeat:   'no-repeat',
    backgroundSize:     `${SHEET_W}px ${SHEET_H}px`,
    backgroundPosition: `${x}px ${y}px`,
    imageRendering:     'pixelated',
  };
}

// ======================================================
export default function KirbyPet() {
  const [pos,       setPos]       = useState({ x: 200, y: 200 });
  const [animKey,   setAnimKey]   = useState('walkRight');
  const [frameIdx,  setFrameIdx]  = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [message,   setMessage]   = useState(NAGGING_MESSAGES[0]);
  const [msgVisible,setMsgVisible]= useState(true);
  const [trails,    setTrails]    = useState([]);
  const [inhaleParticles, setInhaleParticles] = useState([]);

  const posRef       = useRef({ x: 200, y: 200 });
  const dirRef       = useRef({ x: 1, y: 0.4 });
  const isHoveredRef = useRef(false);
  const animKeyRef   = useRef('walkRight');
  const frameIdxRef  = useRef(0);
  const trailCiRef   = useRef(0);

  // ── 메인 게임 루프 ──
  useEffect(() => {
    const SPEED         = 1.1;
    const FRAME_MS      = 155;
    const TRAIL_MS      = 85;
    const DIR_CHANGE_MS = 3500;

    let lastFrameT = 0;
    let lastTrailT = 0;
    let lastDirT   = 0;
    let rafId;

    const loop = (ts) => {
      if (!isHoveredRef.current) {
        const { x, y } = posRef.current;
        const d = dirRef.current;
        let nx = x + d.x * SPEED;
        let ny = y + d.y * SPEED;
        const maxX = window.innerWidth  - FRAME_W;
        const maxY = window.innerHeight - FRAME_H;

        // 벽 반사
        if (nx <= 0 || nx >= maxX) {
          dirRef.current = { x: -d.x, y: d.y + (Math.random() - 0.5) * 0.3 };
          nx = Math.max(0, Math.min(maxX, nx));
        }
        if (ny <= 0 || ny >= maxY) {
          dirRef.current = { x: d.x + (Math.random() - 0.5) * 0.3, y: -d.y };
          ny = Math.max(0, Math.min(maxY, ny));
        }

        // 방향 벡터 정규화
        const mag = Math.hypot(dirRef.current.x, dirRef.current.y);
        if (mag > 0) {
          dirRef.current.x /= mag;
          dirRef.current.y /= mag;
        }

        posRef.current = { x: nx, y: ny };
        setPos({ x: nx, y: ny });

        // 방향에 따른 스프라이트
        const newAnim = dirRef.current.x >= 0 ? 'walkRight' : 'walkLeft';
        if (newAnim !== animKeyRef.current) {
          animKeyRef.current = newAnim;
          setAnimKey(newAnim);
        }

        // 프레임 전진
        if (ts - lastFrameT > FRAME_MS) {
          lastFrameT = ts;
          const next = (frameIdxRef.current + 1) % ANIM[animKeyRef.current].frames;
          frameIdxRef.current = next;
          setFrameIdx(next);
        }

        // 무지개 잔상
        if (ts - lastTrailT > TRAIL_MS) {
          lastTrailT = ts;
          const ci = trailCiRef.current;
          trailCiRef.current = (ci + 1) % RAINBOW.length;
          const born = Date.now();
          setTrails(prev => {
            const fresh = prev.filter(t => born - t.born < 900);
            return [...fresh, {
              id:    ts + Math.random(),
              x:     nx + FRAME_W / 2,
              y:     ny + FRAME_H / 2,
              color: RAINBOW[ci],
              size:  Math.random() * 16 + 10,
              born,
            }].slice(-18); // 최대 18개
          });
        }

        // 주기적 방향 전환 (wandering)
        if (ts - lastDirT > DIR_CHANGE_MS) {
          lastDirT = ts;
          if (Math.random() < 0.5) {
            const angle = Math.random() * Math.PI * 2;
            dirRef.current = { x: Math.cos(angle), y: Math.sin(angle) * 0.6 };
          }
        }

      } else {
        // ── 호버 중: 흡입 애니메이션 ──
        if (ts - lastFrameT > 110) {
          lastFrameT = ts;
          const next = (frameIdxRef.current + 1) % ANIM.inhaling.frames;
          frameIdxRef.current = next;
          setFrameIdx(next);
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ── 잔소리 타이머 (5~7초마다 교체) ──
  useEffect(() => {
    const tick = () => {
      setMsgVisible(false);
      setTimeout(() => {
        setMessage(NAGGING_MESSAGES[Math.floor(Math.random() * NAGGING_MESSAGES.length)]);
        setMsgVisible(true);
      }, 350);
    };
    const delay = 5000 + Math.random() * 2000;
    const iv = setInterval(tick, delay);
    return () => clearInterval(iv);
  }, []);

  // ── 흡입 파티클 ──
  useEffect(() => {
    if (!isHovered) { setInhaleParticles([]); return; }
    const iv = setInterval(() => {
      setInhaleParticles(prev => [
        ...prev.slice(-15),
        ...Array.from({ length: 4 }, (_, i) => ({
          id:    Date.now() + i,
          x:     (Math.random() - 0.5) * 200,
          y:     (Math.random() - 0.5) * 200,
          size:  Math.random() * 10 + 5,
          color: RAINBOW[Math.floor(Math.random() * RAINBOW.length)],
        })),
      ]);
    }, 110);
    return () => clearInterval(iv);
  }, [isHovered]);

  // ── 잔상 정리 ──
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      setTrails(prev => prev.filter(t => now - t.born < 900));
    }, 300);
    return () => clearInterval(iv);
  }, []);

  // ── 호버 핸들러 ──
  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    setIsHovered(true);
    animKeyRef.current = 'inhaling';
    setAnimKey('inhaling');
    frameIdxRef.current = 0;
    setFrameIdx(0);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    setIsHovered(false);
    const key = dirRef.current.x >= 0 ? 'walkRight' : 'walkLeft';
    animKeyRef.current = key;
    setAnimKey(key);
    frameIdxRef.current = 0;
    setFrameIdx(0);
  }, []);

  const spriteStyle = getSpriteStyle(animKey, frameIdx);

  return (
    <>
      {/* 🌈 무지개 잔상 */}
      <div className="kirby-trail-layer" aria-hidden="true">
        {trails.map(t => {
          const age = (Date.now() - t.born) / 900;
          const opacity = Math.max(0, 1 - age);
          return (
            <div
              key={t.id}
              className="kirby-trail-dot"
              style={{
                left:            t.x,
                top:             t.y,
                width:           `${t.size}px`,
                height:          `${t.size}px`,
                backgroundColor: t.color,
                opacity,
                transform:       `translate(-50%,-50%) scale(${0.3 + opacity * 0.7})`,
                boxShadow:       `0 0 ${t.size * 1.5}px ${t.color}`,
              }}
            />
          );
        })}
      </div>

      {/* 🌀 흡입 파티클 */}
      {isHovered && (
        <div
          className="kirby-inhale-zone"
          style={{ left: pos.x + FRAME_W / 2, top: pos.y + FRAME_H / 2 }}
          aria-hidden="true"
        >
          {inhaleParticles.map(p => (
            <div
              key={p.id}
              className="kirby-inhale-particle"
              style={{
                '--px':          `${p.x}px`,
                '--py':          `${p.y}px`,
                width:           `${p.size}px`,
                height:          `${p.size}px`,
                backgroundColor: p.color,
              }}
            />
          ))}
          <div className="kirby-inhale-ripple" />
          <div className="kirby-inhale-ripple kirby-inhale-ripple--delay" />
        </div>
      )}

      {/* 🐾 커비 본체 */}
      <div
        className={`kirby-pet-wrapper${isHovered ? ' kirby-pet-wrapper--hovered' : ''}`}
        style={{ left: pos.x, top: pos.y }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="화면을 돌아다니는 커비"
      >
        {/* 💬 픽셀 말풍선 */}
        {!isHovered && (
          <div className={`kirby-speech-bubble${msgVisible ? ' kirby-speech-bubble--visible' : ' kirby-speech-bubble--hidden'}`}>
            <span className="kirby-speech-text">{message}</span>
            <div className="kirby-speech-tail" />
          </div>
        )}

        {/* 🎮 커비 스프라이트 */}
        <div
          className={`kirby-sprite${isHovered ? ' kirby-sprite--inhaling' : ''}`}
          style={spriteStyle}
        />

        {/* ⭐ 호버 별 이펙트 */}
        {isHovered && (
          <div className="kirby-stars" aria-hidden="true">
            {['⭐', '✨', '💫', '🌟'].map((star, i) => (
              <span
                key={i}
                className="kirby-star"
                style={{ '--delay': `${i * 0.2}s`, '--angle': `${i * 90}deg` }}
              >
                {star}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
