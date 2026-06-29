import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './IndexPage.module.css';

const ADJECTIVES = ['happy','bright','smart','kind','cool','sunny','lucky','brave'];
const NOUNS      = ['star','sun','dream','hero','moon','rose','sky','leaf'];

function randomCode() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const d = Math.floor(Math.random() * 99) + 1;
  return `${a}-${n}-${d}`;
}

function normalizeCode(raw) {
  return raw.trim().toLowerCase().replace(/\s+/g, '-');
}

function GuideModal({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <h2 className={styles.modalTitle}>📋 모두의 학급 — 사용 안내</h2>
        <div className={styles.modalBody}>

          {/* ① 목적 */}
          <div className={styles.guideBlock}>
            <div className={styles.guideTag}>① 목적</div>
            <div className={styles.purposeBox}>
              <p>▸ 학급 공지·일정·칭찬 도장 등을 <strong>실시간</strong>으로 학생과 공유</p>
              <p>▸ TV·프로젝터 등 디스플레이에 연결해 <strong>전자칠판</strong>으로 활용</p>
              <p>▸ 공지·타이머·발표자·선거 등 학급 운영 기능을 <strong>한 곳에 통합</strong></p>
            </div>
          </div>

          {/* ② 사용 방법 */}
          <div className={styles.guideBlock}>
            <div className={styles.guideTag}>② 사용 방법</div>

            <div className={styles.stepBox}>
              <div className={styles.stepLabel}>STEP 1 &nbsp;·&nbsp; 학급 코드 입력</div>
              <ul className={styles.stepList}>
                <li>메인 화면 코드 입력란에 <strong>우리 반 고유 코드</strong> 입력 (예: 인왕-2-1)</li>
                <li>처음 사용하는 코드면 <strong>새 학급이 자동 생성</strong>됩니다</li>
                <li>같은 코드를 입력하면 언제든지 같은 학급 데이터로 접속</li>
                <li>🎲 버튼으로 코드를 자동 생성할 수도 있습니다</li>
              </ul>
            </div>

            <div className={styles.stepBox}>
              <div className={styles.stepLabel}>STEP 2 &nbsp;·&nbsp; 교사 패널 & 비밀번호</div>
              <ul className={styles.stepList}>
                <li>메인 화면 → <strong>교사 패널</strong> 버튼으로 접속 (최초엔 비밀번호 없이 입장)</li>
                <li>교사 패널 하단 <strong>🔐 교사 모드 비밀번호</strong>에서 비밀번호 설정</li>
                <li>비밀번호는 이 기기 브라우저에만 저장 — 다른 기기에서는 별도 설정 필요</li>
              </ul>
            </div>

            <div className={styles.stepBox}>
              <div className={styles.stepLabel}>STEP 3 &nbsp;·&nbsp; 전자칠판 실행</div>
              <ul className={styles.stepList}>
                <li>메인 화면 → <strong>전자칠판 보기</strong> 클릭</li>
                <li>TV·프로젝터 연결 후 <strong>F11</strong>로 전체화면 전환 권장</li>
                <li>교무실 PC 교사 패널에서 수정하면 교실 전자칠판에 <strong>즉시 반영</strong></li>
              </ul>
            </div>
          </div>

          {/* ③ 주요 기능 */}
          <div className={styles.guideBlock}>
            <div className={styles.guideTag}>③ 주요 기능</div>
            <div className={styles.featureGrid}>
              {[
                ['📢', '공지사항',   '긴급·일반·제출·시간표 유형별 작성'],
                ['📅', 'D-Day',      '시험·행사·방학 카운트다운'],
                ['🐥', '칭찬 도장',  '학생별 도장 부여·주간 TOP3 표시'],
                ['⏱️', '집중 타이머','전자칠판에 크게 표시'],
                ['🎲', '랜덤 발표자','무작위 발표자 선정'],
                ['🗳️', '학급 선거',  '투표 생성·실시간 결과 집계'],
                ['🧹', '청소 당번',  '구역별 담당자 배정·관리'],
                ['📸', '학급 사진',  '슬라이드쇼로 자동 표시'],
                ['📖', '오늘의 교육','교육자료 카드 순환 표시'],
              ].map(([icon, name, desc]) => (
                <div key={name} className={styles.featureCard}>
                  <span className={styles.featureIcon}>{icon}</span>
                  <div>
                    <div className={styles.featureName}>{name}</div>
                    <div className={styles.featureDesc}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ④ 주의사항 */}
          <div className={styles.guideBlock}>
            <div className={styles.guideTag}>④ 주의사항</div>
            <ul className={styles.cautionList}>
              <li className={styles.cautionRed}>🔐 비밀번호·학급 사진은 이 기기에만 저장됩니다. 다른 기기에서는 재설정·재업로드 필요.</li>
              <li className={styles.cautionBlue}>💡 공지사항·학생 정보·칭찬 도장은 여러 기기 간 실시간 자동 동기화됩니다.</li>
              <li className={styles.cautionOrange}>⚠ 학급 코드를 아는 사람은 누구나 전자칠판을 볼 수 있으니 코드는 학급 내에서만 공유하세요.</li>
              <li className={styles.cautionOrange}>⚠ 공용 PC 사용 시 수업 후 브라우저 방문 기록 삭제를 권장합니다.</li>
              <li className={styles.cautionBlue}>💡 Chrome 브라우저 + 전체화면(F11)에서 가장 안정적으로 작동합니다.</li>
              <li className={styles.cautionBlue}>💡 학생 이름은 화면 표시 시 가운데 글자가 ✦로 마스킹 처리됩니다.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function IndexPage() {
  const navigate   = useNavigate();
  const [code,     setCode]     = useState(() => localStorage.getItem('last_class_code') || '');
  const [error,    setError]    = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const go = (path) => {
    const normalized = normalizeCode(code);
    if (!normalized) { setError('학급 코드를 입력하세요.'); return; }
    if (normalized.length < 2) { setError('코드는 2자 이상이어야 합니다.'); return; }
    localStorage.setItem('last_class_code', normalized);
    navigate(`/${path}/${normalized}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') go('board');
  };

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

        <div className={styles.codeSection}>
          <label className={styles.codeLabel}>학급 코드</label>
          <div className={styles.codeRow}>
            <input
              className={styles.codeInput}
              type="text"
              placeholder="예: 인왕-2-1"
              value={code}
              onChange={e => { setCode(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              maxLength={40}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              className={styles.randomBtn}
              onClick={() => { setCode(randomCode()); setError(''); }}
              title="코드 자동 생성"
            >🎲</button>
          </div>
          {error && <p className={styles.codeError}>{error}</p>}
          <p className={styles.codeHint}>처음 입력하는 코드면 새 학급이 자동 생성됩니다.</p>
        </div>

        <div className={styles.buttonGroup}>
          <button className={`${styles.button} ${styles.boardBtn}`} onClick={() => go('board')}>
            <span className={styles.btnIcon}>📺</span>
            <div>
              <div className={styles.btnTitle}>전자칠판 보기</div>
              <div className={styles.btnSub}>BOARD MODE · 전체화면</div>
            </div>
          </button>
          <button className={`${styles.button} ${styles.teacherBtn}`} onClick={() => go('teacher')}>
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
          onClick={() => {
            const normalized = normalizeCode(code);
            if (normalized) localStorage.removeItem(`classboard_v2_${normalized}`);
            window.location.reload();
          }}>
          데이터 초기화
        </button>
      </div>

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}
