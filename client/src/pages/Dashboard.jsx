import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import {
	Plus,
	TrendingUp,
	MessageSquare,
	CheckCircle,
	MapPin,
	User,
	UserCheck,
	AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import API from "../utils/api.js";
import { useAuthUser } from "../utils/useAuthUser.js";
import { setAuthData } from "../utils/auth.js";
import { useNavigate } from "react-router";

const Dashboard = () => {
	const { user } = useAuthUser();
	const navigate = useNavigate();
	const [stats, setStats] = useState({
		totalProblems: 0,
		openProblems: 0,
		activeSolutions: 0,
		completedProblems: 0,
		myContributions: 0,
	});

	const [recentProblems, setRecentProblems] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);

	const normalizeStatus = (status) => {
		const value = String(status || "open")
			.toLowerCase()
			.replace(/\s+/g, "-");

		if (value === "inprogress") return "in-progress";
		if (["open", "in-progress", "completed"].includes(value)) return value;

		return "open";
	};

	const formatStatus = (status) => {
		if (!status) return "Unknown";

		return status === "in-progress"
			? "In Progress"
			: status.charAt(0).toUpperCase() + status.slice(1);
	};

	useEffect(() => {
		const refreshUser = async () => {
			try {
				const res = await API.get("/auth/me");
				if (res.data?.user) {
					setAuthData(res.data.user, localStorage.getItem("token") || "");
				}
			} catch {
				// ignore profile refresh errors
			}
		};

		const fetchDashboardData = async () => {
			try {
				const problemsRes = await API.get("/problems");
				const notificationsRes = await API.get("/notifications");

				const problems = problemsRes.data.problems || [];

				setRecentProblems(problems.slice(0, 5));

				const completed = problems.filter(
					(p) => p.status === "completed",
				).length;

				const inProgress = problems.filter(
					(p) => p.status === "in-progress",
				).length;

				const open = problems.filter((p) => p.status === "open").length;

				setStats({
					totalProblems: problems.length,
					openProblems: open,
					activeSolutions: inProgress,
					completedProblems: completed,
					myContributions: 0,
				});

				setNotifications(notificationsRes.data.notifications || []);
			} catch (error) {
				toast.error("Failed to load dashboard data");
			} finally {
				setLoading(false);
			}
		};

		refreshUser();
		fetchDashboardData();
	}, []);

	const badgeStyles = {
		open: "bg-blue-100 text-[#0c2340]",
		"in-progress": "bg-amber-100 text-[#92400e]",
		completed: "bg-[#d1fae5] text-[#065f46]",
	};

	return (
		<div className="flex flex-col min-h-screen bg-white">
			<Navbar user={user} notifications={notifications} />

			<div className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-8">
				{/* Header */}
				<section className="flex md:flex-col md:items-start md:gap-4 justify-between items-center mb-8 pb-6 border-b-2 border-[#d1fae5]">
					<div>
						<h1 className="text-[2rem] text-[#065f46] font-bold mb-1">
							Welcome, {user?.name}!
						</h1>

						<p className="text-[0.95rem] text-gray-500">
							Your Community Problem Solver Dashboard
						</p>
					</div>

					<button
						onClick={() => navigate("/create-problem")}
						className="w-auto md:w-full bg-[#10b981] hover:bg-[#065f46] text-white px-5 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
					>
						<Plus size={20} />
						Post a Problem
					</button>
				</section>

				{/* {user?.role === "user" && user?.volunteerStatus !== "approved" && (
					<section className="mb-8 bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] border-2 border-[#10b981] rounded-xl p-6 flex md:flex-col items-center justify-between gap-4">
						<div>
							<h2 className="text-[1.25rem] font-bold text-[#065f46]">
								Become a Community Volunteer
							</h2>
							<p className="text-sm text-gray-600">
								Help verify issues in your city and approve completion requests.
							</p>
							{user?.volunteerStatus === "pending" && (
								<p className="text-xs text-amber-700 mt-2">
									Your application is pending approval.
								</p>
							)}
						</div>
						<button
							onClick={() => navigate("/volunteer-apply")}
							className="bg-white border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
						>
							<UserCheck size={18} />
							Apply as Volunteer
						</button>
					</section>
				)} */}

				{user?.role === "user" && user?.volunteerStatus !== "approved" && (
					<section className="mb-8 bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] border-2 border-[#10b981] rounded-xl p-6 flex md:flex-col items-center justify-between gap-4">
						<div>
							<h2 className="text-[1.25rem] font-bold text-[#065f46]">
								Become a Community Volunteer
							</h2>

							<p className="text-sm text-gray-600">
								Help verify issues in your city and approve completion requests.
							</p>

							{/* {user?.volunteerStatus === "pending" && (
								<p className="text-xs text-amber-700 mt-2">
									Your application is pending approval.
								</p>
							)} */}
						</div>

						{user?.volunteerStatus === "pending" ? (
							<button
								disabled
								className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg font-semibold cursor-not-allowed flex items-center gap-2"
							>
								<UserCheck size={18} />
								Pending Approval
							</button>
						) : (
							<button
								onClick={() => navigate("/volunteer-apply")}
								className="bg-white border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
							>
								<UserCheck size={18} />
								Apply as Volunteer
							</button>
						)}
					</section>
				)}

				{loading ? (
					<div className="flex justify-center py-20">
						<div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
					</div>
				) : (
					<>
						{/* Stats */}
						<section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
							{/* Card */}
							<div className="cursor-pointer bg-gradient-to-br from-white to-[#d1fae5] border-2 border-[#d1fae5] rounded-xl p-6 flex md:flex-col md:text-center items-center gap-6 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)] hover:border-[#10b981] transition">
								<div className="w-[60px] h-[60px] rounded-xl bg-[#10b981] text-white flex items-center justify-center">
									<TrendingUp size={24} />
								</div>

								<div>
									<h3 className="text-[1.75rem] font-bold text-[#065f46] leading-none">
										{stats.totalProblems}
									</h3>
									<p className="text-[0.9rem] text-gray-500 mt-1">
										Total Problems
									</p>
								</div>
							</div>

							<div className="cursor-pointer bg-gradient-to-br from-white to-[#d1fae5] border-2 border-[#d1fae5] rounded-xl p-6 flex md:flex-col md:text-center items-center gap-6 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)] hover:border-[#10b981] transition">
								<div className="w-[60px] h-[60px] rounded-xl bg-orange-500 text-white flex items-center justify-center">
									<AlertCircle size={24} />
								</div>

								<div>
									<h3 className="text-[1.75rem] font-bold text-[#065f46]">
										{stats.openProblems}
									</h3>
									<p className="text-[0.9rem] text-gray-500 mt-1">
										Open Problems
									</p>
								</div>
							</div>

							<div className="cursor-pointer bg-gradient-to-br from-white to-[#d1fae5] border-2 border-[#d1fae5] rounded-xl p-6 flex md:flex-col md:text-center items-center gap-6 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)] hover:border-[#10b981] transition">
								<div className="w-[60px] h-[60px] rounded-xl bg-blue-500 text-white flex items-center justify-center">
									<MessageSquare size={24} />
								</div>

								<div>
									<h3 className="text-[1.75rem] font-bold text-[#065f46]">
										{stats.activeSolutions}
									</h3>
									<p className="text-[0.9rem] text-gray-500 mt-1">
										In Progress
									</p>
								</div>
							</div>

							<div className="cursor-pointer bg-gradient-to-br from-white to-[#d1fae5] border-2 border-[#d1fae5] rounded-xl p-6 flex md:flex-col md:text-center items-center gap-6 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)] hover:border-[#10b981] transition">
								<div className="w-[60px] h-[60px] rounded-xl bg-[#10b981] text-white flex items-center justify-center">
									<CheckCircle size={24} />
								</div>

								<div>
									<h3 className="text-[1.75rem] font-bold text-[#065f46]">
										{stats.completedProblems}
									</h3>
									<p className="text-[0.9rem] text-gray-500 mt-1">Completed</p>
								</div>
							</div>

							<div className="cursor-pointer bg-gradient-to-br from-white to-[#d1fae5] border-2 border-[#d1fae5] rounded-xl p-6 flex md:flex-col md:text-center items-center gap-6 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)] hover:border-[#10b981] transition">
								<div className="w-[60px] h-[60px] rounded-xl bg-amber-500 text-white flex items-center justify-center">
									<TrendingUp size={24} />
								</div>

								<div>
									<h3 className="text-[1.75rem] font-bold text-[#065f46]">
										{stats.myContributions}
									</h3>
									<p className="text-[0.9rem] text-gray-500 mt-1">
										My Contributions
									</p>
								</div>
							</div>
						</section>

						{/* Recent Problems */}
						<section>
							<h2 className="text-2xl font-bold text-[#065f46] mb-5">
								Recent Problems
							</h2>

							<div className="flex flex-col gap-4">
								{recentProblems.length > 0 ? (
									recentProblems.map((problem) => {
										const status = normalizeStatus(problem.status);

										return (
											<div
												key={problem._id}
												className="bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-[#10b981] hover:shadow-[0_4px_12px_rgba(16,185,129,0.1)] transition"
											>
												<div className="flex md:flex-col md:items-start md:gap-3 justify-between items-center mb-3">
													<h3 className="text-[1.1rem] font-semibold text-[#065f46]">
														{problem.title}
													</h3>

													<span
														className={`inline-flex items-center justify-center min-w-[110px] px-3 py-1 rounded-full text-[0.8rem] font-bold uppercase ${badgeStyles[status]}`}
													>
														{formatStatus(problem.status)}
													</span>
												</div>

												<p className="text-gray-700 text-[0.95rem] leading-relaxed my-2">
													{problem.description}
												</p>

												<div className="flex md:flex-col gap-4 text-[0.85rem] text-gray-500 mt-4 pt-4 border-t border-gray-300">
													<span className="flex items-center gap-1">
														<MapPin size={16} />
														{problem.location}
													</span>

													<span className="flex items-center gap-1">
														<User size={16} />
														{problem.user?.name}
													</span>
												</div>
											</div>
										);
									})
								) : (
									<div className="text-center border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-100">
										<img
											src="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80"
											alt="No community reports yet"
											className="w-full max-w-[640px] h-[220px] object-cover rounded-lg mb-3 mx-auto"
										/>

										<p className="text-gray-500">No problems reported yet</p>
									</div>
								)}
							</div>
						</section>
					</>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
