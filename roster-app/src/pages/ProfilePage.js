import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../css/ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    if (user) {
      fetch(`/api/users/${user.user_id}`)
        .then(res => res.json())
        .then(data => setProfile(data));
    }
  }, [user]);

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
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
        <p><strong>Telephone:</strong> {profile.telephone || 'N/A'}</p>
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
