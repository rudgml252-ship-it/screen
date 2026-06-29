import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ──────────────────────────────────────────────────────────────────
// 🔥 Firebase 설정
//
// 1. https://console.firebase.google.com/ 접속
// 2. 새 프로젝트 만들기 → 프로젝트 이름 입력
// 3. 왼쪽 메뉴 '빌드' → Firestore Database → 데이터베이스 만들기
//    (테스트 모드로 시작 → 나중에 보안 규칙 설정)
// 4. 프로젝트 설정(톱니바퀴) → 일반 탭 → 내 앱 → 웹 앱 추가(</>)
// 5. Firebase SDK 구성 → "구성" 선택 → 아래 값들을 복사해서 붙여넣기
// ──────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            'AIzaSyAUnKRFdPxgBj_M1K-P9AVHI1Ks9-sMpmI',
  authDomain:        'screen-9a943.firebaseapp.com',
  projectId:         'screen-9a943',
  storageBucket:     'screen-9a943.firebasestorage.app',
  messagingSenderId: '213149901125',
  appId:             '1:213149901125:web:ed966c0a99f64927f09e2c',
};

const isConfigured = !firebaseConfig.apiKey.startsWith('YOUR_');

let firestoreDb = null;

if (isConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    firestoreDb = getFirestore(app);
  } catch (e) {
    console.warn('[Firebase] 초기화 실패:', e.message);
  }
}

export { firestoreDb };
export const FIREBASE_ENABLED = isConfigured;
