import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { User, Briefcase, Award, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DoctorItem {
  user: {
    id: string;
    name: string;
    email: string;
  };
  profile: {
    experience: number;
    specializations: string[];
  } | null;
}

const DoctorsList = () => {
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/patient/all-doctors');
        if (res.data.success) {
          setDoctors(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch doctors', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Available Specialists</h1>
          <p className="text-zinc-500 mt-2 text-lg">Browse our network of top-tier verified professionals.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.length === 0 ? (
          <div className="col-span-full text-center p-16 bg-white rounded-3xl shadow-sm border border-zinc-200">
            <p className="text-zinc-500 font-medium text-lg">No specialists are currently available on Docco360.</p>
          </div>
        ) : (
          doctors.map((doc) => (
            <Card key={doc.user.id} className="rounded-3xl border-zinc-200 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all overflow-hidden relative group bg-white flex flex-col h-full">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-orange-50 text-primary flex items-center justify-center flex-shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 leading-tight">Dr. {doc.user.name}</h3>
                    <div className="flex items-center text-sm font-medium text-zinc-500 mt-1.5">
                      <Briefcase size={14} className="mr-1.5 text-zinc-400" />
                      {doc.profile?.experience || 0} Years Exp
                    </div>
                  </div>
                </div>
                
                <div className="mb-8 flex-1">
                  <div className="flex items-center text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                    <Award size={14} className="mr-1.5 text-primary" />
                    Specializations
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doc.profile?.specializations && doc.profile.specializations.length > 0 ? (
                      doc.profile.specializations.map((spec, idx) => (
                        <span key={idx} className="bg-zinc-100 text-zinc-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-zinc-200/50">
                          {spec}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-zinc-400 italic font-medium">No specializations listed</span>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-100">
                  <Link
                    to={`/patient-dashboard/doctor/${doc.user.id}`}
                    className="w-full h-12 flex justify-center items-center bg-zinc-50 hover:bg-primary text-zinc-700 hover:text-white font-bold rounded-xl transition-colors group/btn"
                  >
                    View Full Profile <ArrowRight className="ml-2 h-4 w-4 text-zinc-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
