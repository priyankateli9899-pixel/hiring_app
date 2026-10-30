import { useState } from 'react';
import { CalendarIcon, ClockIcon, UserIcon, CheckCircleIcon } from '../../components/Icons.jsx';
import './company.css';

// Demo slots — replaced with real data when the interview API is built
const DEMO_SLOTS = [
  { id: 1, date: '2026-11-10', time: '10:00 AM', capacity: 5, registered: 3, mode: 'On-site', round: 'Technical Round 1' },
  { id: 2, date: '2026-11-10', time: '02:00 PM', capacity: 5, registered: 5, mode: 'On-site', round: 'Technical Round 1' },
  { id: 3, date: '2026-11-11', time: '10:00 AM', capacity: 4, registered: 2, mode: 'Virtual', round: 'HR Round' },
];

const DEMO_CANDIDATES = [
  { id: 1, name: 'Priya Sharma',    college: 'IIT Delhi',    cgpa: '9.1', slot: 1, status: 'registered', attended: null },
  { id: 2, name: 'Rahul Verma',     college: 'BITS Pilani',  cgpa: '8.7', slot: 1, status: 'registered', attended: null },
  { id: 3, name: 'Ananya Singh',    college: 'NIT Trichy',   cgpa: '8.3', slot: 1, status: 'waitlist',   attended: null },
  { id: 4, name: 'Karthik Rajan',   college: 'VIT Vellore',  cgpa: '7.9', slot: 2, status: 'registered', attended: null },
  { id: 5, name: 'Sneha Patel',     college: 'DAIICT',       cgpa: '8.5', slot: 2, status: 'registered', attended: null },
];

function fmt(dateStr) {
  const d = new Date(dateStr);
  return { day: d.getDate(), month: d.toLocaleString('default', { month: 'short' }), full: d.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) };
}

export default function InterviewManagement() {
  const [selectedSlot, setSelectedSlot] = useState(DEMO_SLOTS[0].id);
  const [candidates, setCandidates] = useState(DEMO_CANDIDATES);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', time: '', capacity: '', mode: 'On-site', round: '' });
  const [slots, setSlots] = useState(DEMO_SLOTS);

  const slot = slots.find(s => s.id === selectedSlot);
  const slotCandidates = candidates.filter(c => c.slot === selectedSlot);
  const waitlist = slotCandidates.filter(c => c.status === 'waitlist');
  const registered = slotCandidates.filter(c => c.status === 'registered');

  function markAttended(cid, val) {
    setCandidates(prev => prev.map(c => c.id === cid ? { ...c, attended: val } : c));
  }

  function addSlot() {
    if (!newSlot.date || !newSlot.time || !newSlot.capacity || !newSlot.round) return;
    setSlots(prev => [...prev, { id: Date.now(), ...newSlot, capacity: Number(newSlot.capacity), registered: 0 }]);
    setNewSlot({ date: '', time: '', capacity: '', mode: 'On-site', round: '' });
    setShowAddSlot(false);
  }

  function initials(name) { return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(); }

  return (
    <div>
      <div className="cd-row">
        {/* Slots panel */}
        <div className="cd-card" style={{ minWidth: 0 }}>
          <div className="cd-card-header">
            <div className="cd-card-title">Interview Slots</div>
            <button className="cd-card-link" onClick={() => setShowAddSlot(v => !v)}>+ Add Slot</button>
          </div>

          {showAddSlot && (
            <div style={{ background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '.8125rem', fontWeight: 700, color: '#059669', marginBottom: '.75rem' }}>New Interview Slot</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.625rem', marginBottom: '.625rem' }}>
                {[['date','Date','date'],['time','Time','time'],['capacity','Max Capacity','number'],['round','Round Name','text']].map(([f,l,t]) => (
                  <div key={f}>
                    <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '.25rem' }}>{l}</label>
                    <input type={t} value={newSlot[f]} onChange={e => setNewSlot(p => ({ ...p, [f]: e.target.value }))} placeholder={l}
                      style={{ width: '100%', padding: '.5rem .75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.875rem', outline: 'none', fontFamily: 'inherit' }} />
                  </div>
                ))}
              </div>
              <select value={newSlot.mode} onChange={e => setNewSlot(p => ({ ...p, mode: e.target.value }))}
                style={{ width: '100%', padding: '.5rem .75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.875rem', outline: 'none', marginBottom: '.75rem' }}>
                {['On-site','Virtual','Hybrid'].map(m => <option key={m}>{m}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '.625rem' }}>
                <button onClick={addSlot} style={{ flex: 1, padding: '.5rem', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '.875rem', cursor: 'pointer' }}>Add Slot</button>
                <button onClick={() => setShowAddSlot(false)} style={{ padding: '.5rem 1rem', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 8, fontWeight: 600, fontSize: '.875rem', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {slots.map(s => {
            const { day, month, full } = fmt(s.date);
            const full_pct = s.registered >= s.capacity;
            return (
              <div key={s.id} className={`im-slot-card${selectedSlot === s.id ? ' selected' : ''}`}
                onClick={() => setSelectedSlot(s.id)} style={{ marginBottom: '.75rem' }}>
                <div style={{ display: 'flex', gap: '.875rem', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 48, textAlign: 'center', background: '#f0fdf4', borderRadius: 10, padding: '.5rem .375rem' }}>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#059669', lineHeight: 1 }}>{day}</div>
                    <div style={{ fontSize: '.6875rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>{month}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '.9375rem', color: '#111827' }}>{s.round}</div>
                    <div style={{ fontSize: '.8125rem', color: '#6b7280', marginTop: '.2rem' }}>{s.time} · {s.mode}</div>
                    <div className="im-slot-meta">
                      <span className={`cd-chip ${full_pct ? 'red' : 'green'}`}>{s.registered}/{s.capacity} slots</span>
                      {full_pct && <span className="cd-chip orange">Full</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Candidates panel */}
        <div className="cd-card" style={{ minWidth: 0 }}>
          {slot ? (
            <>
              <div className="cd-card-header">
                <div className="cd-card-title">Candidates — {slot.round}</div>
                <span className="cd-badge active">{fmt(slot.date).full}</span>
              </div>

              <div style={{ fontSize: '.8125rem', fontWeight: 600, color: '#374151', marginBottom: '.5rem' }}>
                Registered ({registered.length}/{slot.capacity})
              </div>
              {registered.length ? registered.map(c => (
                <CandidateRow key={c.id} c={c} onAttend={markAttended} initials={initials} />
              )) : <p style={{ fontSize: '.875rem', color: '#9ca3af', marginBottom: '1rem' }}>No registered candidates.</p>}

              {waitlist.length > 0 && (
                <>
                  <div style={{ fontSize: '.8125rem', fontWeight: 600, color: '#b45309', margin: '1rem 0 .5rem', display: 'flex', alignItems: 'center', gap: '.375rem' }}>
                    ⏳ Waiting List ({waitlist.length})
                  </div>
                  {waitlist.map(c => <CandidateRow key={c.id} c={c} onAttend={markAttended} initials={initials} isWait />)}
                </>
              )}

              {!slotCandidates.length && (
                <div className="cd-empty">
                  <div className="cd-empty-icon">👥</div>
                  <p>No candidates registered for this slot yet.</p>
                </div>
              )}
            </>
          ) : (
            <div className="cd-empty">
              <div className="cd-empty-icon">📅</div>
              <p>Select a slot to view registered candidates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CandidateRow({ c, onAttend, initials, isWait }) {
  return (
    <div className="im-candidate-row">
      <div className="im-candidate-avatar" style={{ background: isWait ? 'linear-gradient(135deg,#b45309,#f59e0b)' : undefined }}>
        {initials(c.name)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '.9rem', color: '#111827' }}>{c.name}</div>
        <div style={{ fontSize: '.8rem', color: '#6b7280' }}>{c.college} · CGPA {c.cgpa}</div>
      </div>
      {!isWait && (
        <div style={{ display: 'flex', gap: '.375rem' }}>
          <button onClick={() => onAttend(c.id, true)}
            style={{ padding: '.3rem .75rem', borderRadius: 8, fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${c.attended === true ? '#059669' : '#e2e8f0'}`, background: c.attended === true ? '#f0fdf4' : '#fff', color: c.attended === true ? '#059669' : '#6b7280' }}>
            ✓ Present
          </button>
          <button onClick={() => onAttend(c.id, false)}
            style={{ padding: '.3rem .75rem', borderRadius: 8, fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${c.attended === false ? '#ef4444' : '#e2e8f0'}`, background: c.attended === false ? '#fef2f2' : '#fff', color: c.attended === false ? '#b91c1c' : '#6b7280' }}>
            ✗ Absent
          </button>
        </div>
      )}
      {isWait && <span className="cd-badge pending">Waitlist</span>}
    </div>
  );
}
