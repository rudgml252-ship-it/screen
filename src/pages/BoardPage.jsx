import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockDb } from '../context/MockDbContext';
import styles from './BoardPage.module.css';
import Footer from '../components/Footer';

const maskName = (name) => {
  if (!name || name.length <= 1) return name;
  if (name.length === 2) return name[0] + '✦';
  return name[0] + '✦'.repeat(name.length - 2) + name[name.length - 1];
};

/* ── helpers ── */
const getDday = (targetDate) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(targetDate); target.setHours(0,0,0,0);
  return Math.ceil((target - today) / 86400000);
};
const TYPE_CONFIG = {
  URGENT:  { label:'🚨 긴급', bg:'#FF4757', text:'#fff' },
  GENERAL: { label:'📢 일반', bg:'#FF9AB5', text:'#7A1235' },
  SUBMIT:  { label:'📝 제출', bg:'#FFEAA7', text:'#7B6000' },
  SCHEDULE:{ label:'📅 시간표', bg:'#FFCCD6', text:'#D94F72' },
};

/* ── Rich Education Card ── */
function EduCard({ data }) {
  if (!Array.isArray(data.sections)) {
    return (
      <div className={styles.eduCard}>
        <div className={styles.eduEmoji}>{data.emoji}</div>
        <div className={styles.eduTitle}>{data.title}</div>
        <div className={styles.eduBody}>{data.body}</div>
      </div>
    );
  }
  return (
    <div className={styles.eduCardRich}>
      <div className={styles.eduRichHeader} style={{ background: data.headerBg || '#FF5673' }}>
        <span className={styles.eduRichEmoji}>{data.mainEmoji}</span>
        <div className={styles.eduRichHeaderText}>
          <div className={styles.eduRichTitle}>{data.title}</div>
          <div className={styles.eduRichMsg}>{data.keyMessage}</div>
        </div>
      </div>
      <div className={styles.eduRichSections}>
        {data.sections.map((sec, i) => (
          <div key={i} className={styles.eduRichSection} style={{ background: sec.bg || '#F5F5F5' }}>
            <div className={styles.eduSecTitle}>{sec.icon} {sec.title}</div>
            <ul className={styles.eduSecList}>
              {sec.items.map((item, j) => <li key={j}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
      {data.stats && data.stats.length > 0 && (
        <div className={styles.eduStats}>
          {data.stats.map((s, i) => (
            <div key={i} className={styles.eduStatItem}>
              <span className={styles.eduStatEmoji}>{s.emoji}</span>
              <span className={styles.eduStatValue}>{s.value}</span>
              <span className={styles.eduStatLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
      {data.highlightText && (
        <div className={styles.eduHighlight}>{data.highlightText}</div>
      )}
    </div>
  );
}

export default function BoardPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { db } = useMockDb();

  const [now, setNow] = useState(new Date());
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [eduIdx, setEduIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ── 반짝이 커서 효과 (터치 기기 제외) ── */
  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes sparklePop {
        0%   { opacity: 1; transform: translate(-50%,-50%) scale(1) rotate(0deg); }
        100% { opacity: 0; transform: translate(-50%, calc(-50% - 28px)) scale(0.1) rotate(40deg); }
      }
    `;
    document.head.appendChild(style);
    document.documentElement.style.cursor = 'none';

    const cursor = document.createElement('div');
    cursor.style.cssText = `
      position:fixed; pointer-events:none; z-index:99999;
      width:40px; height:40px;
      background-image: url('/wand-cursor.svg');
      background-size: contain;
      background-repeat: no-repeat;
      transform:translate(-5px,-5px);
      filter: drop-shadow(0 2px 4px rgba(232,69,112,0.5));
    `;
    document.body.appendChild(cursor);

    const TRAIL_COUNT = 7;
    const trails = Array.from({ length: TRAIL_COUNT }, (_, i) => {
      const el = document.createElement('div');
      const size = Math.max(3, 11 - i * 1.2);
      el.style.cssText = `
        position:fixed; pointer-events:none; z-index:99998;
        width:${size}px; height:${size}px;
        background: radial-gradient(circle, #FF9AB5, #FF5673);
        border-radius:50%;
        transform:translate(-50%,-50%);
        opacity:${(0.55 - i * 0.07).toFixed(2)};
        transition: left ${(0.08 + i * 0.045).toFixed(3)}s ease,
                    top  ${(0.08 + i * 0.045).toFixed(3)}s ease;
      `;
      document.body.appendChild(el);
      return el;
    });

    const COLORS  = ['#FF5673','#FF9AB5','#E84570','#FFCCD6','#FF6B88','#FFD0DC'];
    const SYMBOLS = ['✦','✧','⋆','★','✺','✼','❋'];
    let lastSparkle = 0;

    const spawnSparkle = (x, y) => {
      const el = document.createElement('span');
      el.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const size = 10 + Math.random() * 13;
      el.style.cssText = `
        position:fixed; pointer-events:none; z-index:99997;
        left:${x + (Math.random() - 0.5) * 22}px;
        top:${y  + (Math.random() - 0.5) * 22}px;
        font-size:${size}px;
        color:${COLORS[Math.floor(Math.random() * COLORS.length)]};
        transform:translate(-50%,-50%);
        animation: sparklePop 0.75s ease-out forwards;
        text-shadow: 0 0 5px currentColor;
        will-change: transform, opacity;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 750);
    };

    const onMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      cursor.style.left = x + 'px';
      cursor.style.top  = y + 'px';
      trails.forEach(t => { t.style.left = x + 'px'; t.style.top = y + 'px'; });
      const now = Date.now();
      if (now - lastSparkle > 55) { spawnSparkle(x, y); lastSparkle = now; }
    };

    document.addEventListener('mousemove', onMouseMove);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.documentElement.style.cursor = '';
      cursor.remove();
      trails.forEach(t => t.remove());
      style.remove();
    };
  }, []);

  /* ── 명언 (날짜 기반 시작, 20s 회전) ── */
  const quotes = db.quotes || [];
  useEffect(() => {
    if (quotes.length === 0) return;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setQuoteIdx(dayOfYear % quotes.length);
  }, [quotes.length]);
  useEffect(() => {
    if (quotes.length < 2) return;
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % quotes.length), 20000);
    return () => clearInterval(t);
  }, [quotes.length]);

  /* ── 교육자료 (20s 회전) ── */
  const eduCards = db.educationCards || [];
  useEffect(() => {
    if (eduCards.length < 2) return;
    const t = setInterval(() => setEduIdx(i => (i + 1) % eduCards.length), 20000);
    return () => clearInterval(t);
  }, [eduCards.length]);

  /* ── 학급 사진 (6s 회전) ── */
  const visiblePhotos = (db.photos || []).filter(p => p.visible);
  useEffect(() => {
    if (visiblePhotos.length < 2) return;
    const t = setInterval(() => setPhotoIdx(i => (i + 1) % visiblePhotos.length), 6000);
    return () => clearInterval(t);
  }, [visiblePhotos.length]);

  const handleTeacherClick = () => {
    const pw = db.classInfo?.teacherPassword;
    if (!pw) {
      navigate(`/teacher/${classId}`);
    } else {
      setPwInput('');
      setPwError('');
      setShowPwModal(true);
    }
  };

  const handlePwSubmit = (e) => {
    e.preventDefault();
    if (pwInput === db.classInfo?.teacherPassword) {
      setShowPwModal(false);
      navigate(`/teacher/${classId}`);
    } else {
      setPwError('비밀번호가 틀렸습니다.');
    }
  };

  const dateStr = now.toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'long' });
  const timeStr = now.toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });

  const sortedDdays = [...(db.ddays || [])]
    .map(d => ({ ...d, diff: getDday(d.targetDate) }))
    .sort((a, b) => a.diff - b.diff);

  const activeAnn = [...(db.announcements || [])]
    .filter(a => !a.expiresAt || a.expiresAt > Date.now())
    .sort((a, b) => a.priority - b.priority);

  const top3 = [...(db.students || [])].sort((a, b) => b.stamps.total - a.stamps.total).slice(0, 3);

  const currentQuote = quotes[quoteIdx % Math.max(1, quotes.length)];
  const currentEdu   = eduCards[eduIdx % Math.max(1, eduCards.length)];
  const currentPhoto = visiblePhotos[photoIdx % Math.max(1, visiblePhotos.length)];

  return (
    <div className={`board-mode-root ${styles.board}`}>

      {/* ── 배경 ── */}
      <div className={styles.bgBase} />

      {/* ══ 헤더 ══ */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.dateText}>{dateStr}</div>
          <div className={styles.headerMeta}>
            <span className={styles.classTag}>🌿 {db.classInfo?.name}</span>
            {sortedDdays[0] && (
              <span className={styles.ddayChipHeader} style={{ background: sortedDdays[0].color }}>
                {sortedDdays[0].title} {sortedDdays[0].diff < 0 ? `D+${Math.abs(sortedDdays[0].diff)}` : sortedDdays[0].diff === 0 ? 'D-Day' : `D-${sortedDdays[0].diff}`}
              </span>
            )}
          </div>
        </div>

        <div className={styles.headerCenter}>
          {currentQuote && (
            <div className={styles.headerQuoteWrap} key={quoteIdx}>
              <div className={styles.headerQuoteText}>"{currentQuote.text}"</div>
              <div className={styles.headerQuoteAuthor}>— {currentQuote.author}</div>
            </div>
          )}
        </div>

        <div className={styles.headerRight}>
          <div className={styles.clockBig}>{timeStr}</div>
          <button className={styles.teacherBtn} onClick={handleTeacherClick}>✏️ 교사</button>
        </div>
      </header>

      {/* ══ 메인 그리드 ══ */}
      <main className={styles.mainGrid}>

        {/* ── 왼쪽: 전달사항 ── */}
        <section className={`${styles.panel} ${styles.annPanel}`}>
          <div className={styles.panelTitle}>📢 전달사항</div>
          <div className={styles.annList}>
            {activeAnn.length === 0
              ? <div className={styles.empty}>🌿 오늘은 새 공지가 없어요!</div>
              : activeAnn.map(ann => {
                  const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.GENERAL;
                  return (
                    <div key={ann.id} className={`${styles.annCard} ${ann.type === 'URGENT' ? styles.urgentCard : ''}`}>
                      <span className={styles.annBadge} style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
                      <div className={styles.annTitle}>{ann.title}</div>
                      {ann.body && <div className={styles.annBody}>{ann.body}</div>}
                    </div>
                  );
                })
            }
          </div>
        </section>

        {/* ── 가운데: 오늘의 교육 (전체) ── */}
        <section className={`${styles.panel} ${styles.eduPanel}`}>
          <div className={styles.panelTitle}>📚 오늘의 교육</div>
          {currentEdu
            ? <EduCard data={currentEdu} />
            : <div className={styles.empty}>📖 교육 자료가 없어요.</div>
          }
          <div className={styles.cardDots}>
            {eduCards.map((_, i) => (
              <span key={i} className={`${styles.dot} ${i === eduIdx ? styles.dotActive : ''}`} />
            ))}
          </div>
        </section>

        {/* ── 오른쪽 위: D-day + 칭찬왕 ── */}
        <div className={styles.rightTopStack}>
          <section className={`${styles.panel} ${styles.ddayPanel}`}>
            <div className={styles.panelTitle}>📆 D-day</div>
            {sortedDdays.slice(0, 3).map(d => (
              <div key={d.id} className={styles.ddayRow}>
                <span className={styles.ddayTitle}>{d.title}</span>
                <span className={styles.ddayNum} style={{ color: d.diff < 0 ? '#A8849A' : d.diff <= 3 ? '#FF4757' : '#D94F72' }}>
                  {d.diff < 0 ? `D+${Math.abs(d.diff)}` : d.diff === 0 ? 'D-Day' : `D-${d.diff}`}
                </span>
              </div>
            ))}
            {sortedDdays.length === 0 && <div className={styles.empty}>예정된 일정 없음</div>}
          </section>

          <section className={`${styles.panel} ${styles.top3Panel}`}>
            <div className={styles.panelTitle}>🏆 이번 주 칭찬 왕</div>
            {top3.map((s, i) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={s.id} className={styles.top3Row}>
                  <span className={styles.medal}>{medals[i]}</span>
                  <span className={styles.top3Name}>{maskName(s.name)}</span>
                  <span className={styles.top3Count}>{s.stamps.total}개</span>
                </div>
              );
            })}
          </section>
        </div>

        {/* ── 오른쪽 아래: 학급 사진 ── */}
        <section className={`${styles.panel} ${styles.photoPanel}`}>
          {visiblePhotos.length > 0 && currentPhoto ? (
            <div className={styles.photoSlide}>
              {visiblePhotos.map((p, i) => (
                <div
                  key={p.id}
                  className={`${styles.photoImg} ${i === photoIdx ? styles.photoImgActive : ''}`}
                  style={{ backgroundImage: `url(${p.url})` }}
                />
              ))}
              <div className={styles.photoCaptionBar}>
                <span>📸 {currentPhoto.caption}</span>
                {visiblePhotos.length > 1 && (
                  <span className={styles.photoCounter}>{photoIdx + 1} / {visiblePhotos.length}</span>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.photoEmpty}>
              <div className={styles.photoEmptyIcon}>📷</div>
              <div>학급 사진을<br/>업로드해보세요!</div>
            </div>
          )}
        </section>

      </main>

      <Footer />

      {showPwModal && (
        <div className={styles.pwOverlay} onClick={() => setShowPwModal(false)}>
          <div className={styles.pwModal} onClick={e => e.stopPropagation()}>
            <div className={styles.pwModalIcon}>🔐</div>
            <div className={styles.pwModalTitle}>교사 모드</div>
            <p className={styles.pwModalSub}>비밀번호를 입력하세요</p>
            <form onSubmit={handlePwSubmit}>
              <input
                className={styles.pwInput}
                type="password"
                autoFocus
                value={pwInput}
                onChange={e => { setPwInput(e.target.value); setPwError(''); }}
                placeholder="비밀번호"
              />
              {pwError && <p className={styles.pwError}>{pwError}</p>}
              <div className={styles.pwBtns}>
                <button type="submit" className={styles.pwConfirmBtn}>확인</button>
                <button type="button" className={styles.pwCancelBtn} onClick={() => setShowPwModal(false)}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
