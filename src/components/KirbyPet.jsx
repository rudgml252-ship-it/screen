import { useState, useEffect, useRef, useCallback } from 'react';
import './KirbyPet.css';

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

// ── 스프라이트 정의 ──────────────────────────────
const WALK = {
  right: ['/walk right 1.PNG', '/walk right 2.PNG'],
  left:  ['/walk left 1.PNG',  '/walk left 2.PNG'],
};
const FLY = ['/fly1.PNG', '/fly2.PNG', '/fly3.PNG', '/fly4.PNG'];

// eat2/eat3: 입 쫙 벌린 흡입 자세 → 오래 유지해서 "와아아아암" 효과
const EAT = [
  { src: '/eat1.PNG', ms:  80 },   // 입 살짝 벌리기
  { src: '/eat2.PNG', ms: 350 },   // 와아아아암! ← 오래 유지
  { src: '/eat3.PNG', ms: 350 },   // 와아아아암! ← 오래 유지
  { src: '/eat4.PNG', ms: 130 },   // 먹히는 중
  { src: '/eat5.PNG', ms: 130 },   // 삼킨 후
];

const WALK_MS = 120;
const FLY_MS  = 130;
const SIZE    = 96;

const RAINBOW = [
  'rgba(255,80,80,0.7)', 'rgba(255,160,40,0.7)', 'rgba(255,230,40,0.7)',
  'rgba(80,210,100,0.7)', 'rgba(80,160,255,0.7)', 'rgba(140,90,255,0.7)',
  'rgba(200,80,255,0.7)',
];

// 전체 이미지 프리로드
[...WALK.right, ...WALK.left, ...FLY, ...EAT.map(e => e.src)].forEach(src => {
  const img = new Image(); img.src = src;
});

export default function KirbyPet() {
  const [pos,        setPos]        = useState({ x: 200, y: 200 });
  const [walkDir,    setWalkDir]    = useState('right');   // 'right' | 'left'
  const [moveMode,   setMoveMode]   = useState('walk');    // 'walk' | 'fly'
  const [walkFrame,  setWalkFrame]  = useState(0);         // 0-1, 방향 바뀌어도 유지
  const [flyFrame,   setFlyFrame]   = useState(0);         // 0-3
  const [eatFrame,   setEatFrame]   = useState(0);         // 0-4
  const [isHovered,  setIsHovered]  = useState(false);
  const [message,    setMessage]    = useState(NAGGING_MESSAGES[0]);
  const [msgVisible, setMsgVisible] = useState(true);
  const [trails,     setTrails]     = useState([]);

  const posRef       = useRef({ x: 200, y: 200 });
  const dirRef       = useRef({ x: 1, y: 0.4 });
  const isHoveredRef = useRef(false);
  const walkDirRef   = useRef('right');
  const moveModeRef  = useRef('walk');
  const walkFrameRef = useRef(0);  // ← 절대 방향 전환 시 리셋 안 함
  const flyFrameRef  = useRef(0);
  const eatFrameRef  = useRef(0);
  const trailCiRef   = useRef(0);

  // ── 메인 루프 ──────────────────────────────────
  useEffect(() => {
    const SPEED         = 1.1;
    const TRAIL_MS      = 90;
    const DIR_CHANGE_MS = 3500;

    let lastWalkT  = 0;
    let lastFlyT   = 0;
    let lastEatT   = 0;
    let lastTrailT = 0;
    let lastDirT   = 0;
    let rafId;

    const loop = (ts) => {
      if (!isHoveredRef.current) {
        /* 이동 */
        const { x, y } = posRef.current;
        const d = dirRef.current;
        let nx = x + d.x * SPEED;
        let ny = y + d.y * SPEED;
        const maxX = window.innerWidth  - SIZE;
        const maxY = window.innerHeight - SIZE;

        if (nx <= 0 || nx >= maxX) {
          dirRef.current = { x: -d.x, y: d.y + (Math.random() - 0.5) * 0.3 };
          nx = Math.max(0, Math.min(maxX, nx));
        }
        if (ny <= 0 || ny >= maxY) {
          dirRef.current = { x: d.x + (Math.random() - 0.5) * 0.3, y: -d.y };
          ny = Math.max(0, Math.min(maxY, ny));
        }

        const mag = Math.hypot(dirRef.current.x, dirRef.current.y);
        if (mag > 0) { dirRef.current.x /= mag; dirRef.current.y /= mag; }

        posRef.current = { x: nx, y: ny };
        setPos({ x: nx, y: ny });

        /* 수직 이동이면 fly, 수평이면 walk (walkFrame 은 절대 리셋 안 함) */
        const absX = Math.abs(dirRef.current.x);
        const absY = Math.abs(dirRef.current.y);
        const newMode = absY > absX * 1.2 ? 'fly' : 'walk';
        if (newMode !== moveModeRef.current) {
          moveModeRef.current = newMode;
          setMoveMode(newMode);
        }

        /* 걷기 방향 갱신 (walkFrame 은 그대로 이어감) */
        if (newMode === 'walk') {
          const newDir = dirRef.current.x >= 0 ? 'right' : 'left';
          if (newDir !== walkDirRef.current) {
            walkDirRef.current = newDir;
            setWalkDir(newDir);
          }
          if (ts - lastWalkT > WALK_MS) {
            lastWalkT = ts;
            const next = (walkFrameRef.current + 1) % WALK[walkDirRef.current].length;
            walkFrameRef.current = next;
            setWalkFrame(next);
          }
        } else {
          if (ts - lastFlyT > FLY_MS) {
            lastFlyT = ts;
            const next = (flyFrameRef.current + 1) % FLY.length;
            flyFrameRef.current = next;
            setFlyFrame(next);
          }
        }

        /* 무지개 잔상 */
        if (ts - lastTrailT > TRAIL_MS) {
          lastTrailT = ts;
          const ci = trailCiRef.current;
          trailCiRef.current = (ci + 1) % RAINBOW.length;
          const born = Date.now();
          setTrails(prev => [
            ...prev.filter(t => born - t.born < 800),
            { id: ts + Math.random(), x: nx + SIZE / 2, y: ny + SIZE / 2,
              color: RAINBOW[ci], size: Math.random() * 14 + 8, born },
          ].slice(-16));
        }

        /* 랜덤 방향 전환 */
        if (ts - lastDirT > DIR_CHANGE_MS) {
          lastDirT = ts;
          if (Math.random() < 0.5) {
            const angle = Math.random() * Math.PI * 2;
            dirRef.current = { x: Math.cos(angle), y: Math.sin(angle) * 0.6 };
          }
        }

      } else {
        /* 호버: eat 프레임별 타이밍으로 진행 */
        const curMs = EAT[eatFrameRef.current].ms;
        if (ts - lastEatT > curMs) {
          lastEatT = ts;
          const next = (eatFrameRef.current + 1) % EAT.length;
          eatFrameRef.current = next;
          setEatFrame(next);
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ── 잔소리 타이머 ──────────────────────────────
  useEffect(() => {
    const tick = () => {
      setMsgVisible(false);
      setTimeout(() => {
        setMessage(NAGGING_MESSAGES[Math.floor(Math.random() * NAGGING_MESSAGES.length)]);
        setMsgVisible(true);
      }, 350);
    };
    const iv = setInterval(tick, 5000 + Math.random() * 2000);
    return () => clearInterval(iv);
  }, []);

  // ── 잔상 정리 ──────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      setTrails(prev => prev.filter(t => now - t.born < 800));
    }, 300);
    return () => clearInterval(iv);
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    setIsHovered(true);
    eatFrameRef.current = 0;
    setEatFrame(0);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    setIsHovered(false);
  }, []);

  const spriteSrc = isHovered
    ? EAT[eatFrame].src
    : moveMode === 'fly'
      ? FLY[flyFrame]
      : WALK[walkDir][walkFrame];

  return (
    <>
      {/* 🌈 무지개 잔상 */}
      <div className="kirby-trail-layer" aria-hidden="true">
        {trails.map(t => {
          const age     = (Date.now() - t.born) / 800;
          const opacity = Math.max(0, 1 - age);
          return (
            <div key={t.id} className="kirby-trail-dot" style={{
              left: t.x, top: t.y,
              width: `${t.size}px`, height: `${t.size}px`,
              backgroundColor: t.color, opacity,
              transform: `translate(-50%,-50%) scale(${0.3 + opacity * 0.7})`,
              boxShadow: `0 0 ${t.size * 1.5}px ${t.color}`,
            }} />
          );
        })}
      </div>

      {/* 🐾 커비 본체 */}
      <div
        className={`kirby-pet-wrapper${isHovered ? ' kirby-pet-wrapper--hovered' : ''}`}
        style={{ left: pos.x, top: pos.y }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="화면을 돌아다니는 커비"
      >
        {/* 💬 말풍선 */}
        {!isHovered && (
          <div className={`kirby-speech-bubble${msgVisible ? ' kirby-speech-bubble--visible' : ' kirby-speech-bubble--hidden'}`}>
            <span className="kirby-speech-text">{message}</span>
            <div className="kirby-speech-tail" />
          </div>
        )}

        {/* 🎮 스프라이트 */}
        <img
          src={spriteSrc}
          className={`kirby-sprite${isHovered ? ' kirby-sprite--inhaling' : ''}`}
          style={{ width: SIZE, height: SIZE }}
          alt=""
          draggable={false}
        />

        {/* ⭐ 호버 별 */}
        {isHovered && (
          <div className="kirby-stars" aria-hidden="true">
            {['⭐','✨','💫','🌟'].map((star, i) => (
              <span key={i} className="kirby-star"
                style={{ '--delay': `${i * 0.2}s`, '--angle': `${i * 90}deg` }}>
                {star}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
