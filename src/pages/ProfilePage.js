import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../css/ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editFirstname, setEditFirstname] = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelephone, setEditTelephone] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    if (user) {
      fetch(`/api/users/${user.user_id}`)
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          setEditUsername(data.username || '');
          setEditFirstname(data.firstname || '');
          setEditSurname(data.surname || '');
          setEditEmail(data.email || '');
          setEditTelephone(data.telephone || '');
        });
    }
  }, [user]);
  const handleProfileChange = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    if (!editUsername) {
      setProfileMsg('Username is required.');
      return;
    }
    try {
      const res = await fetch(`/api/users/${user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editUsername,
          firstname: editFirstname,
          surname: editSurname,
          email: editEmail,
          telephone: editTelephone
        })
      });
      if (res.ok) {
        setProfile({
          ...profile,
          username: editUsername,
          firstname: editFirstname,
          surname: editSurname,
          email: editEmail,
          telephone: editTelephone
        });
        setProfileMsg('Profile updated!');
      } else {
        setProfileMsg('Failed to update profile.');
      }
    } catch {
      setProfileMsg('Server error.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match.');
      return;
    }
    try {
      const res = await fetch('/api/change_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMsg('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg(data.error || 'Password change failed.');
      }
    } catch (err) {
      setPasswordMsg('Server error.');
    }
  };

  if (!user) return <div>Please log in to view your profile.</div>;
  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="profile-info">
        <form onSubmit={handleProfileChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <label htmlFor="edit-username"><strong>Username:</strong></label>
          <input id="edit-username" type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder="N/A" style={{ maxWidth: '300px', padding: '6px', fontSize: '1rem' }} />
          <label htmlFor="edit-firstname"><strong>First Name:</strong></label>
          <input id="edit-firstname" type="text" value={editFirstname} onChange={e => setEditFirstname(e.target.value)} placeholder="N/A" style={{ maxWidth: '300px', padding: '6px', fontSize: '1rem' }} />
          <label htmlFor="edit-surname"><strong>Surname:</strong></label>
          <input id="edit-surname" type="text" value={editSurname} onChange={e => setEditSurname(e.target.value)} placeholder="N/A" style={{ maxWidth: '300px', padding: '6px', fontSize: '1rem' }} />
          <label htmlFor="edit-email"><strong>Email:</strong></label>
          <input id="edit-email" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="N/A" style={{ maxWidth: '300px', padding: '6px', fontSize: '1rem' }} />
          <label htmlFor="edit-telephone"><strong>Telephone:</strong></label>
          <input id="edit-telephone" type="text" value={editTelephone} onChange={e => setEditTelephone(e.target.value)} placeholder="N/A" style={{ maxWidth: '300px', padding: '6px', fontSize: '1rem' }} />
          <button type="submit" style={{ marginTop: '1rem', padding: '8px 24px', fontSize: '1rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', maxWidth: '180px' }}>Save Changes</button>
        </form>
        {profileMsg && <div className="profile-msg">{profileMsg}</div>}
        <p><strong>Roles:</strong> {profile.roles && profile.roles.length > 0 ? profile.roles.join(', ') : 'N/A'}</p>
      </div>
      <div className="profile-password-box">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordChange}>
          <div>
            <label>Current Password:</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <label>New Password:</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div>
            <label>Confirm New Password:</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          <button type="submit">Change Password</button>
        </form>
        {passwordMsg && <div className="password-msg">{passwordMsg}</div>}
      </div>
    </div>
  );
};

export default ProfilePage;
