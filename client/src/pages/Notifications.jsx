import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { Bell, CheckCheck, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../utils/api.js';
import { useAuthUser } from '../utils/useAuthUser.js';

const Notifications = () => {
    const { user } = useAuthUser();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await API.get('/notifications');
            setNotifications(response.data.notifications || []);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Failed to load notifications'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await API.patch(`/notifications/read/${id}`);

            setNotifications((prev) =>
                prev.map((item) =>
                    item._id === id
                        ? { ...item, isRead: true }
                        : item
                )
            );

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Failed to mark as read'
            );
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.patch('/notifications/read-all');

            setNotifications((prev) =>
                prev.map((item) => ({
                    ...item,
                    isRead: true
                }))
            );

            toast.success('All notifications marked as read');

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Failed to mark all as read'
            );
        }
    };

    const formatDateTime = (value) =>
        new Date(value).toLocaleString();

    return (
        <div className="min-h-screen bg-white">
            <Navbar
                user={user}
                notifications={notifications}
            />

            <div className="max-w-[1000px] mx-auto px-4 py-8">

                {/* Header */}
                <section className="flex md:flex-col md:items-start justify-between items-center gap-4 mb-8 pb-4 border-b-2 border-[#d1fae5]">

                    <div>
                        <h1 className="flex items-center gap-2 text-[2rem] font-bold text-[#065f46] mb-1">
                            <Bell size={22} />
                            Notifications
                        </h1>

                        <p className="text-gray-500">
                            Stay updated on problem status, solutions, and community activity.
                        </p>
                    </div>

                    <button
                        onClick={markAllAsRead}
                        disabled={notifications.length === 0}
                        className="border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCheck size={18} />
                        Mark All Read
                    </button>

                </section>

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
                    </div>

                ) : notifications.length === 0 ? (

                    /* Empty State */
                    <div className="text-center bg-gray-100 rounded-xl p-6">

                        <img
                            src="https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=1000&q=80"
                            alt="No notifications"
                            className="w-full max-w-[600px] h-[220px] object-cover rounded-xl mb-4 mx-auto"
                        />

                        <h3 className="text-xl font-semibold text-[#065f46] mb-1">
                            No notifications yet
                        </h3>

                        <p className="text-gray-500">
                            When there is activity on your problems and solutions,
                            updates will appear here.
                        </p>

                    </div>

                ) : (

                    /* List */
                    <section className="flex flex-col gap-4">

                        {notifications.map((item) => (
                            <article
                                key={item._id}
                                className={`flex md:flex-col justify-between gap-4 items-start border-2 rounded-xl p-4 bg-white ${
                                    item.isRead
                                        ? 'border-gray-300 opacity-85'
                                        : 'border-[#10b981] bg-[#ecfdf5]'
                                }`}
                            >

                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-[#065f46] mb-1">
                                        {item.title}
                                    </h3>

                                    <p className="text-gray-700 mb-2">
                                        {item.message}
                                    </p>

                                    <span className="text-[0.85rem] text-gray-500">
                                        {formatDateTime(item.createdAt)}
                                    </span>
                                </div>

                                {!item.isRead && (
                                    <button
                                        onClick={() => markAsRead(item._id)}
                                        className="w-auto md:w-full md:justify-center bg-[#10b981] hover:bg-[#065f46] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
                                    >
                                        <Check size={18} />
                                        Mark Read
                                    </button>
                                )}

                            </article>
                        ))}

                    </section>
                )}
            </div>
        </div>
    );
};

export default Notifications;