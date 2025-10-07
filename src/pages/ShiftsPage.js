import React, { useEffect, useState, useMemo } from 'react';
import AddShiftModal from '../components/AddShiftModal';
import EditShiftModal from '../components/EditShiftModal';
import ShiftCard from '../components/ShiftCard';
import { hasRequiredRole } from '../utils/roleUtils';
// import { useAuth } from '../context/AuthContext'; // Removed unused import
import '../css/ShiftsPage.css';


export default function ShiftsPage() {
  console.log('[ShiftsPage] Render start');
  // Track if initial page has been set
  const initialPageSet = React.useRef(false);
  // State declarations (must be first)
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  // const [allRoles, setAllRoles] = useState([]); // Removed unused variable
  const { roles } = require('../context/AuthContext').useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editShift, setEditShift] = useState(null); // shift object or null

  // Pagination state, remembered in sessionStorage
  const getCurrentMonthPage = (allYearMonths) => {
    const now = new Date();
    const currentYM = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const idx = allYearMonths.findIndex(m => m === currentYM);
    return idx === -1 ? 0 : Math.floor(idx / monthsPerPage);
  };
  const monthsPerPage = 2;
  const [page, setPageRaw] = useState(() => {
    const saved = sessionStorage.getItem('shiftsPage');
    return saved ? Number(saved) : 0;
  });
  // Helper to set page and save to sessionStorage
  const setPage = (p) => {
    sessionStorage.setItem('shiftsPage', p);
    setPageRaw(p);
  };
  // Get all unique year-month pairs from shifts
  const allYearMonths = useMemo(() => {
  console.log('[ShiftsPage] useMemo allYearMonths - shifts:', shifts);
    const pairs = shifts.map(s => {
      const d = new Date(s.start_date);
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    });
    const result = Array.from(new Set(pairs)).sort();
    console.log('[ShiftsPage] allYearMonths:', result, 'shifts:', shifts);
    return result;
  }, [shifts]);
  const totalPages = Math.ceil(allYearMonths.length / monthsPerPage);
  console.log('[ShiftsPage] totalPages:', totalPages, 'allYearMonths.length:', allYearMonths.length, 'monthsPerPage:', monthsPerPage);
  // Calculate currentMonths before useEffect
  // Use page directly, only correct it in useEffect
  const currentMonths = useMemo(() => {
  console.log('[ShiftsPage] useMemo currentMonths - page:', page, 'allYearMonths:', allYearMonths);
    if (allYearMonths.length > 0) {
      return allYearMonths.slice(page * monthsPerPage, (page + 1) * monthsPerPage);
    }
    return [];
  }, [allYearMonths, page, monthsPerPage]);
  console.log('[ShiftsPage] currentMonths:', currentMonths, 'page:', page, 'monthsPerPage:', monthsPerPage);

  // Only restore saved page or set current month once after data loads
  React.useEffect(() => {
  console.log('[ShiftsPage] useEffect page init - initialPageSet:', initialPageSet.current, 'shifts.length:', shifts.length, 'allYearMonths.length:', allYearMonths.length, 'totalPages:', totalPages);
    // Only run when shifts and months are loaded and valid
    if (!initialPageSet.current && shifts.length > 0 && allYearMonths.length > 0) {
  console.log('[ShiftsPage] Initializing page');
  console.log('[ShiftsPage] sessionStorage.shiftsPage:', sessionStorage.getItem('shiftsPage'));
      let savedPage = sessionStorage.getItem('shiftsPage');
      let pageNum = savedPage !== null ? Number(savedPage) : null;
      // If saved page is invalid, set to current month page
      if (pageNum === null || isNaN(pageNum) || pageNum < 0 || pageNum >= totalPages) {
  console.log('[ShiftsPage] Saved page invalid, using currentMonthPage');
        const currentMonthPage = getCurrentMonthPage(allYearMonths);
        setPage(currentMonthPage);
  console.log('[ShiftsPage] setPage(currentMonthPage):', currentMonthPage);
      } else {
  console.log('[ShiftsPage] setPage(saved pageNum):', pageNum);
        setPage(pageNum);
      }
      initialPageSet.current = true;
  console.log('[ShiftsPage] initialPageSet set TRUE');
    }
  }, [shifts.length, allYearMonths, totalPages]);

  // Only show shifts for the current page's months
  const pagedShifts = useMemo(() => {
  console.log('[ShiftsPage] useMemo pagedShifts - currentMonths:', currentMonths, 'shifts:', shifts);
    const filtered = shifts.filter(shift => {
      const d = new Date(shift.start_date);
      const ym = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      return currentMonths.includes(ym);
    });
    console.log('[ShiftsPage] pagedShifts:', filtered);
    return filtered;
  }, [shifts, currentMonths]);
  // Memoize grouped shifts by week, move getWeekNumber inside useMemo to avoid dependency warning
  const grouped = useMemo(() => {
  console.log('[ShiftsPage] useMemo grouped - pagedShifts:', pagedShifts);
    function getWeekNumber(dateStr) {
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return weekNo;
    }
    const groups = {};
    pagedShifts.forEach(shift => {
      const week = getWeekNumber(shift.start_date);
      const year = new Date(shift.start_date).getFullYear();
      const key = `${year}-W${week}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(shift);
    });
    console.log('[ShiftsPage] grouped:', groups);
    return groups;
  }, [pagedShifts]);

  async function handleUnassign(shift_id) {
  console.log('[ShiftsPage] handleUnassign called for shift_id:', shift_id);
    setAssigning(a => ({ ...a, [shift_id]: true }));
    try {
  // Debug log: show API URL and browser origin
  // console.log('Unassigning shift:', { shift_id });
  // console.log('window.location.origin:', window.location.origin);
  // console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${apiUrl}/api/shifts/${shift_id}/unassign`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to unassign user');
      // Refresh shifts
      const res2 = await fetch(`${apiUrl}/api/shifts`);
      const data2 = await res2.json();
      setShifts(data2.shifts || data2);
    } catch (err) {
      alert(err.message);
    } finally {
      setAssigning(a => ({ ...a, [shift_id]: false }));
    }
  }



  async function handleAddShift(newShift) {
  console.log('[ShiftsPage] handleAddShift called for newShift:', newShift);
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShift)
      });
      if (!res.ok) throw new Error('Failed to create shift');
      setShowAddModal(false);
      const res2 = await fetch('/api/shifts');
      const data2 = await res2.json();
      setShifts(data2.shifts || data2);
    } catch (err) {
      alert(err.message);
    }
  }

  function formatDate(dateStr) {
  // console.log('[ShiftsPage] formatDate called for:', dateStr);
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatTime(timeStr) {
  // console.log('[ShiftsPage] formatTime called for:', timeStr);
    if (!timeStr) return '';
    // Handles HH:MM:SS or HH:MM
    return timeStr.slice(0,5);
  }

  useEffect(() => {
  console.log('[ShiftsPage] useEffect fetchAll called');
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [shiftsRes, usersRes, rolesRes] = await Promise.all([
          fetch('/api/shifts'),
          fetch('/api/users'),
          fetch('/api/roles')
        ]);
        if (!shiftsRes.ok) throw new Error('Failed to fetch shifts');
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        if (!rolesRes.ok) throw new Error('Failed to fetch roles');
    const shiftsData = await shiftsRes.json();
    const usersData = await usersRes.json();
  // const rolesData = await rolesRes.json(); // Removed unused variable
    setShifts(shiftsData.shifts || shiftsData);
    setUsers(usersData.users || usersData);
  // setAllRoles(rolesData.roles || rolesData); // Removed unused setter
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Handler to assign a user to a shift
  async function handleAssign(shift_id, user_id) {
  console.log('[ShiftsPage] handleAssign called for shift_id:', shift_id, 'user_id:', user_id);
    setAssigning(a => ({ ...a, [shift_id]: true }));
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${apiUrl}/api/shifts/${shift_id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id })
      });
      if (!res.ok) throw new Error('Failed to assign user');
      // Refresh shifts
      const res2 = await fetch(`${apiUrl}/api/shifts`);
      const data2 = await res2.json();
      setShifts(data2.shifts || data2);
    } catch (err) {
      alert(err.message);
    } finally {
      setAssigning(a => ({ ...a, [shift_id]: false }));
    }
  }

  // Handler to delete a shift
  async function handleDeleteShift(shift_id) {
  console.log('[ShiftsPage] handleDeleteShift called for shift_id:', shift_id);
    if (!window.confirm('Are you sure you want to delete this shift?')) return;
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${apiUrl}/api/shifts/${shift_id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete shift');
      // Refresh shifts
      const res2 = await fetch(`${apiUrl}/api/shifts`);
      const data2 = await res2.json();
      setShifts(data2.shifts || data2);
    } catch (err) {
      alert(err.message);
    }
  }

  // Main render
  return (
    <div className="shifts-page">
      {/* Pagination controls */}
      <div className="shifts-pagination-row">
        <button
          className="pagination-btn"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          Prev
        </button>
        <span className="pagination-label">
          {currentMonths.map(m => {
            const [year, month] = m.split('-');
            return `${month}/${year}`;
          }).join(' & ')}
        </span>
        <button
          className="pagination-btn"
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
        >
          Next
        </button>
      </div>

      {loading && <p>Loading shifts...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && (
        <div className="shifts-cards-wrapper">
          {Object.keys(grouped).length === 0 ? (
            <div className="no-shifts">No shifts found.</div>
          ) : (
            Object.entries(grouped).map(([weekKey, weekShifts]) => {
              const [year, week] = weekKey.split('-W');
              return (
                <div key={weekKey} className="shifts-week-group">
                  <div className="shifts-week-label week-border">
                    Week {week}, {year}
                  </div>
                  {weekShifts.map((shift, idx) => (
                    <ShiftCard key={`shift-${shift.shift_id}-${idx}`}>
                      <div className="shifts-card-row">
                        <div className="shifts-card-main">
                          <div><strong>Name:</strong> {shift.assigned_username || 'None'}</div>
                          <div><strong>Start Date:</strong> {formatDate(shift.start_date)} {formatTime(shift.start_time)}</div>
                          <div><strong>End Date:</strong> {formatDate(shift.end_date)} {formatTime(shift.end_time)}</div>
                          <div><strong>Role:</strong> {shift.role_name || shift.role_id}</div>
                          <div><strong>Status:</strong> <span className={shift.assigned_user_id ? 'filled-status' : 'vacant-status'}>{shift.assigned_user_id ? 'Filled' : 'Vacant'}</span></div>
                        </div>
                        <div className="shifts-card-admin">
                          {hasRequiredRole(roles, 'admin') && (
                            <>
                              {shift.assigned_user_id ? (
                                <button
                                  className="unassign-btn"
                                  disabled={assigning[shift.shift_id]}
                                  onClick={() => handleUnassign(shift.shift_id)}
                                >Unassign</button>
                              ) : (
                                <select
                                  className="assign-select"
                                  value=""
                                  disabled={assigning[shift.shift_id]}
                                  onChange={e => {
                                    if (e.target.value) handleAssign(shift.shift_id, e.target.value);
                                  }}
                                >
                                  <option value="">Assign user...</option>
                                  {users.map(user => (
                                    <option key={`user-${user.user_id}`} value={user.user_id}>{user.username}</option>
                                  ))}
                                </select>
                              )}
                              <button
                                className="edit-btn"
                                onClick={() => setEditShift(shift)}
                              >Edit</button>
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteShift(shift.shift_id)}
                              >Delete</button>
                            </>
                          )}
                        </div>
                      </div>
                    </ShiftCard>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
      {showAddModal && <AddShiftModal onClose={() => setShowAddModal(false)} onAdd={handleAddShift} />}
      {editShift && (
        <EditShiftModal
          shift={editShift}
          onClose={() => setEditShift(null)}
          onSave={async updatedShift => {
            try {
              const res = await fetch(`/api/shifts/${updatedShift.shift_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedShift)
              });
              if (!res.ok) throw new Error('Failed to update shift');
              setEditShift(null);
              const res2 = await fetch('/api/shifts');
              const data2 = await res2.json();
              setShifts(data2.shifts || data2);
            } catch (err) {
              alert(err.message);
            }
          }}
        />
      )}
    </div>
  );
}
