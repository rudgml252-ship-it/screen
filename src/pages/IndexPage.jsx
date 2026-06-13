import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './IndexPage.module.css';

const CLASS_ID = 'class-1';

const IndexPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.emojiRow}>
          <span className={`${styles.emoji} ${styles.float1}`}>🐣</span>
          <span className={`${styles.emoji} ${styles.float2}`}>📚</span>
          <span className={`${styles.emoji} ${styles.float3}`}>⭐</span>
        </div>
        <h1 className={styles.title}>ClassBoard</h1>
        <p className={styles.subtitle}>우리 반 실시간 학급 운영 시스템</p>

        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${styles.boardBtn}`}
            onClick={() => navigate(`/board/${CLASS_ID}`)}
          >
            <span className={styles.btnIcon}>📺</span>
            <div>
              <div className={styles.btnTitle}>전자칠판 보기</div>
              <div className={styles.btnSub}>BOARD MODE</div>
            </div>
          </button>

          <button
            className={`${styles.button} ${styles.teacherBtn}`}
            onClick={() => navigate(`/teacher/${CLASS_ID}`)}
          >
            <span className={styles.btnIcon}>✏️</span>
            <div>
              <div className={styles.btnTitle}>교사 패널</div>
              <div className={styles.btnSub}>TEACHER MODE</div>
            </div>
          </button>
        </div>

        <p className={styles.footer}>🐥 병아리를 모아봐요!</p>
      </div>
    </div>
  );
};

export default IndexPage;
