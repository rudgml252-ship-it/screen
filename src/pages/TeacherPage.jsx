import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockDb } from '../context/MockDbContext';
import StampStatusModal from '../components/StampStatusModal';
import styles from './TeacherPage.module.css';

/* ── helpers ── */
const getBadge = (n) => n>=30?'👑':n>=20?'🥇':n>=10?'🥈':n>=5?'🥉':'';
const getDday = (d) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(d); target.setHours(0,0,0,0);
  return Math.ceil((target-today)/86400000);
};
const TYPE_LABELS = {
  GENERAL:{ label:'일반', icon:'📢', color:'#A8D8EA' },
  URGENT: { label:'긴급', icon:'🚨', color:'#FF6B6B' },
  SUBMIT: { label:'제출물', icon:'📝', color:'#FFEAA7' },
  SCHEDULE:{ label:'시간표', icon:'📅', color:'#B5EAD7' },
};
const MAX_STAMPS = 30;

const resizeImage = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      const maxW = 1280;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

/* ════ TABS ════ */
const TABS = [
  { key:'settings',  label:'⚙️ 학급 설정' },
  { key:'students',  label:'👥 학생 관리' },
  { key:'stamps',    label:'🐥 칭찬 스티커' },
  { key:'announce',  label:'📢 공지사항' },
  { key:'photos',    label:'📸 학급 사진' },
  { key:'dday',      label:'📅 D-day 관리' },
  { key:'picker',    label:'🎲 발표자 뽑기' },
  { key:'timer',     label:'⏱️ 타이머' },
  { key:'cleaning',  label:'🧹 청소 당번' },
  { key:'election',  label:'🗳️ 투표/선거' },
];

/* ════ SUB-COMPONENTS ════ */

/* ── 0. 학급 설정 ── */
function SettingsTab({ db, updateClassInfo }) {
  const info = db.classInfo || {};
  const [grade, setGrade] = useState(() => {
    const m = info.name?.match(/(\d+)학년/);
    return m ? m[1] : '3';
  });
  const [classNum, setClassNum] = useState(() => {
    const m = info.name?.match(/(\d+)반/);
    return m ? m[1] : '2';
  });
  const [school, setSchool] = useState(info.school || '');
  const [teacher, setTeacher] = useState(info.teacherName || '');
  const [toast, setToast] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    updateClassInfo({
      name: `${grade}학년 ${classNum}반`,
      school: school.trim(),
      teacherName: teacher.trim(),
    });
    setToast('저장됐습니다!');
    setTimeout(() => setToast(''), 2000);
  };

  return (
    <div className={styles.card} style={{ maxWidth: 520 }}>
      <h3 className={styles.cardTitle}>⚙️ 학급 기본 정보</h3>
      <form onSubmit={handleSave} className={styles.form}>

        <label className={styles.label}>학년 · 반</label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select className={styles.input} value={grade} onChange={e => setGrade(e.target.value)} style={{ flex: 1 }}>
            {[1,2,3,4,5,6].map(g => (
              <option key={g} value={g}>{g}학년</option>
            ))}
          </select>
          <select className={styles.input} value={classNum} onChange={e => setClassNum(e.target.value)} style={{ flex: 1 }}>
            {Array.from({ length: 15 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n}반</option>
            ))}
          </select>
        </div>

        <label className={styles.label} style={{ marginTop: 14 }}>학교 이름</label>
        <input
          className={styles.input}
          placeholder="예: 행복초등학교"
          value={school}
          onChange={e => setSchool(e.target.value)}
        />

        <label className={styles.label} style={{ marginTop: 14 }}>담임 선생님 이름</label>
        <input
          className={styles.input}
          placeholder="예: 김선생님"
          value={teacher}
          onChange={e => setTeacher(e.target.value)}
        />

        <button type="submit" className={styles.pinkBtn} style={{ marginTop: 20 }}>
          💾 저장하기
        </button>
      </form>

      <div className={styles.studentSummary} style={{ marginTop: 20 }}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryNum}>{grade}학년</span>
          <span className={styles.summaryLabel}>학년</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryNum}>{classNum}반</span>
          <span className={styles.summaryLabel}>반</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryNum} style={{ fontSize: 16 }}>{school || '-'}</span>
          <span className={styles.summaryLabel}>학교</span>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

/* ── 1. 공지사항 ── */
function AnnounceTab({ db, addAnnouncement, deleteAnnouncement }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('GENERAL');
  const [showCleaningForm, setShowCleaningForm] = useState(false);
  const [cleaningMsg, setCleaningMsg] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addAnnouncement({ title, body, type, priority: type==='URGENT'?1:type==='SUBMIT'?2:3, pinned: type==='URGENT' });
    setTitle(''); setBody('');
  };

  const openCleaningForm = () => {
    const students = db.students || [];
    const getNames = (ids) => ids.map(id => students.find(s => s.id === id)?.name || id).filter(Boolean).join(', ');
    const groups = db.cleaningRota?.groups || [];
    const preview = groups.map(g => `${g.name} (${g.duty}): ${getNames(g.members)}`).join('\n');
    setCleaningMsg(preview);
    setShowCleaningForm(true);
  };

  const submitCleaning = () => {
    if (!cleaningMsg.trim()) return;
    addAnnouncement({
      title: '🧹 오늘의 청소 당번',
      body: cleaningMsg,
      type: 'GENERAL',
      priority: 3,
      pinned: false,
    });
    setShowCleaningForm(false);
    setCleaningMsg('');
  };

  return (
    <div className={styles.twoCol}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 청소 당번 공지 */}
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showCleaningForm ? 14 : 0 }}>
            <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>🧹 오늘의 청소 공지</h3>
            <button
              className={styles.purpleBtn}
              onClick={() => showCleaningForm ? setShowCleaningForm(false) : openCleaningForm()}
            >
              {showCleaningForm ? '✕ 닫기' : '📋 청소 당번 공지 등록'}
            </button>
          </div>
          {showCleaningForm && (
            <>
              <p style={{ fontSize: 12, color: '#9B8B80', marginBottom: 8 }}>내용을 수정한 뒤 공지로 등록하세요.</p>
              <textarea
                className={styles.textarea}
                value={cleaningMsg}
                onChange={e => setCleaningMsg(e.target.value)}
                rows={Math.max(4, (db.cleaningRota?.groups?.length || 3) + 1)}
              />
              <button className={styles.pinkBtn} onClick={submitCleaning} style={{ marginTop: 8 }}>
                🔔 공지로 등록
              </button>
            </>
          )}
        </div>

        {/* 일반 공지 작성 */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>✏️ 새 공지 작성</h3>
          <form onSubmit={submit} className={styles.form}>
            <div className={styles.chipRow}>
              {Object.entries(TYPE_LABELS).map(([k,v]) => (
                <button key={k} type="button" onClick={() => setType(k)}
                  className={`${styles.chip} ${type===k ? styles.chipActive : ''}`}
                  style={type===k ? { background: v.color } : {}}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
            <input className={styles.input} placeholder="제목" value={title} onChange={e=>setTitle(e.target.value)} required />
            <textarea className={styles.textarea} placeholder="내용 (선택)" value={body} onChange={e=>setBody(e.target.value)} />
            <button type="submit" className={styles.pinkBtn}>🔔 공지 등록</button>
          </form>
        </div>

      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>📋 현재 공지 ({db.announcements?.length || 0}건)</h3>
        <div className={styles.scrollList}>
          {(db.announcements||[]).length === 0
            ? <p className={styles.emptyMsg}>등록된 공지가 없습니다.</p>
            : (db.announcements||[]).map(a => {
              const cfg = TYPE_LABELS[a.type]||TYPE_LABELS.GENERAL;
              return (
                <div key={a.id} className={styles.annItem}>
                  <div className={styles.annItemTop}>
                    <span className={styles.annBadge} style={{background:cfg.color}}>{cfg.icon} {cfg.label}</span>
                    <button className={styles.delBtn} onClick={()=>deleteAnnouncement(a.id)}>✕</button>
                  </div>
                  <p className={styles.annTitle}>{a.title}</p>
                  {a.body && <p className={styles.annBody} style={{whiteSpace:'pre-line'}}>{a.body}</p>}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

/* ── 2. 칭찬 스티커 ── */
function StampsTab({ db, addStamp }) {
  const [reason, setReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const sorted = [...(db.students||[])].sort((a,b)=>a.number-b.number);

  const handleStamp = (studentId, delta) => {
    const s = db.students?.find(x=>x.id===studentId);
    addStamp(studentId, delta, reason||'교사 부여');
    if (delta>0 && s) { setToast(`${s.name} +1 🐥`); setTimeout(()=>setToast(''),2000); }
  };

  return (
    <div className={styles.stampsWrap}>
      <div className={styles.stampsHeader}>
        <div style={{flex:1}}>
          <label className={styles.label}>📝 칭찬 이유 (선택)</label>
          <input className={styles.input} placeholder="예: 발표를 잘했어요!" value={reason} onChange={e=>setReason(e.target.value)} style={{marginTop:6}} />
        </div>
        <button className={styles.purpleBtn} onClick={()=>setShowModal(true)}>📊 전체 현황</button>
      </div>

      <div className={styles.studentGrid}>
        {sorted.map(s => {
          const total = s.stamps.total;
          const badge = getBadge(total);
          return (
            <div key={s.id} className={styles.studentCard}>
              <div className={styles.stuTop}>
                <div className={styles.stuMeta}>
                  <span className={styles.stuNum}>{s.number}번</span>
                  <span className={styles.stuName}>{s.name}</span>
                  {badge && <span>{badge}</span>}
                </div>
                <span className={styles.stuCount}>🐥{total}</span>
              </div>
              <div className={styles.eggRow}>
                {Array.from({length: MAX_STAMPS}).map((_,i) => (
                  <span key={i} className={`${styles.eggEmoji} ${i<total ? styles.chickStyle : styles.eggStyle} ${i===total ? styles.nextEgg : ''}`}
                    onClick={() => i===total ? handleStamp(s.id,1) : undefined}
                    title={i<total ? '🐥 병아리!' : i===total ? '🥚 클릭해서 부화!' : '🥚 계란'}
                  >
                    {i < total ? '🐥' : '🥚'}
                  </span>
                ))}
                {total > MAX_STAMPS && <span className={styles.moreStamps}>+{total-MAX_STAMPS}</span>}
              </div>
              <div className={styles.stampCtrl}>
                <button className={styles.minusBtn} onClick={()=>handleStamp(s.id,-1)} disabled={total===0}>−</button>
                <span className={styles.stampNum}>{total}</span>
                <button className={styles.plusBtn} onClick={()=>handleStamp(s.id,1)}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
      {showModal && <StampStatusModal students={sorted} onClose={()=>setShowModal(false)} />}
    </div>
  );
}

/* ── 3. 발표자 랜덤 뽑기 ── */
function PickerTab({ db, pickStudent, resetPicker, toggleExcluded }) {
  const [picking, setPicking] = useState(false);
  const [displayName, setDisplayName] = useState('?');
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('NO_REPEAT');
  const intervalRef = useRef(null);

  const spin = () => {
    if (picking) return;
    setPicking(true); setResult(null);
    const candidates = (db.students||[]).filter(s=>!db.pickerSession?.excluded?.includes(s.id));
    if (candidates.length === 0) { setPicking(false); return; }
    let count = 0;
    const maxCount = 20;
    intervalRef.current = setInterval(() => {
      const rnd = candidates[Math.floor(Math.random()*candidates.length)];
      setDisplayName(rnd.name);
      count++;
      if (count >= maxCount) {
        clearInterval(intervalRef.current);
        const picked = pickStudent(mode);
        const pickedStudent = (db.students||[]).find(s=>s.id===picked);
        if (pickedStudent) { setDisplayName(pickedStudent.name); setResult(pickedStudent); }
        setPicking(false);
      }
    }, 100);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const excluded = db.pickerSession?.excluded || [];
  const history = db.pickerSession?.history || [];
  const sortedStudents = [...(db.students||[])].sort((a,b)=>a.number-b.number);

  return (
    <div className={styles.twoCol}>
      <div className={styles.card} style={{textAlign:'center'}}>
        <h3 className={styles.cardTitle}>🎲 발표자 랜덤 뽑기</h3>
        <div className={styles.chipRow} style={{justifyContent:'center',marginBottom:16}}>
          {[['NO_REPEAT','🚫 중복 방지'],['RANDOM','🎲 완전 랜덤']].map(([k,l]) => (
            <button key={k} className={`${styles.chip} ${mode===k?styles.chipActive:''}`}
              onClick={()=>setMode(k)}>{l}</button>
          ))}
        </div>
        <div className={`${styles.rouletteBox} ${picking ? styles.rouletteSpinning : ''} ${result ? styles.rouletteResult : ''}`}>
          <div className={styles.rouletteName}>{displayName}</div>
          {result && <div className={styles.resultBadge}>🎉 발표자!</div>}
        </div>
        <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:16}}>
          <button className={styles.pinkBtn} onClick={spin} disabled={picking}>
            {picking ? '🎲 뽑는 중...' : '🎲 뽑기!'}
          </button>
          <button className={styles.grayBtn} onClick={()=>{ resetPicker(); setDisplayName('?'); setResult(null); }}>
            🔄 초기화
          </button>
        </div>
        {history.length > 0 && (
          <div style={{marginTop:16}}>
            <p style={{fontSize:13,color:'#9B8B80',marginBottom:6}}>발표 이력 ({history.length}명)</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,justifyContent:'center'}}>
              {history.map((id,i) => {
                const s = db.students?.find(x=>x.id===id);
                return s ? <span key={i} className={styles.historyChip}>{s.name}</span> : null;
              })}
            </div>
          </div>
        )}
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>👥 대상 학생 설정</h3>
        <p style={{fontSize:13,color:'#9B8B80',marginBottom:12}}>제외할 학생을 선택하세요 (결석 등)</p>
        <div className={styles.scrollList}>
          {sortedStudents.map(s => {
            const isExcluded = excluded.includes(s.id);
            const wasPresented = history.includes(s.id);
            return (
              <div key={s.id} className={`${styles.pickerStudentRow} ${isExcluded ? styles.pickerExcluded : ''}`}>
                <span className={styles.stuNum}>{s.number}번</span>
                <span className={styles.stuName} style={{flex:1}}>{s.name}</span>
                {wasPresented && <span className={styles.presentedBadge}>발표✓</span>}
                <span className={styles.presentedCount}>총{s.presentedCount}회</span>
                <button
                  className={isExcluded ? styles.includeBtn : styles.excludeBtn}
                  onClick={() => toggleExcluded(s.id)}>
                  {isExcluded ? '참여' : '제외'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── 4. D-day 관리 ── */
function DdayTab({ db, addDday, deleteDday }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [color, setColor] = useState('#FF6B6B');

  const submit = (e) => {
    e.preventDefault();
    if (!title||!date) return;
    addDday({ title, targetDate: date, color, pinned: false });
    setTitle(''); setDate('');
  };

  const sorted = [...(db.ddays||[])].map(d=>({...d,diff:getDday(d.targetDate)})).sort((a,b)=>a.diff-b.diff);

  return (
    <div className={styles.twoCol}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>📅 D-day 추가</h3>
        <form onSubmit={submit} className={styles.form}>
          <input className={styles.input} placeholder="행사명 (예: 기말고사)" value={title} onChange={e=>setTitle(e.target.value)} required />
          <input className={styles.input} type="date" value={date} onChange={e=>setDate(e.target.value)} required />
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <label className={styles.label}>색상</label>
            {['#FF6B6B','#4ECDC4','#FFC97E','#C9B1FF','#A8D8EA','#B5EAD7'].map(c => (
              <div key={c} onClick={()=>setColor(c)}
                style={{width:28,height:28,borderRadius:'50%',background:c,cursor:'pointer',
                  border: color===c?'3px solid #3D2B1F':'3px solid transparent',transition:'border 0.15s'}} />
            ))}
          </div>
          <button type="submit" className={styles.pinkBtn}>➕ 추가</button>
        </form>
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>📆 등록된 D-day</h3>
        <div className={styles.scrollList}>
          {sorted.length === 0 && <p className={styles.emptyMsg}>등록된 D-day가 없습니다.</p>}
          {sorted.map(d => (
            <div key={d.id} className={styles.ddayItem}>
              <div className={styles.ddayColorDot} style={{background:d.color}} />
              <span style={{flex:1,fontWeight:700,fontSize:15}}>{d.title}</span>
              <span style={{fontWeight:900,fontSize:20,color: d.diff<0?'#9B8B80':d.diff<=3?'#FF4757':'#3D2B1F'}}>
                {d.diff < 0 ? `D+${Math.abs(d.diff)}` : d.diff === 0 ? 'D-Day' : `D-${d.diff}`}
              </span>
              <span style={{fontSize:13,color:'#9B8B80',margin:'0 8px'}}>{d.targetDate}</span>
              <button className={styles.delBtn} onClick={()=>deleteDday(d.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 5. 학생 관리 ── */
function StudentsTab({ db, addStudent, deleteStudent, renameStudent }) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [toast, setToast] = useState('');

  const sorted = [...(db.students||[])].sort((a,b)=>a.number-b.number);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addStudent(newName.trim());
    setToast(`${newName.trim()} 학생이 추가되었습니다.`);
    setTimeout(() => setToast(''), 2000);
    setNewName('');
  };

  const startEdit = (s) => { setEditingId(s.id); setEditName(s.name); };

  const saveEdit = (id) => {
    if (editName.trim()) renameStudent(id, editName.trim());
    setEditingId(null);
  };

  const handleDelete = (s) => {
    if (window.confirm(`"${s.name}" 학생을 명단에서 삭제할까요?\n칭찬 스티커·발표 이력도 함께 삭제됩니다.`)) {
      deleteStudent(s.id);
    }
  };

  return (
    <div className={styles.twoCol}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>➕ 학생 추가</h3>
        <form onSubmit={handleAdd} className={styles.form}>
          <input
            className={styles.input}
            placeholder="학생 이름 입력"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
          />
          <button type="submit" className={styles.pinkBtn}>➕ 추가</button>
        </form>
        <div className={styles.studentSummary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryNum}>{sorted.length}</span>
            <span className={styles.summaryLabel}>전체 학생</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryNum}>{sorted.reduce((s,st)=>s+st.stamps.total,0)}</span>
            <span className={styles.summaryLabel}>총 스티커</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryNum}>{sorted.filter(s=>s.stamps.total>0).length}</span>
            <span className={styles.summaryLabel}>스티커 보유자</span>
          </div>
        </div>
        <p className={styles.hintText}>💡 이름을 클릭하면 수정할 수 있어요</p>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>👥 학생 명단 ({sorted.length}명)</h3>
        <div className={styles.scrollList}>
          {sorted.length === 0 && <p className={styles.emptyMsg}>등록된 학생이 없습니다.</p>}
          {sorted.map(s => (
            <div key={s.id} className={styles.studentManageRow}>
              <span className={styles.manageNum}>{s.number}번</span>
              {editingId === s.id ? (
                <>
                  <input
                    className={styles.inlineInput}
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter') saveEdit(s.id); if(e.key==='Escape') setEditingId(null); }}
                    autoFocus
                  />
                  <button className={styles.saveBtn} onClick={() => saveEdit(s.id)}>✓ 저장</button>
                  <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>✕</button>
                </>
              ) : (
                <>
                  <span className={styles.manageName} onClick={() => startEdit(s)} title="클릭하여 이름 수정">
                    {s.name}
                  </span>
                  <span className={styles.manageStamp}>🐥 {s.stamps.total}</span>
                  <button className={styles.editNameBtn} onClick={() => startEdit(s)}>✏️</button>
                  <button className={styles.delBtn} onClick={() => handleDelete(s)}>✕</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

/* ── 6. 학급 사진 ── */
function PhotosTab({ db, addClassPhoto, deleteClassPhoto, togglePhotoVisibility, updatePhotoCaption }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [editCaptionId, setEditCaptionId] = useState(null);
  const [editCaptionText, setEditCaptionText] = useState('');
  const [toast, setToast] = useState('');

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const dataUrl = await resizeImage(file);
        addClassPhoto(dataUrl, caption || file.name.replace(/\.[^/.]+$/, ''));
      }
      setToast(`사진 ${files.length}장이 추가되었습니다.`);
      setTimeout(() => setToast(''), 2500);
    } catch {
      setToast('업로드 중 오류가 발생했습니다.');
      setTimeout(() => setToast(''), 2500);
    }
    setUploading(false);
    setCaption('');
    e.target.value = '';
  };

  const startEditCaption = (p) => { setEditCaptionId(p.id); setEditCaptionText(p.caption); };
  const saveCaption = (id) => { updatePhotoCaption(id, editCaptionText); setEditCaptionId(null); };

  const photos = db.photos || [];
  const visibleCount = photos.filter(p => p.visible).length;

  return (
    <div className={styles.photosWrap}>
      <div className={styles.card} style={{marginBottom: 20}}>
        <h3 className={styles.cardTitle}>📸 사진 업로드</h3>
        <div className={styles.form}>
          <input
            className={styles.input}
            placeholder="사진 캡션 (선택, 비우면 파일명 사용)"
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
          <div
            className={`${styles.uploadArea} ${uploading ? styles.uploadAreaLoading : ''}`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <div className={styles.uploadIcon}>{uploading ? '⏳' : '📁'}</div>
            <div className={styles.uploadText}>
              {uploading ? '업로드 중...' : '클릭하여 사진 선택'}
            </div>
            <div className={styles.uploadSub}>
              {uploading ? '잠시만 기다려주세요.' : 'JPG, PNG, WEBP · 여러 장 동시 선택 가능'}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{display:'none'}} />
          </div>
          <div className={styles.photoStats}>
            <span>전체 <strong>{photos.length}</strong>장</span>
            <span>·</span>
            <span>전자칠판 표시 중 <strong style={{color:'#27AE60'}}>{visibleCount}</strong>장</span>
            <span>·</span>
            <span>숨김 <strong style={{color:'#9B8B80'}}>{photos.length - visibleCount}</strong>장</span>
          </div>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className={styles.card}>
          <p className={styles.emptyMsg}>📷 업로드된 사진이 없습니다.<br/>위에서 사진을 추가해보세요!</p>
        </div>
      ) : (
        <div className={styles.photoGrid}>
          {photos.map(p => (
            <div key={p.id} className={`${styles.photoCard} ${!p.visible ? styles.photoHidden : ''}`}>
              <div
                className={styles.photoPreview}
                style={{backgroundImage: `url(${p.url})`}}
              >
                <div className={styles.photoOverlay}>
                  <button
                    className={p.visible ? styles.visibleBtn : styles.hiddenBtn}
                    onClick={() => togglePhotoVisibility(p.id)}
                  >
                    {p.visible ? '👁️ 표시 중' : '🙈 숨김'}
                  </button>
                </div>
              </div>
              <div className={styles.photoInfo}>
                {editCaptionId === p.id ? (
                  <div style={{display:'flex',gap:6}}>
                    <input
                      className={styles.inlineInput}
                      style={{flex:1}}
                      value={editCaptionText}
                      onChange={e => setEditCaptionText(e.target.value)}
                      onKeyDown={e => { if(e.key==='Enter') saveCaption(p.id); if(e.key==='Escape') setEditCaptionId(null); }}
                      autoFocus
                    />
                    <button className={styles.saveBtn} onClick={() => saveCaption(p.id)}>✓</button>
                  </div>
                ) : (
                  <p className={styles.photoCaption} onClick={() => startEditCaption(p)} title="클릭하여 캡션 수정">
                    {p.caption || '제목 없음'} ✏️
                  </p>
                )}
                <button className={styles.photoDelBtn} onClick={() => {
                  if (window.confirm('이 사진을 삭제할까요?')) deleteClassPhoto(p.id);
                }}>🗑️ 삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

/* ── 7. 청소 당번 ── */
function CleaningTab({ db, rotateCleaningRota }) {
  const groups = db.cleaningRota?.groups || [];
  const students = db.students || [];
  const getNames = (ids) => ids.map(id => students.find(s=>s.id===id)?.name || id).join(', ');

  return (
    <div className={styles.card} style={{maxWidth:700}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h3 className={styles.cardTitle} style={{marginBottom:0}}>🧹 청소 당번 현황</h3>
        <button className={styles.pinkBtn} onClick={rotateCleaningRota}>🔄 순번 돌리기</button>
      </div>
      {groups.map(g => (
        <div key={g.id} className={styles.cleanCard}>
          <div className={styles.cleanGroupName}>{g.name}</div>
          <div className={styles.cleanDuty}>{g.duty}</div>
          <div className={styles.cleanMembers}>👤 {getNames(g.members)}</div>
        </div>
      ))}
      {db.cleaningRota?.lastRotated && (
        <p style={{fontSize:12,color:'#C9A0B0',marginTop:12,textAlign:'right'}}>
          마지막 순번 변경: {new Date(db.cleaningRota.lastRotated).toLocaleString('ko-KR')}
        </p>
      )}
    </div>
  );
}

/* ── 8. 투표/선거 ── */
function ElectionTab({ db, startElection, addCandidate, castVote, resetElection }) {
  const el = db.election;
  const [newTitle, setNewTitle] = useState('');
  const [newRole, setNewRole] = useState('PRESIDENT');
  const [candName, setCandName] = useState('');
  const [candSlogan, setCandSlogan] = useState('');
  const [voterIdx, setVoterIdx] = useState(0);
  const [showTally, setShowTally] = useState(false);

  const students = db.students || [];

  const handleReset = () => {
    if (window.confirm('선거 데이터를 모두 삭제할까요?\n후보, 투표 결과가 전부 초기화됩니다.')) {
      resetElection();
    }
  };

  if (!el) return (
    <div className={styles.card} style={{maxWidth:600}}>
      <h3 className={styles.cardTitle}>🗳️ 새 선거 시작</h3>
      <div className={styles.form}>
        <input className={styles.input} placeholder="선거 제목 (예: 2학기 학급 회장)" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
        <div className={styles.chipRow}>
          {[['PRESIDENT','🏅 회장'],['VICE','🎖️ 부회장']].map(([k,l])=>(
            <button key={k} className={`${styles.chip} ${newRole===k?styles.chipActive:''}`} onClick={()=>setNewRole(k)}>{l}</button>
          ))}
        </div>
        <button className={styles.pinkBtn} onClick={()=>{ if(newTitle) { startElection({title:newTitle,role:newRole}); setNewTitle(''); } }}>
          ▶️ 선거 시작
        </button>
      </div>
    </div>
  );

  const candidates = Object.values(el.candidates||{});
  const totalVotes = candidates.reduce((s,c)=>s+c.voteCount,0);
  const currentVoter = students[voterIdx];
  const hasVoted = currentVoter && el.voters?.[currentVoter.id];
  const votedCount = Object.keys(el.voters||{}).length;

  return (
    <div className={styles.twoCol}>
      <div className={styles.card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
          <h3 className={styles.cardTitle} style={{marginBottom:0}}>🗳️ {el.title}</h3>
          <button className={styles.delBtn} style={{fontSize:12,padding:'4px 10px',borderRadius:8}}
            onClick={handleReset} title="선거 데이터 삭제">
            🗑️ 삭제
          </button>
        </div>
        <p style={{fontSize:13,color:'#9B8B80',marginBottom:16}}>
          {el.role === 'PRESIDENT' ? '🏅 회장' : '🎖️ 부회장'} 선거 ·
          투표: <strong style={{color: votedCount===students.length?'#27AE60':'#E8527A'}}>{votedCount}</strong>/{students.length}명 완료
        </p>

        <h4 style={{marginBottom:10,fontSize:15}}>후보 등록</h4>
        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <input className={styles.input} placeholder="후보자 이름" value={candName} onChange={e=>setCandName(e.target.value)} style={{flex:1,minWidth:120}} />
          <input className={styles.input} placeholder="슬로건" value={candSlogan} onChange={e=>setCandSlogan(e.target.value)} style={{flex:2,minWidth:160}} />
          <button className={styles.pinkBtn} onClick={()=>{
            if(candName) { addCandidate(el.id,{name:candName,slogan:candSlogan}); setCandName(''); setCandSlogan(''); }
          }}>➕ 등록</button>
        </div>

        <h4 style={{marginBottom:10,fontSize:15}}>후보 목록</h4>
        {candidates.length === 0 && <p className={styles.emptyMsg}>등록된 후보가 없습니다.</p>}
        {candidates.map(c => (
          <div key={c.id} className={styles.cleanCard}>
            <div style={{fontWeight:700,fontSize:16}}>{c.name}</div>
            <div style={{fontSize:13,color:'#9B8B80'}}>{c.slogan}</div>
            {showTally && (
              <div style={{marginTop:8}}>
                <div style={{background:'#B2EBF2',borderRadius:6,height:12,overflow:'hidden'}}>
                  <div style={{height:'100%',background:'#26C6DA',width:`${totalVotes>0?(c.voteCount/totalVotes*100):0}%`,transition:'width 0.5s'}} />
                </div>
                <span style={{fontSize:13,color:'#00838F',fontWeight:700,marginTop:4,display:'block'}}>
                  {c.voteCount}표 ({totalVotes>0?Math.round(c.voteCount/totalVotes*100):0}%)
                </span>
              </div>
            )}
          </div>
        ))}
        <div style={{display:'flex',gap:8,marginTop:16,flexWrap:'wrap'}}>
          <button className={styles.purpleBtn} onClick={()=>setShowTally(!showTally)}>
            {showTally ? '🔒 집계 숨기기' : '📊 집계 공개'}
          </button>
          <button className={styles.grayBtn} onClick={handleReset}>
            🗑️ 선거 종료 및 삭제
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>🗳️ 비밀 투표</h3>
        <div style={{marginBottom:16}}>
          <label className={styles.label}>투표할 학생 선택</label>
          <select className={styles.input} style={{marginTop:6}} value={voterIdx} onChange={e=>setVoterIdx(Number(e.target.value))}>
            {students.map((s,i)=>(
              <option key={s.id} value={i}>{s.number}번 {s.name} {el.voters?.[s.id]?'✅':''}</option>
            ))}
          </select>
        </div>
        {hasVoted ? (
          <div className={styles.votedMsg}>✅ {currentVoter?.name} 학생은 이미 투표했습니다.</div>
        ) : (
          <>
            <p style={{fontSize:14,marginBottom:12,color:'#5D4E6A'}}>후보를 선택해주세요:</p>
            {candidates.length === 0 && <p className={styles.emptyMsg}>먼저 후보를 등록해주세요.</p>}
            {candidates.map(c => (
              <button key={c.id} className={styles.voteBtn}
                onClick={()=>castVote(el.id, c.id, currentVoter?.id)}>
                🗳️ {c.name} 후보에게 투표
              </button>
            ))}
          </>
        )}
        <p style={{fontSize:12,color:'#9B8B80',marginTop:16}}>
          비밀 투표: 누가 어느 후보에게 투표했는지 기록되지 않습니다.
        </p>
      </div>
    </div>
  );
}

/* ── 9. 타이머 ── */
function TimerTab() {
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('FOCUS');
  const [label, setLabel] = useState('집중 시간');
  const intervalRef = useRef(null);

  const PRESETS = [
    { key:'FOCUS', label:'집중 시간', sec:25*60, emoji:'🧠' },
    { key:'BREAK', label:'쉬는 시간', sec:5*60, emoji:'☕' },
    { key:'EXAM',  label:'시험 시간', sec:45*60, emoji:'📝' },
    { key:'CLEAN', label:'청소 시간', sec:10*60, emoji:'🧹' },
  ];

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => { if (r<=1) { clearInterval(intervalRef.current); setRunning(false); return 0; } return r-1; });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const total = PRESETS.find(p=>p.key===mode)?.sec || 25*60;
  const pct = Math.max(0, remaining/total*100);
  const urgent = remaining <= 60 && remaining > 0;

  return (
    <div className={styles.card} style={{maxWidth:500,margin:'0 auto',textAlign:'center'}}>
      <h3 className={styles.cardTitle} style={{textAlign:'center'}}>⏱️ 학급 타이머</h3>
      <div className={styles.chipRow} style={{justifyContent:'center',marginBottom:20}}>
        {PRESETS.map(p => (
          <button key={p.key} className={`${styles.chip} ${mode===p.key?styles.chipActive:''}`}
            onClick={()=>{ if(!running){ setMode(p.key); setLabel(p.label); setRemaining(p.sec); } }}>
            {p.emoji} {p.label}
          </button>
        ))}
      </div>
      <div className={styles.timerCircle} style={{borderColor: urgent ? '#FF4757' : '#FFD6E3'}}>
        <svg className={styles.timerSvg} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#FFE0E9" strokeWidth="8"/>
          <circle cx="60" cy="60" r="54" fill="none"
            stroke={urgent ? '#FF4757' : '#FF8FAB'} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2*Math.PI*54}`}
            strokeDashoffset={`${2*Math.PI*54*(1-pct/100)}`}
            style={{transition:'stroke-dashoffset 1s linear',transformOrigin:'center',transform:'rotate(-90deg)'}}
          />
        </svg>
        <div className={`${styles.timerDisplay} ${urgent ? styles.timerUrgent : ''}`}>{fmt(remaining)}</div>
      </div>
      <p className={styles.timerLabel}>{label}</p>
      <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:20}}>
        <button className={styles.pinkBtn} onClick={()=>setRunning(r=>!r)}>
          {running ? '⏸️ 일시정지' : '▶️ 시작'}
        </button>
        <button className={styles.grayBtn} onClick={()=>{ setRunning(false); setRemaining(PRESETS.find(p=>p.key===mode)?.sec||25*60); }}>
          🔄 리셋
        </button>
      </div>
    </div>
  );
}

/* ════ MAIN COMPONENT ════ */
export default function TeacherPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const {
    db, addAnnouncement, deleteAnnouncement, addStamp,
    addStudent, deleteStudent, renameStudent,
    addDday, deleteDday,
    addClassPhoto, deleteClassPhoto, togglePhotoVisibility, updatePhotoCaption,
    pickStudent, resetPicker, toggleExcluded, rotateCleaningRota,
    startElection, addCandidate, castVote, resetElection,
    updateClassInfo, resetDb,
  } = useMockDb();

  const [tab, setTab] = useState('settings');

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.hLeft}>
          <span className={styles.logo}>🐣</span>
          <div>
            <h1 className={styles.hTitle}>ClassBoard 교사 패널</h1>
            <p className={styles.hSub}>{db.classInfo?.name} · {db.classInfo?.school}</p>
          </div>
        </div>
        <div className={styles.hRight}>
          <button className={styles.boardNavBtn} onClick={()=>navigate(`/board/${classId}`)}>📺 전자칠판</button>
        </div>
      </header>

      <nav className={styles.tabNav}>
        {TABS.map(t => (
          <button key={t.key} className={`${styles.tabBtn} ${tab===t.key?styles.tabActive:''}`}
            onClick={()=>setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {tab==='settings'  && <SettingsTab db={db} updateClassInfo={updateClassInfo}/>}
        {tab==='announce'  && <AnnounceTab db={db} addAnnouncement={addAnnouncement} deleteAnnouncement={deleteAnnouncement}/>}
        {tab==='stamps'    && <StampsTab db={db} addStamp={addStamp}/>}
        {tab==='picker'    && <PickerTab db={db} pickStudent={pickStudent} resetPicker={resetPicker} toggleExcluded={toggleExcluded}/>}
        {tab==='dday'      && <DdayTab db={db} addDday={addDday} deleteDday={deleteDday}/>}
        {tab==='students'  && <StudentsTab db={db} addStudent={addStudent} deleteStudent={deleteStudent} renameStudent={renameStudent}/>}
        {tab==='photos'    && <PhotosTab db={db} addClassPhoto={addClassPhoto} deleteClassPhoto={deleteClassPhoto} togglePhotoVisibility={togglePhotoVisibility} updatePhotoCaption={updatePhotoCaption}/>}
        {tab==='cleaning'  && <CleaningTab db={db} rotateCleaningRota={rotateCleaningRota}/>}
        {tab==='election'  && <ElectionTab db={db} startElection={startElection} addCandidate={addCandidate} castVote={castVote} resetElection={resetElection}/>}
        {tab==='timer'     && <TimerTab/>}
      </div>

      <div style={{textAlign:'center',padding:'12px',borderTop:'1px solid #FFE0E9'}}>
        <button style={{fontSize:12,color:'#DDB8C8',textDecoration:'underline',background:'none',border:'none',cursor:'pointer'}}
          onClick={()=>{ if(window.confirm('데이터를 초기화할까요?')) resetDb(); }}>
          데이터 초기화
        </button>
      </div>
    </div>
  );
}
