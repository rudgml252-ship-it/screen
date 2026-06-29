import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './IndexPage.module.css';

const CLASS_ID = 'class-1';

function GuideModal({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <h2 className={styles.modalTitle}>📋 사용 안내</h2>
        <div className={styles.modalBody}>

          <div className={styles.guideSection}>
            <div className={styles.guideSectionTitle}>① 목적</div>
            <div className={styles.purposeBox}>
              <p>▸ 공지사항·일정·칭찬 도장 등 학급 운영 정보를 <strong>실시간</strong>으로 학생과 공유</p>
              <p>▸ TV·프로젝터 등 <strong>디스플레이에 연결</strong>하여 전자칠판 기능을 최대한 활용</p>
              <p>▸ 공지·타이머·발표자·선거 등 학급 운영 기능을 <strong>한 곳에 통합</strong></p>
            </div>
          </div>

          <div className={styles.guideSection}>
            <div className={styles.guideSectionTitle}>② 사용 방법</div>

            <div className={styles.step}>
              <div className={styles.stepLabel}>STEP 1 · 초기 설정 및 비밀번호</div>
              <ul className={styles.stepList}>
                <li>메인 화면 → <strong>교사 패널</strong> 클릭 (최초 접속 시 비밀번호 없이 입장)</li>
                <li>교사 패널 하단 <strong>🔐 교사 모드 비밀번호</strong>에서 비밀번호 설정</li>
                <li>설정 후 전자칠판 우하단 자물쇠 클릭 시 비밀번호 확인</li>
                <li>⚠ 비밀번호는 이 기기의 브라우저에만 저장 (다른 기기에서는 재설정 필요)</li>
              </ul>
            </div>

            <div className={styles.step}>
              <div className={styles.stepLabel}>STEP 2 · 전자칠판 표시</div>
              <ul className={styles.stepList}>
                <li>메인 화면 → <strong>전자칠판 보기</strong> 클릭</li>
                <li>TV·프로젝터 연결 후 <strong>F11</strong>로 전체화면 전환 권장</li>
                <li>공지·D-Day·TOP3 도장·교육자료·학급 사진 자동 표시</li>
              </ul>
            </div>

            <div className={styles.step}>
              <div className={styles.stepLabel}>STEP 3 · 내용 관리</div>
              <ul className={styles.stepList}>
                <li>전자칠판 우하단 자물쇠 → 비밀번호 → 교사 패널 이동</li>
                <li>또는 메인 화면 → <strong>교사 패널</strong>로 직접 접속</li>
              </ul>
            </div>
          </div>

          <div className={styles.guideSection}>
            <div className={styles.guideSectionTitle}>③ 주요 기능</div>
            <div className={styles.featureGrid}>
              {[
                ['📢', '공지사항', '긴급·일반·제출·시간표 유형별 작성'],
                ['📅', 'D-Day', '시험·행사·방학 카운트다운'],
                ['🐥', '칭찬 도장', '학생별 도장 부여·TOP3 표시'],
                ['⏱️', '집중 타이머', '전자칠판에 크게 표시'],
                ['🎲', '랜덤 발표자', '무작위 발표자 선정'],
                ['🗳️', '학급 선거', '실시간 투표·결과 집계'],
                ['🧹', '청소 당번', '구역별 담당자 배정'],
                ['📸', '학급 사진', '슬라이드쇼 자동 표시'],
                ['📖', '오늘의 교육', '교육자료 카드 순환 표시'],
              ].map(([icon, name, desc]) => (
                <div key={name} className={styles.featureCard}>
                  <div className={styles.featureCardIcon}>{icon}</div>
                  <div>
                    <div className={styles.featureCardName}>{name}</div>
                    <div className={styles.featureCardDesc}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.guideSection}>
            <div className={styles.guideSectionTitle}>④ 주의사항</div>
            <ul className={styles.cautionList}>
              <li className={styles.cautionRed}>🔐 비밀번호는 이 기기의 브라우저에만 저장됩니다. 다른 기기에서는 재설정 필요.</li>
              <li className={styles.cautionOrange}>⚠ 학급 사진은 서버에 업로드되지 않고 이 기기에만 저장됩니다.</li>
              <li className={styles.cautionBlue}>💡 공지사항·학생 정보·도장 현황은 여러 기기 간 자동 동기화됩니다.</li>
              <li className={styles.cautionOrange}>⚠ 공용 PC 사용 시 수업 후 브라우저 로컬 데이터 삭제를 권장합니다.</li>
              <li className={styles.cautionBlue}>💡 Chrome 브라우저 + 전체화면(F11) 환경에서 가장 안정적으로 작동합니다.</li>
              <li className={styles.cautionBlue}>💡 학생 이름은 화면 표시 시 가운데 글자가 ✦로 마스킹 처리됩니다.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function IndexPage() {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.emojiRow}>
          <span className={styles.e1}>🐣</span>
          <span className={styles.e2}>📚</span>
          <span className={styles.e3}>⭐</span>
        </div>
        <h1 className={styles.title}>모두의 학급</h1>
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

        <button className={styles.guideBtn} onClick={() => setShowGuide(true)}>
          📋 사용 안내 보기
        </button>

        <p className={styles.footer}>🐥 병아리를 모으며 즐거운 학급을!</p>
        <button className={styles.resetBtn}
          onClick={() => { localStorage.removeItem('classboard_v2'); window.location.reload(); }}>
          데이터 초기화
        </button>
      </div>

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}
