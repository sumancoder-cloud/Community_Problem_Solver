import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { logout } from '../utils/auth.js';

const Navbar = ({ user, notifications = [] }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const unreadCount =
        notifications.filter((n) => !n.isRead).length;

    const navLinkClass = (path) =>
        `font-medium py-2 transition-all duration-300 border-b-2 ${
            location.pathname === path
                ? 'text-[#10b981] border-[#10b981]'
                : 'text-gray-800 border-transparent hover:text-[#10b981] hover:border-[#10b981]'
        }`;

    return (
        <nav className="bg-white border-b-2 border-[#d1fae5] py-4 sticky top-0 z-[100] shadow-[0_2px_4px_rgba(0,0,0,0.05)]">

            <div className="mx-auto px-4 flex justify-between items-center relative gap-4">

                {/* Logo */}
                <div>
                    <h1
                        onClick={() => navigate('/dashboard')}
                        className="text-[#10b981] text-[1.5rem] font-bold cursor-pointer"
                    >
                        Community Problem Solver
                    </h1>
                </div>
                <div className="flex justify-between">
                {/* Desktop Menu */}
                <div className="hidden md:hidden lg:flex gap-8 mx-8 flex-1">

                    <button
                        onClick={() => navigate('/dashboard')}
                        className={navLinkClass('/dashboard')}
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={() => navigate('/problems')}
                        className={navLinkClass('/problems')}
                    >
                        Problems
                    </button>

                    <button
                        onClick={() => navigate('/create-problem')}
                        className={navLinkClass('/create-problem')}
                    >
                        Report Problem
                    </button>

                    {/* <button
                        onClick={() => navigate('/notifications')}
                        className={navLinkClass('/notifications')}
                    >
                        Notifications
                    </button> */}

                    {user?.role === 'volunteer' && (
                        <button
                            onClick={() => navigate('/volunteer')}
                            className={navLinkClass('/volunteer')}
                        >
                            Volunteer
                        </button>
                    )}

                    {user?.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin')}
                            className={navLinkClass('/admin')}
                        >
                            Admin
                        </button>
                    )}

                    {user && user.role === 'user' && user.volunteerStatus !== 'approved' && (
                        <button
                            onClick={() => navigate('/volunteer-apply')}
                            className={navLinkClass('/volunteer-apply')}
                        >
                            Volunteer Apply
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/regions')}
                        className={navLinkClass('/regions')}
                    >
                        Regions
                    </button>

                    {/* {user && (
                        <button
                            onClick={() => navigate('/profile')}
                            className={navLinkClass('/profile')}
                        >
                            My Profile
                        </button>
                    )} */}

                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">

                    {user && (
                        <>
                            {/* Bell */}
                            <button
                                onClick={() =>
                                    navigate('/notifications')
                                }
                                title="Notifications"
                                className="relative text-gray-800 hover:text-[#10b981] transition"
                            >
                                <Bell size={20} />

                                {unreadCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-[0.75rem] font-semibold flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* User */}
                            <button
                                onClick={() =>
                                    navigate('/profile')
                                }
                                className="hidden sm:flex flex-col items-start hover:text-[#10b981] transition"
                            >
                                <span className="text-gray-800 font-medium text-[0.9rem]">
                                    {user.name}
                                </span>
                            </button>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                title="Logout"
                                className="bg-red-200 text-red-900 p-2 rounded-md hover:bg-red-100 hover:scale-105 transition"
                            >
                                <LogOut size={20} />
                            </button>
                        </>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() =>
                            setMobileMenuOpen(!mobileMenuOpen)
                        }
                        className="lg:hidden text-gray-800"
                    >
                        {mobileMenuOpen ? (
                            <X size={24} />
                        ) : (
                            <Menu size={24} />
                        )}
                    </button>

                </div>
                </div>
                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b-2 border-[#d1fae5] p-4 flex flex-col gap-4 shadow-md">

                        <button
                            onClick={() => {
                                navigate('/dashboard');
                                setMobileMenuOpen(false);
                            }}
                            className={navLinkClass('/dashboard')}
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={() => {
                                navigate('/problems');
                                setMobileMenuOpen(false);
                            }}
                            className={navLinkClass('/problems')}
                        >
                            Problems
                        </button>

                        <button
                            onClick={() => {
                                navigate('/create-problem');
                                setMobileMenuOpen(false);
                            }}
                            className={navLinkClass('/create-problem')}
                        >
                            Report Problem
                        </button>

                        <button
                            onClick={() => {
                                navigate('/notifications');
                                setMobileMenuOpen(false);
                            }}
                            className={navLinkClass('/notifications')}
                        >
                            Notifications
                        </button>

                        {user?.role === 'volunteer' && (
                            <button
                                onClick={() => {
                                    navigate('/volunteer');
                                    setMobileMenuOpen(false);
                                }}
                                className={navLinkClass('/volunteer')}
                            >
                                Volunteer
                            </button>
                        )}

                        {user?.role === 'admin' && (
                            <button
                                onClick={() => {
                                    navigate('/admin');
                                    setMobileMenuOpen(false);
                                }}
                                className={navLinkClass('/admin')}
                            >
                                Admin
                            </button>
                        )}

                        {user && user.role === 'user' && user.volunteerStatus !== 'approved' && (
                            <button
                                onClick={() => {
                                    navigate('/volunteer-apply');
                                    setMobileMenuOpen(false);
                                }}
                                className={navLinkClass('/volunteer-apply')}
                            >
                                Volunteer Apply
                            </button>
                        )}

                        <button
                            onClick={() => {
                                navigate('/regions');
                                setMobileMenuOpen(false);
                            }}
                            className={navLinkClass('/regions')}
                        >
                            Regions
                        </button>

                        {user && (
                            <button
                                onClick={() => {
                                    navigate('/profile');
                                    setMobileMenuOpen(false);
                                }}
                                className={navLinkClass('/profile')}
                            >
                                My Profile
                            </button>
                        )}

                    </div>
                )}

            </div>
        </nav>
    );
};

export default Navbar;