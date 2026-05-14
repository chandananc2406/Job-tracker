import React, { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app">
      <nav className="navbar">
        <h1>🎯 Job Tracker AI</h1>
        <div className="nav-links">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={activeTab === 'dashboard' ? 'active' : ''}>
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={activeTab === 'add' ? 'active' : ''}>
            Add Job
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={activeTab === 'ai' ? 'active' : ''}>
            AI Feedback
          </button>
        </div>
      </nav>

      <div className="content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'add' && <AddJob />}
        {activeTab === 'ai' && <AiFeedback />}
      </div>
    </div>
  );
}

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/applications/user/1');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      alert('Error fetching applications!');
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:8080/api/applications/${id}/status?status=${status}`, {
        method: 'PUT'
      });
      fetchApplications();
    } catch (error) {
      alert('Error updating status!');
    }
  };

  const deleteApplication = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/applications/${id}`, {
        method: 'DELETE'
      });
      fetchApplications();
    } catch (error) {
      alert('Error deleting application!');
    }
  };

  return (
    <div className="dashboard">
      <h2>My Job Applications</h2>
      {loading && <p>Loading...</p>}
      {applications.length === 0 && !loading && <p>No applications yet! Add one.</p>}
      <div className="cards">
        {applications.map(app => (
          <div key={app.id} className="card">
            <h3>{app.companyName}</h3>
            <p>Role: {app.jobRole}</p>
            <p>Location: {app.jobLocation}</p>
            <p>Applied: {app.appliedDate}</p>
            <p>Type: {app.jobType}</p>
            <div className="status-bar">
              <span className={`status ${app.status.toLowerCase()}`}>
                {app.status}
              </span>
            </div>
            <div className="actions">
              <select onChange={(e) => updateStatus(app.id, e.target.value)}
                defaultValue={app.status}>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button className="delete-btn"
                onClick={() => deleteApplication(app.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddJob() {
  const [form, setForm] = useState({
    companyName: '', jobRole: '', jobLocation: '',
    jobType: 'Full-time', appliedDate: '', status: 'Applied',
    notes: '', jobUrl: '', userId: 1
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/applications/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        setMessage('✅ Application added successfully!');
        setForm({ companyName: '', jobRole: '', jobLocation: '',
          jobType: 'Full-time', appliedDate: '', status: 'Applied',
          notes: '', jobUrl: '', userId: 1 });
      }
    } catch (error) {
      setMessage('❌ Error adding application!');
    }
  };

  return (
    <div className="add-job">
      <h2>Add New Job Application</h2>
      {message && <p className="message">{message}</p>}
      <div className="form">
        <input placeholder="Company Name" value={form.companyName}
          onChange={e => setForm({...form, companyName: e.target.value})} />
        <input placeholder="Job Role" value={form.jobRole}
          onChange={e => setForm({...form, jobRole: e.target.value})} />
        <input placeholder="Location" value={form.jobLocation}
          onChange={e => setForm({...form, jobLocation: e.target.value})} />
        <select value={form.jobType}
          onChange={e => setForm({...form, jobType: e.target.value})}>
          <option value="Full-time">Full-time</option>
          <option value="Internship">Internship</option>
          <option value="Contract">Contract</option>
        </select>
        <input type="date" value={form.appliedDate}
          onChange={e => setForm({...form, appliedDate: e.target.value})} />
        <input placeholder="Job URL" value={form.jobUrl}
          onChange={e => setForm({...form, jobUrl: e.target.value})} />
        <textarea placeholder="Notes" value={form.notes}
          onChange={e => setForm({...form, notes: e.target.value})} />
        <button onClick={handleSubmit}>Add Application</button>
      </div>
    </div>
  );
}

function AiFeedback() {
  const [resumeText, setResumeText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const getFeedback = async () => {
    setLoading(true);
    setFeedback('');
    try {
      const response = await fetch('http://localhost:8080/api/ai/resume-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      });
      const data = await response.text();
      setFeedback(data);
    } catch (error) {
      setFeedback('Error getting feedback!');
    }
    setLoading(false);
  };

  return (
    <div className="ai-feedback">
      <h2>🤖 AI Resume Feedback</h2>
      <p>Paste your resume text below and get AI powered feedback!</p>
      <textarea
        placeholder="Paste your resume text here..."
        value={resumeText}
        onChange={e => setResumeText(e.target.value)}
        rows={10} />
      <button onClick={getFeedback} disabled={loading}>
        {loading ? 'Analyzing...' : 'Get AI Feedback'}
      </button>
      {feedback && (
        <div className="feedback-result">
          <h3>Feedback:</h3>
          <pre>{feedback}</pre>
        </div>
      )}
    </div>
  );
}

export default App;