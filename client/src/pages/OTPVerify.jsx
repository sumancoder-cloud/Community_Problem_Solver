import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, RotateCw } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../utils/api.js';
import { setAuthData } from '../utils/auth.js';

const OTPVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || '';
    const desiredRole = location.state?.desiredRole || 'user';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    const inputRefs = useRef([]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setTimeout(() => {
                setTimer(timer - 1);
            }, 1000);

            return () => clearTimeout(interval);
        }
    }, [timer]);

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] p-4">
                <div className="bg-white rounded-xl p-10 max-w-[420px] w-full border-2 border-[#d1fae5] shadow-[0_10px_40px_rgba(16,185,129,0.15)] text-center max-[480px]:p-6">

                    <p className="text-gray-700 mb-6">
                        Please login or register first
                    </p>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-[#10b981] hover:bg-[#065f46] text-white py-3 rounded-lg font-semibold transition"
                    >
                        Go to Login
                    </button>

                </div>
            </div>
        );
    }

    const handleInputChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const otpString = otp.join('');

        if (otpString.length !== 6) {
            toast.error('Please enter a 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            const response = await API.post('/auth/verify-otp', {
                email,
                otp: otpString
            });

            const user = response.data.user;
            setAuthData(user, response.data.token);

            if (desiredRole === 'admin' && user.role !== 'admin') {
                toast.error('Admin access only. Please use a valid admin account.');
                navigate('/dashboard');
                return;
            }

            if (desiredRole === 'volunteer' && user.role !== 'volunteer') {
                if (user.volunteerStatus === 'pending') {
                    toast.info('Your volunteer application is pending approval.');
                } else {
                    toast.error('Volunteer access only. Apply to become a volunteer.');
                }
                navigate('/dashboard');
                return;
            }

            toast.success('Login successful!');

            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'volunteer') {
                navigate('/volunteer');
            } else {
                navigate('/dashboard');
            }

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'OTP verification failed'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);

        try {
            await API.post('/auth/resend-otp', { email });

            setOtp(['', '', '', '', '', '']);
            setTimer(60);

            toast.success('OTP sent again');

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Failed to resend OTP'
            );
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] p-4">

            <div className="bg-white rounded-xl p-10 w-full max-w-[420px] border-2 border-[#d1fae5] shadow-[0_10px_40px_rgba(16,185,129,0.15)] max-[480px]:p-6">

                {/* Header */}
                <div className="text-center mb-8">

                    <h1 className="text-[1.75rem] max-[480px]:text-[1.5rem] font-bold text-[#065f46] mb-2">
                        Verify Your Email
                    </h1>

                    <p className="text-[0.95rem] text-gray-500 break-all">
                        Enter the 6-digit OTP sent to {email}
                    </p>

                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mb-6">

                    <div className="flex justify-center gap-2 mb-4">

                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) =>
                                    (inputRefs.current[index] = el)
                                }
                                type="text"
                                value={digit}
                                maxLength="1"
                                inputMode="numeric"
                                onChange={(e) =>
                                    handleInputChange(
                                        index,
                                        e.target.value
                                    )
                                }
                                onKeyDown={(e) =>
                                    handleKeyDown(index, e)
                                }
                                className="w-[50px] h-[50px] text-center text-[1.5rem] font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#10b981]"
                            />
                        ))}

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#065f46] text-white py-3 rounded-lg font-semibold transition"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                        <ArrowRight size={18} />
                    </button>

                </form>

                {/* Resend */}
                <div className="text-center mt-4">

                    {timer > 0 ? (
                        <p className="text-[0.9rem] text-gray-700">
                            Resend in {timer} seconds
                        </p>
                    ) : (
                        <button
                            onClick={handleResendOTP}
                            disabled={resendLoading}
                            className="text-[#10b981] hover:text-[#065f46] font-semibold underline inline-flex items-center gap-2 transition"
                        >
                            <RotateCw
                                size={16}
                                className={
                                    resendLoading
                                        ? 'animate-spin'
                                        : ''
                                }
                            />

                            {resendLoading
                                ? 'Resending...'
                                : 'Resend OTP'}
                        </button>
                    )}

                </div>

            </div>
        </div>
    );
};

export default OTPVerify;