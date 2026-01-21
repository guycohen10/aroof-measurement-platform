import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";

export default function TeamManager() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    role: 'estimator' 
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      setUserProfile(user);
      
      if (user?.company_id) {
        fetchTeam(user.company_id);
      }
    } catch (err) {
      console.error('Load error:', err);
    }
  };

  const fetchTeam = async (companyId) => {
    try {
      const allUsers = await base44.entities.User.list();
      const companyTeam = allUsers.filter(u => u.company_id === companyId);
      setTeam(companyTeam || []);
    } catch (err) {
      console.warn("Team fetch restricted:", err);
      setTeam([]);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Use Base44's native invite function
      await base44.users.inviteUser(newUser.email, 'user');
      
      // Update the invited user's profile with additional details
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const allUsers = await base44.entities.User.list();
      const invitedUser = allUsers.find(u => u.email === newUser.email);
      
      if (invitedUser) {
        await base44.entities.User.update(invitedUser.id, {
          full_name: newUser.name,
          company_id: userProfile.company_id,
          company_name: userProfile.company_name,
          aroof_role: newUser.role
        });
      }

      alert(`INVITE SENT!\n\nAn email has been sent to ${newUser.email}.\nThey will receive a link to set their password and join your team.`);
      setNewUser({ name: '', email: '', role: 'estimator' });
      fetchTeam(userProfile.company_id);
    } catch (err) {
      console.error("Invite Error:", err);
      setErrorMsg(err.message || "Failed to send invite. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigate(createPageUrl('RooferDashboard'));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* BACK BUTTON */}
        <button
          onClick={goBack}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold text-lg"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white p-8 rounded-lg shadow-md border">
          <h2 className="text-2xl font-bold mb-6">Manage Team</h2>
          
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error: </strong> {errorMsg}
            </div>
          )}
          
          <form onSubmit={handleInvite} className="mb-8 bg-blue-50 p-6 rounded border border-blue-100">
            <h3 className="font-bold text-lg mb-4 text-blue-900">Invite New Employee</h3>
            <p className="text-sm text-gray-600 mb-4">They will receive an email to set their own password</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input 
                className="p-3 border rounded w-full" 
                placeholder="Full Name" 
                required 
                value={newUser.name} 
                onChange={e => setNewUser({...newUser, name: e.target.value})} 
              />

              <select 
                className="p-3 border rounded w-full" 
                value={newUser.role} 
                onChange={e => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="estimator">Estimator</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="crew">Crew Lead</option>
                <option value="external_roofer">Roofer</option>
              </select>
            </div>
            <div className="mb-6">
              <input 
                className="p-3 border rounded w-full" 
                placeholder="Email Address" 
                required 
                type="email"
                value={newUser.email} 
                onChange={e => setNewUser({...newUser, email: e.target.value})} 
              />
            </div>
            <button 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded disabled:opacity-50"
            >
              {loading ? 'Sending Invite...' : 'Send Invite'}
            </button>
          </form>

          <h3 className="font-bold text-lg mb-2 border-b pb-2">Team List</h3>
          {team.length === 0 ? (
            <p className="text-gray-500">No employees found (or permission restricted).</p>
          ) : (
            <ul className="space-y-2">
              {team.map((m) => (
                <li key={m.id} className="p-3 border rounded bg-white flex justify-between items-center">
                  <div>
                    <p className="font-bold">{m.full_name || 'Unnamed'}</p>
                    <p className="text-sm text-gray-500">{m.email}</p>
                  </div>
                  <span className="uppercase text-xs bg-gray-200 px-2 py-1 rounded">
                    {m.aroof_role?.replace('_', ' ') || 'user'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}