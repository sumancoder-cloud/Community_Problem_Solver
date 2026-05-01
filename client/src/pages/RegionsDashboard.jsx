import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { BarChart3 } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../utils/api.js';
import { useAuthUser } from '../utils/useAuthUser.js';

const RegionsDashboard = () => {
  const { user } = useAuthUser();
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await API.get('/analytics/regions');
        setRegions(res.data.regions || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load region analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar user={user} />

      <div className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 size={22} className="text-[#10b981]" />
          <h1 className="text-[2rem] font-bold text-[#065f46]">State Analytics</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {regions.map((region) => (
              <div
                key={region.city}
                className="bg-gradient-to-br from-white to-[#d1fae5] border-2 border-[#d1fae5] rounded-xl p-6"
              >
                <h2 className="text-[1.2rem] font-bold text-[#065f46] mb-4">
                  {region.city}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="font-semibold">Total</p>
                    <p>{region.stats.total}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Open</p>
                    <p>{region.stats.open}</p>
                  </div>
                  <div>
                    <p className="font-semibold">In Progress</p>
                    <p>{region.stats.inProgress}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Completed</p>
                    <p>{region.stats.completed}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Requests</p>
                    <p>{region.stats.completionRequested}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Avg Days</p>
                    <p>{region.stats.avgResolutionDays}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionsDashboard;
