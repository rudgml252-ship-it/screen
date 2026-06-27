import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MockDbContext = createContext(null);
const gid = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

const defaultData = {
  classInfo: { name: '3학년 2반', school: '행복초등학교', teacherName: '김선생님', year: 2026, semester: 1, teacherPassword: '' },

  announcements: [
    { id: 'ann_1', type: 'URGENT', title: '🚨 체육 수업 우천으로 실내 변경', body: '강당 2층 집합! 실내화 꼭 지참하세요.', priority: 1, createdAt: Date.now() - 3600000, updatedAt: Date.now() - 3600000, expiresAt: Date.now() + 86400000, pinned: true },
    { id: 'ann_2', type: 'SUBMIT', title: '📝 독서록 제출', body: '이번 주 금요일까지 담임 선생님께 제출해주세요.', priority: 2, createdAt: Date.now() - 86400000, updatedAt: Date.now() - 86400000, expiresAt: null, pinned: false },
    { id: 'ann_3', type: 'GENERAL', title: '📢 현장학습 동의서 제출', body: '아직 안 낸 친구들 내일까지 꼭 제출해요!', priority: 3, createdAt: Date.now() - 7200000, updatedAt: Date.now() - 7200000, expiresAt: null, pinned: false },
  ],

  ddays: [
    { id: 'dday_1', title: '🎓 기말고사', targetDate: '2026-06-24', color: '#FF6B6B', pinned: true },
    { id: 'dday_2', title: '🏕️ 수학여행', targetDate: '2026-07-10', color: '#4ECDC4', pinned: false },
    { id: 'dday_3', title: '☀️ 여름방학', targetDate: '2026-07-25', color: '#FFC97E', pinned: false },
  ],

  timetable: {
    MON: ['국어', '수학', '사회', '과학', '체육', '음악'],
    TUE: ['수학', '영어', '국어', '미술', '도덕', '체육'],
    WED: ['과학', '국어', '수학', '영어', '음악', '창체'],
    THU: ['사회', '수학', '국어', '체육', '영어', '미술'],
    FRI: ['국어', '사회', '수학', '과학', '영어', '창체'],
  },

  quotes: [
    { id: 'q01', text: '오늘 할 수 있는 일을 내일로 미루지 말라.', author: '벤자민 프랭클린', category: '도전' },
    { id: 'q02', text: '꿈을 계속 간직하고 있으면 반드시 실현할 때가 온다.', author: '괴테', category: '꿈' },
    { id: 'q03', text: '노력하는 자에게 기회가 온다.', author: '루이 파스퇴르', category: '성실' },
    { id: 'q04', text: '천 리 길도 한 걸음부터.', author: '한국 속담', category: '도전' },
    { id: 'q05', text: '친절함은 아무 비용도 들지 않는 최고의 선물이다.', author: '마크 트웨인', category: '배려' },
    { id: 'q06', text: '실패는 성공의 어머니이다.', author: '에디슨', category: '도전' },
    { id: 'q07', text: '배움에는 왕도가 없다.', author: '유클리드', category: '성실' },
    { id: 'q08', text: '가장 큰 영광은 넘어지지 않는 데 있는 것이 아니라 넘어질 때마다 일어나는 데 있다.', author: '올리버 골드스미스', category: '도전' },
    { id: 'q09', text: '천재는 1%의 영감과 99%의 노력으로 이루어진다.', author: '토마스 에디슨', category: '성실' },
    { id: 'q10', text: '시작이 반이다.', author: '아리스토텔레스', category: '도전' },
    { id: 'q11', text: '자신을 믿어라. 그러면 어떻게 살아야 할지 알게 될 것이다.', author: '괴테', category: '자신감' },
    { id: 'q12', text: '성공이란 열정을 잃지 않고 실패를 거듭하는 능력이다.', author: '윈스턴 처칠', category: '도전' },
    { id: 'q13', text: '불가능이란 말은 바보들의 사전에 있는 말이다.', author: '나폴레옹', category: '도전' },
    { id: 'q14', text: '지금 흘리는 땀이 나중의 눈물을 막아준다.', author: '한국 속담', category: '성실' },
    { id: 'q15', text: '행복은 준비된 마음을 가진 자에게 찾아온다.', author: '루이 파스퇴르', category: '행복' },
    { id: 'q16', text: '친구를 사귀는 유일한 방법은 친구가 되어 주는 것이다.', author: '랄프 왈도 에머슨', category: '배려' },
    { id: 'q17', text: '독서는 완전한 인간을 만들고, 토론은 준비된 인간을 만들며, 쓰기는 정확한 인간을 만든다.', author: '프랜시스 베이컨', category: '성실' },
    { id: 'q18', text: '따뜻한 말 한마디가 세 번의 겨울을 따뜻하게 한다.', author: '중국 속담', category: '배려' },
    { id: 'q19', text: '작은 일에도 정성을 다하는 사람이 큰일도 잘한다.', author: '한국 속담', category: '성실' },
    { id: 'q20', text: '칭찬은 고래도 춤추게 한다.', author: '켄 블랜차드', category: '배려' },
    { id: 'q21', text: '어제의 나보다 오늘의 내가 더 나은 사람이 되자.', author: '익명', category: '성장' },
    { id: 'q22', text: '실수하는 것을 두려워하지 마라. 아무것도 하지 않는 것이 가장 큰 실수다.', author: '탈레스', category: '도전' },
    { id: 'q23', text: '함께 가면 더 멀리 갈 수 있다.', author: '아프리카 속담', category: '협동' },
    { id: 'q24', text: '오늘 걷지 않으면 내일은 뛰어야 한다.', author: '한국 속담', category: '성실' },
    { id: 'q25', text: '지식은 나눌수록 커진다.', author: '프랜시스 베이컨', category: '성장' },
    { id: 'q26', text: '최고가 되기보다 최선을 다하는 사람이 되어라.', author: '익명', category: '성실' },
    { id: 'q27', text: '모든 어린이는 예술가다. 문제는 어떻게 어른이 되어서도 예술가로 남느냐이다.', author: '파블로 피카소', category: '꿈' },
    { id: 'q28', text: '남에게 대접 받고자 하는 대로 남을 대접하라.', author: '황금률', category: '배려' },
    { id: 'q29', text: '하루하루를 마지막 날인 것처럼 살아라. 언젠가 가장 옳은 날이 될 것이다.', author: '스티브 잡스', category: '도전' },
    { id: 'q30', text: '세상에서 가장 힘든 일은 자기 자신을 아는 것이다.', author: '탈레스', category: '성장' },
    { id: 'q31', text: '네가 할 수 있다고 믿든 할 수 없다고 믿든, 믿는 대로 된다.', author: '헨리 포드', category: '자신감' },
    { id: 'q32', text: '어둠을 탓하기보다 작은 촛불 하나를 켜라.', author: '공자', category: '도전' },
    { id: 'q33', text: '배움이란 죽을 때까지 계속되는 것이다.', author: '로버트 리', category: '성실' },
    { id: 'q34', text: '작은 배려 하나가 세상을 아름답게 만든다.', author: '익명', category: '배려' },
    { id: 'q35', text: '웃음은 마음의 햇빛이다. 웃음 없이는 인생이 어두워진다.', author: '찰리 채플린', category: '행복' },
    { id: 'q36', text: '세 사람이 길을 가면 반드시 나의 스승이 있다.', author: '공자', category: '성장' },
    { id: 'q37', text: '자기 자신에게 정직하면 다른 누구에게도 거짓말할 수 없다.', author: '링컨', category: '성품' },
    { id: 'q38', text: '소중한 것은 눈에 보이지 않아. 마음으로 봐야 잘 보여.', author: '생텍쥐페리', category: '배려' },
    { id: 'q39', text: '뛰어난 스승은 가르치지 않고 영감을 준다.', author: '익명', category: '성장' },
    { id: 'q40', text: '작은 목표를 이루는 것이 큰 성공의 시작이다.', author: '익명', category: '도전' },
    { id: 'q41', text: '오늘 하루도 최선을 다하자. 그것으로 충분하다.', author: '익명', category: '성실' },
    { id: 'q42', text: '꿈꾸는 것을 멈추지 마라. 꿈은 생각을 현실로 만드는 힘이다.', author: '익명', category: '꿈' },
    { id: 'q43', text: '배려와 존중이 있는 곳에 행복이 있다.', author: '익명', category: '배려' },
    { id: 'q44', text: '고통이 없으면 얻는 것도 없다.', author: '벤자민 프랭클린', category: '성실' },
    { id: 'q45', text: '비가 온 뒤에 땅이 굳는다.', author: '한국 속담', category: '도전' },
  ],

  educationCards: [
    {
      id: 'edu_1',
      category: 'SCHOOL_VIOLENCE',
      title: '학교폭력 예방',
      mainEmoji: '🤝',
      headerBg: '#C44569',
      keyMessage: '서로 존중하고 배려하는 안전한 우리 반!',
      sections: [
        {
          icon: '⚠️', title: '이런 행동이 폭력이에요', bg: '#FFE8F0',
          items: ['신체: 때리기·밀기·물건 빼앗기', '언어: 욕설·협박·별명 강요', '따돌림: 무시·대화 거부하기', '사이버: 악성 댓글·사진 유포'],
        },
        {
          icon: '🏫', title: '교실에서 이렇게 실천해요', bg: '#E8F5E9',
          items: ['짝꿍에게 먼저 "안녕?" 인사하기', '모둠 활동 시 모든 친구 의견 존중', '혼자 있는 친구에게 먼저 말 걸기', '나쁜 말 대신 "같이 하자!" 말하기'],
        },
        {
          icon: '🙋', title: '도움받는 방법', bg: '#E3F2FD',
          items: ['담임 선생님께 즉시 말하기', '학교 상담 선생님 찾아가기', '부모님께 솔직하게 이야기하기'],
        },
      ],
      highlightText: '💡 나의 용기 있는 한마디가 친구의 소중한 하루를 지켜줍니다!',
      stats: [],
    },
    {
      id: 'edu_2',
      category: 'LANGUAGE_ETIQUETTE',
      title: '바른 말 고운 말',
      mainEmoji: '💬',
      headerBg: '#27AE60',
      keyMessage: '말 한마디가 꽃이 될 수도, 가시가 될 수도 있어요!',
      sections: [
        {
          icon: '❌', title: '쓰면 안 돼요', bg: '#FFE8F0',
          items: ['욕설·비속어·줄임말 남발', '"야!", "너" 같은 낮춤말', '친구 놀리기·별명 억지로 부르기', '뒤에서 흉보기·험담 퍼뜨리기'],
        },
        {
          icon: '🌸', title: '교실에서 써요', bg: '#E8F5E9',
          items: ['이름 부르기 (○○아, ○○야)', '"고마워" "미안해" 먼저 말하기', '"잘했어!" "대단하다!" 진심으로 칭찬', '"괜찮아?" "도와줄까?" 따뜻하게'],
        },
        {
          icon: '🏆', title: '말하기 황금 규칙', bg: '#FFF9E3',
          items: ['말하기 전 3초 생각하기', '상대방 기분을 먼저 생각하기', '갈등은 폭력 대신 대화로 해결'],
        },
      ],
      highlightText: '💡 "고마워", "미안해" 이 두 마디가 우리 반을 행복하게 만들어요!',
      stats: [{ emoji: '⏱️', value: '3초', label: '말하기 전 생각 시간' }],
    },
    {
      id: 'edu_3',
      category: 'SAFETY',
      title: '안전사고 예방',
      mainEmoji: '🦺',
      headerBg: '#E67E22',
      keyMessage: '안전한 학교생활은 우리 모두의 약속!',
      sections: [
        {
          icon: '🏫', title: '교실 안전 수칙', bg: '#FFF3E0',
          items: ['의자를 앞으로 당겨 바르게 앉기', '가위·칼 등 뾰족한 물건 조심히 사용', '바닥에 물건 두지 않기 (걸려 넘어짐 주의)', '수업 중 뛰거나 장난치지 않기'],
        },
        {
          icon: '🚶', title: '복도·계단 안전', bg: '#E8F5E9',
          items: ['복도는 천천히 오른쪽으로 걷기', '계단 이동 시 난간 꼭 잡기', '문은 천천히 열고 닫기', '친구 밀거나 장난치지 않기'],
        },
        {
          icon: '⛑️', title: '다쳤을 때 대처법', bg: '#E3F2FD',
          items: ['당황하지 말고 선생님께 알리기', '다친 부위 함부로 움직이지 않기', '친구 다쳤을 때 혼자 부축 금지', '보건실 위치 미리 기억해두기'],
        },
      ],
      highlightText: '🚨 사고는 예방이 최선! 안전수칙을 항상 생각하고 실천해요.',
      stats: [{ emoji: '📈', value: '70%', label: '부주의로 발생하는 사고' }],
    },
    {
      id: 'edu_4',
      category: 'CYBER',
      title: '사이버 예절',
      mainEmoji: '🖥️',
      headerBg: '#6C3483',
      keyMessage: '온라인에서도 우리는 같은 사람이에요!',
      sections: [
        {
          icon: '🚫', title: '하면 안 돼요', bg: '#FCE4EC',
          items: ['악성 댓글·욕설 남기기', '허락 없이 친구 사진·정보 공유', '단체 채팅방 따돌리기', '허위 소문·거짓 정보 퍼뜨리기'],
        },
        {
          icon: '🏫', title: '교실 기기 사용 규칙', bg: '#EDE7F6',
          items: ['수업 중 학습 목적으로만 사용하기', '친구 허락 없이 사진 찍지 않기', '비밀번호·계정 친구에게 알리지 않기', '모르는 링크·파일 절대 클릭 금지'],
        },
        {
          icon: '✅', title: '올바른 온라인 습관', bg: '#E8F5E9',
          items: ['보내기 전 한 번 더 읽어보기', '불쾌한 내용은 선생님께 바로 알리기', '온라인도 현실처럼 예의 바르게'],
        },
      ],
      highlightText: '💡 온라인상의 말과 행동도 현실과 똑같은 책임이 따릅니다.',
      stats: [],
    },
    {
      id: 'edu_5',
      category: 'ENVIRONMENT',
      title: '환경 보호',
      mainEmoji: '🌍',
      headerBg: '#1E8449',
      keyMessage: '지금 우리의 작은 실천이 지구의 미래를 바꿉니다!',
      sections: [
        {
          icon: '🏫', title: '교실에서 실천해요', bg: '#E8F5E9',
          items: ['안 쓰는 조명·TV 끄기', '이면지 활용하고 프린트 줄이기', '수돗물 틀어놓지 않기', '급식 남기지 않기 (음식물 쓰레기 줄이기)'],
        },
        {
          icon: '♻️', title: '분리배출 방법', bg: '#E3F2FD',
          items: ['종이: 물에 젖지 않게 따로 모으기', '플라스틱: 내용물 비우고 찌그러뜨리기', '캔·유리: 지정 수거함에 넣기', '일반 쓰레기와 섞지 않기'],
        },
        {
          icon: '🌱', title: '작은 습관 큰 변화', bg: '#F1F8E9',
          items: ['텀블러·에코백 챙겨 다니기', '가까운 곳은 걷거나 자전거 타기', '화단 식물 물 주고 돌보기', '절약한 것 가족·친구에게 알리기'],
        },
      ],
      highlightText: '🌏 지구는 우리가 미래 세대에게 빌린 것입니다. 함께 지켜요!',
      stats: [
        { emoji: '🌡️', value: '1.5°C', label: '온도 상승 제한 목표' },
        { emoji: '🔋', value: '30%', label: '절약으로 줄이는 탄소' },
      ],
    },
  ],

  routine: {
    morningStart: '08:30', morningEnd: '08:50',
    closingStart: '15:00', closingEnd: '15:20',
    cardInterval: 15, currentCardIndex: 0, pausedAt: null,
  },

  photos: [
    { id: 'ph1', url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=1920&q=80', visible: true, caption: '우리 반 소풍' },
    { id: 'ph2', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&q=80', visible: true, caption: '공부하는 중' },
    { id: 'ph3', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1920&q=80', visible: true, caption: '운동회' },
  ],

  students: [
    { id: 's01', name: '김수하', number: 1, stamps: { total: 7, weekly: 4, history: {} }, presentedCount: 2 },
    { id: 's02', name: '김은섭', number: 2, stamps: { total: 12, weekly: 5, history: {} }, presentedCount: 1 },
    { id: 's03', name: '김희원', number: 3, stamps: { total: 3, weekly: 2, history: {} }, presentedCount: 3 },
    { id: 's04', name: '박지은', number: 4, stamps: { total: 18, weekly: 5, history: {} }, presentedCount: 0 },
    { id: 's05', name: '박지후', number: 5, stamps: { total: 9, weekly: 1, history: {} }, presentedCount: 2 },
    { id: 's06', name: '배지윤', number: 6, stamps: { total: 5, weekly: 3, history: {} }, presentedCount: 1 },
    { id: 's07', name: '손아연', number: 7, stamps: { total: 14, weekly: 6, history: {} }, presentedCount: 4 },
    { id: 's08', name: '송진항', number: 8, stamps: { total: 2, weekly: 0, history: {} }, presentedCount: 0 },
    { id: 's09', name: '심주하', number: 9, stamps: { total: 20, weekly: 7, history: {} }, presentedCount: 1 },
    { id: 's10', name: '양훤', number: 10, stamps: { total: 11, weekly: 4, history: {} }, presentedCount: 2 },
    { id: 's11', name: '이세빈', number: 11, stamps: { total: 6, weekly: 2, history: {} }, presentedCount: 1 },
    { id: 's12', name: '이수현', number: 12, stamps: { total: 15, weekly: 3, history: {} }, presentedCount: 3 },
    { id: 's13', name: '이승우', number: 13, stamps: { total: 8, weekly: 4, history: {} }, presentedCount: 2 },
    { id: 's14', name: '이시윤', number: 14, stamps: { total: 22, weekly: 8, history: {} }, presentedCount: 1 },
    { id: 's15', name: '전승주', number: 15, stamps: { total: 4, weekly: 1, history: {} }, presentedCount: 0 },
    { id: 's16', name: '전준호', number: 16, stamps: { total: 11, weekly: 4, history: {} }, presentedCount: 2 },
    { id: 's17', name: '정우영', number: 17, stamps: { total: 6, weekly: 2, history: {} }, presentedCount: 1 },
    { id: 's18', name: '조선율', number: 18, stamps: { total: 15, weekly: 3, history: {} }, presentedCount: 3 },
    { id: 's19', name: '최동건', number: 19, stamps: { total: 8, weekly: 4, history: {} }, presentedCount: 2 },
    { id: 's20', name: '최재유', number: 20, stamps: { total: 22, weekly: 8, history: {} }, presentedCount: 1 },
    { id: 's21', name: '한서현', number: 21, stamps: { total: 4, weekly: 1, history: {} }, presentedCount: 0 },
    { id: 's22', name: '홍은택', number: 22, stamps: { total: 8, weekly: 4, history: {} }, presentedCount: 2 },
    { id: 's23', name: '박수아', number: 23, stamps: { total: 22, weekly: 8, history: {} }, presentedCount: 1 },
  ],

  pickerSession: {
    mode: 'NO_REPEAT', pool: ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10', 's11', 's12', 's13', 's14', 's15'],
    excluded: [], lastPickedId: null, history: [],
  },

  xp: { total: 2840, level: 7, nextLevelAt: 3000, log: {} },

  quests: [
    { id: 'quest_1', title: '친구에게 칭찬 한마디 하기', xpReward: 5, completed: false, emoji: '💬' },
    { id: 'quest_2', title: '쉬는 시간 책 1쪽 읽기', xpReward: 5, completed: false, emoji: '📚' },
    { id: 'quest_3', title: '복도에서 조용히 걷기', xpReward: 3, completed: true, emoji: '🚶' },
  ],

  cleaningRota: {
    groups: [
      { id: 'g1', name: '1모둠', members: ['s01', 's02', 's03'], duty: '교실 바닥 쓸기' },
      { id: 'g2', name: '2모둠', members: ['s04', 's05', 's06'], duty: '칠판 지우기 & 분필 정리' },
      { id: 'g3', name: '3모둠', members: ['s07', 's08', 's09'], duty: '쓰레기통 비우기' },
      { id: 'g4', name: '4모둠', members: ['s10', 's11', 's12'], duty: '창문 & 환기' },
      { id: 'g5', name: '5모둠', members: ['s13', 's14', 's15'], duty: '복도 청소' },
    ],
    lastRotated: null,
  },

  election: null,

  timer: { running: false, remaining: 25 * 60, mode: 'FOCUS', label: '집중 시간' },
};

export const MockDbProvider = ({ children }) => {
  const [db, setDb] = useState(() => {
    try {
      const saved = localStorage.getItem('classboard_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 교육카드 구버전 마이그레이션
        if (parsed.educationCards && parsed.educationCards[0] && !parsed.educationCards[0].sections) {
          parsed.educationCards = defaultData.educationCards;
        }
        // 교육카드 내용 업데이트 마이그레이션 (전화번호 제거 + 교실실천 추가)
        const needsUpdate = parsed.educationCards?.some(c =>
          c.stats?.some(s => s.value === '117' || s.value === '119') ||
          c.sections?.some(sec => sec.items?.some(i => i.includes('117') || i.includes('117chat')))
        ) || parsed.educationCards?.[0]?.sections?.[1]?.icon !== '🏫';
        if (needsUpdate) {
          parsed.educationCards = defaultData.educationCards;
        }
        // 학생 ID 중복 수정 마이그레이션
        if (parsed.students) {
          const seenIds = new Set();
          parsed.students = parsed.students.map(s => {
            if (seenIds.has(s.id)) {
              const newId = gid('s');
              // pickerSession pool/history/excluded 도 함께 교체
              if (parsed.pickerSession) {
                const fix = (arr) => arr.map(id => id === s.id ? newId : id);
                parsed.pickerSession.pool     = fix(parsed.pickerSession.pool || []);
                parsed.pickerSession.excluded = fix(parsed.pickerSession.excluded || []);
                parsed.pickerSession.history  = fix(parsed.pickerSession.history || []);
                if (parsed.pickerSession.lastPickedId === s.id) parsed.pickerSession.lastPickedId = newId;
              }
              return { ...s, id: newId };
            }
            seenIds.add(s.id);
            return s;
          });
        }
        // 명언 8개 이하면 최신 버전으로 교체
        if (!parsed.quotes || parsed.quotes.length < 20) {
          parsed.quotes = defaultData.quotes;
        }
        return parsed;
      }
    } catch (e) { }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem('classboard_v2', JSON.stringify(db));
    const onStorage = (e) => {
      if (e.key === 'classboard_v2' && e.newValue) {
        try { setDb(JSON.parse(e.newValue)); } catch (e) { }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [db]);

  const addAnnouncement = useCallback((ann) => setDb(prev => ({
    ...prev, announcements: [{ ...ann, id: gid('ann'), createdAt: Date.now(), updatedAt: Date.now() }, ...prev.announcements]
  })), []);

  const deleteAnnouncement = useCallback((id) => setDb(prev => ({
    ...prev, announcements: prev.announcements.filter(a => a.id !== id)
  })), []);

  const addStamp = useCallback((studentId, delta, reason = '교사 부여') => {
    setDb(prev => ({
      ...prev,
      students: prev.students.map(s => s.id !== studentId ? s : {
        ...s,
        stamps: {
          ...s.stamps,
          total: Math.max(0, s.stamps.total + delta),
          weekly: Math.max(0, s.stamps.weekly + delta),
          history: { ...s.stamps.history, [gid('st')]: { reason, delta, at: Date.now() } }
        }
      }),
      xp: delta > 0 ? { ...prev.xp, total: prev.xp.total + 10 } : prev.xp,
    }));
  }, []);

  const addStudent = useCallback((name) => {
    if (!name.trim()) return;
    setDb(prev => {
      const maxNum = prev.students.length > 0 ? Math.max(...prev.students.map(s => s.number)) : 0;
      const newId = gid('s');
      return {
        ...prev,
        students: [...prev.students, {
          id: newId, name: name.trim(), number: maxNum + 1,
          stamps: { total: 0, weekly: 0, history: {} }, presentedCount: 0,
        }],
        pickerSession: { ...prev.pickerSession, pool: [...prev.pickerSession.pool, newId] },
      };
    });
  }, []);

  const deleteStudent = useCallback((id) => {
    setDb(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id),
      pickerSession: {
        ...prev.pickerSession,
        pool: prev.pickerSession.pool.filter(pid => pid !== id),
        excluded: prev.pickerSession.excluded.filter(pid => pid !== id),
        history: prev.pickerSession.history.filter(pid => pid !== id),
        lastPickedId: prev.pickerSession.lastPickedId === id ? null : prev.pickerSession.lastPickedId,
      },
      cleaningRota: {
        ...prev.cleaningRota,
        groups: prev.cleaningRota.groups.map(g => ({ ...g, members: g.members.filter(mid => mid !== id) })),
      },
    }));
  }, []);

  const renameStudent = useCallback((id, newName) => {
    if (!newName.trim()) return;
    setDb(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === id ? { ...s, name: newName.trim() } : s),
    }));
  }, []);

  const addDday = useCallback((dday) => setDb(prev => ({
    ...prev, ddays: [...prev.ddays, { ...dday, id: gid('dd') }]
  })), []);

  const deleteDday = useCallback((id) => setDb(prev => ({
    ...prev, ddays: prev.ddays.filter(d => d.id !== id)
  })), []);

  const addClassPhoto = useCallback((dataUrl, caption) => {
    setDb(prev => ({
      ...prev,
      photos: [...prev.photos, { id: gid('ph'), url: dataUrl, visible: true, caption: caption || '학급 사진' }],
    }));
  }, []);

  const deleteClassPhoto = useCallback((id) => {
    setDb(prev => ({ ...prev, photos: prev.photos.filter(p => p.id !== id) }));
  }, []);

  const togglePhotoVisibility = useCallback((id) => {
    setDb(prev => ({
      ...prev,
      photos: prev.photos.map(p => p.id === id ? { ...p, visible: !p.visible } : p),
    }));
  }, []);

  const updatePhotoCaption = useCallback((id, caption) => {
    setDb(prev => ({
      ...prev,
      photos: prev.photos.map(p => p.id === id ? { ...p, caption } : p),
    }));
  }, []);

  const pickStudent = useCallback((mode = 'NO_REPEAT') => {
    let picked = null;
    setDb(prev => {
      const session = prev.pickerSession;
      let pool = mode === 'NO_REPEAT'
        ? session.pool.filter(id => !session.history.includes(id) && !session.excluded.includes(id))
        : prev.students.map(s => s.id).filter(id => !session.excluded.includes(id));
      if (pool.length === 0 && mode === 'NO_REPEAT') pool = prev.students.map(s => s.id).filter(id => !session.excluded.includes(id));
      if (pool.length === 0) return prev;
      const idx = Math.floor(Math.random() * pool.length);
      picked = pool[idx];
      return {
        ...prev,
        pickerSession: { ...session, lastPickedId: picked, history: [...session.history, picked], mode },
        students: prev.students.map(s => s.id === picked ? { ...s, presentedCount: s.presentedCount + 1 } : s),
      };
    });
    return picked;
  }, []);

  const resetPicker = useCallback(() => setDb(prev => ({
    ...prev, pickerSession: { ...prev.pickerSession, history: [], lastPickedId: null }
  })), []);

  const toggleExcluded = useCallback((studentId) => setDb(prev => {
    const ex = prev.pickerSession.excluded;
    return { ...prev, pickerSession: { ...prev.pickerSession, excluded: ex.includes(studentId) ? ex.filter(id => id !== studentId) : [...ex, studentId] } };
  }), []);

  const completeQuest = useCallback((questId) => setDb(prev => ({
    ...prev,
    quests: prev.quests.map(q => q.id === questId ? { ...q, completed: true } : q),
    xp: { ...prev.xp, total: prev.xp.total + (prev.quests.find(q => q.id === questId)?.xpReward || 0) },
  })), []);

  const rotateCleaningRota = useCallback(() => setDb(prev => {
    const groups = [...prev.cleaningRota.groups];
    const lastDuty = groups[groups.length - 1].duty;
    const rotated = groups.map((g, i) => ({ ...g, duty: i === 0 ? lastDuty : groups[i - 1].duty }));
    return { ...prev, cleaningRota: { groups: rotated, lastRotated: Date.now() } };
  }), []);

  const startElection = useCallback((election) => setDb(prev => ({
    ...prev, election: { ...election, id: gid('el'), stage: 'VOTING', candidates: {}, voters: {} }
  })), []);

  const addCandidate = useCallback((elId, candidate) => setDb(prev => {
    if (!prev.election || prev.election.id !== elId) return prev;
    const candId = gid('cand');
    return { ...prev, election: { ...prev.election, candidates: { ...prev.election.candidates, [candId]: { ...candidate, id: candId, voteCount: 0 } } } };
  }), []);

  const castVote = useCallback((elId, candidateId, studentId) => setDb(prev => {
    if (!prev.election || prev.election.id !== elId) return prev;
    if (prev.election.voters[studentId]) return prev;
    const updatedCandidates = { ...prev.election.candidates };
    if (updatedCandidates[candidateId]) updatedCandidates[candidateId] = { ...updatedCandidates[candidateId], voteCount: updatedCandidates[candidateId].voteCount + 1 };
    return { ...prev, election: { ...prev.election, candidates: updatedCandidates, voters: { ...prev.election.voters, [studentId]: true } } };
  }), []);

  const resetElection = useCallback(() => setDb(prev => ({ ...prev, election: null })), []);

  const updateClassInfo = useCallback((info) => setDb(prev => ({
    ...prev, classInfo: { ...prev.classInfo, ...info }
  })), []);

  const resetDb = useCallback(() => { localStorage.removeItem('classboard_v2'); setDb(defaultData); }, []);

  return (
    <MockDbContext.Provider value={{
      db, setDb,
      addAnnouncement, deleteAnnouncement,
      addStamp,
      addStudent, deleteStudent, renameStudent,
      addDday, deleteDday,
      addClassPhoto, deleteClassPhoto, togglePhotoVisibility, updatePhotoCaption,
      pickStudent, resetPicker, toggleExcluded,
      completeQuest,
      rotateCleaningRota,
      startElection, addCandidate, castVote, resetElection,
      updateClassInfo,
      resetDb,
    }}>
      {children}
    </MockDbContext.Provider>
  );
};

export const useMockDb = () => {
  const ctx = useContext(MockDbContext);
  if (!ctx) throw new Error('useMockDb must be used within MockDbProvider');
  return ctx;
};
