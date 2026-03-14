import React, { useState, useEffect, useMemo } from 'react';
import { Users, CheckCircle2, AlertCircle, MessageCircle, Loader2, Activity, Search, Filter, Mail, FileText, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New State Hooks for Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const fetchVolunteers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.get('/admin/volunteers');
      setVolunteers(data);
    } catch (err) {
      setError(err.message || 'Failed to load volunteers. Please ensure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const generateWhatsAppLink = (phone) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await apiClient.delete(`/admin/volunteers/${id}`);
        setVolunteers(prev => prev.filter(v => v.id !== id));
      } catch (err) {
        setError(err.message || 'Failed to delete volunteer.');
      }
    }
  };

  const handleEdit = (volunteer) => {
    // Pass the volunteer data to the form via routing state
    navigate(`/edit/${volunteer.id}`, { state: { volunteer } });
  };

  // Dynamically extract unique values for filters
  const uniqueSkills = useMemo(() => {
    const skills = new Set();
    volunteers.forEach(v => {
      v.skills?.forEach(s => skills.add(s.name));
    });
    return Array.from(skills).sort();
  }, [volunteers]);

  const uniqueAvailabilities = useMemo(() => {
    const availabilities = new Set();
    volunteers.forEach(v => {
      v.availabilities?.forEach(a => availabilities.add(`${a.day_of_week} ${a.time_of_day}`));
    });
    return Array.from(availabilities).sort();
  }, [volunteers]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set();
    volunteers.forEach(v => {
      if (v.target_role) roles.add(v.target_role);
    });
    return Array.from(roles).sort();
  }, [volunteers]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set();
    volunteers.forEach(v => {
      if (v.location) locations.add(v.location);
    });
    return Array.from(locations).sort();
  }, [volunteers]);

  // Client-Side Filtering Logic
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(v => {
      // 1. Search Query Match (Name or Email)
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = `${v.first_name} ${v.last_name}`.toLowerCase().includes(searchLower);
      const emailMatch = (v.email || '').toLowerCase().includes(searchLower);
      const matchesSearch = !searchQuery || nameMatch || emailMatch;

      // 2. Skill Match
      const matchesSkill = !selectedSkill || v.skills?.some(s => s.name === selectedSkill);

      // 3. Availability Match
      const matchesAvailability = !selectedAvailability || v.availabilities?.some(a => 
        `${a.day_of_week} ${a.time_of_day}` === selectedAvailability
      );

      // 4. Role Match
      const matchesRole = !selectedRole || v.target_role === selectedRole;

      // 5. Location Match
      const matchesLocation = !selectedLocation || v.location === selectedLocation;

      return matchesSearch && matchesSkill && matchesAvailability && matchesRole && matchesLocation;
    });
  }, [volunteers, searchQuery, selectedSkill, selectedAvailability, selectedRole, selectedLocation]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Organizer Command Center
          </h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-emerald-400">System Online</span>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-[0_0_30px_-15px_rgba(6,182,212,0.15)] hover:border-slate-700 transition-colors">
            <div className="p-4 bg-cyan-500/10 rounded-xl">
              <Users className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Volunteers</p>
              <p className="text-3xl font-bold text-slate-100">{loading ? '-' : volunteers.length}</p>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-[0_0_30px_-15px_rgba(99,102,241,0.15)] hover:border-slate-700 transition-colors">
            <div className="p-4 bg-indigo-500/10 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Roles Filled</p>
              <p className="text-3xl font-bold text-slate-100">89%</p>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-[0_0_30px_-15px_rgba(245,158,11,0.15)] hover:border-slate-700 transition-colors">
            <div className="p-4 bg-amber-500/10 rounded-xl">
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Pending Matches</p>
              <p className="text-3xl font-bold text-slate-100">12</p>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
            <h2 className="text-xl font-semibold text-slate-200">Volunteer Directory</h2>
            <span className="text-sm text-slate-400">Showing {filteredVolunteers.length} of {volunteers.length}</span>
          </div>
          
          {/* The Control Bar (New UI) */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 shadow-lg">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[250px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-xl leading-5 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
              />
            </div>

            {/* Role Filter */}
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-500" />
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-slate-700 rounded-xl leading-5 bg-slate-950 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm appearance-none cursor-pointer transition-all"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-500" />
              </div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-slate-700 rounded-xl leading-5 bg-slate-950 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm appearance-none cursor-pointer transition-all"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Skill Filter */}
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-500" />
              </div>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-slate-700 rounded-xl leading-5 bg-slate-950 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm appearance-none cursor-pointer transition-all"
              >
                <option value="">All Skills</option>
                {uniqueSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-500" />
              </div>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-slate-700 rounded-xl leading-5 bg-slate-950 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm appearance-none cursor-pointer transition-all"
              >
                <option value="">Any Availability</option>
                {uniqueAvailabilities.map(avail => (
                  <option key={avail} value={avail}>{avail}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-cyan-500" />
                <p className="text-lg font-medium">Decrypting volunteer data...</p>
              </div>
            ) : filteredVolunteers.length === 0 ? (
              <div className="text-center py-32 text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No matches found.</p>
                <p className="text-sm mt-2 text-slate-500">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-sm tracking-wide">
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Role & Location</th>
                      <th className="px-6 py-4 font-medium">Contact Info</th>
                      <th className="px-6 py-4 font-medium">Skills</th>
                      <th className="px-6 py-4 font-medium">Availability</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredVolunteers.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-800/40 transition-colors duration-200 group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-200">{v.first_name} {v.last_name}</div>
                          <div className="text-xs text-slate-500 mt-1">ID: #{v.id.toString().padStart(4, '0')}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-cyan-400">{v.target_role || 'Not specified'}</div>
                          <div className="text-sm text-slate-400 mt-1">{v.location || 'Any location'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-300">{v.email}</div>
                          <div className="text-sm text-slate-400 mt-1">{v.phone || 'No phone provided'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2 max-w-[200px]">
                            {v.skills && v.skills.length > 0 ? (
                              v.skills.map(skill => (
                                <span key={skill.id} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium rounded-full">
                                  {skill.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-600 text-sm italic">None listed</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2 max-w-[200px]">
                            {v.availabilities && v.availabilities.length > 0 ? (
                              v.availabilities.map(a => (
                                <span key={a.id} className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium rounded-full">
                                  {a.day_of_week.substring(0, 3)} {a.time_of_day}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-600 text-sm italic">Not set</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(v)}
                              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all duration-300"
                              title="Edit Volunteer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(v.id, `${v.first_name} ${v.last_name}`)}
                              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
                              title="Delete Volunteer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="w-px h-6 bg-slate-800 mx-1"></div>
                            {v.cv_url && (
                              <a 
                                href={v.cv_url}
                                download={`CV_${v.first_name}_${v.last_name}.pdf`}
                                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all duration-300"
                                title="Download CV"
                              >
                                <FileText className="w-5 h-5" />
                              </a>
                            )}
                            {v.email && (
                              <a 
                                href={`mailto:${v.email}`}
                                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all duration-300"
                                title="Send Email"
                              >
                                <Mail className="w-5 h-5" />
                              </a>
                            )}
                            {v.phone && (
                              <a 
                                href={generateWhatsAppLink(v.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Contact
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
