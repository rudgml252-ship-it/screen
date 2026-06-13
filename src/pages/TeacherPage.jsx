import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './TeacherPage.module.css';
import { useMockDb } from '../context/MockDbContext';
import EggStamp from '../components/EggStamp';
import StampStatusModal from '../components/StampStatusModal';

const TYPE_LABELS = {
  GENERAL: { label: '일반', color: '#A8D8EA', icon: '📢' },
  URGENT: { label: '긴급', color: '#FF6B6B', icon: '🚨' },
  SUBMIT: { label: '제출물', color: '#FFEAA7', icon: '📝' },
  SCHEDULE: { label: '시간표', color: '#B5EAD7', icon: '📅' },
};

const getBadge = (total) => {
  if (total >= 30) return '👑';
  if (total >= 20) return '🥇';
  if (total >= 10) return '🥈';
  if (total >= 5) return '🥉';
  return null;
};

const MAX_DISPLAY_STAMPS = 20;

const TeacherPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { db, addAnnouncement, deleteAnnouncement, addStamp, resetDb } = useMockDb();

  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newType, setNewType] = useState('GENERAL');
  const [showStampModal, setShowStampModal] = useState(false);
  const [activeTab, setActiveTab] = useState('announce'); // 'announce' | 'stamps'
  const [stampReason, setStampReason] = useState('');
  const [hatchNotif, setHatchNotif] = useState(null);

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addAnnouncement({
      title: newTitle,
      body: newBody,
      type: newType,
      priority: newType === 'URGENT' ? 1 : newType === 'SUBMIT' ? 2 : 3,
      authorId: 'teacher_01',
      pinned: newType === 'URGENT',
    });
    setNewTitle('');
    setNewBody('');
  };

  const handleStamp = (studentId, delta) => {
    const student = db.students.find(s => s.id === studentId);
    addStamp(studentId, delta, stampReason || '교사 부여', 'teacher_01');
    if (delta > 0 && student) {
      setHatchNotif(`${student.name} 학생에게 칭찬 스티커 +1! 🐣`);
      setTimeout(() => setHatchNotif(null), 2000);
    }
  };

  const handleHatch = (studentId, eggIndex) => {
    // eggIndex+1 == new total, so we just add 1
    handleStamp(studentId, 1);
  };

  const sortedStudents = [...db.students].sort((a, b) => a.number - b.number);

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>🐣</span>
          <div>
            <h1 className={styles.headerTitle}>ClassBoard 교사 패널</h1>
            <p className={styles.headerSub}>학급: {classId}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.boardBtn} onClick={() => navigate(`/board/${classId}`)}>
            📺 전자칠판 보기
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'announce' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('announce')}
        >
          📢 공지사항 관리
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'stamps' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('stamps')}
        >
          🐣 칭찬 스티커 관리
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'announce' && (
          <div className={styles.announceLayout}>
            {/* New Announcement Form */}
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>✏️ 새 공지 작성</h2>
              <form onSubmit={handleAddAnnouncement} className={styles.form}>
                <div className={styles.typeRow}>
                  {Object.entries(TYPE_LABELS).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewType(key)}
                      className={`${styles.typeChip} ${newType === key ? styles.typeChipSelected : ''}`}
                      style={newType === key ? { backgroundColor: val.color } : {}}
                    >
                      {val.icon} {val.label}
                    </button>
                  ))}
                </div>
                <input
                  className={styles.input}
                  placeholder="제목을 입력하세요"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
                <textarea
                  className={styles.textarea}
                  placeholder="내용을 입력하세요 (선택)"
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                />
                <button type="submit" className={styles.submitBtn}>
                  🔔 공지 등록하기
                </button>
              </form>
            </div>

            {/* Announcement List */}
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>📋 현재 공지사항</h2>
              <div className={styles.annList}>
                {db.announcements.length === 0 && (
                  <p className={styles.emptyMsg}>등록된 공지가 없습니다.</p>
                )}
                {db.announcements.map(ann => {
                  const typeInfo = TYPE_LABELS[ann.type] || TYPE_LABELS.GENERAL;
                  return (
                    <div key={ann.id} className={styles.annItem}>
                      <div className={styles.annTop}>
                        <span
                          className={styles.annBadge}
                          style={{ backgroundColor: typeInfo.color }}
                        >
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => deleteAnnouncement(ann.id)}
                        >
                          ✕
                        </button>
                      </div>
                      <p className={styles.annTitle}>{ann.title}</p>
                      {ann.body && <p className={styles.annBody}>{ann.body}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stamps' && (
          <div className={styles.stampsLayout}>
            {/* Header for stamps */}
            <div className={styles.stampsHeader}>
              <div className={styles.stampReasonBox}>
                <label>📝 칭찬 이유 (선택)</label>
                <input
                  className={styles.input}
                  placeholder="예: 발표를 잘했어요, 친구를 도와줬어요..."
                  value={stampReason}
                  onChange={e => setStampReason(e.target.value)}
                  style={{ marginTop: 6 }}
                />
              </div>
              <button
                className={styles.statusBtn}
                onClick={() => setShowStampModal(true)}
              >
                📊 칭찬도장 현황 보기
              </button>
            </div>

            {/* Student Cards */}
            <div className={styles.studentGrid}>
              {sortedStudents.map(student => {
                const total = student.stamps.total;
                const badge = getBadge(total);
                const displayStamps = Math.min(total, MAX_DISPLAY_STAMPS);

                return (
                  <div key={student.id} className={styles.studentCard}>
                    {/* Student Name & Badge */}
                    <div className={styles.studentCardTop}>
                      <div className={styles.studentMeta}>
                        <span className={styles.stuNumber}>{student.number}번</span>
                        <span className={styles.stuName}>{student.name}</span>
                        {badge && <span className={styles.stuBadge}>{badge}</span>}
                      </div>
                      <div className={styles.stampCount}>
                        🐣 {total}개
                      </div>
                    </div>

                    {/* Egg/Chick row */}
                    <div className={styles.eggRow}>
                      {Array.from({ length: MAX_DISPLAY_STAMPS }).map((_, i) => (
                        <EggStamp
                          key={i}
                          index={i}
                          isHatched={i < displayStamps}
                          readonly={i < displayStamps} // already hatched eggs are read-only
                          onHatch={() => handleHatch(student.id, i)}
                        />
                      ))}
                      {total > MAX_DISPLAY_STAMPS && (
                        <span className={styles.moreStamps}>+{total - MAX_DISPLAY_STAMPS}</span>
                      )}
                    </div>

                    {/* +/- Controls */}
                    <div className={styles.stampControls}>
                      <button
                        className={styles.minusBtn}
                        onClick={() => handleStamp(student.id, -1)}
                        disabled={total === 0}
                      >
                        −
                      </button>
                      <span className={styles.stampTotal}>{total}</span>
                      <button
                        className={styles.plusBtn}
                        onClick={() => handleStamp(student.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hatch Notification Toast */}
      {hatchNotif && (
        <div className={styles.toast}>
          {hatchNotif}
        </div>
      )}

      {/* Stamp Status Modal */}
      {showStampModal && (
        <StampStatusModal
          students={sortedStudents}
          onClose={() => setShowStampModal(false)}
        />
      )}
    </div>
  );
};

export default TeacherPage;
