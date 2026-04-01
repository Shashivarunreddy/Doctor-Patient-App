import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { User, Briefcase, Award, Clock, DollarSign, ChevronLeft } from 'lucide-react';

interface FullDoctorProfile {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  profile: {
    id: string;
    specializations: string[];
    experience: number;
    qualifications: string[];
    bio: string | null;
    consultationFee: number | null;
    availableFrom: string | null;
    availableTo: string | null;
  } | null;
}

const DoctorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<FullDoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const res = await api.get(`/patient/doctors/${id}`);
        if (res.data.success && res.data.data) {
          setData(res.data.data);
        } else {
          setError('Doctor profile not found');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch doctor details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchDoctorDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto text-center p-12 bg-white rounded-3xl shadow-sm border border-red-100 font-sans">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Profile Not Found</h2>
        <p className="text-zinc-600 mb-6 font-medium">{error || "We couldn't locate this doctor's profile."}</p>
        <Link to="/patient-dashboard/doctors" className="text-primary font-bold hover:underline inline-flex items-center">
          <ChevronLeft size={16} className="mr-1" /> Back to Directory
        </Link>
      </div>
    );
  }

  const { user, profile } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans px-4 py-8">
      <Link to="/patient-dashboard/doctors" className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-primary transition-colors bg-white hover:bg-orange-50 px-4 py-2 rounded-full border border-zinc-200">
        <ChevronLeft size={16} className="mr-1" /> Back to Doctors
      </Link>

      <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-200 overflow-hidden relative">
        {/* Abstract Header Graphic */}
        <div className="h-40 bg-gradient-to-r from-orange-400 to-primary relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+Cgk8cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9Im5vbmUiLz4KCTxwb2x5Z29uIHBvaW50cz0iMjAsMjAgMCwyMCAwLDAiIGZpbGw9IiNmOWNhMjQiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPgo8L3N2Zz4=')] opacity-30 mix-blend-overlay" />
        </div>
        
        <div className="px-10 pb-12">
          {/* Avatar & Action row */}
          <div className="relative flex justify-between items-end -mt-16 mb-8">
            <div className="h-32 w-32 rounded-[2rem] bg-white p-2 shadow-xl border border-zinc-100 transform rotate-3">
               <div className="h-full w-full rounded-2xl bg-orange-50 flex items-center justify-center text-primary transform -rotate-3">
                 <User size={64} className="opacity-80" />
               </div>
            </div>
            
            <div className="flex gap-4 items-center">
              {profile?.consultationFee != null && (
                <div className="bg-white text-zinc-800 border border-zinc-200 px-6 py-3 rounded-xl font-bold flex items-center shadow-lg transform -translate-y-2">
                  <DollarSign size={18} className="mr-1 text-green-600" />
                  <span className="text-xl">{profile.consultationFee}</span> <span className="text-zinc-400 text-sm ml-1 font-medium">/ session</span>
                </div>
              )}
            </div>
          </div>
          
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Dr. {user.name}</h1>
          <p className="text-zinc-500 mt-2 font-medium">{user.email}</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 pt-12 border-t border-zinc-100">
            <div className="space-y-10">
              <div>
                <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-4 flex items-center">
                  <Briefcase size={16} className="mr-2" /> Professional Summary
                </h3>
                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                  <div className="text-3xl font-extrabold text-zinc-900 mb-2">{profile?.experience || 0} <span className="text-lg text-zinc-500 font-bold">Years</span></div>
                  <p className="text-zinc-500 font-medium">Clinical Experience</p>
                  <p className="text-zinc-700 mt-6 leading-relaxed">
                    {profile?.bio || 'This doctor has not provided a biographical summary yet.'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-4 flex items-center">
                  <Clock size={16} className="mr-2" /> Availability
                </h3>
                {(profile?.availableFrom && profile?.availableTo) ? (
                  <div className="flex items-center gap-4 bg-orange-50/50 rounded-2xl p-6 border border-orange-100/50">
                     <span className="bg-white text-zinc-800 font-bold px-4 py-2 rounded-xl border border-zinc-200 shadow-sm">{profile.availableFrom}</span>
                     <span className="text-zinc-400 font-bold uppercase text-sm">to</span>
                     <span className="bg-white text-zinc-800 font-bold px-4 py-2 rounded-xl border border-zinc-200 shadow-sm">{profile.availableTo}</span>
                  </div>
                ) : (
                  <p className="text-zinc-500 italic bg-zinc-50 p-6 rounded-2xl border border-zinc-100">Schedule not configured</p>
                )}
              </div>
            </div>

            <div className="space-y-10">
              <div>
                <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-4 flex items-center">
                  <Award size={16} className="mr-2" /> Specializations
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile?.specializations && profile.specializations.length > 0 ? (
                    profile.specializations.map((spec, idx) => (
                      <span key={idx} className="bg-white text-zinc-800 font-bold px-5 py-2.5 rounded-xl border border-zinc-200 shadow-sm hover:border-primary transition-colors cursor-default">
                        {spec}
                      </span>
                    ))
                  ) : (
                    <p className="text-zinc-500 italic pb-4">None listed</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-4 flex items-center">
                  <Award size={16} className="mr-2" /> Qualifications
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile?.qualifications && profile.qualifications.length > 0 ? (
                    profile.qualifications.map((qual, idx) => (
                      <span key={idx} className="bg-zinc-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm cursor-default">
                        {qual}
                      </span>
                    ))
                  ) : (
                    <p className="text-zinc-500 italic">None listed</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
