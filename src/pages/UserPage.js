
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserEditPopup from '../components/UserEditPopup';
import UserDeletePopup from '../components/UserDeletePopup';
import AddUserPopup from '../components/AddUserPopup';
import UserShiftsPopup from '../components/UserShiftsPopup';
import { hasRequiredRole } from '../utils/roleUtils';
import '../css/UserPage.css';

export default function UserPage() {
  const { isLoggedIn, roles } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [addUserPopup, setAddUserPopup] = useState(false);
  const [shiftsUser, setShiftsUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  console.log('UserPage roles:', roles);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/users' } });
      return;
    }
    setCheckingAuth(false);
    if (roles.includes('admin')) {
  fetch('/api/users')
        .then(res => res.json())
        .then(setUsers)
        .catch(() => setUsers([]));
    }
  }, [isLoggedIn, roles, navigate]);


  const handleSaveEdit = async (updatedUser) => {
    // TODO: Implement API call to update user
    setEditUser(null);
    // Optionally refetch users
  };

  const handleAddUser = async (newUser) => {
    try {
      // Create user first
  const userRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
          telephone: newUser.telephone,
          password_hash: '123pass456word'
        })
      });
      const userData = await userRes.json();
      // Add roles for user
      for (const role_id of newUser.roles) {
  await fetch('/api/user_roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userData.user_id, role_id })
        });
      }
      // Refetch users after adding
  const res = await fetch('/api/users');
      const updatedUsers = await res.json();
      setUsers(updatedUsers);
    } catch (err) {
      // Optionally show error
    }
    setAddUserPopup(false);
  };

  
  const handleDeleteUser = async (userId) => {
    try {
  await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      // Refetch users after deletion
  const res = await fetch('/api/users');
      const updatedUsers = await res.json();
      setUsers(updatedUsers);
    } catch (err) {
      // Optionally show error
    }
    setDeleteUser(null);
  };

  if (checkingAuth) {
    return <div className="userpage-container"><h2>Checking permissions...</h2></div>;
  }
  // Hierarchical role logic: superadmin > admin > test > user
  const roleHierarchy = ['user', 'test', 'admin', 'superadmin'];
  // Minimum required role for this page
  const requiredRole = 'admin';
  // Find highest role of current user
  const userHighestRole = roles && roles.length > 0
    ? roleHierarchy.reduce((highest, role) => roles.includes(role) && roleHierarchy.indexOf(role) > roleHierarchy.indexOf(highest) ? role : highest, roles[0])
    : null;
  if (!userHighestRole || roleHierarchy.indexOf(userHighestRole) < roleHierarchy.indexOf(requiredRole)) {
    return <div className="userpage-container"><h2>Access denied. Admins only.</h2></div>;
  }
  return (
    <div className="userpage-container">
      <h2 className="userpage-title">All Users</h2>
      <table className="userpage-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.user_id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{
                Array.isArray(user.roles)
                  ? [
                      ...(
                        user.roles.includes('user')
                          ? []
                          : user.roles.length > 0 ? ['user'] : []
                      ),
                      ...user.roles.filter(role => role !== 'superadmin' || (roles && roles.includes('superadmin')))
                    ].join(', ')
                  : user.roles || ''
              }</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ cursor: 'pointer', marginRight: 10 }} title="Edit Shifts" onClick={() => setShiftsUser(user)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#43a047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><circle cx="12" cy="16" r="2"/><path d="M12 14v2"/></svg>
                  </span>
                  {hasRequiredRole(roles, 'admin') && (
                    <>
                      <span style={{ cursor: 'pointer', marginRight: 10 }} title="Edit" onClick={() => setEditUser(user)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                      </span>
                      <span style={{ cursor: 'pointer', marginLeft: 'auto' }} title="Delete" onClick={() => setDeleteUser(user)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </span>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasRequiredRole(roles, 'admin') && (
        <button style={{ marginTop: '2rem', padding: '10px 24px', fontSize: '1.1rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setAddUserPopup(true)}>Add User</button>
      )}
      {addUserPopup && hasRequiredRole(roles, 'admin') && <AddUserPopup onClose={() => setAddUserPopup(false)} onAdd={handleAddUser} />}
      {editUser && hasRequiredRole(roles, 'admin') && <UserEditPopup user={editUser} onClose={() => setEditUser(null)} onSave={handleSaveEdit} />}
      {deleteUser && hasRequiredRole(roles, 'admin') && <UserDeletePopup user={deleteUser} onClose={() => setDeleteUser(null)} onDelete={handleDeleteUser} />}
      {shiftsUser && <UserShiftsPopup user={shiftsUser} onClose={() => setShiftsUser(null)} />}
    </div>
  );
}
