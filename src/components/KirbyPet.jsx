import React, { useState, useEffect, useRef, useCallback } from 'react';
import './KirbyPet.css';

// ======================================================
// 🌟 커비 잔소리 목록
// ======================================================
const NAGGING_MESSAGES = [
  "🍎 밥은 먹었니?",
  "💧 물 마셔!! 진짜로!!",
  "😴 일찍 자야 키 커~",
  "📚 공부... 하고 있지?",
  "🚶 스트레칭 좀 해봐!",
  "🧹 방 청소는 언제 할 거야?",
  "📱 폰 그만 보고 눈 쉬어~",
  "🌞 오늘 하루도 화이팅!!",
  "🍕 야식은 건강에 안 좋아!",
  "💪 운동 30분만 해봐!",
  "🎵 음악 들으며 잠깐 쉬어~",
  "🤗 오늘도 수고했어!",
  "🌟 넌 할 수 있어! Poyo~",
  "🧃 비타민 먹었어?",
  "💤 눈 좀 쉬어봐~",
  "🫧 양치 했지? 설마...?",
  "🌸 오늘 기분 어때?",
  "🎮 게임도 적당히~",
  "☕ 커피 너무 많이 마시면 안 돼!",
  "🥳 오늘도 최고야!",
];

// ======================================================
// 🎨 스프라이트 설정
//
// 원본 이미지: 960 × 540 px
// 프레임 단위: 64 × 64 px
// 화면 표시: 2배(128px) 스케일
//
// 모션별 Y 시작점 (원본 기준):
//   - 걷기(WALKING LEFT/RIGHT): y = 120px
//   - 흡입(INHALING):           y = 240px
//
// 모션별 X 배치 (원본 기준):
//   - WALKING LEFT  4프레임: x = 0, 64, 128, 192
//   - WALKING RIGHT 4프레임: x = 256, 320, 384, 448  (LEFT 이후 연속)
//   - INHALING      4프레임: x = 0, 64, 128, 192
// ======================================================
const ORIG_FRAME = 64;   // 원본 프레임 크기 (px)
const SCALE      = 2;    // 화면 표시 배율
const FRAME_SIZE = ORIG_FRAME * SCALE;  // 128px
const SHEET_W    = 960 * SCALE;         // 1920px
const SHEET_H    = 540 * SCALE;         // 1080px

// 모션별 CSS 애니메이션에 쓸 background-position 계산 (스케일 반영)
// Y: 원본 y * SCALE
// X: 원본 x * SCALE  (CSS background-position 은 음수)
const ANIM = {
  walkLeft:  { yPx: 120 * SCALE, startX: 0,               frames: 4 },
  walkRight: { yPx: 120 * SCALE, startX: 256 * SCALE,      frames: 4 },
  inhaling:  { yPx: 240 * SCALE, startX: 0,               frames: 4 },
};

// 무지개 잔상 색상
const RAINBOW = [
  'rgba(255, 80,  80,  0.75)',
  'rgba(255, 160, 40,  0.75)',
  'rgba(255, 230, 40,  0.75)',
  'rgba(80,  210, 100, 0.75)',
  'rgba(80,  160, 255, 0.75)',
  'rgba(140, 90,  255, 0.75)',
  'rgba(200, 80,  255, 0.75)',
];

// ── 스프라이트 div 의 inline style 계산 ──
// steps(N) CSS 애니메이션 대신 JS로 프레임을 제어해서
// 이동 방향과 정확히 동기화함
function getSpriteStyle(animKey, frameIdx) {
  const cfg = ANIM[animKey];
  const x = -(cfg.startX + frameIdx * FRAME_SIZE);
  const y = -cfg.yPx;
  return {
    width:              `${FRAME_SIZE}px`,
    height:             `${FRAME_SIZE}px`,
    backgroundImage:    `url('/kirby.png')`,
    backgroundRepeat:   'no-repeat',
    backgroundSize:     `${SHEET_W}px ${SHEET_H}px`,
    backgroundPosition: `${x}px ${y}px`,
    imageRendering:     'pixelated',
  };
}

// ======================================================
export default function KirbyPet() {
  const [pos,      setPos]      = useState({ x: 200, y: 200 });
  const [animKey,  setAnimKey]  = useState('walkRight');
  const [frameIdx, setFrameIdx] = useState(0);
  const [isHovered,setIsHovered]= useState(false);
  const [message,  setMessage]  = useState(NAGGING_MESSAGES[0]);
  const [msgVisible,setMsgVisible]= useState(true);
  const [trails,   setTrails]   = useState([]);
  const [inhaleParticles, setInhaleParticles] = useState([]);

  const posRef      = useRef({ x: 200, y: 200 });
  const dirRef      = useRef({ x: 1, y: 0.4 });
  const isHoveredRef= useRef(false);
  const animKeyRef  = useRef('walkRight');
  const frameIdxRef = useRef(0);
  const trailCiRef  = useRef(0);

  // ── 메인 게임 루프 ──
  useEffect(() => {
    const SPEED        = 1.2;
    const FRAME_MS     = 160;
    const TRAIL_MS     = 85;
    const DIR_CHANGE_MS= 3200;

    let lastFrameT = 0;
    let lastTrailT = 0;
    let lastDirT   = 0;
    let rafId;

    const loop = (ts) => {
      if (!isHoveredRef.current) {
        // 이동
        const { x, y } = posRef.current;
        const d = dirRef.current;
        let nx = x + d.x * SPEED;
        let ny = y + d.y * SPEED;
        const maxX = window.innerWidth  - FRAME_SIZE;
        const maxY = window.innerHeight - FRAME_SIZE;

        if (nx <= 0 || nx >= maxX) {
          dirRef.current = { x: -d.x, y: d.y + (Math.random() - 0.5) * 0.4 };
          nx = Math.max(0, Math.min(maxX, nx));
        }
        if (ny <= 0 || ny >= maxY) {
          dirRef.current = { x: d.x + (Math.random() - 0.5) * 0.4, y: -d.y };
          ny = Math.max(0, Math.min(maxY, ny));
        }

        // 정규화
        const mag = Math.hypot(dirRef.current.x, dirRef.current.y);
        if (mag > 0) { dirRef.current.x /= mag; dirRef.current.y /= mag; }

        posRef.current = { x: nx, y: ny };
        setPos({ x: nx, y: ny });

        // 방향별 애니메이션
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
          const now = Date.now();
          setTrails(prev => {
            const fresh = prev.filter(t => now - t.born < 2000);
            return [...fresh, {
              id:    ts + Math.random(),
              x:     nx + FRAME_SIZE / 2,
              y:     ny + FRAME_SIZE / 2,
              color: RAINBOW[ci],
              size:  Math.random() * 14 + 8,
              born:  now,
            }];
          });
        }

        // 주기적 방향 전환
        if (ts - lastDirT > DIR_CHANGE_MS) {
          lastDirT = ts;
          if (Math.random() < 0.45) {
            const angle = Math.random() * Math.PI * 2;
            dirRef.current = { x: Math.cos(angle), y: Math.sin(angle) };
          }
        }

      } else {
        // ── 호버 중: 흡입 애니메이션 ──
        if (ts - lastFrameT > 120) {
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

  // ── 메시지 타이머 ──
  useEffect(() => {
    const tick = () => {
      setMsgVisible(false);
      setTimeout(() => {
        setMessage(NAGGING_MESSAGES[Math.floor(Math.random() * NAGGING_MESSAGES.length)]);
        setMsgVisible(true);
      }, 400);
    };
    const iv = setInterval(tick, 5000 + Math.random() * 2000);
    return () => clearInterval(iv);
  }, []);

  // ── 흡입 파티클 ──
  useEffect(() => {
    if (!isHovered) { setInhaleParticles([]); return; }
    const iv = setInterval(() => {
      setInhaleParticles(prev => [
        ...prev.slice(-20),
        ...Array.from({ length: 5 }, (_, i) => ({
          id:    Date.now() + i,
          x:     Math.random() * 220 - 110,
          y:     Math.random() * 220 - 110,
          size:  Math.random() * 12 + 4,
          color: RAINBOW[Math.floor(Math.random() * RAINBOW.length)],
        })),
      ]);
    }, 100);
    return () => clearInterval(iv);
  }, [isHovered]);

  // ── 잔상 정리 ──
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      setTrails(prev => prev.filter(t => now - t.born < 2000));
      setInhaleParticles(prev => prev.filter(p => p.id > Date.now() - 800));
    }, 500);
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
    animKeyRef.current = dirRef.current.x >= 0 ? 'walkRight' : 'walkLeft';
    setAnimKey(animKeyRef.current);
    frameIdxRef.current = 0;
    setFrameIdx(0);
  }, []);

  const spriteStyle = getSpriteStyle(animKey, frameIdx);

  return (
    <>
      {/* 🌈 무지개 잔상 */}
      <div className="kirby-trail-layer" aria-hidden="true">
        {trails.map(t => {
          const age = (Date.now() - t.born) / 2000;
          const opacity = Math.max(0, 1 - age);
          return (
            <div
              key={t.id}
              className="kirby-trail-dot"
              style={{
                left: t.x,
                top: t.y,
                width: t.size,
                height: t.size,
                backgroundColor: t.color,
                opacity,
                transform: `translate(-50%,-50%) scale(${0.3 + opacity * 0.7})`,
                boxShadow: `0 0 ${t.size * 1.5}px ${t.color}`,
              }}
            />
          );
        })}
      </div>

      {/* 🌀 흡입 파티클 */}
      {isHovered && (
        <div
          className="kirby-inhale-zone"
          style={{ left: pos.x + FRAME_SIZE / 2, top: pos.y + FRAME_SIZE / 2 }}
          aria-hidden="true"
        >
          {inhaleParticles.map(p => (
            <div
              key={p.id}
              className="kirby-inhale-particle"
              style={{
                '--px': `${p.x}px`,
                '--py': `${p.y}px`,
                width: p.size,
                height: p.size,
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
            {['⭐','✨','💫','🌟'].map((s, i) => (
              <span key={i} className="kirby-star" style={{ '--delay': `${i*0.2}s`, '--angle': `${i*90}deg` }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
