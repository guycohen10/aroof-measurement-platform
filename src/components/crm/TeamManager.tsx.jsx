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
      console.error('Fetch error:', err);
      setTeam([]);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.users.inviteUser(newUser.email, 'user');
      await new Promise(resolve => setTimeout(resolve, 1500));

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

      alert(`SUCCESS! User Created.\n\nEmail: ${newUser.email}\n\nThey will receive an invitation email.`);
      setNewUser({ name: '', email: '', role: 'estimator' });
      fetchTeam(userProfile.company_id);
    } catch (err) {
      alert('Error: ' + (err.message || 'Failed to create user'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(createPageUrl('RooferDashboard'))}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium text-lg"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Team Management</h2>
          
          <form onSubmit={handleCreateUser} className="mb-10 p-6 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="font-bold text-lg mb-4 text-blue-900">Add New Employee</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input 
                className="p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Full Name" 
                required 
                value={newUser.name} 
                onChange={e => setNewUser({...newUser, name: e.target.value})} 
              />
              <select 
                className="p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
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
                className="w-full p-3 border-2 border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Email (Login Username)" 
                required 
                type="email"
                value={newUser.email} 
                onChange={e => setNewUser({...newUser, email: e.target.value})} 
              />
              <p className="text-xs text-gray-500 mt-1">User will receive invitation email</p>
            </div>
            <button 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Employee Account'}
            </button>
          </form>

          <h3 className="font-bold text-lg mb-4 border-b pb-2">Current Team</h3>
          {team.length === 0 ? (
            <p className="text-gray-500 italic">No employees found.</p>
          ) : (
            <ul className="space-y-3">
              {team.map(m => (
                <li key={m.id} className="flex justify-between items-center p-4 border rounded hover:bg-gray-50 transition">
                  <div>
                    <p className="font-bold text-gray-800">{m.full_name || 'Unnamed'}</p>
                    <p className="text-sm text-gray-500">{m.email}</p>
                  </div>
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
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