import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { Edit2, LogOut, MapPin, Star } from "lucide-react";
import { toast } from "react-toastify";
import API from "../utils/api.js";
import { logout, setAuthData } from "../utils/auth.js";
import { useAuthUser } from "../utils/useAuthUser.js";

const UserProfile = () => {
	const navigate = useNavigate();
	const { user: currentUser, token } = useAuthUser();

	const [user, setUser] = useState(currentUser);
	const [isEditing, setIsEditing] = useState(false);

	const [editForm, setEditForm] = useState({
		name: currentUser?.name || "",
		email: currentUser?.email || "",
	});

	const [myProblems, setMyProblems] = useState([]);
	const [mySolutions, setMySolutions] = useState([]);
	const [stats, setStats] = useState({
		totalProblems: 0,
		activeSolutions: 0,
		totalVotes: 0,
		discussionsMade: 0,
	});

	const [loading, setLoading] = useState(true);
	const [notifications, setNotifications] = useState([]);

	useEffect(() => {
		if (!currentUser) {
			navigate("/login");
			return;
		}
		refreshUser();
		fetchUserData();
	}, []);

	const refreshUser = async () => {
		try {
			const res = await API.get("/auth/me");
			if (res.data?.user && token) {
				setAuthData(res.data.user, token);
				setUser(res.data.user);
				setEditForm({
					name: res.data.user.name || "",
					email: res.data.user.email || "",
				});
			}
		} catch (error) {
			console.log(error);
		}
	};

	const fetchStats = async () => {
		try {
			const res = await API.get("/auth/profile-stats");
			setStats(res.data);
		} catch (err) {
			console.error(err);
			toast.error("Failed to load stats");
		}
	};

	const fetchProblems = async () => {
		try {
			const res = await API.get("/problems/user");
			setMyProblems(res.data.problems || []);
		} catch (err) {
			console.error(err);
		}
	};

	const fetchSolutions = async () => {
		try {
			const res = await API.get("/solutions/user");
			setMySolutions(res.data.solutions || []);
		} catch (err) {
			console.error(err);
		}
	};

	const fetchUserData = async () => {
		try {
			await fetchStats();

			await Promise.all([
				fetchProblems(),
				fetchSolutions(),
				fetchNotifications(),
			]);
		} catch {
			toast.error("Failed to load profile data");
		} finally {
			setLoading(false);
		}
	};

	const fetchNotifications = async () => {
		try {
			const res = await API.get("/notifications");
			setNotifications(res.data.notifications || []);
		} catch (err) {
			console.error(err);
		}
	};

	const handleEditChange = (e) => {
		setEditForm({
			...editForm,
			[e.target.name]: e.target.value,
		});
	};

	const handleSaveProfile = async (e) => {
		e.preventDefault();

		if (!editForm.name.trim()) {
			toast.error("Name cannot be empty");
			return;
		}

		if (!editForm.email.trim()) {
			toast.error("Email cannot be empty");
			return;
		}

		try {
			const res = await API.put("/auth/profile", {
				name: editForm.name,
				email: editForm.email,
			});

			const updatedUser = res.data.user;
			setUser(updatedUser);
			setEditForm({
				name: updatedUser.name || "",
				email: updatedUser.email || "",
			});
			if (token) {
				setAuthData(updatedUser, token);
			}
			setIsEditing(false);

			toast.success("Profile updated successfully!");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update profile");
		}
	};

	const handleLogout = () => {
		logout();
		navigate("/login");
		toast.success("Logged out successfully");
	};

	const normalizeStatus = (status) => {
		const value = String(status || "open")
			.toLowerCase()
			.replace(/\s+/g, "-");

		if (value === "inprogress") return "in-progress";
		if (["open", "in-progress", "completed"].includes(value)) return value;

		return "open";
	};

	const getStatusLabel = (status) => {
		const normalized = normalizeStatus(status);

		if (normalized === "in-progress") return "In Progress";

		if (normalized === "completed") return "Completed";

		return "Open";
	};

	const badgeStyles = {
		open: "bg-blue-100 text-[#0c2340]",
		"in-progress": "bg-amber-100 text-[#92400e]",
		completed: "bg-[#d1fae5] text-[#065f46]",
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

	return (
		<div className="min-h-screen bg-white flex flex-col">
			<Navbar user={user} notifications={notifications} />

			<div className="flex-1 max-w-[1000px] mx-auto w-full px-4 py-8">
				{/* Header */}
				<section className="flex md:flex-col md:text-center justify-between gap-8 bg-gradient-to-br from-[#0d211b] to-[#33836a] text-white p-8 rounded-xl mb-8">
					<div className="flex md:flex-col items-center gap-6">
						<div className="w-20 h-20 rounded-full bg-white/20 border-[3px] border-white flex items-center justify-center text-[2.5rem] font-bold">
							{user?.name?.charAt(0).toUpperCase()}
						</div>

						<div>
							<h1 className="text-[1.75rem] text-white font-bold">
								{user?.name}
							</h1>

							<p className="mt-2 text-[0.95rem] opacity-90">{user?.email}</p>

							<p className="mt-2 text-[0.85rem] uppercase tracking-wide">
								Role: {user?.role || "user"}
								{user?.volunteerStatus && user?.role === "user" && (
									<p>Volunteer status : {user.volunteerStatus}</p>
								)}
							</p>
						</div>
					</div>

					<div className="flex md:flex-row justify-between gap-4">
						<button
							onClick={() => setIsEditing(!isEditing)}
							className="px-4 py-2 rounded-lg border-2 border-white text-white font-semibold flex items-center gap-2 hover:bg-white/20 transition"
						>
							<Edit2 size={18} />
							Edit Profile
						</button>

						<button
							onClick={handleLogout}
							className="px-4 py-2 rounded-lg border-2 border-white text-white font-semibold flex items-center gap-2 hover:bg-white/20 transition"
						>
							<LogOut size={18} />
							Logout
						</button>
					</div>
				</section>

				{/* Edit Form */}
				{isEditing && (
					<section className="bg-gray-100 border-2 border-[#d1fae5] rounded-xl p-8 mb-8">
						<h2 className="text-[#065f46] text-xl font-bold mb-6">
							Edit Profile
						</h2>

						<form onSubmit={handleSaveProfile}>
							<div className="mb-6">
								<label className="block font-semibold text-gray-700 mb-2">
									Full Name
								</label>

								<input
									type="text"
									name="name"
									value={editForm.name}
									onChange={handleEditChange}
									required
									className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/10"
								/>
							</div>

							<div className="mb-6">
								<label className="block font-semibold text-gray-700 mb-2">
									Email Address
								</label>

								<input
									type="email"
									name="email"
									value={editForm.email}
									onChange={handleEditChange}
									required
									className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/10"
								/>
							</div>

							<div className="flex md:flex-col gap-4 mt-8">
								<button className="flex-1 bg-[#10b981] hover:bg-[#065f46] text-white py-3 rounded-lg font-semibold transition">
									Save Changes
								</button>

								<button
									type="button"
									onClick={() => setIsEditing(false)}
									className="flex-1 border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white py-3 rounded-lg font-semibold transition"
								>
									Cancel
								</button>
							</div>
						</form>
					</section>
				)}

				{/* Stats */}
				<section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
					{[
						["Total Problems", stats.totalProblems],
						["Solutions Suggested", stats.activeSolutions],
						["Total Votes Received", stats.totalVotes],
						["Contributions", stats.totalProblems + stats.activeSolutions],
					].map((item, i) => (
						<div
							key={i}
							className="bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] border-l-4 border-[#10b981] rounded-xl p-6 text-center"
						>
							<h3 className="text-[0.9rem] text-gray-700 mb-3 font-semibold">
								{item[0]}
							</h3>

							<p className="text-[2.5rem] md:text-[2rem] font-bold text-[#065f46]">
								{item[1]}
							</p>
						</div>
					))}
				</section>

				{/* My Problems */}
				<section className="bg-white border-2 border-gray-300 rounded-xl p-8 mb-8">
					<h2 className="text-[#065f46] text-xl font-bold mb-6">
						My Problems ({myProblems.length})
					</h2>

					{myProblems.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{myProblems.map((problem) => {
								const status = normalizeStatus(problem.status);

								return (
									<div
										key={problem._id}
										onClick={() => navigate(`/problems/${problem._id}`)}
										className="cursor-pointer bg-gray-100 rounded-lg p-6 border-l-4 border-[#10b981] hover:-translate-y-1 hover:shadow-lg transition"
									>
										<h3 className="text-[#065f46] font-semibold mb-3">
											{problem.title}
										</h3>

										<p className="text-gray-500 text-sm leading-6 mb-4">
											{problem.description.substring(0, 100)}...
										</p>

										<div className="flex justify-between items-center gap-3">
											<span
												className={`px-3 py-1 rounded text-[0.75rem] font-semibold uppercase ${badgeStyles[status]}`}
											>
												{getStatusLabel(problem.status)}
											</span>

											<span className="text-[0.85rem] text-gray-500 flex items-center gap-1">
												<MapPin size={14} />
												{problem.location}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<p className="text-center text-gray-500 bg-gray-100 rounded-lg p-8">
							You haven't reported any problems yet.
						</p>
					)}
				</section>

				{/* My Solutions */}
				<section className="bg-white border-2 border-gray-300 rounded-xl p-8">
					<h2 className="text-[#065f46] text-xl font-bold mb-6">
						My Solutions ({mySolutions.length})
					</h2>

					{mySolutions.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{mySolutions.map((solution) => (
								<div
									key={solution._id}
									className="bg-gray-100 rounded-lg p-6 border-l-4 border-[#10b981] flex md:flex-col justify-between gap-4"
								>
									<div>
										<h4 className="text-gray-700 font-semibold mb-2">
											{solution.description.substring(0, 50)}...
										</h4>

										<p className="text-sm text-gray-500">
											Votes:{" "}
											<strong className="text-[#065f46]">
												{solution.votes}
											</strong>
											{solution.isBestSolution && (
												<span className="ml-4 inline-flex items-center gap-1 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-white px-2 py-1 rounded text-[0.8rem] font-semibold">
													<Star size={14} fill="currentColor" />
													Best
												</span>
											)}
										</p>
									</div>

									<button
										onClick={() => navigate(`/problems/${solution.problemId}`)}
										className="border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white px-4 py-2 rounded-lg font-semibold transition w-full md:w-auto"
									>
										View Problem
									</button>
								</div>
							))}
						</div>
					) : (
						<p className="text-center text-gray-500 bg-gray-100 rounded-lg p-8">
							You haven't suggested any solutions yet.
						</p>
					)}
				</section>
			</div>
		</div>
	);
};

export default UserProfile;
