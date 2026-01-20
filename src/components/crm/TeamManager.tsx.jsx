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
    password: '', 
    role: 'estimator' 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      setUserProfile(user);
      
      if (user?.company_id) {
        await fetchTeam(user.company_id);
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
      console.error('Team fetch error:', err);
      setTeam([]);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Invite user via Base44
      await base44.users.inviteUser(newUser.email, 'user');

      // Wait for user creation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update the newly created user
      const allUsers = await base44.entities.User.list();
      const newlyCreatedUser = allUsers.find(u => u.email === newUser.email);
      
      if (newlyCreatedUser) {
        await base44.entities.User.update(newlyCreatedUser.id, {
          full_name: newUser.name,
          company_id: userProfile.company_id,
          company_name: userProfile.company_name,
          aroof_role: newUser.role,
          is_company_owner: false
        });
      }

      alert(`SUCCESS! User Created.\n\nEmail: ${newUser.email}\n\nThey will receive an email to set their password.`);
      
      setNewUser({ name: '', email: '', password: '', role: 'estimator' });
      await fetchTeam(userProfile.company_id);

    } catch (err) {
      alert('Error: ' + (err.message || 'Email may already exist'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(createPageUrl('RooferDashboard'))}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-2xl font-bold mb-4">Add Team Member</h2>
          
          <form onSubmit={handleCreateUser} className="space-y-4 mb-8 bg-gray-50 p-4 rounded border">
            <div className="grid grid-cols-2 gap-4">
              <input 
                className="p-2 border rounded" 
                placeholder="Full Name" 
                required 
                value={newUser.name} 
                onChange={e => setNewUser({...newUser, name: e.target.value})} 
              />
              <select 
                className="p-2 border rounded" 
                value={newUser.role} 
                onChange={e => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="estimator">Estimator</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="crew">Crew Lead</option>
                <option value="external_roofer">Roofer</option>
              </select>
            </div>
            <div>
              <input 
                className="w-full p-2 border-2 border-blue-300 rounded" 
                placeholder="Email (Username)" 
                required 
                type="email"
                value={newUser.email} 
                onChange={e => setNewUser({...newUser, email: e.target.value})} 
              />
              <p className="text-xs text-gray-500 mt-1">User will receive email to set password</p>
            </div>
            <button 
              disabled={loading} 
              className="w-full bg-blue-600 text-white font-bold p-3 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Employee Account'}
            </button>
          </form>

          <h3 className="font-bold text-lg mb-4">My Team</h3>
          {team.length === 0 ? (
            <p className="text-gray-500">No employees found.</p>
          ) : (
            <ul className="space-y-2">
              {team.map(m => (
                <li key={m.id} className="flex justify-between p-3 border rounded bg-white">
                  <span>
                    {m.full_name || 'Unnamed'} 
                    <span className="text-gray-400"> ({m.email})</span>
                  </span>
                  <span className="uppercase text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">
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