import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../utils/api.js';
import { useAuthUser } from '../utils/useAuthUser.js';

const TrackingHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthUser();

  const [problem, setProblems] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchTrackingData();
  }, [id]);

  const fetchTrackingData = async () => {
    try {
      const problemRes = await API.get(`/problems/${id}`);
      setProblems(problemRes.data.problem);

      const trackingRes = await API.get(`/tracking/${id}`);
      setTracking(trackingRes.data.tracking || []);

      const notificationsRes = await API.get('/notifications');
      setNotifications(notificationsRes.data.notifications || []);
    } catch {
      toast.error('Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  const statusStyles = {
    open: 'bg-[rgba(59,130,246,0.2)] text-[#dbeafe]',
    'in-progress': 'bg-[rgba(245,158,11,0.2)] text-[#fef3c7]',
    completed: 'bg-[rgba(16,185,129,0.2)] text-[#d1fae5]'
  };

  const getStatusColor = (status) => {
    if (status === 'open') return '#3b82f6';
    if (status === 'in-progress') return '#f59e0b';
    if (status === 'completed') return '#10b981';
    return '#6b7280';
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    return status === 'in-progress'
      ? 'In Progress'
      : status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar user={user} notifications={notifications} />

        <div className="flex justify-center items-center h-[400px]">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[#10b981] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar user={user} notifications={notifications} />

        <div className="max-w-[900px] mx-auto w-full px-4 py-10">
          Problem not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar user={user} notifications={notifications} />

      <div className="flex-1 max-w-[900px] mx-auto w-full px-4 py-8">

        {/* Back Button */}
        <button
          onClick={() => navigate(`/problems/${id}`)}
          className="inline-flex items-center gap-2 text-[#10b981] hover:text-[#065f46] font-semibold mb-8 transition hover:-translate-x-1"
        >
          <ArrowLeft size={20} />
          Back to Problem
        </button>

        <div className="flex flex-col gap-8">

          {/* Header */}
          <section className="bg-gradient-to-r from-[#173229] to-[#059669] text-white p-8 rounded-xl">

            <h1 className="text-[1.5rem] font-bold mb-4 text-white">
              Tracking History
            </h1>

            <div className="flex md:flex-col gap-4 justify-between items-start">

              <h2 className="text-[1.75rem] md:text-[1.3rem] font-semibold text-white">
                {problem.title}
              </h2>

              <span className={`px-4 py-2 rounded-md text-[0.85rem] text-white font-semibold uppercase whitespace-nowrap ${statusStyles[problem.status]}`}>
                {getStatusLabel(problem.status)}
              </span>

            </div>

          </section>

          {/* Timeline */}
          <section className="bg-white border-2 border-[#d1fae5] rounded-xl p-8">

            {tracking.length > 0 ? (
              <div className="flex flex-col gap-6">

                {tracking.map((entry, index) => (
                  <div key={entry._id} className="flex gap-6">

                    {/* Marker */}
                    <div className="flex flex-col items-center relative">

                      <div
                        className="w-4 h-4 rounded-full border-[3px] border-gray-100 shrink-0"
                        style={{
                          backgroundColor: getStatusColor(entry.status)
                        }}
                      ></div>

                      {index < tracking.length - 1 && (
                        <div className="w-[2px] h-20 mt-2 bg-gradient-to-b from-[#d1fae5] to-transparent"></div>
                      )}

                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-100 rounded-lg border-l-4 border-[#10b981] p-4">

                      <div className="flex md:flex-col gap-4 justify-between mb-3">

                        <h3 className="text-gray-700 font-semibold">
                          Status Changed to{' '}
                          <span className="text-[#10b981] font-bold">
                            {getStatusLabel(entry.status)}
                          </span>
                        </h3>

                        <span className="flex items-center gap-2 text-gray-500 text-[0.85rem] whitespace-nowrap">
                          <Calendar size={16} />
                          {new Date(entry.createdAt).toLocaleDateString()} at{' '}
                          {new Date(entry.createdAt).toLocaleTimeString()}
                        </span>

                      </div>

                      <div className="mb-2">
                        <span className="flex items-center gap-2 text-gray-500 text-[0.9rem]">
                          <User size={16} />
                          Updated by:
                          <strong className="text-[#065f46]">
                            {entry.updatedBy?.name || 'Unknown'}
                          </strong>
                        </span>
                      </div>

                      {entry.note && (
                        <p className="mt-3 pt-3 border-t border-gray-300 italic text-gray-700">
                          {entry.note}
                        </p>
                      )}

                    </div>
                  </div>
                ))}

              </div>
            ) : (
              <div className="text-center bg-gray-100 rounded-lg px-8 py-12 text-gray-500">
                No tracking history available yet.
              </div>
            )}

          </section>

          {/* Summary */}
          <section className="bg-white border-2 border-gray-300 rounded-xl p-8">

            <h3 className="text-[#065f46] text-xl font-bold mb-6">
              Summary
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {[
                ['Total Changes', tracking.length],
                ['Current Status', getStatusLabel(problem.status)],
                ['Created', new Date(problem.createdAt).toLocaleDateString()],
                [
                  'Last Updated',
                  tracking.length > 0
                    ? new Date(tracking[0].createdAt).toLocaleDateString()
                    : new Date(problem.createdAt).toLocaleDateString()
                ]
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] border-2 border-[#10b981] rounded-lg p-4 text-center flex flex-col items-center"
                >
                  <span className="text-[0.85rem] font-semibold uppercase text-gray-500 mb-2">
                    {item[0]}
                  </span>

                  <span
                    className={`text-[1.25rem] font-bold ${
                      item[0] === 'Current Status'
                        ? ''
                        : 'text-[#065f46]'
                    }`}
                    style={
                      item[0] === 'Current Status'
                        ? { color: getStatusColor(problem.status) }
                        : {}
                    }
                  >
                    {item[1]}
                  </span>
                </div>
              ))}

            </div>

          </section>

        </div>
      </div>
    </div>
  );
};

export default TrackingHistory;