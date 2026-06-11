import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, CalendarRange, Clock, Edit3, DollarSign, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DoctorProfileData {
  specializations: string[];
  experience: number;
  qualifications: string[];
  bio: string | null;
  consultationFee: number | null;
  availableFrom: string | null;
  availableTo: string | null;
}

const inputCls = 'w-full h-10 bg-white border border-[#e1e1e1] rounded-sm px-3 text-sm text-black placeholder-[#999999] focus:outline-none focus:border-black transition-colors';
const labelCls = 'text-[11px] font-semibold text-[#555555] uppercase tracking-wider block mb-1.5';

const DoctorProfile = () => {
  const [formData, setFormData] = useState<DoctorProfileData>({
    specializations: [],
    experience: 0,
    qualifications: [],
    bio: '',
    consultationFee: 0,
    availableFrom: '',
    availableTo: ''
  });

  const [specializationsInput, setSpecializationsInput] = useState('');
  const [qualificationsInput, setQualificationsInput] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/doctor/profile');
      if (res.data.success && res.data.data.profile) {
        const profile = res.data.data.profile;
        setFormData({
          specializations: profile.specializations || [],
          experience: profile.experience || 0,
          qualifications: profile.qualifications || [],
          bio: profile.bio || '',
          consultationFee: profile.consultationFee || 0,
          availableFrom: profile.availableFrom || '',
          availableTo: profile.availableTo || ''
        });
        setSpecializationsInput((profile.specializations || []).join(', '));
        setQualificationsInput((profile.qualifications || []).join(', '));
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const payload = {
      ...formData,
      specializations: specializationsInput.split(',').map(s => s.trim()).filter(Boolean),
      qualifications: qualificationsInput.split(',').map(s => s.trim()).filter(Boolean),
      experience: Number(formData.experience),
      consultationFee: formData.consultationFee ? Number(formData.consultationFee) : null,
      availableFrom: formData.availableFrom || null,
      availableTo: formData.availableTo || null,
      bio: formData.bio || null,
    };

    try {
      await api.put('/doctor/profile', payload);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setSpecializationsInput(payload.specializations.join(', '));
      setQualificationsInput(payload.qualifications.join(', '));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update profile.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        to="/doctor-dashboard"
        className="inline-flex items-center text-sm font-medium text-[#555555] hover:text-black transition-colors border border-[#e1e1e1] bg-white hover:bg-[#efefef] px-3 py-1.5 rounded-sm"
      >
        <ChevronLeft size={14} className="mr-1" /> Back to Workspace
      </Link>

      {/* Page header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-6 h-6 flex items-center justify-center text-black">
            <Edit3 size={18} />
          </div>
          <h2 className="text-2xl text-black font-semibold leading-tight tracking-tight">Profile Settings</h2>
        </div>
        <p className="text-sm text-[#555555] mt-1">
          Manage your professional details, specialties and availability.
        </p>
      </div>

      {message && (
        <div className={`p-4 border rounded-sm text-sm font-medium flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-white border-[#e1e1e1] text-black'
            : 'bg-white border-black text-black'
        }`}>
          {message.type === 'success' && <ShieldCheck size={14} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Professional details panel */}
        <div className="bg-white border border-[#e1e1e1] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e1e1e1] bg-[#fafafa]">
            <h3 className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Professional Details</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Specializations (comma separated)</label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Cardiologist, General Physician"
                value={specializationsInput}
                onChange={e => setSpecializationsInput(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Qualifications (comma separated)</label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. MBBS, MD"
                value={qualificationsInput}
                onChange={e => setQualificationsInput(e.target.value)}
              />
            </div>
            <div>
              <label className={`${labelCls} flex items-center gap-1`}>
                <CalendarRange size={10} /> Years of Experience
              </label>
              <input
                type="number"
                min="0"
                required
                className={inputCls}
                value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={`${labelCls} flex items-center gap-1`}>
                <DollarSign size={10} /> Consultation Fee ($)
              </label>
              <input
                type="number"
                min="0"
                className={inputCls}
                value={formData.consultationFee || ''}
                onChange={e => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Availability panel */}
        <div className="bg-white border border-[#e1e1e1] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e1e1e1] bg-[#fafafa] flex items-center gap-2">
            <Clock size={14} className="text-black" />
            <h3 className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Availability Time Window</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <input
                type="time"
                className={`${inputCls} max-w-[150px]`}
                value={formData.availableFrom || ''}
                onChange={e => setFormData({ ...formData, availableFrom: e.target.value })}
              />
              <span className="text-[#777777] font-mono text-sm">to</span>
              <input
                type="time"
                className={`${inputCls} max-w-[150px]`}
                value={formData.availableTo || ''}
                onChange={e => setFormData({ ...formData, availableTo: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Bio panel */}
        <div className="bg-white border border-[#e1e1e1] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e1e1e1] bg-[#fafafa]">
            <h3 className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Professional Bio</h3>
          </div>
          <div className="p-4">
            <textarea
              rows={4}
              className="w-full bg-white border border-[#e1e1e1] rounded-sm px-3 py-2.5 text-sm text-black placeholder-[#999999] focus:outline-none focus:border-black transition-colors resize-none"
              placeholder="Tell your patients about your practice..."
              value={formData.bio || ''}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-sm hover:bg-[#222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfile;
