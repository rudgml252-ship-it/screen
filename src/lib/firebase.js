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
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_AUTH_DOMAIN',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId:             'YOUR_APP_ID',
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
