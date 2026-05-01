import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import API from "../utils/api.js";
import { REGIONS } from "../utils/regions.js";
import { useAuthUser } from "../utils/useAuthUser.js";

const VolunteerApply = () => {
	const navigate = useNavigate();
	const { user } = useAuthUser();

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		city: "",
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user) {
			setFormData((prev) => ({
				...prev,
				name: user.name || "",
				email: user.email || "",
			}));
		}
	}, [user]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.city) {
			toast.error("Please select a city");
			return;
		}

		if (!user && formData.password.length < 6) {
			toast.error("Password must be at least 6 characters");
			return;
		}

		setLoading(true);

		try {
			if (user) {
				const res = await API.post("/auth/volunteer-apply", {
					city: formData.city,
				});
				toast.success(res.data.message || "Volunteer application submitted");
				navigate("/dashboard");
			} else {
				await API.post("/auth/register-volunteer", formData);
				toast.success(
					"Volunteer application submitted. OTP sent to your email",
				);
				navigate("/otp-verify", {
					state: { email: formData.email },
				});
			}
		} catch (error) {
			toast.error(
				error.response?.data?.message || "Volunteer application failed",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] p-4">
			<button
				onClick={() => navigate("/dashboard")}
				className="absolute top-6 left-6 flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
			>
				<ArrowLeft size={18} />
				Back to Dashboard
			</button>
			<div className="bg-white rounded-xl p-10 w-full max-w-[460px] shadow-[0_10px_40px_rgba(16,185,129,0.15)] border-2 border-[#bbf7d0] max-[480px]:p-6">
				<div className="text-center mb-8">
					<h1 className="text-[1.75rem] text-[#065f46] mb-2 font-bold">
						Volunteer Application
					</h1>
					<p className="text-[0.95rem] text-gray-500">
						Apply to help verify and close community issues
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5 mb-6">
					{!user && (
						<>
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
						</>
					)}

					<div>
						<label className="block mb-2 font-medium text-gray-700">
							State
						</label>
						<div className="relative flex items-center">
							<MapPin size={20} className="absolute left-3 text-[#10b981]" />
							<select
								name="city"
								value={formData.city}
								onChange={handleChange}
								required
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#10b981] bg-white"
							>
								<option value="">Select a state</option>
								{REGIONS.map((city) => (
									<option key={city} value={city}>
										{city}
									</option>
								))}
							</select>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#065f46] text-white py-3 rounded-lg font-semibold transition"
					>
						{loading ? "Submitting..." : "Submit Application"}
						<ArrowRight size={18} />
					</button>
				</form>
			</div>
		</div>
	);
};

export default VolunteerApply;
