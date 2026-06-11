import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { User, Briefcase, Award, ArrowRight, Search, X } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
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

  const filtered = doctors.filter(doc => {
    const q = searchQuery.toLowerCase();
    return (
      doc.user.name.toLowerCase().includes(q) ||
      doc.profile?.specializations?.some(s => s.toLowerCase().includes(q))
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page header */}
      <div className="mb-2">
        <h2 className="text-2xl text-black font-semibold leading-tight tracking-tight">Available Specialists</h2>
        <p className="text-sm text-[#555555] mt-1">Browse our network of top-tier verified professionals.</p>
      </div>

      {/* Search + stats bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="flex items-center rounded-sm border border-[#e1e1e1] px-2 py-1.5 bg-white hover:border-[#cccccc] transition-colors">
          <Search size={16} className="text-[#555555] shrink-0" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm text-black w-[220px] px-2 outline-none placeholder:text-[#999999]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[#777777] hover:text-black">
              <X size={14} />
            </button>
          )}
        </div>
        <span className="text-[13px] text-[#555555] font-mono">{filtered.length} specialist{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#e1e1e1] rounded-sm p-12 text-center">
          <div className="w-10 h-10 border border-[#e1e1e1] rounded-sm flex items-center justify-center mx-auto mb-4 bg-[#f5f5f5]">
            <User size={20} className="text-[#555555]" />
          </div>
          <p className="text-black font-medium">No specialists found</p>
          <p className="text-[#777777] text-sm mt-1">
            {searchQuery ? 'Try a different search term.' : 'No verified specialists are currently available.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e1e1e1] rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#fafafa] text-[#555555] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e1e1e1]">
                  <th className="px-4 py-3">Practitioner</th>
                  <th className="px-4 py-3">Specializations</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-[#e1e1e1]">
                {filtered.map(doc => (
                  <tr key={doc.user.id} className="hover:bg-[#fcfcfc] transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-sm border border-[#e1e1e1] bg-[#f5f5f5] flex-shrink-0 flex items-center justify-center text-black text-xs font-medium">
                          {doc.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-black">Dr. {doc.user.name}</div>
                          <div className="font-mono text-[#777777] text-[11px]">{doc.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {doc.profile?.specializations && doc.profile.specializations.length > 0 ? (
                          doc.profile.specializations.map((spec, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#e1e1e1] rounded-sm text-[11px] font-medium bg-[#f5f5f5] text-black"
                            >
                              <Award size={9} />
                              {spec}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#999999] font-mono text-[11px]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[#555555]">
                        <Briefcase size={12} />
                        <span className="font-mono">{doc.profile?.experience ?? 0} yrs</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/patient-dashboard/doctor/${doc.user.id}`}
                        className="inline-flex items-center gap-1.5 text-[13px] px-3 py-1 border border-[#e1e1e1] rounded-sm hover:bg-[#f0f0f0] transition-colors text-black font-medium"
                      >
                        View Profile <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
