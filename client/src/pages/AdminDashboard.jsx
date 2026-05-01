import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../utils/api.js';
import { useAuthUser } from '../utils/useAuthUser.js';
import { REGIONS } from '../utils/regions.js';

const AdminDashboard = () => {
  const { user } = useAuthUser();
  const [stats, setStats] = useState(null);
  const [topProblems, setTopProblems] = useState([]);
  const [topVolunteers, setTopVolunteers] = useState([]);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [analyticsRes, pendingRes] = await Promise.all([
        API.get('/analytics/admin'),
        API.get('/admin/volunteers/pending')
      ]);

      setStats(analyticsRes.data.stats || null);
      setTopProblems(analyticsRes.data.topProblems || []);
      setTopVolunteers(analyticsRes.data.topVolunteers || []);
      setPendingVolunteers(pendingRes.data.volunteers || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApprove = async (volunteerId, city) => {
    try {
      await API.patch(`/admin/volunteers/approve/${volunteerId}`, { city });
      toast.success('Volunteer approved');
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve volunteer');
    }
  };

  const handleReject = async (volunteerId) => {
    try {
      await API.patch(`/admin/volunteers/reject/${volunteerId}`);
      toast.success('Volunteer rejected');
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject volunteer');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar user={user} />
        <div className="max-w-[900px] mx-auto w-full px-4 py-10">
          Admin access only.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar user={user} />

      <div className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck size={22} className="text-[#10b981]" />
          <h1 className="text-[2rem] font-bold text-[#065f46]">Super Admin Dashboard</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {stats && (
              <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {[
                  ['Total Problems', stats.total],
                  ['Open', stats.open],
                  ['In Progress', stats.inProgress],
                  ['Completed', stats.completed],
                  ['Completion Rate', `${stats.completionRate}%`],
                  ['Requests', stats.completionRequested],
                  ['Avg Days', stats.avgResolutionDays],
                  ['Total Votes', stats.totalVotes]
                ].map((item) => (
                  <div
                    key={item[0]}
                    className="bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] border-2 border-[#10b981] rounded-lg p-4"
                  >
                    <p className="text-sm text-gray-600 font-semibold">{item[0]}</p>
                    <p className="text-[1.5rem] font-bold text-[#065f46]">{item[1]}</p>
                  </div>
                ))}
              </section>
            )}

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border-2 border-[#d1fae5] rounded-xl p-6">
                <h2 className="text-lg font-bold text-[#065f46] mb-4">Top Problems</h2>
                {topProblems.length === 0 ? (
                  <p className="text-gray-500">No data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topProblems.map((problem) => (
                      <div key={problem.problemId} className="bg-gray-100 rounded-lg p-3">
                        <p className="text-[#065f46] font-semibold">{problem.title}</p>
                        <p className="text-sm text-gray-500">{problem.city} • {problem.status} • {problem.votes} votes</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border-2 border-[#d1fae5] rounded-xl p-6">
                <h2 className="text-lg font-bold text-[#065f46] mb-4">Top Volunteers</h2>
                {topVolunteers.length === 0 ? (
                  <p className="text-gray-500">No data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topVolunteers.map((volunteer) => (
                      <div key={volunteer.userId} className="bg-gray-100 rounded-lg p-3">
                        <p className="text-[#065f46] font-semibold">{volunteer.name}</p>
                        <p className="text-sm text-gray-500">{volunteer.city} • {volunteer.completedCount} approvals</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white border-2 border-[#d1fae5] rounded-xl p-6">
              <h2 className="text-lg font-bold text-[#065f46] mb-4">Pending Volunteer Applications</h2>
              {pendingVolunteers.length === 0 ? (
                <p className="text-gray-500">No pending volunteers.</p>
              ) : (
                <div className="space-y-4">
                  {pendingVolunteers.map((volunteer) => (
                    <div key={volunteer._id} className="bg-gray-100 rounded-lg p-4 flex md:flex-col gap-4 justify-between">
                      <div>
                        <p className="text-[#065f46] font-semibold">{volunteer.name}</p>
                        <p className="text-sm text-gray-500">{volunteer.email}</p>
                        <p className="text-xs text-gray-500">Requested state: {volunteer.city || 'Not selected'}</p>
                      </div>
                      <div className="flex md:flex-col gap-3">
                        <select
                          value={volunteer.city || ''}
                          className="border rounded-lg px-3 py-2"
                          onChange={(e) => {
                            const nextCity = e.target.value;
                            setPendingVolunteers((prev) =>
                              prev.map((item) =>
                                item._id === volunteer._id
                                  ? { ...item, city: nextCity }
                                  : item
                              )
                            );
                          }}
                        >
                          <option value="">Select city</option>
                          {REGIONS.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleApprove(volunteer._id, volunteer.city || '')}
                          className="bg-[#10b981] hover:bg-[#065f46] text-white px-3 py-2 rounded-lg font-semibold flex items-center gap-2"
                        >
                          <UserCheck size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(volunteer._id)}
                          className="border border-red-500 text-red-600 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg font-semibold flex items-center gap-2"
                        >
                          <UserX size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
