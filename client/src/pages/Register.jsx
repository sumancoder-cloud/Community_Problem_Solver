import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../utils/api.js';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
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

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await API.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            navigate('/otp-verify', {
                state: {
                    email: formData.email,
                    isNewUser: true
                }
            });

            toast.success('Registration successful! OTP sent to your email');

        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] p-4">

            <div className="bg-white rounded-xl p-10 w-full max-w-[420px] shadow-[0_10px_40px_rgba(16,185,129,0.15)] border-2 border-[#bbf7d0] max-[480px]:p-6">

                <div className="text-center mb-8">
                    <h1 className="text-[1.75rem] max-[480px]:text-[1.5rem] text-[#065f46] font-bold mb-2">
                        Create Account
                    </h1>

                    <p className="text-[0.95rem] text-gray-500">
                        Join the Community Problem Solver
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 mb-6">

                    <div>
                        <label className="block mb-2 font-medium text-gray-700">
                            Full Name
                        </label>

                        <div className="relative flex items-center">
                            <User size={20} className="absolute left-3 text-[#10b981]" />

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#10b981]"
                            />
                        </div>
                    </div>

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
                                placeholder="Create a password"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#10b981]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-gray-700">
                            Confirm Password
                        </label>

                        <div className="relative flex items-center">
                            <Lock size={20} className="absolute left-3 text-[#10b981]" />

                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
                        <ArrowRight size={18} />
                    </button>

                </form>

                <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-[0.9rem] text-gray-600">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-[#10b981] font-semibold hover:text-[#065f46]"
                        >
                            Sign in here
                        </Link>
                    </p>

                    <p className="text-[0.9rem] text-gray-600 mt-2">
                        Want to help as a volunteer?{' '}
                        <Link
                            to="/volunteer-apply"
                            className="text-[#10b981] font-semibold hover:text-[#065f46]"
                        >
                            Apply here
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Register;