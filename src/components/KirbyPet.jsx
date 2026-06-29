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

// 개별 이미지 파일 애니메이션 정의
const ANIMS = {
  walkRight: ['/walk right 1.PNG', '/walk right 2.PNG'],
  walkLeft:  ['/walk left 1.PNG',  '/walk left 2.PNG'],
  eat:       ['/eat1.PNG', '/eat2.PNG', '/eat3.PNG', '/eat4.PNG', '/eat5.PNG'],
  fly:       ['/fly1.PNG', '/fly2.PNG', '/fly3.PNG', '/fly4.PNG'],
};

const FRAME_MS = { walkRight: 160, walkLeft: 160, eat: 110, fly: 130 };
const SIZE = 96; // 화면 표시 크기(px)

const RAINBOW = [
  'rgba(255,80,80,0.7)', 'rgba(255,160,40,0.7)', 'rgba(255,230,40,0.7)',
  'rgba(80,210,100,0.7)', 'rgba(80,160,255,0.7)', 'rgba(140,90,255,0.7)',
  'rgba(200,80,255,0.7)',
];

// 이미지 프리로드 (첫 프레임 깜빡임 방지)
const ALL_FRAMES = [...new Set(Object.values(ANIMS).flat())];
ALL_FRAMES.forEach(src => { const img = new Image(); img.src = src; });

export default function KirbyPet() {
  const [pos,        setPos]        = useState({ x: 200, y: 200 });
  const [animKey,    setAnimKey]    = useState('walkRight');
  const [frameIdx,   setFrameIdx]   = useState(0);
  const [isHovered,  setIsHovered]  = useState(false);
  const [message,    setMessage]    = useState(NAGGING_MESSAGES[0]);
  const [msgVisible, setMsgVisible] = useState(true);
  const [trails,     setTrails]     = useState([]);

  const posRef       = useRef({ x: 200, y: 200 });
  const dirRef       = useRef({ x: 1, y: 0.4 });
  const isHoveredRef = useRef(false);
  const animKeyRef   = useRef('walkRight');
  const frameIdxRef  = useRef(0);
  const trailCiRef   = useRef(0);

  // ── 메인 루프 (이동 + 잔상) ──
  useEffect(() => {
    const SPEED         = 1.1;
    const TRAIL_MS      = 90;
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

        // 이동 방향에 따른 애니메이션
        const absX = Math.abs(dirRef.current.x);
        const absY = Math.abs(dirRef.current.y);
        let newAnim;
        if (absX >= absY * 0.6) {
          newAnim = dirRef.current.x >= 0 ? 'walkRight' : 'walkLeft';
        } else {
          newAnim = 'fly';
        }
        if (newAnim !== animKeyRef.current) {
          animKeyRef.current = newAnim;
          setAnimKey(newAnim);
          frameIdxRef.current = 0;
          setFrameIdx(0);
        }

        // 프레임 전진
        const fms = FRAME_MS[animKeyRef.current] ?? 160;
        if (ts - lastFrameT > fms) {
          lastFrameT = ts;
          const next = (frameIdxRef.current + 1) % ANIMS[animKeyRef.current].length;
          frameIdxRef.current = next;
          setFrameIdx(next);
        }

        // 무지개 잔상
        if (ts - lastTrailT > TRAIL_MS) {
          lastTrailT = ts;
          const ci = trailCiRef.current;
          trailCiRef.current = (ci + 1) % RAINBOW.length;
          const born = Date.now();
          setTrails(prev => [
            ...prev.filter(t => born - t.born < 800),
            {
              id: ts + Math.random(),
              x: nx + SIZE / 2, y: ny + SIZE / 2,
              color: RAINBOW[ci],
              size: Math.random() * 14 + 8,
              born,
            },
          ].slice(-16));
        }

        // 랜덤 방향 전환
        if (ts - lastDirT > DIR_CHANGE_MS) {
          lastDirT = ts;
          if (Math.random() < 0.5) {
            const angle = Math.random() * Math.PI * 2;
            dirRef.current = { x: Math.cos(angle), y: Math.sin(angle) * 0.6 };
          }
        }
      } else {
        // 호버 중: eat 애니메이션
        if (ts - lastFrameT > FRAME_MS.eat) {
          lastFrameT = ts;
          const next = (frameIdxRef.current + 1) % ANIMS.eat.length;
          frameIdxRef.current = next;
          setFrameIdx(next);
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ── 잔소리 타이머 ──
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

  // ── 잔상 정리 ──
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
    animKeyRef.current = 'eat';
    setAnimKey('eat');
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

  const currentSrc = ANIMS[animKey]?.[frameIdx] ?? ANIMS.walkRight[0];

  return (
    <>
      {/* 🌈 무지개 잔상 */}
      <div className="kirby-trail-layer" aria-hidden="true">
        {trails.map(t => {
          const age = (Date.now() - t.born) / 800;
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
        <img
          src={currentSrc}
          className={`kirby-sprite${isHovered ? ' kirby-sprite--inhaling' : ''}`}
          style={{ width: SIZE, height: SIZE }}
          alt=""
          draggable={false}
        />

        {/* ⭐ 호버 별 이펙트 */}
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
