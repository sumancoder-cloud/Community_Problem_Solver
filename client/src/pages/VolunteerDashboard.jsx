import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { CheckCircle, ClipboardCheck, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../utils/api.js';
import { useAuthUser } from '../utils/useAuthUser.js';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthUser();

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    completionRequested: 0,
    avgResolutionDays: 0
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/analytics/volunteer');
      setStats(res.data.stats || stats);
      setRequests(res.data.completionRequests || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load volunteer dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const approveCompletion = async (problemId) => {
    try {
      await API.patch(`/problems/approve-completion/${problemId}`);
      toast.success('Completion approved');
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve completion');
    }
  };

  if (!user || user.role !== 'volunteer') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar user={user} />
        <div className="max-w-[900px] mx-auto w-full px-4 py-10">
          Volunteer access only.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar user={user} />

      <div className="flex-1 max-w-[1100px] mx-auto w-full px-4 py-8">
        <div className="flex md:flex-col items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[2rem] font-bold text-[#065f46]">Volunteer Dashboard</h1>
            <p className="text-gray-500">State coverage: {user.city || 'Not set'}</p>
          </div>
          <button
            onClick={() => navigate('/regions')}
            className="border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white px-4 py-2 rounded-lg font-semibold"
          >
            View Region Analytics
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
              {[
                ['Total', stats.total],
                ['Open', stats.open],
                ['In Progress', stats.inProgress],
                ['Completed', stats.completed],
                ['Requests', stats.completionRequested]
              ].map((item) => (
                <div
                  key={item[0]}
                  className="bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] border-2 border-[#10b981] rounded-lg p-4 text-center"
                >
                  <p className="text-sm text-gray-600 font-semibold">{item[0]}</p>
                  <p className="text-[1.6rem] font-bold text-[#065f46]">{item[1]}</p>
                </div>
              ))}
            </section>

            <section className="bg-white border-2 border-[#d1fae5] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardCheck size={18} className="text-[#10b981]" />
                <h2 className="text-lg font-bold text-[#065f46]">Completion Requests</h2>
              </div>

              {requests.length === 0 ? (
                <div className="bg-gray-100 rounded-lg p-6 text-gray-500">
                  No completion requests in your city right now.
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((problem) => (
                    <div
                      key={problem._id}
                      className="bg-gray-100 rounded-lg p-4 border-l-4 border-amber-400"
                    >
                      <div className="flex md:flex-col justify-between gap-3">
                        <div>
                          <h3 className="text-[#065f46] font-semibold mb-1">{problem.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{problem.description}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={14} />
                            {problem.location}
                          </p>
                        </div>
                        <div className="flex md:flex-col gap-2">
                          <button
                            onClick={() => navigate(`/problems/${problem._id}`)}
                            className="border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white px-3 py-2 rounded-lg font-semibold"
                          >
                            View
                          </button>
                          <button
                            onClick={() => approveCompletion(problem._id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg font-semibold flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Approve
                          </button>
                        </div>
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

export default VolunteerDashboard;
