import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patient.service';
import { Link } from 'react-router-dom';
import {
  User, ShieldCheck, Calendar, HeartHandshake, FileSpreadsheet,
  MapPin, PhoneCall, Plus, X, Loader2, ChevronLeft,
} from 'lucide-react';

interface PatientProfileData {
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  bloodGroup: string;
  phone: string;
  address: string;
  emergencyContact: string;
  allergies: string[];
  medicalHistory: string;
}

const inputCls = 'w-full h-10 bg-white border border-[#e1e1e1] rounded-sm px-3 text-sm text-black placeholder-[#999999] focus:outline-none focus:border-black transition-colors';
const labelCls = 'text-[11px] font-semibold text-[#555555] uppercase tracking-wider block mb-1.5';

const PatientProfile: React.FC = () => {
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [formData, setFormData] = useState<PatientProfileData>({
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    address: '',
    emergencyContact: '',
    allergies: [],
    medicalHistory: ''
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await patientService.getProfile();
      if (res) {
        setUserData({ name: res.user?.name || '', email: res.user?.email || '' });
        const profile = res.profile || {};
        let dob = '';
        if (profile.dateOfBirth) {
          dob = new Date(profile.dateOfBirth).toISOString().split('T')[0];
        }
        setFormData({
          dateOfBirth: dob,
          gender: profile.gender || '',
          bloodGroup: profile.bloodGroup || '',
          phone: profile.phone || '',
          address: profile.address || '',
          emergencyContact: profile.emergencyContact || '',
          allergies: profile.allergies || [],
          medicalHistory: profile.medicalHistory || ''
        });
      }
    } catch (err) {
      console.error('Error fetching patient profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAllergy = () => {
    const allergy = allergyInput.trim();
    if (allergy && !formData.allergies.includes(allergy)) {
      setFormData(prev => ({ ...prev, allergies: [...prev.allergies, allergy] }));
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const payload = {
      ...formData,
      gender: formData.gender || null,
      bloodGroup: formData.bloodGroup.trim() || null,
      phone: formData.phone.trim() || null,
      address: formData.address.trim() || null,
      emergencyContact: formData.emergencyContact.trim() || null,
      medicalHistory: formData.medicalHistory.trim() || null,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null
    };

    try {
      await patientService.updateProfile(payload);
      setMessage({ type: 'success', text: 'Health profile updated successfully.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <Loader2 className="animate-spin h-8 w-8 text-black" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        to="/patient-dashboard"
        className="inline-flex items-center text-sm font-medium text-[#555555] hover:text-black transition-colors border border-[#e1e1e1] bg-white hover:bg-[#efefef] px-3 py-1.5 rounded-sm"
      >
        <ChevronLeft size={14} className="mr-1" /> Back to Overview
      </Link>

      {/* Page header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-6 h-6 flex items-center justify-center text-black">
            <User size={18} />
          </div>
          <h2 className="text-2xl text-black font-semibold leading-tight tracking-tight">Health Profile</h2>
        </div>
        <p className="text-sm text-[#555555] mt-1">
          Manage your personal demographics, health history, and emergency contact details.
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
        {/* Account metadata (read-only) */}
        <div className="bg-white border border-[#e1e1e1] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e1e1e1] bg-[#fafafa]">
            <h3 className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Account Information</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className={labelCls}>Account Holder Name</span>
              <p className="text-sm font-medium text-black">{userData?.name}</p>
            </div>
            <div>
              <span className={labelCls}>Email Address</span>
              <p className="text-sm font-medium text-black font-mono">{userData?.email}</p>
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className="bg-white border border-[#e1e1e1] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e1e1e1] bg-[#fafafa] flex items-center gap-2">
            <Calendar size={14} className="text-black" />
            <h3 className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Personal Demographics</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input
                type="date"
                className={inputCls}
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Gender</label>
              <select
                className={`${inputCls} appearance-none`}
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Blood Group</label>
              <input
                type="text"
                placeholder="e.g. O+, A-"
                className={inputCls}
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Contact Phone</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                className={inputCls}
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className={`${labelCls} flex items-center gap-1`}>
                <PhoneCall size={10} /> Emergency Contact
              </label>
              <input
                type="text"
                placeholder="Name & Relationship / Number"
                className={inputCls}
                value={formData.emergencyContact}
                onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </div>
            <div className="md:col-span-3">
              <label className={`${labelCls} flex items-center gap-1`}>
                <MapPin size={10} /> Address
              </label>
              <input
                type="text"
                placeholder="Enter home/billing address"
                className={inputCls}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Medical indicators */}
        <div className="bg-white border border-[#e1e1e1] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e1e1e1] bg-[#fafafa] flex items-center gap-2">
            <HeartHandshake size={14} className="text-black" />
            <h3 className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Medical Indicators & Allergies</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Allergy manager */}
            <div>
              <label className={labelCls}>Known Allergies</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add known allergy (e.g. Peanuts, Penicillin)"
                  className={`${inputCls} flex-1`}
                  value={allergyInput}
                  onChange={e => setAllergyInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddAllergy(); } }}
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="h-10 px-3 border border-[#e1e1e1] rounded-sm text-sm font-medium text-black hover:bg-[#efefef] transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              {formData.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium bg-[#f5f5f5] text-black border border-[#e1e1e1] rounded-sm"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(index)}
                        className="hover:bg-[#e1e1e1] rounded-sm p-0.5 text-[#555555] hover:text-black transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[#999999] text-xs mt-2 font-mono">No allergies registered.</p>
              )}
            </div>

            {/* Medical history */}
            <div>
              <label className={`${labelCls} flex items-center gap-1`}>
                <FileSpreadsheet size={10} /> Comprehensive Medical History
              </label>
              <textarea
                rows={5}
                placeholder="List surgeries, active conditions, medications, chronic ailments..."
                className="w-full bg-white border border-[#e1e1e1] rounded-sm px-3 py-2.5 text-sm text-black placeholder-[#999999] focus:outline-none focus:border-black transition-colors resize-none font-mono"
                value={formData.medicalHistory}
                onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-sm hover:bg-[#222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <><Loader2 size={14} className="animate-spin" /> Saving...</>
            ) : 'Save Health Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientProfile;
