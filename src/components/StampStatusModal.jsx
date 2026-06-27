import React from 'react';
import styles from './StampStatusModal.module.css';

const MAX_DISPLAY = 30;

const getBadge = (n) => n>=30?'👑':n>=20?'🥇':n>=10?'🥈':n>=5?'🥉':'';

export default function StampStatusModal({ students, onClose }) {
  const sorted = [...students].sort((a,b) => a.number - b.number);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e=>e.stopPropagation()}>
        <div className={styles.header}>
          <h2>🐥 칭찬 스티커 전체 현황</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.legend}>
          <span>🥚 계란 (아직)</span>
          <span>🐥 병아리 (획득!)</span>
          <span className={styles.legendBadges}>🥉5개 · 🥈10개 · 🥇20개 · 👑30개</span>
        </div>

        <div className={styles.list}>
          {sorted.map(s => {
            const total = s.stamps.total;
            const badge = getBadge(total);
            return (
              <div key={s.id} className={styles.row}>
                <div className={styles.nameCol}>
                  <span className={styles.num}>{s.number}번</span>
                  <span className={styles.name}>{s.name}</span>
                  {badge && <span>{badge}</span>}
                  <span className={styles.countBadge}>🐥{total}</span>
                </div>
                <div className={styles.eggsRow}>
                  {Array.from({length: MAX_DISPLAY}).map((_,i) => (
                    <span key={i} className={`${styles.stampEmoji} ${i < total ? styles.chick : styles.egg}`}>
                      {i < total ? '🐥' : '🥚'}
                    </span>
                  ))}
                  {total > MAX_DISPLAY && <span className={styles.extra}>+{total-MAX_DISPLAY}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
