import React from 'react';
import styles from './StampStatusModal.module.css';
import EggStamp from './EggStamp';

const MAX_STAMPS = 30; // 최대 표시할 칸 수

const getBadge = (total) => {
  if (total >= 30) return '👑';
  if (total >= 20) return '🥇';
  if (total >= 10) return '🥈';
  if (total >= 5) return '🥉';
  return '';
};

const StampStatusModal = ({ students, onClose }) => {
  const sortedStudents = [...students].sort((a, b) => a.number - b.number);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>🐣 칭찬 스티커 현황</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.legend}>
          <span>🥚 아직 부화 중</span>
          <span>🐥 병아리 탄생!</span>
          <span className={styles.badges}>🥉5개 &nbsp; 🥈10개 &nbsp; 🥇20개 &nbsp; 👑30개</span>
        </div>

        <div className={styles.studentList}>
          {sortedStudents.map((student) => {
            const total = student.stamps.total;
            const badge = getBadge(total);
            return (
              <div key={student.id} className={styles.studentRow}>
                <div className={styles.nameCol}>
                  <span className={styles.number}>{student.number}번</span>
                  <span className={styles.name}>{student.name}</span>
                  {badge && <span className={styles.badge}>{badge}</span>}
                  <span className={styles.count}>({total}개)</span>
                </div>
                <div className={styles.eggsRow}>
                  {Array.from({ length: MAX_STAMPS }).map((_, i) => (
                    <EggStamp
                      key={i}
                      index={i}
                      isHatched={i < total}
                      readonly={true}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StampStatusModal;
