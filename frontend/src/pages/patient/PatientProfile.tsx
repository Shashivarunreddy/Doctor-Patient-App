import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patient.service';
import { 
  User, ShieldCheck, Calendar, HeartHandshake, FileSpreadsheet, 
  MapPin, PhoneCall, Plus, X, Loader2 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        setUserData({
          name: res.user?.name || '',
          email: res.user?.email || ''
        });
        
        const profile = res.profile || {};
        
        // Convert dateOfBirth ISO string to YYYY-MM-DD
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
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergy]
      }));
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
      // Date must be formatted correctly
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null
    };

    try {
      await patientService.updateProfile(payload);
      setMessage({ type: 'success', text: 'Health profile updated successfully!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update profile. Please verify your fields.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans px-4 py-8">
      {/* Header card */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-primary rounded-2xl">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Health Profile</h1>
            <p className="text-zinc-500 mt-1 font-semibold">
              Manage your personal demographics, health history, and emergency contact details.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl shadow-sm border font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.type === 'success' && <ShieldCheck className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      {/* Form Details */}
      <Card className="rounded-3xl border-zinc-200 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-8">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Account Metadata (Read Only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-150">
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Account Holder Name</span>
                <p className="text-base font-extrabold text-zinc-800">{userData?.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</span>
                <p className="text-base font-extrabold text-zinc-800">{userData?.email}</p>
              </div>
            </div>

            {/* Demographics */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Personal Demographics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-zinc-700 font-bold">Date of Birth</Label>
                  <Input 
                    type="date" 
                    className="h-12 bg-zinc-50 border-zinc-250 focus-visible:ring-primary rounded-xl"
                    value={formData.dateOfBirth}
                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-700 font-bold">Gender</Label>
                  <select
                    className="flex h-12 w-full appearance-none items-center justify-between rounded-xl border border-zinc-250 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-700 font-bold">Blood Group</Label>
                  <Input 
                    type="text" 
                    placeholder="e.g. O+, A-"
                    className="h-12 bg-zinc-50 border-zinc-250 focus-visible:ring-primary rounded-xl"
                    value={formData.bloodGroup}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-zinc-700 font-bold">Contact Phone</Label>
                  <Input 
                    type="tel" 
                    placeholder="Enter phone number"
                    className="h-12 bg-zinc-50 border-zinc-250 focus-visible:ring-primary rounded-xl"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-700 font-bold flex items-center gap-1">
                    <PhoneCall size={14} className="text-primary" /> Emergency Contact
                  </Label>
                  <Input 
                    type="text" 
                    placeholder="Name & Relationship / Number"
                    className="h-12 bg-zinc-50 border-zinc-250 focus-visible:ring-primary rounded-xl"
                    value={formData.emergencyContact}
                    onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-3">
                  <Label className="text-zinc-700 font-bold flex items-center gap-1">
                    <MapPin size={14} className="text-primary" /> Address
                  </Label>
                  <Input 
                    type="text" 
                    placeholder="Enter home/billing address"
                    className="h-12 bg-zinc-50 border-zinc-250 focus-visible:ring-primary rounded-xl"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Medical details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-primary" /> Medical Indicators & Allergies
              </h3>

              {/* Allergies tag manager */}
              <div className="space-y-3">
                <Label className="text-zinc-700 font-bold">Known Allergies</Label>
                <div className="flex gap-3">
                  <Input 
                    type="text" 
                    placeholder="Add known allergy (e.g. Peanuts, Penicillin)"
                    className="h-12 bg-zinc-50 border-zinc-250 focus-visible:ring-primary rounded-xl flex-1"
                    value={allergyInput}
                    onChange={e => setAllergyInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAllergy();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddAllergy}
                    className="h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-250 rounded-xl px-4"
                  >
                    <Plus size={18} /> Add
                  </Button>
                </div>

                {/* Tag list */}
                {formData.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.allergies.map((allergy, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-50 text-primary border border-orange-100 shadow-sm"
                      >
                        {allergy}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveAllergy(index)}
                          className="hover:bg-orange-200/50 rounded-full p-0.5 text-primary"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-xs font-medium italic">No registered allergies listed. Add any to alert consulting doctors.</p>
                )}
              </div>

              {/* Medical history */}
              <div className="space-y-2">
                <Label className="text-zinc-700 font-bold flex items-center gap-1">
                  <FileSpreadsheet size={14} className="text-primary" /> Comprehensive Medical History
                </Label>
                <textarea 
                  rows={5}
                  placeholder="List surgeries, active conditions, medications, chronic ailments..."
                  className="w-full p-4 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                  value={formData.medicalHistory}
                  onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })}
                />
              </div>
            </div>

            {/* Footer action button */}
            <div className="flex justify-end pt-6 border-t border-zinc-100">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="px-8 h-12 bg-primary hover:bg-primary/95 text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-base"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : 'Save Health Profile'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfile;
