import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockDb } from '../context/MockDbContext';
import styles from './BoardPage.module.css';

/* ── helpers ── */
const getDday = (targetDate) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(targetDate); target.setHours(0,0,0,0);
  return Math.ceil((target - today) / 86400000);
};
const TYPE_CONFIG = {
  URGENT:  { label:'🚨 긴급', bg:'#FF4757', text:'#fff' },
  GENERAL: { label:'📢 일반', bg:'#80DEEA', text:'#006064' },
  SUBMIT:  { label:'📝 제출', bg:'#FFEAA7', text:'#7B6000' },
  SCHEDULE:{ label:'📅 시간표', bg:'#B2EBF2', text:'#00838F' },
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
      <div className={styles.eduRichHeader} style={{ background: data.headerBg || '#26C6DA' }}>
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

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
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

      {/* ── 귀여운 CSS 배경 ── */}
      <div className={styles.bgBase} />
      <div className={styles.bgBubbles}>
        <span /><span /><span /><span /><span />
        <span /><span /><span /><span /><span />
      </div>

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
          <button className={styles.teacherBtn} onClick={() => navigate(`/teacher/${classId}`)}>✏️ 교사</button>
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

        {/* ── 가운데: 교육자료(위 2/3) + 칭찬왕(아래 1/3) ── */}
        <section className={`${styles.panel} ${styles.eduPanel}`}>

          {/* 위: 교육자료 (더 크게) */}
          <div className={styles.eduTop}>
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
          </div>

          {/* 구분선 */}
          <div className={styles.eduDivider} />

          {/* 아래: 칭찬 TOP3 */}
          <div className={styles.top3Bottom}>
            <div className={styles.panelTitle}>🏆 이번 주 칭찬 왕</div>
            {top3.map((s, i) => {
              const medals = ['🥇', '🥈', '🥉'];
              const chickCount = Math.min(s.stamps.total, 30);
              return (
                <div key={s.id} className={styles.top3Row}>
                  <span className={styles.medal}>{medals[i]}</span>
                  <span className={styles.top3Name}>{s.name}</span>
                  <div className={styles.chickRow}>
                    {Array.from({ length: chickCount }).map((_, ci) => (
                      <span key={ci} className={styles.chickEmoji}>🐥</span>
                    ))}
                  </div>
                  <span className={styles.top3Count}>{s.stamps.total}개</span>
                </div>
              );
            })}
          </div>

        </section>

        {/* ── 오른쪽 위: D-day ── */}
        <section className={`${styles.panel} ${styles.ddayPanel}`}>
          <div className={styles.panelTitle}>📆 D-day</div>
          {sortedDdays.slice(0, 5).map(d => (
            <div key={d.id} className={styles.ddayRow}>
              <span className={styles.ddayTitle}>{d.title}</span>
              <span className={styles.ddayNum} style={{ color: d.diff < 0 ? '#78909C' : d.diff <= 3 ? '#FF4757' : '#006064' }}>
                {d.diff < 0 ? `D+${Math.abs(d.diff)}` : d.diff === 0 ? 'D-Day' : `D-${d.diff}`}
              </span>
            </div>
          ))}
          {sortedDdays.length === 0 && <div className={styles.empty}>예정된 일정 없음</div>}
        </section>

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
    </div>
  );
}
