import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { Plus, Search, MapPin, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../utils/api.js';
import { useAuthUser } from '../utils/useAuthUser.js';
import noImage from '../assets/no-image.jpg';

const Problems = () => {
  const navigate = useNavigate();
  const { user } = useAuthUser();

  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [mapCoordsById, setMapCoordsById] = useState({});
  const [mapLoadingIds, setMapLoadingIds] = useState({});
  const mapCoordsRef = useRef({});
  const mapLoadingRef = useRef({});

  useEffect(() => {
    fetchProblems();
    fetchNotifications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [problems, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    mapCoordsRef.current = mapCoordsById;
  }, [mapCoordsById]);

  useEffect(() => {
    mapLoadingRef.current = mapLoadingIds;
  }, [mapLoadingIds]);

  useEffect(() => {
    const controller = new AbortController();

    const loadMaps = async () => {
      const targets = filteredProblems.slice(0, 9);
      for (const problem of targets) {
        if (!problem?.location || mapCoordsRef.current[problem._id] || mapLoadingRef.current[problem._id]) {
          continue;
        }

        setMapLoadingIds((prev) => ({ ...prev, [problem._id]: true }));

        try {
          const query = encodeURIComponent(problem.location);
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`, {
            signal: controller.signal
          });
          const data = await res.json();
          const first = data?.[0];
          if (first) {
            setMapCoordsById((prev) => ({
              ...prev,
              [problem._id]: { lat: Number(first.lat), lng: Number(first.lon) }
            }));
          }
        } catch (error) {
          if (error?.name === 'AbortError') {
            break;
          }
        } finally {
          setMapLoadingIds((prev) => ({ ...prev, [problem._id]: false }));
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    };

    if (filteredProblems.length > 0) {
      loadMaps();
    }

    return () => controller.abort();
  }, [filteredProblems]);

  const fetchProblems = async () => {
    try {
      const res = await API.get('/problems');
      setProblems(res.data.problems || []);
    } catch {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch {}
  };

  const applyFilters = () => {
    let filtered = [...problems];

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      filtered.sort((a, b) => {
        const order = { open: 0, 'in-progress': 1, completed: 2 };
        return order[a.status] - order[b.status];
      });
    }

    setFilteredProblems(filtered);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const days = Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return d.toLocaleDateString();
  };

  const statusStyles = {
    open: 'bg-[#d8e5ff] text-[#12335f] border-[#9ec0ff]',
    'in-progress': 'bg-[#ffefcc] text-[#854d0e] border-[#f9cf73]',
    completed: 'bg-[#c9f1df] text-[#0b6f4a] border-[#82d8b3]'
  };

  const buildMapUrl = (lat, lng) => {
    const delta = 0.01;
    const left = lng - delta;
    const right = lng + delta;
    const top = lat + delta;
    const bottom = lat - delta;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar user={user} notifications={notifications} />

      <div className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-8">

        {/* Header */}
        <section className="flex md:flex-col gap-8 justify-between items-start mb-8 pb-6 border-b-2 border-[#d1fae5]">

          <div>
            <h1 className="text-[2.5rem] font-bold text-[#065f46] mb-1">
              Community Problems
            </h1>

            <p className="text-gray-500 text-[0.95rem]">
              Discover and contribute to solving local issues
            </p>
          </div>

          <button
            onClick={() => navigate('/create-problem')}
            className="w-auto md:w-full bg-[#10b981] hover:bg-[#065f46] text-white px-5 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <Plus size={20} />
            Report Problem
          </button>

        </section>

        {/* Filters */}
        <section className="mb-8 bg-gray-100 p-6 rounded-lg border border-gray-300">

          <div className="flex items-center bg-white border-2 border-gray-300 focus-within:border-[#10b981] rounded-lg px-4 py-3 mb-6">

            <Search size={20} className="text-[#10b981] mr-3" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search problems by title, description, or location..."
              className="flex-1 outline-none"
            />

          </div>

          <div className="flex md:flex-row justify-between gap-8">

            {/* Status */}
            <div className="flex md:flex-col md:items-start items-center gap-4">

              <label className="font-semibold text-gray-700">
                Status:
              </label>

              <div className="flex flex-wrap gap-2 w-full">

                {['all', 'open', 'in-progress', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-md border-2 font-medium transition flex-1 md:flex-none ${
                      statusFilter === status
                        ? 'bg-[#10b981] text-white border-[#10b981]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#10b981]'
                    }`}
                  >
                    {status === 'all'
                      ? 'All'
                      : status === 'in-progress'
                      ? 'In Progress'
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}

              </div>
            </div>

            {/* Sort */}
            <div className="flex md:flex-col md:items-start items-center gap-4">

              <label className="font-semibold text-gray-700">
                Sort by:
              </label>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-md border-2 border-gray-300 focus:border-[#10b981] outline-none bg-white w-full md:w-auto"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="urgent">Most Urgent</option>
              </select>

            </div>

          </div>
        </section>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
          </div>

        ) : filteredProblems.length > 0 ? (

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {filteredProblems.map((problem) => (
              <div
                key={problem._id}
                onClick={() => navigate(`/problems/${problem._id}`)}
                className="relative cursor-pointer bg-white border-2 border-gray-300 rounded-xl p-5 flex flex-col h-full hover:border-[#10b981] hover:shadow-[0_8px_24px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition"
              >

                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-t-xl"></div>

                <div className="flex md:flex-col gap-3 justify-between mb-3">

                  <h3 className="text-[1.25rem] font-semibold text-[#065f46] leading-7">
                    {problem.title}
                  </h3>

                  <span className={`inline-flex min-w-[126px] justify-center px-4 py-1 rounded-full text-[0.78rem] font-bold border ${statusStyles[problem.status]}`}>
                    {problem.status === 'in-progress'
                      ? 'In Progress'
                      : problem.status.charAt(0).toUpperCase() +
                        problem.status.slice(1)}
                  </span>

                </div>

                <p className="text-gray-500 text-[0.95rem] leading-6 mb-4">
                  {problem.description.substring(0, 120)}...
                </p>

                <div className="flex justify-between gap-3 py-4 border-y border-gray-300 text-[0.85rem] text-gray-500 mb-4">

                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#10b981]" />
                    {problem.location}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#10b981]" />
                    {formatDate(problem.createdAt)}
                  </div>

                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-[0.88rem] text-gray-500">
                    Posted by
                  </span>

                  <span className="text-[1.1rem] font-bold text-[#065f46]">
                    {problem.user?.name || 'Anonymous'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-auto">
                  <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                    {mapCoordsById[problem._id] ? (
                      <iframe
                        title={`Map for ${problem.title}`}
                        src={buildMapUrl(mapCoordsById[problem._id].lat, mapCoordsById[problem._id].lng)}
                        className="w-full h-full pointer-events-none"
                        loading="lazy"
                      />
                    ) : mapLoadingIds[problem._id] ? (
                      <span className="text-sm text-gray-500">Loading map...</span>
                    ) : (
                      <span className="text-sm text-gray-500">Map not available</span>
                    )}
                  </div>

                  <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0]">
                    <img
                      src={
                        problem.image
                          ? problem.image
                          : noImage
                      }
                      alt={problem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

              </div>
            ))}

          </section>

        ) : (

          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <p className="text-gray-500 text-lg mb-4">
              No problems found matching your criteria.
            </p>

            <button
              onClick={() => navigate('/create-problem')}
              className="bg-[#10b981] hover:bg-[#065f46] text-white px-5 py-3 rounded-lg font-semibold transition"
            >
              Be the first to report
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Problems;