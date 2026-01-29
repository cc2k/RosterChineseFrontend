
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserEditPopup from '../components/UserEditPopup';
import UserDeletePopup from '../components/UserDeletePopup';
import AddUserPopup from '../components/AddUserPopup';
import UserShiftsPopup from '../components/UserShiftsPopup';
import UserCard from '../components/UserCard';
import { hasRequiredRole } from '../utils/roleUtils';
export default function UserPage() {
  const { isLoggedIn, roles } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || '';
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [addUserPopup, setAddUserPopup] = useState(false);
  const [shiftsUser, setShiftsUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  console.log('UserPage roles:', roles);

  const roleHierarchy = ['user', 'test', 'admin', 'superadmin'];
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/users' } });
      return;
    }
    setCheckingAuth(false);
    console.log('[UserPage] Checking roles for user list:', roles);
    if (roles.includes('admin') || roles.includes('superadmin')) {
      fetch(`${API_URL}/api/users`)
        .then(res => res.json())
        .then(data => {
          console.log('[UserPage] Users fetched from database:', data);
          setUsers(data);
        })
        .catch(() => setUsers([]));
    }
  }, [isLoggedIn, roles, navigate, API_URL]);


  const handleSaveEdit = async (updatedUser) => {
    // TODO: Implement API call to update user
    setEditUser(null);
    // Optionally refetch users
  };

  const handleAddUser = async (newUser) => {
    try {
      // Create user first
      const userRes = await fetch(`${API_URL}/api/users`, {
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
        await fetch(`${API_URL}/api/user_roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userData.user_id, role_id })
        });
      }
      // Refetch users after adding
      const res = await fetch(`${API_URL}/api/users`);
      const updatedUsers = await res.json();
      setUsers(updatedUsers);
    } catch (err) {
      // Optionally show error
    }
    setAddUserPopup(false);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE'
      });
      // Refetch users after deleting
      const res = await fetch(`${API_URL}/api/users`);
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

  // Minimum required role for this page
  const requiredRole = 'admin';
  // Find highest role of current user
  const userHighestRole = roles && roles.length > 0
    ? roleHierarchy.reduce((highest, role) => roles.includes(role) && roleHierarchy.indexOf(role) > roleHierarchy.indexOf(highest) ? role : highest, roles[0])
    : null;
  if (!userHighestRole || roleHierarchy.indexOf(userHighestRole) < roleHierarchy.indexOf(requiredRole)) {
    return <div className="userpage-container"><h2>Access denied. Admins only.</h2></div>;
  }

  // Get all unique roles for filter dropdown, hide 'superadmin' unless user is superadmin
  let allRoles = Array.from(new Set(users.flatMap(u => Array.isArray(u.roles) ? u.roles : [])));
  if (!roles.includes('superadmin')) {
    allRoles = allRoles.filter(role => role !== 'superadmin');
  }

  // Filter users by search and role
  const filteredUsers = users.filter(user => {
    const nameMatch =
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.name?.toLowerCase().includes(search.toLowerCase());
    const roleMatch =
      !roleFilter || (Array.isArray(user.roles) && user.roles.includes(roleFilter));
    return nameMatch && roleMatch;
  });

  return (
    <div className="userpage-container">
      <h2 className="userpage-title">All Users</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #bbb', fontSize: '1rem', minWidth: 180 }}
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #bbb', fontSize: '1rem', minWidth: 120 }}
        >
          <option value="">All Roles</option>
          {allRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
      <div className="user-cards-list">
        {filteredUsers.map(user => (
          <UserCard
            key={user.user_id}
            user={user}
            roles={roles}
            onEdit={setEditUser}
            onDelete={setDeleteUser}
            onShowShifts={setShiftsUser}
          />
        ))}
      </div>
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
