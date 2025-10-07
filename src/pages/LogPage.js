import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../css/LogPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function LogPage() {
  const { roles, user } = useAuth();
  // Hierarchical role logic
  const isSuperadmin = roles.includes('superadmin');
  const isAdmin = isSuperadmin || roles.includes('admin');
  // Always allow superadmin to view audit log
  const isTest = isSuperadmin || isAdmin || roles.includes('test');
  // const isUser = isTest || roles.includes('user'); // not used
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [undoing, setUndoing] = useState({});
  const [selected, setSelected] = useState([]);
  // Handle checkbox toggle
  const handleSelect = (logId) => {
    setSelected(sel => sel.includes(logId) ? sel.filter(id => id !== logId) : [...sel, logId]);
  };

  useEffect(() => {
    // Only allow test, admin, superadmin to see logs
    if (!isTest) return;
    fetch(`${API_URL}/api/audit_log`)
      .then(res => res.json())
      .then(data => {
        // Sort logs by timestamp descending (newest first)
        const sortedLogs = (data.logs || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setLogs(sortedLogs);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch logs');
        setLoading(false);
      });
  }, [roles, isTest]);

  const handleUndo = async (log) => {
    setUndoing(u => ({ ...u, [log.id]: true }));
    let endpoint = '';
    if (log.entity_type === 'shift') {
      endpoint = `/api/shifts/${log.entity_id}/undo`;
    } else {
      setError('Undo only supported for shift edits.');
      setUndoing(u => ({ ...u, [log.id]: false }));
      return;
    }
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editor_user_id: log.editor_user_id })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Undo failed');
      window.location.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setUndoing(u => ({ ...u, [log.id]: false }));
    }
  };

  if (!isTest) {
    // If superadmin, always allow access
    if (!isSuperadmin) {
      return <div style={{color:'red'}}>You do not have permission to view this page.</div>;
    }
  }
  if (loading) return <div>Loading logs...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div className="log-page">
      <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:8}}>
        <h2 style={{margin:0}}>Audit Log</h2>
        <button
          style={{padding:'2px 4px',fontSize:'0.8rem',minWidth:'40px',maxWidth:'80px',width:'80px'}}
          onClick={() => {
            if (selected.length === logs.length) setSelected([]);
            else setSelected(logs.map(l => l.id));
          }}
        >{selected.length === logs.length ? 'Uncheck All' : 'Check All'}</button>
        <button
          style={{padding:'2px 4px',fontSize:'0.8rem',minWidth:'40px',maxWidth:'80px',width:'80px'}}
          onClick={() => setModalOpen(true)}
          disabled={selected.length === 0}
        >Take Action</button>
      {modalOpen && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:1000,background:'rgba(0,0,0,0.15)'}} onClick={()=>setModalOpen(false)}>
          <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',background:'#fff',border:'1px solid #ccc',borderRadius:8,padding:24,minWidth:320,boxShadow:'0 2px 16px rgba(0,0,0,0.12)'}} onClick={e=>e.stopPropagation()}>
            <h3>Take Action</h3>
            <p style={{marginBottom:16}}>You have selected {selected.length} log(s).</p>
            {/* Undo is visible to admin and above */}
            {isAdmin && (
              <button
                style={{marginBottom:12,padding:'4px 12px',fontSize:'0.9rem',width:'100%'}}
                disabled={modalLoading}
                onClick={async () => {
                  setModalLoading(true);
                  for (const log of logs.filter(l => selected.includes(l.id))) {
                    await handleUndo(log);
                  }
                  setModalLoading(false);
                  setModalOpen(false);
                }}
              >Undo Selected Actions</button>
            )}
            {/* Delete is visible to superadmin only */}
            {isSuperadmin && (
              <button
                style={{padding:'4px 12px',fontSize:'0.9rem',width:'100%',background:'#f8d7da',color:'#a00',border:'1px solid #f5c2c7',marginBottom:12}}
                disabled={modalLoading}
                onClick={async () => {
                  setModalLoading(true);
                  for (const log of logs.filter(l => selected.includes(l.id))) {
                    try {
                      await fetch(`${API_URL}/api/audit_log/${log.id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ editor_user_id: user.user_id })
                      });
                    } catch (e) {
                      // Optionally handle error
                    }
                  }
                  // Refetch logs from backend after delete
                  fetch(`${API_URL}/api/audit_log`)
                    .then(res => res.json())
                    .then(data => {
                      setLogs(data.logs || []);
                      setSelected([]);
                    })
                    .finally(() => {
                      setModalLoading(false);
                      setModalOpen(false);
                    });
                }}
              >Delete Selected Logs</button>
            )}
            <button style={{padding:'2px 8px',fontSize:'0.8rem',width:'100%'}} onClick={()=>setModalOpen(false)} disabled={modalLoading}>Cancel</button>
          </div>
        </div>
      )}
      </div>
      <div className="log-table">
        {logs.length === 0 ? (
          <div style={{color:'#888', marginTop:24}}>No audit logs found.</div>
        ) : (
          logs.map(log => (
            <div className="log-card" key={log.id} style={{position:'relative', paddingRight:'32px'}}>
              <div style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
                <div><b>Type:</b> {log.entity_type}</div>
                <div><b>Entity ID:</b> {log.entity_id}</div>
                <div><b>Editor:</b> {log.editor_username || log.editor_user_id}</div>
                <div><b>Reason:</b> {log.reason}</div>
                <div><b>Timestamp:</b> {(() => {
                  const d = new Date(log.timestamp);
                  const dateStr = d.toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' });
                  const ms = String(d.getMilliseconds()).padStart(3, '0');
                  return `${dateStr}.${ms}`;
                })()}</div>
                <div><b>Source:</b> {log.source || <span style={{color:'#888'}}>N/A</span>}</div>
                <div><b>Changes:</b> <pre>{typeof log.changes === 'object' ? JSON.stringify(log.changes, null, 2) : String(log.changes)}</pre></div>
                {log.previous && (
                  <div><b>Previous:</b> <pre>{typeof log.previous === 'object' ? JSON.stringify(log.previous, null, 2) : String(log.previous)}</pre></div>
                )}
                {log.entity_type === 'shift' && (
                  <button disabled={!!undoing[log.id]} onClick={() => handleUndo(log)}>
                    {undoing[log.id] ? 'Undoing...' : 'Undo'}
                  </button>
                )}
              </div>
              <input
                type="checkbox"
                checked={selected.includes(log.id)}
                onChange={() => handleSelect(log.id)}
                style={{position:'absolute', top:'50%', right:'12px', transform:'translateY(-50%)'}}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LogPage;
