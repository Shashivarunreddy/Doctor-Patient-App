import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, CalendarRange, Clock, Edit3, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DoctorProfileData {
  specializations: string[];
  experience: number;
  qualifications: string[];
  bio: string | null;
  consultationFee: number | null;
  availableFrom: string | null;
  availableTo: string | null;
}

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
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

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
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setSpecializationsInput(payload.specializations.join(', '));
      setQualificationsInput(payload.qualifications.join(', '));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update profile. Please verify your details.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
        <div className="flex items-center gap-4">
           <div className="p-4 bg-orange-50 text-primary rounded-2xl">
             <Edit3 className="h-8 w-8" />
           </div>
           <div>
             <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Profile Settings</h1>
             <p className="text-zinc-500 mt-1 font-medium">Manage your professional details, specialties and availability</p>
           </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl shadow-sm border font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.type === 'success' && <ShieldCheck className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      {/* Form Card */}
      <Card className="rounded-3xl border-zinc-200 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-8">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-2">
                <Label className="text-zinc-700 font-bold">Specializations (comma separated)</Label>
                <Input 
                  type="text" 
                  className="h-12 bg-zinc-50 border-zinc-200 focus-visible:ring-primary rounded-xl"
                  placeholder="e.g. Cardiologist, General Physician"
                  value={specializationsInput}
                  onChange={e => setSpecializationsInput(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-700 font-bold">Qualifications (comma separated)</Label>
                <Input 
                  type="text" 
                  className="h-12 bg-zinc-50 border-zinc-200 focus-visible:ring-primary rounded-xl"
                  placeholder="e.g. MBBS, MD"
                  value={qualificationsInput}
                  onChange={e => setQualificationsInput(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-700 font-bold flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-primary" /> Years of Experience
                </Label>
                <Input 
                  type="number" 
                  min="0"
                  required
                  className="h-12 bg-zinc-50 border-zinc-200 focus-visible:ring-primary rounded-xl"
                  value={formData.experience}
                  onChange={e => setFormData({ ...formData, experience: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-700 font-bold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" /> Consultation Fee ($)
                </Label>
                <Input 
                  type="number" 
                  min="0"
                  className="h-12 bg-zinc-50 border-zinc-200 focus-visible:ring-primary rounded-xl"
                  value={formData.consultationFee || ''}
                  onChange={e => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <Label className="text-zinc-700 font-bold flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" /> Availability Time Window
                </Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="time" 
                    className="h-12 bg-zinc-50 border-zinc-200 focus-visible:ring-primary rounded-xl flex-1"
                    value={formData.availableFrom || ''}
                    onChange={e => setFormData({ ...formData, availableFrom: e.target.value })}
                  />
                  <span className="text-zinc-400 font-bold">TO</span>
                  <Input 
                    type="time" 
                    className="h-12 bg-zinc-50 border-zinc-200 focus-visible:ring-primary rounded-xl flex-1"
                    value={formData.availableTo || ''}
                    onChange={e => setFormData({ ...formData, availableTo: e.target.value })}
                  />
                </div>
              </div>
              
            </div>

            <div className="space-y-2 pt-4 border-t border-zinc-100">
              <Label className="text-zinc-700 font-bold">Professional Bio</Label>
              <textarea 
                rows={4}
                className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                placeholder="Tell your patients about your practice..."
                value={formData.bio || ''}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="px-8 h-12 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95 text-base"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorProfile;
