import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './StudentPage.module.css';
import { useMockDb } from '../context/MockDbContext';

const StudentPage = () => {
  const { classId } = useParams();
  const { db, markAnnouncementRead } = useMockDb();
  
  // 간단하게 학생을 선택해서 테스트 (실제로는 로그인 정보)
  const [currentStudentId, setCurrentStudentId] = useState('s01');

  const unreadAnnouncements = db.announcements.filter(a => !a.readBy[currentStudentId]);

  const handleRead = (annId) => {
    markAnnouncementRead(annId, currentStudentId);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>STUDENT MODE ({classId})</h1>
        <select 
          value={currentStudentId} 
          onChange={e => setCurrentStudentId(e.target.value)}
          className={styles.studentSelect}
        >
          {db.students.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </header>

      <div className={styles.content}>
        <h2>새로운 공지사항 ({unreadAnnouncements.length})</h2>
        <div className={styles.announcementList}>
          {unreadAnnouncements.length === 0 ? (
            <p className={styles.empty}>모든 공지를 확인했습니다!</p>
          ) : (
            unreadAnnouncements.map(ann => (
              <div key={ann.id} className={styles.announcementCard}>
                <div className={styles.annHeader}>
                  <span className={`${styles.annType} ${ann.type === 'URGENT' ? styles.urgent : ''}`}>
                    {ann.type}
                  </span>
                  <h3>{ann.title}</h3>
                </div>
                <p className={styles.annBody}>{ann.body}</p>
                <button 
                  className={styles.readButton}
                  onClick={() => handleRead(ann.id)}
                >
                  확인했습니다
                </button>
              </div>
            ))
          )}
        </div>

        <h2 className={styles.sectionTitle}>내 정보</h2>
        <div className={styles.myInfo}>
          <p>내 칭찬 도장: <strong>{db.students.find(s => s.id === currentStudentId)?.stamps.total || 0}</strong>개</p>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
