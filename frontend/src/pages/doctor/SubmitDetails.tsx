import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { api } from '../../services/api';
import { 
  FileText, Check, Award, Briefcase, DollarSign, 
  Clock, LogOut, Loader2, Info, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SubmitDetails: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [specializations, setSpecializations] = useState('');
  const [experience, setExperience] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [availableFrom, setAvailableFrom] = useState('09:00');
  const [availableTo, setAvailableTo] = useState('17:00');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isResubmit = user?.doctorProfile?.approvalStatus === 'PHASE2_REJECTED';
  const rejectionReason = user?.doctorProfile?.phase2RejectionReason;

  // Protect screen from already approved users
  useEffect(() => {
    if (user?.doctorProfile?.approvalStatus === 'PHASE2_APPROVED') {
      navigate('/doctor-dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Load existing profile details
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/doctor/profile');
        if (res.data?.success && res.data?.data?.profile) {
          const profile = res.data.data.profile;
          setSpecializations(profile.specializations?.join(', ') || '');
          setExperience(profile.experience?.toString() || '');
          setQualifications(profile.qualifications?.join(', ') || '');
          setBio(profile.bio || '');
          setConsultationFee(profile.consultationFee?.toString() || '');
          setAvailableFrom(profile.availableFrom || '09:00');
          setAvailableTo(profile.availableTo || '17:00');
          setLicenseNumber(profile.licenseNumber || '');
        }
      } catch (err) {
        console.error('Failed to load doctor profile:', err);
      } finally {
        setFetchLoading(false);
      }
    };

    loadProfile();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!specializations.trim()) errors.specializations = 'Specializations are required (e.g. Cardiologist)';
    if (!experience.trim() || isNaN(Number(experience)) || Number(experience) < 0) {
      errors.experience = 'Enter a valid number for years of experience';
    }
    if (!qualifications.trim()) errors.qualifications = 'Qualifications are required (e.g. MBBS, MD)';
    if (!licenseNumber.trim() || licenseNumber.trim().length < 2) {
      errors.licenseNumber = 'A valid medical practice license number is required';
    }
    if (!consultationFee.trim() || isNaN(Number(consultationFee)) || Number(consultationFee) < 0) {
      errors.consultationFee = 'Enter a valid consultation fee';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    const payload = {
      specializations: specializations.split(',').map(s => s.trim()).filter(Boolean),
      experience: parseInt(experience) || 0,
      qualifications: qualifications.split(',').map(q => q.trim()).filter(Boolean),
      bio: bio.trim() || null,
      consultationFee: parseFloat(consultationFee) || 0,
      availableFrom: availableFrom || '09:00',
      availableTo: availableTo || '17:00',
      licenseNumber: licenseNumber.trim(),
    };

    try {
      const res = await api.put('/doctor/profile', payload);
      if (res.data.success) {
        await refreshUser();
        navigate('/doctor-dashboard/pending', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit verification details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
        <Loader2 className="animate-spin h-10 w-10 text-primary mb-4" />
        <p className="text-zinc-500 font-medium">Fetching profile details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] font-sans selection:bg-orange-200">
      
      {/* Custom simplified header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 font-extrabold text-2xl tracking-tight text-zinc-900">
              <span className="p-2 bg-orange-100 rounded-xl">
                <FileText className="h-6 w-6 text-primary" />
              </span>
              Docco360 Verification
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-50 hover:bg-red-50 text-zinc-600 hover:text-red-500 rounded-xl transition-colors border border-zinc-250 hover:border-red-200 font-semibold text-sm"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 space-y-8">
        
        {/* Step Indicator */}
        <div className="bg-white border border-zinc-200/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between max-w-md mx-auto relative mb-3">
            {/* Connection lines */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-200 -translate-y-1/2 z-0" />
            <div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-green-500 -translate-y-1/2 z-0" />
            
            {/* Step 1 */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white border-2 border-white shadow-md">
                <Check size={16} className="stroke-[3]" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white border-2 border-white shadow-md font-bold">
                2
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 border-2 border-white shadow-sm font-bold">
                3
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs font-bold text-zinc-500 max-w-[500px] mx-auto px-1">
            <span className="text-green-600">Account Approved</span>
            <span className="text-primary text-center">Verify Credentials</span>
            <span className="text-right">Awaiting Launch</span>
          </div>
        </div>

        {/* Rejection Alert Banner */}
        {isResubmit && rejectionReason && (
          <div className="bg-red-50/70 border border-red-200 rounded-3xl p-6 flex gap-4 items-start shadow-sm animate-pulse">
            <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-red-800 text-sm">Previous Submission Rejected</h4>
              <p className="text-red-700 text-sm font-medium leading-relaxed">{rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl shadow-md overflow-hidden">
          
          {/* Header Banner */}
          <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                {isResubmit ? 'Update Credentials' : 'Submit Credentials'}
              </h2>
              <p className="text-zinc-500 text-sm font-semibold">
                Phase 2 — Provide professional details and practicing license.
              </p>
            </div>
            <span className="px-3 py-1 text-xs font-bold rounded-full border border-orange-200 bg-orange-50 text-primary">
              Details Required
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Section 1: Professional details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> Professional Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-zinc-700 font-bold">Specializations</Label>
                  <Input 
                    type="text" 
                    placeholder="e.g. Cardiologist, Dermatologist"
                    className={`h-12 rounded-xl bg-zinc-50 border-zinc-250 focus-visible:ring-primary ${validationErrors.specializations ? 'border-red-500' : ''}`}
                    value={specializations}
                    onChange={e => setSpecializations(e.target.value)}
                  />
                  {validationErrors.specializations && <p className="text-red-500 text-xs font-medium">{validationErrors.specializations}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-700 font-bold">Years of Experience</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 8"
                    min="0"
                    className={`h-12 rounded-xl bg-zinc-50 border-zinc-250 focus-visible:ring-primary ${validationErrors.experience ? 'border-red-500' : ''}`}
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                  />
                  {validationErrors.experience && <p className="text-red-500 text-xs font-medium">{validationErrors.experience}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-zinc-700 font-bold">Qualifications</Label>
                  <Input 
                    type="text" 
                    placeholder="e.g. MBBS, MD Cardiology, FACC"
                    className={`h-12 rounded-xl bg-zinc-50 border-zinc-250 focus-visible:ring-primary ${validationErrors.qualifications ? 'border-red-500' : ''}`}
                    value={qualifications}
                    onChange={e => setQualifications(e.target.value)}
                  />
                  {validationErrors.qualifications && <p className="text-red-500 text-xs font-medium">{validationErrors.qualifications}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-zinc-700 font-bold">Professional Bio</Label>
                  <textarea 
                    rows={4}
                    placeholder="Describe your medical experience, style, philosophy..."
                    className="w-full p-4 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Section 2: Medical Practice License */}
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" /> Practicing License
              </h3>
              
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 flex gap-3 items-start">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary font-medium leading-relaxed">
                  Enter your official Medical Registration / License number. Credential verification will be cross-referenced with regional councils. Documents can be uploaded inside your profile settings once verified.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-700 font-bold">License / Registration Number</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. MCI-123456 or REG-2026-XYZ"
                  className={`h-12 rounded-xl bg-zinc-50 border-zinc-250 focus-visible:ring-primary ${validationErrors.licenseNumber ? 'border-red-500' : ''}`}
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                />
                {validationErrors.licenseNumber && <p className="text-red-500 text-xs font-medium">{validationErrors.licenseNumber}</p>}
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Section 3: Consultation Settings */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" /> Consultation Pricing & Working Hours
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-zinc-700 font-bold">Consultation Fee ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 50"
                    min="0"
                    className={`h-12 rounded-xl bg-zinc-50 border-zinc-250 focus-visible:ring-primary ${validationErrors.consultationFee ? 'border-red-500' : ''}`}
                    value={consultationFee}
                    onChange={e => setConsultationFee(e.target.value)}
                  />
                  {validationErrors.consultationFee && <p className="text-red-500 text-xs font-medium">{validationErrors.consultationFee}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-700 font-bold flex items-center gap-1">
                    <Clock size={14} /> Available Time Range
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="time" 
                      className="h-12 rounded-xl bg-zinc-50 border-zinc-250 focus-visible:ring-primary flex-1"
                      value={availableFrom}
                      onChange={e => setAvailableFrom(e.target.value)}
                    />
                    <span className="text-zinc-400 font-bold text-xs uppercase">to</span>
                    <Input 
                      type="time" 
                      className="h-12 rounded-xl bg-zinc-50 border-zinc-250 focus-visible:ring-primary flex-1"
                      value={availableTo}
                      onChange={e => setAvailableTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 text-base font-extrabold bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Details...
                  </>
                ) : 'Submit Credentials for Approval'}
              </Button>
            </div>
          </form>

        </div>

      </main>

    </div>
  );
};

export default SubmitDetails;
