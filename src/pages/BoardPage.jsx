import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './BoardPage.module.css';
import { useMockDb } from '../context/MockDbContext';

const TYPE_CONFIG = {
  URGENT: { label: '🚨 긴급', bg: '#FF4757', text: '#fff' },
  GENERAL: { label: '📢 일반', bg: '#A8D8EA', text: '#2d6a88' },
  SUBMIT: { label: '📝 제출', bg: '#FFEAA7', text: '#7B6000' },
  SCHEDULE: { label: '📅 시간표', bg: '#B5EAD7', text: '#206040' },
};

const getBadge = (total) => {
  if (total >= 30) return '👑';
  if (total >= 20) return '🥇';
  if (total >= 10) return '🥈';
  if (total >= 5) return '🥉';
  return '';
};

// Chick SVG for board display
const MiniChick = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <ellipse cx="24" cy="32" rx="14" ry="12" fill="#FFEB3B"/>
    <circle cx="24" cy="18" r="10" fill="#FFEB3B"/>
    <circle cx="20" cy="16" r="2.5" fill="#333"/>
    <circle cx="28" cy="16" r="2.5" fill="#333"/>
    <circle cx="21" cy="15" r="1" fill="white"/>
    <circle cx="29" cy="15" r="1" fill="white"/>
    <path d="M21 21 L24 24 L27 21" fill="#FF8F00" stroke="#FF8F00" strokeWidth="0.5"/>
    <ellipse cx="10" cy="32" rx="5" ry="7" fill="#FFC107" transform="rotate(-15 10 32)"/>
    <ellipse cx="38" cy="32" rx="5" ry="7" fill="#FFC107" transform="rotate(15 38 32)"/>
    <ellipse cx="16" cy="20" rx="3" ry="2" fill="rgba(255,150,130,0.5)"/>
    <ellipse cx="32" cy="20" rx="3" ry="2" fill="rgba(255,150,130,0.5)"/>
  </svg>
);

const MiniEgg = () => (
  <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="30">
    <ellipse cx="20" cy="26" rx="16" ry="20" fill="#FFF9C4" stroke="#F9C84A" strokeWidth="2"/>
    <ellipse cx="14" cy="20" rx="3" ry="4" fill="rgba(255,255,255,0.5)"/>
  </svg>
);

const BoardPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { db } = useMockDb();

  const [time, setTime] = useState(new Date());
  const [quoteIndex] = useState(() => Math.floor(Math.random() * (db.quotes?.length || 1)));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = time.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const timeStr = time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const activeAnnouncements = db.announcements.filter(ann =>
    !ann.expiresAt || ann.expiresAt > Date.now()
  ).sort((a, b) => a.priority - b.priority);

  const top3 = [...db.students].sort((a, b) => b.stamps.total - a.stamps.total).slice(0, 3);
  const quote = db.quotes?.[quoteIndex] || { text: '오늘도 최선을 다해봐요!', author: '선생님' };

  return (
    <div className={`board-mode-root ${styles.board}`}>
      {/* ─── Header Row ─── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.dateText}>{dateStr}</div>
          <div className={styles.classLabel}>🐣 우리 반</div>
        </div>
        <div className={styles.clock}>{timeStr}</div>
        <button className={styles.teacherLink} onClick={() => navigate(`/teacher/${classId}`)}>
          ✏️ 교사 패널
        </button>
      </header>

      {/* ─── Main Grid ─── */}
      <main className={styles.grid}>

        {/* Announcement Panel */}
        <section className={`${styles.panel} ${styles.announcePanel}`}>
          <h2 className={styles.panelTitle}>📢 전달사항</h2>
          <div className={styles.annList}>
            {activeAnnouncements.length === 0 ? (
              <div className={styles.emptyPanel}>오늘은 새로운 공지가 없어요 😊</div>
            ) : (
              activeAnnouncements.map(ann => {
                const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.GENERAL;
                return (
                  <div
                    key={ann.id}
                    className={`${styles.annCard} ${ann.type === 'URGENT' ? styles.urgentCard : ''}`}
                  >
                    <span className={styles.annBadge} style={{ backgroundColor: cfg.bg, color: cfg.text }}>
                      {cfg.label}
                    </span>
                    <p className={styles.annTitle}>{ann.title}</p>
                    {ann.body && <p className={styles.annBody}>{ann.body}</p>}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Quote / Routine Card */}
        <section className={`${styles.panel} ${styles.quotePanel}`}>
          <h2 className={styles.panelTitle}>💬 오늘의 명언</h2>
          <div className={styles.quoteContent}>
            <p className={styles.quoteText}>"{quote.text}"</p>
            <p className={styles.quoteAuthor}>— {quote.author}</p>
          </div>
          <div className={styles.questSection}>
            <h3 className={styles.questTitle}>🎯 오늘의 미션</h3>
            {db.quests?.map(q => (
              <div key={q.id} className={styles.questItem}>
                <span>✅ {q.title}</span>
                <span className={styles.questXp}>+{q.xpReward} XP</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stamp TOP 3 */}
        <section className={`${styles.panel} ${styles.stampPanel}`}>
          <h2 className={styles.panelTitle}>🏆 칭찬 스티커 TOP 3</h2>
          <div className={styles.top3List}>
            {top3.map((s, i) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={s.id} className={styles.top3Item}>
                  <span className={styles.medalEmoji}>{medals[i]}</span>
                  <span className={styles.topName}>{s.name}</span>
                  <div className={styles.topChicks}>
                    {Array.from({ length: Math.min(s.stamps.total, 10) }).map((_, ci) => (
                      <MiniChick key={ci} />
                    ))}
                    {s.stamps.total > 10 && (
                      <span className={styles.extraCount}>+{s.stamps.total - 10}</span>
                    )}
                  </div>
                  <span className={styles.topCount}>{s.stamps.total}개</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* XP Bar */}
        <section className={`${styles.panel} ${styles.xpPanel}`}>
          <h2 className={styles.panelTitle}>⭐ 학급 경험치</h2>
          <div className={styles.levelBadge}>Lv. {db.xp.level}</div>
          <div className={styles.xpBarOuter}>
            <div
              className={styles.xpBarInner}
              style={{ width: `${Math.min(100, (db.xp.total / db.xp.nextLevelAt) * 100)}%` }}
            />
          </div>
          <div className={styles.xpNumbers}>
            {db.xp.total.toLocaleString()} / {db.xp.nextLevelAt.toLocaleString()} XP
          </div>
        </section>

        {/* Student Chick Display */}
        <section className={`${styles.panel} ${styles.chickPanel}`}>
          <h2 className={styles.panelTitle}>🐣 우리 반 병아리 현황</h2>
          <div className={styles.chickGrid}>
            {[...db.students].sort((a, b) => a.number - b.number).map(s => (
              <div key={s.id} className={styles.chickStudentItem}>
                <div className={styles.chickStudentName}>{s.number}번 {s.name}</div>
                <div className={styles.chickStudentRow}>
                  {Array.from({ length: Math.min(s.stamps.total, 8) }).map((_, i) => (
                    <MiniChick key={i} />
                  ))}
                  {Array.from({ length: Math.max(0, 8 - s.stamps.total) }).map((_, i) => (
                    <MiniEgg key={`egg-${i}`} />
                  ))}
                  {s.stamps.total > 8 && (
                    <span className={styles.extraCount}>+{s.stamps.total - 8}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default BoardPage;
