import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MockDbContext = createContext(null);

const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const defaultData = {
  announcements: [
    {
      id: 'ann_1',
      type: 'URGENT',
      title: '체육 수업 우천 시 실내',
      body: '강당 2층 집합, 실내화 지참',
      priority: 1,
      authorId: 'teacher_01',
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 3600000,
      expiresAt: Date.now() + 86400000,
      pinned: true,
      readBy: {}
    },
    {
      id: 'ann_2',
      type: 'GENERAL',
      title: '내일 현장학습 동의서 제출',
      body: '아직 안 낸 사람 내일까지 꼭 제출하세요.',
      priority: 3,
      authorId: 'teacher_01',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
      expiresAt: null,
      pinned: false,
      readBy: {}
    },
    {
      id: 'ann_3',
      type: 'SUBMIT',
      title: '독서록 제출',
      body: '이번 주 금요일까지 제출해주세요.',
      priority: 2,
      authorId: 'teacher_01',
      createdAt: Date.now() - 7200000,
      updatedAt: Date.now() - 7200000,
      expiresAt: null,
      pinned: false,
      readBy: {}
    }
  ],
  routine: {
    morningStart: '08:30',
    morningEnd: '08:50',
    closingStart: '15:00',
    closingEnd: '15:20',
    enabledCategories: ['SCHOOL_VIOLENCE', 'SAFETY', 'CUSTOM'],
    currentCardId: 'edu_bully_01',
    pausedAt: null
  },
  quotes: [
    { id: 'q1', text: '오늘 할 수 있는 일을 내일로 미루지 말라.', author: '벤자민 프랭클린' },
    { id: 'q2', text: '꿈을 계속 간직하고 있으면 반드시 실현할 때가 온다.', author: '괴테' },
    { id: 'q3', text: '노력하는 자에게 기회가 온다.', author: '루이 파스퇴르' },
    { id: 'q4', text: '천 리 길도 한 걸음부터.', author: '한국 속담' },
    { id: 'q5', text: '친절함은 아무 비용도 들지 않는 최고의 선물이다.', author: '마크 트웨인' },
  ],
  students: [
    { id: 's01', name: '김민수', number: 1, stamps: { total: 7, weekly: 4, monthly: 7, history: {} } },
    { id: 's02', name: '이영희', number: 2, stamps: { total: 12, weekly: 5, monthly: 12, history: {} } },
    { id: 's03', name: '박지훈', number: 3, stamps: { total: 3, weekly: 2, monthly: 3, history: {} } },
    { id: 's04', name: '최윤진', number: 4, stamps: { total: 18, weekly: 5, monthly: 18, history: {} } },
    { id: 's05', name: '정동현', number: 5, stamps: { total: 9, weekly: 1, monthly: 9, history: {} } },
    { id: 's06', name: '강하은', number: 6, stamps: { total: 5, weekly: 3, monthly: 5, history: {} } },
    { id: 's07', name: '오승민', number: 7, stamps: { total: 14, weekly: 6, monthly: 14, history: {} } },
    { id: 's08', name: '윤서아', number: 8, stamps: { total: 2, weekly: 0, monthly: 2, history: {} } },
    { id: 's09', name: '임준혁', number: 9, stamps: { total: 20, weekly: 7, monthly: 20, history: {} } },
    { id: 's10', name: '한소희', number: 10, stamps: { total: 11, weekly: 4, monthly: 11, history: {} } },
  ],
  xp: {
    total: 2840,
    level: 7,
    nextLevelAt: 3000,
    log: {}
  },
  pickerSession: {
    sessionId: 'sess_default',
    mode: 'NO_REPEAT',
    pool: ['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10'],
    excluded: [],
    lastPickedId: null,
    history: []
  },
  quests: [
    { id: 'q1', title: '친구에게 칭찬 한마디 하기', xpReward: 5 },
    { id: 'q2', title: '쉬는 시간 책 1쪽 읽기', xpReward: 5 },
    { id: 'q3', title: '복도에서 조용히 걷기', xpReward: 3 },
  ]
};

export const MockDbProvider = ({ children }) => {
  const [db, setDb] = useState(() => {
    try {
      const saved = localStorage.getItem('classboard_db');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem('classboard_db', JSON.stringify(db));
    const handleStorageChange = (e) => {
      if (e.key === 'classboard_db' && e.newValue) {
        try { setDb(JSON.parse(e.newValue)); } catch(e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [db]);

  const addAnnouncement = useCallback((announcement) => {
    setDb(prev => {
      const newAnn = {
        ...announcement,
        id: generateId('ann'),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        readBy: {}
      };
      return { ...prev, announcements: [newAnn, ...prev.announcements] };
    });
  }, []);

  const updateAnnouncement = useCallback((id, updates) => {
    setDb(prev => ({
      ...prev,
      announcements: prev.announcements.map(a =>
        a.id === id ? { ...a, ...updates, updatedAt: Date.now() } : a
      )
    }));
  }, []);

  const deleteAnnouncement = useCallback((id) => {
    setDb(prev => ({
      ...prev,
      announcements: prev.announcements.filter(a => a.id !== id)
    }));
  }, []);

  const addStamp = useCallback((studentId, delta, reason = '교사 부여', teacherId = 'teacher_01') => {
    setDb(prev => {
      const students = prev.students.map(s => {
        if (s.id === studentId) {
          const newTotal = Math.max(0, s.stamps.total + delta);
          return {
            ...s,
            stamps: {
              ...s.stamps,
              total: newTotal,
              weekly: Math.max(0, s.stamps.weekly + delta),
              monthly: Math.max(0, s.stamps.monthly + delta),
              history: {
                ...s.stamps.history,
                [generateId('stamp')]: { by: teacherId, reason, at: Date.now(), delta }
              }
            }
          };
        }
        return s;
      });
      return { ...prev, students };
    });
  }, []);

  const resetDb = useCallback(() => {
    localStorage.removeItem('classboard_db');
    setDb(defaultData);
  }, []);

  const value = {
    db,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addStamp,
    resetDb,
    setDb
  };

  return (
    <MockDbContext.Provider value={value}>
      {children}
    </MockDbContext.Provider>
  );
};

export const useMockDb = () => {
  const context = useContext(MockDbContext);
  if (!context) throw new Error('useMockDb must be used within a MockDbProvider');
  return context;
};
