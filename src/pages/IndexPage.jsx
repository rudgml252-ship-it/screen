import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './IndexPage.module.css';

const CLASS_ID = 'class-1';

export default function IndexPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.emojiRow}>
          <span className={styles.e1}>🐣</span>
          <span className={styles.e2}>📚</span>
          <span className={styles.e3}>⭐</span>
        </div>
        <h1 className={styles.title}>ClassBoard</h1>
        <p className={styles.subtitle}>🏫 우리 반 실시간 학급 운영 시스템</p>

        <div className={styles.featureList}>
          <div className={styles.featureItem}>📢 실시간 공지사항</div>
          <div className={styles.featureItem}>🐥 병아리 칭찬 스티커</div>
          <div className={styles.featureItem}>🎲 랜덤 발표자 뽑기</div>
          <div className={styles.featureItem}>🗳️ 학급 선거 투표</div>
          <div className={styles.featureItem}>⏱️ 집중 타이머</div>
          <div className={styles.featureItem}>🧹 청소 당번 관리</div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={`${styles.button} ${styles.boardBtn}`} onClick={() => navigate(`/board/${CLASS_ID}`)}>
            <span className={styles.btnIcon}>📺</span>
            <div>
              <div className={styles.btnTitle}>전자칠판 보기</div>
              <div className={styles.btnSub}>BOARD MODE · 전체화면</div>
            </div>
          </button>
          <button className={`${styles.button} ${styles.teacherBtn}`} onClick={() => navigate(`/teacher/${CLASS_ID}`)}>
            <span className={styles.btnIcon}>✏️</span>
            <div>
              <div className={styles.btnTitle}>교사 패널</div>
              <div className={styles.btnSub}>TEACHER MODE · 관리</div>
            </div>
          </button>
        </div>

        <p className={styles.footer}>🐥 병아리를 모으며 즐거운 학급을!</p>
        <button className={styles.resetBtn}
          onClick={() => { localStorage.removeItem('classboard_v2'); window.location.reload(); }}>
          데이터 초기화
        </button>
      </div>
    </div>
  );
}
