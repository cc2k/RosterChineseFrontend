import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/FeedbackPage.css';

const FeedbackPage = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true, state: { from: '/feedback' } });
    }
  }, [isLoggedIn, navigate]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  // Determine default name: use first+last, or username if missing
  const getDefaultName = () => {
    if (!user) return '';
    const first = user.firstname || '';
    const last = user.surname || '';
    if (first.trim() || last.trim()) {
      return `${first}${first && last ? ' ' : ''}${last}`.trim();
    }
    return user.username || '';
  };
  const [name, setName] = useState(getDefaultName());
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState('');
  // Update name if user changes (e.g., on login/logout)
  useEffect(() => {
    setName(getDefaultName());
    // eslint-disable-next-line
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!anonymous && name.trim() === '') {
      setError('Please enter your name or check Anonymous.');
      return;
    }
    setError('');
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${apiUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          description,
          name: anonymous ? 'Anonymous' : name,
          anonymous,
          user_id: anonymous ? null : (user && user.user_id)
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Feedback submitted!');
        setSubject('');
        setDescription('');
        setName(getDefaultName());
        setAnonymous(false);
      } else {
        setError(data.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setError('Server error.');
    }
  };

  return (
    <div className="feedback-container">
      <h2>Feedback</h2>
      <form className="feedback-form" onSubmit={handleSubmit}>
  <label>Subject: <span style={{fontWeight: 'normal', color: '#888', fontSize: '0.95em'}}>(optional)</span></label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
        <label>Description:</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={anonymous}
        />
        <div className="anonymous-checkbox">
          <label>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={e => setAnonymous(e.target.checked)}
            />{' '}
            Submit as Anonymous
            <span style={{ marginLeft: 8, fontSize: '0.95em', color: '#555' }}>
              (Selecting this, means your username will not be saved in the database)
            </span>
          </label>
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default FeedbackPage;
