import { useState } from 'react';
import styles from './Footer.module.css';

function PrivacyModal({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <h2 className={styles.modalTitle}>개인정보처리방침</h2>
        <div className={styles.modalContent}>
          <p className={styles.updated}>최종 수정일: 2026년 6월 29일</p>

          <h3>1. 수집하는 개인정보 항목</h3>
          <p>서비스 운영을 위해 다음 항목을 수집합니다.</p>
          <ul>
            <li>이름 (일부 마스킹 처리)</li>
            <li>학번</li>
            <li>사진</li>
          </ul>

          <h3>2. 개인정보 수집 및 이용 목적</h3>
          <ul>
            <li>학급 전자칠판 서비스 제공</li>
            <li>칭찬 도장 현황 관리</li>
            <li>학급 공지 및 일정 표시</li>
          </ul>

          <h3>3. 개인정보 보유 및 이용 기간</h3>
          <p>수집된 정보는 해당 학년도 종료 시까지 보관하며, 이후 즉시 파기합니다. 로컬 스토리지에 저장되는 데이터는 브라우저에서 직접 삭제하실 수 있습니다.</p>

          <h3>4. 제3자 제공</h3>
          <p>수집된 개인정보는 법령에 의한 경우를 제외하고 제3자에게 제공하지 않습니다.</p>

          <h3>5. 정보주체의 권리</h3>
          <p>학생 및 보호자는 언제든지 개인정보 열람, 정정, 삭제를 요청할 수 있으며, 담당 교사에게 문의하시기 바랍니다.</p>

          <h3>6. 문의</h3>
          <p>개인정보 관련 문의는 담당 교사에게 직접 문의하시기 바랍니다.</p>
        </div>
      </div>
    </div>
  );
}

function TermsModal({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <h2 className={styles.modalTitle}>사용약관</h2>
        <div className={styles.modalContent}>
          <p className={styles.updated}>최종 수정일: 2026년 6월 29일</p>

          <h3>제1조 (목적)</h3>
          <p>본 약관은 모두의 학급 서비스(이하 "서비스")의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>

          <h3>제2조 (서비스 내용)</h3>
          <ul>
            <li>학급 공지 및 전달사항 표시</li>
            <li>D-day 카운트다운</li>
            <li>칭찬 도장 현황 표시</li>
            <li>학급 사진 슬라이드</li>
            <li>오늘의 교육 자료 제공</li>
          </ul>

          <h3>제3조 (금지 행위)</h3>
          <ul>
            <li>서비스를 학급 운영 외 목적으로 사용하는 행위</li>
            <li>타인의 개인정보를 무단 입력하거나 열람하는 행위</li>
            <li>시스템을 고의로 오작동시키거나 훼손하는 행위</li>
          </ul>

          <h3>제4조 (책임의 한계)</h3>
          <p>서비스는 학급 내 교육 보조 도구로 제공됩니다. 서비스 오류 또는 데이터 손실로 인한 피해에 대해 제작자는 책임을 지지 않습니다.</p>

          <h3>제5조 (약관 변경)</h3>
          <p>약관이 변경될 경우 서비스 내 공지를 통해 안내합니다. 변경된 약관은 공지 후 7일이 지난 시점부터 효력이 발생합니다.</p>

          <h3>제6조 (문의)</h3>
          <p>서비스 관련 문의는 담당 교사에게 직접 문의하시기 바랍니다.</p>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms,   setShowTerms]   = useState(false);

  return (
    <>
      <footer className={styles.footer}>
        <span className={styles.credit}>© 모두의 학급</span>
        <span className={styles.sep}>·</span>
        <button className={styles.link} onClick={() => setShowPrivacy(true)}>개인정보처리방침</button>
        <span className={styles.sep}>·</span>
        <button className={styles.link} onClick={() => setShowTerms(true)}>사용약관</button>
      </footer>

      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showTerms   && <TermsModal   onClose={() => setShowTerms(false)}   />}
    </>
  );
}
