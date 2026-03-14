import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, MapPin, UploadCloud, FileText, Briefcase, Plus, Users, ArrowLeft } from 'lucide-react';
import { apiClient } from '../api/client';
import { useLocation, useNavigate } from 'react-router-dom';

const MOCK_SKILLS = [
  'Photography', 'Heavy Lifting', 'Data Entry', 'Social Media', 
  'Driving', 'Event Planning', 'First Aid', 'Public Speaking', 
  'Cooking', 'Translation'
];

const MOCK_ROLES = [
  'Event Support', 'Technical Mentor', 'Administrative Assistant', 
  'Content Creator', 'Logistics Coordinator'
];

const MOCK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MOCK_TIMES = ['Morning', 'Afternoon', 'Evening'];

export default function IntakeForm({ isEditMode = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const editData = location.state?.volunteer;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    target_role: '',
    location: '',
    cv_url: ''
  });
  
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [selectedAvailabilities, setSelectedAvailabilities] = useState([]);
  
  const [skills, setSkills] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Mock CV Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);

  // Initialize form with edit data if in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setFormData({
        first_name: editData.first_name || '',
        last_name: editData.last_name || '',
        email: editData.email || '',
        phone: editData.phone || '',
        target_role: editData.target_role || '',
        location: editData.location || '',
        cv_url: editData.cv_url || ''
      });
      
      if (editData.skills) {
        setSelectedSkills(editData.skills.map(s => s.name));
      }
      
      if (editData.availabilities) {
        setSelectedAvailabilities(editData.availabilities.map(a => ({
          id: `${a.day_of_week}-${a.time_of_day}`,
          day_of_week: a.day_of_week,
          time_of_day: a.time_of_day
        })));
      }
    }
  }, [isEditMode, editData]);

  useEffect(() => {
    // Simulate fetching dynamic data from API
    const fetchData = async () => {
      try {
        setTimeout(() => {
          setSkills(MOCK_SKILLS);
          setLoadingData(false);
        }, 500);
      } catch (err) {
        console.error(err);
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, target_role: role }));
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleCustomSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      addCustomSkill();
    }
  };

  const toggleAvailability = (day, time) => {
    const id = `${day}-${time}`;
    setSelectedAvailabilities(prev => {
      const exists = prev.find(a => a.id === id);
      if (exists) {
        return prev.filter(a => a.id !== id);
      } else {
        return [...prev, { id, day_of_week: day, time_of_day: time }];
      }
    });
  };

  // Mock File Upload Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    
    setError('');
    setUploadedFile(file);
    
    // Create a local object URL to preview the file
    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);
    
    // Convert the file to a Base64 string so we can save it to the database for the MVP
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData(prev => ({ ...prev, cv_url: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email && !formData.phone) {
      setError('You must provide either an email address or a phone number.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    const payload = {
      volunteer: {
        ...formData,
        skills_attributes: selectedSkills.map(name => ({ name })),
        availabilities_attributes: selectedAvailabilities.map(({ day_of_week, time_of_day }) => ({
          day_of_week,
          time_of_day
        }))
      }
    };

    try {
      if (isEditMode && editData) {
        await apiClient.put(`/admin/volunteers/${editData.id}`, payload);
      } else {
        await apiClient.post('/public/volunteers', payload);
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_40px_-10px_rgba(6,182,212,0.2)] transition-all duration-500 transform scale-100">
          <CheckCircle2 className="w-20 h-20 text-cyan-400 mx-auto mb-6 animate-bounce" />
          <h2 className="text-3xl font-bold text-slate-100 mb-4">{isEditMode ? 'Profile Updated!' : 'Application Received!'}</h2>
          <p className="text-slate-400 mb-8">
            {isEditMode 
              ? 'The volunteer profile has been successfully updated.' 
              : `Thank you for applying. Our team will review your profile and contact you regarding the ${formData.target_role || 'volunteer'} role soon.`}
          </p>
          {isEditMode ? (
            <button 
              onClick={() => navigate('/admin')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 w-full"
            >
              Return to Dashboard
            </button>
          ) : (
            <button 
              onClick={() => {
                setSuccess(false);
                setFormData({ first_name: '', last_name: '', email: '', phone: '', target_role: '', location: '', cv_url: '' });
                setSelectedSkills([]);
                setSelectedAvailabilities([]);
                setUploadedFile(null);
                if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
                setFilePreviewUrl(null);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 w-full shadow-lg shadow-indigo-500/30"
            >
              Submit Another Application
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 py-12 font-sans selection:bg-cyan-500/30">
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 max-w-3xl w-full shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)] relative">
        {isEditMode && (
          <button 
            onClick={() => navigate('/admin')}
            className="absolute top-8 left-8 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        )}
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 mb-4">
            {isEditMode ? <Users className="w-8 h-8 text-cyan-400" /> : <Briefcase className="w-8 h-8 text-cyan-400" />}
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">{isEditMode ? 'Edit Profile' : 'Career Portal'}</h1>
          <p className="text-slate-400">{isEditMode ? 'Update volunteer information below.' : 'Join our mission. Apply for open roles and tell us how you can help.'}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Desired Role */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-500" />
              Desired Role
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {MOCK_ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`p-4 rounded-xl text-sm font-medium transition-all duration-300 border text-left flex flex-col gap-1 ${
                    formData.target_role === role
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${formData.target_role === role ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-700'}`}></span>
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Info & Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">First Name *</label>
                <input 
                  required
                  type="text" 
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Last Name *</label>
                <input 
                  required
                  type="text" 
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Preferred District / Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-500" />
                  </div>
                  <input 
                    type="text" 
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="e.g. Downtown, Northside, Remote"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">* Please provide either an email address or a phone number so we can contact you.</p>
          </div>

          {/* CV Upload Zone */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              Resume / CV (PDF Only)
            </h3>
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-cyan-500 bg-cyan-500/5' 
                  : uploadedFile 
                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                    : 'border-slate-700 hover:border-slate-600 bg-slate-950/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileInput}
                accept=".pdf,application/pdf"
              />
              
              {uploadedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-slate-500 mt-1">Click or drag to replace file</p>
                  </div>
                  {filePreviewUrl && (
                    <a 
                      href={filePreviewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 relative z-10"
                      onClick={(e) => e.stopPropagation()} // Prevent triggering the file input
                    >
                      <FileText className="w-4 h-4" />
                      View Selected File
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium">Drag and drop your PDF CV here</p>
                    <p className="text-sm text-slate-500 mt-1">or click to browse files</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200 border-b border-slate-800 pb-2">Technical & Soft Skills</h3>
            {loadingData ? (
              <div className="flex items-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading skills...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {skills.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                          isSelected 
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                  
                  {/* Render custom skills that aren't in the predefined list */}
                  {selectedSkills.filter(s => !skills.includes(s)).map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                
                {/* Custom Skill Input */}
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={handleCustomSkillKeyDown}
                    placeholder="Add other skill..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    disabled={!customSkill.trim()}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 p-2 rounded-xl transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200 border-b border-slate-800 pb-2">Availability</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {MOCK_DAYS.slice(0, 4).map(day => (
                <div key={day} className="space-y-2">
                  <span className="text-sm font-medium text-slate-400">{day}</span>
                  <div className="flex gap-2">
                    {MOCK_TIMES.map(time => {
                      const isSelected = selectedAvailabilities.some(a => a.id === `${day}-${time}`);
                      return (
                        <button
                          key={`${day}-${time}`}
                          type="button"
                          onClick={() => toggleAvailability(day, time)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-300 border ${
                            isSelected
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {MOCK_DAYS.slice(4).map(day => (
                <div key={day} className="space-y-2">
                  <span className="text-sm font-medium text-slate-400">{day}</span>
                  <div className="flex gap-2">
                    {MOCK_TIMES.map(time => {
                      const isSelected = selectedAvailabilities.some(a => a.id === `${day}-${time}`);
                      return (
                        <button
                          key={`${day}-${time}`}
                          type="button"
                          onClick={() => toggleAvailability(day, time)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-300 border ${
                            isSelected
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (!isEditMode && !formData.target_role)}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {isEditMode ? 'Saving Changes...' : 'Submitting Application...'}
              </>
            ) : (
              isEditMode ? 'Save Changes' : 'Submit Application'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
