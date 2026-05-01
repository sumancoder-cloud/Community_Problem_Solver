import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../utils/api.js';
import { setAuthData } from '../utils/auth.js';

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'user'
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await API.post('/auth/login', formData);
            const user = response.data.user;
            setAuthData(user, response.data.token);

            // if (formData.role === 'admin' && user.role !== 'admin') {
            //     toast.error('Admin access only. Please use a valid admin account.');
            //     navigate('/dashboard');
            //     return;
            // }

            // if (formData.role === 'volunteer' && user.role !== 'volunteer') {
            //     if (user.volunteerStatus === 'pending') {
            //         toast.info('Your volunteer application is pending approval.');
            //     } else {
            //         toast.error('Volunteer access only. Apply to become a volunteer.');
            //     }
            //     navigate('/dashboard');
            //     return;
            // }

            toast.success('Login successful!');

            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'volunteer') {
                navigate('/volunteer');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] p-4">
            <div className="bg-white rounded-xl p-10 w-full max-w-[420px] shadow-[0_10px_40px_rgba(16,185,129,0.15)] border-2 border-[#bbf7d0] max-[480px]:p-6">

                <div className="text-center mb-8">
                    <h1 className="text-[1.75rem] max-[480px]:text-[1.5rem] text-[#065f46] mb-2 font-bold">
                        Welcome Back
                    </h1>

                    <p className="text-[0.95rem] text-gray-500">
                        Sign in to your Community Problem Solver account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mb-6 space-y-5">

                    <div>
                        <label className="block mb-2 font-medium text-gray-700">
                            Email Address
                        </label>

                        <div className="relative flex items-center">
                            <Mail size={20} className="absolute left-3 text-[#10b981]" />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#10b981]"
                            />
                        </div>
                    </div>

                    {/* <div>
                        <label className="block mb-2 font-medium text-gray-700">
                            Login As
                        </label>

                        <div className="relative flex items-center">
                            <Users size={20} className="absolute left-3 text-[#10b981]" />
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#10b981] bg-white"
                            >
                                <option value="user">User</option>
                                <option value="volunteer">Volunteer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div> */}

                    <div>
                        <label className="block mb-2 font-medium text-gray-700">
                            Password
                        </label>

                        <div className="relative flex items-center">
                            <Lock size={20} className="absolute left-3 text-[#10b981]" />

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#10b981]"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#065f46] text-white py-3 rounded-lg font-semibold transition"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                        <ArrowRight size={18} />
                    </button>

                </form>

                <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-[0.9rem] text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-[#10b981] font-semibold hover:text-[#065f46]"
                        >
                            Sign up here
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;