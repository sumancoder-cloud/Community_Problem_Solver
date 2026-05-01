import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import {
	ArrowLeft,
	ThumbsUp,
	Lightbulb,
	MessageSquare,
	Loader,
	Clock,
	MapPin,
	Star,
} from "lucide-react";
import { toast } from "react-toastify";
import API from "../utils/api.js";
import { useAuthUser } from "../utils/useAuthUser.js";

const ProblemDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuthUser();

	const [problem, setProblems] = useState(null);
	const [solutions, setSolutions] = useState([]);
	const [discussions, setDiscussions] = useState([]);
	const [aiSuggestions, setAiSuggestions] = useState([]);
	const [newSolution, setNewSolution] = useState("");
	const [discussionDrafts, setDiscussionDrafts] = useState({});
	const [loadingAI, setLoadingAI] = useState(false);
	const [loading, setLoading] = useState(true);
	const [notifications, setNotifications] = useState([]);
	const [mapCoords, setMapCoords] = useState(null);
	const [mapLoading, setMapLoading] = useState(false);
	const [mapError, setMapError] = useState("");
	const [statusDraft, setStatusDraft] = useState("open");
	const [trackingNote, setTrackingNote] = useState("");
	const [trackingSaving, setTrackingSaving] = useState(false);

	useEffect(() => {
		fetchProblemDetails();
	}, [id]);

	useEffect(() => {
		if (problem?.status) {
			setStatusDraft(problem.status);
		}
	}, [problem?.status]);

	useEffect(() => {
		if (!problem?.location) {
			return;
		}

		const controller = new AbortController();
		const fetchCoordinates = async () => {
			try {
				setMapLoading(true);
				setMapError("");
				const query = encodeURIComponent(problem.location);
				const res = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`,
					{
						signal: controller.signal,
					},
				);
				const data = await res.json();
				const first = data?.[0];
				if (!first) {
					setMapCoords(null);
					setMapError("Map not available for this location");
					return;
				}

				setMapCoords({
					lat: Number(first.lat),
					lng: Number(first.lon),
				});
			} catch (error) {
				if (error?.name !== "AbortError") {
					setMapError("Unable to load map for this location");
				}
			} finally {
				setMapLoading(false);
			}
		};

		fetchCoordinates();

		return () => controller.abort();
	}, [problem?.location]);

	const buildMapUrl = (lat, lng) => {
		const delta = 0.005;
		const left = lng - delta;
		const right = lng + delta;
		const top = lat + delta;
		const bottom = lat - delta;
		return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
	};

	const fetchProblemDetails = async () => {
		try {
			const problemRes = await API.get(`/problems/${id}`);
			setProblems(problemRes.data.problem);

			const solutionsRes = await API.get(`/solutions/${id}`);
			setSolutions(solutionsRes.data.solutions || []);

			const discussionsRes = await API.get(`/discussions/${id}`);
			setDiscussions(discussionsRes.data.discussions || []);

			const notificationsRes = await API.get("/notifications");
			setNotifications(notificationsRes.data.notifications || []);
		} catch {
			toast.error("Failed to load problem details");
		} finally {
			setLoading(false);
		}
	};

	const handleAddSolution = async (e) => {
		e.preventDefault();

		if (!newSolution.trim()) {
			toast.error("Please enter a solution");
			return;
		}

		try {
			const res = await API.post(`/solutions/create/${id}`, {
				description: newSolution,
			});

			setSolutions([res.data.solution, ...solutions]);
			setNewSolution("");
			toast.success("Solution added!");
		} catch {
			toast.error("Failed to add solution");
		}
	};

	const handleAddDiscussion = async (solutionId) => {
		const message = discussionDrafts[solutionId] || "";

		if (!message.trim()) {
			toast.error("Please enter a message");
			return;
		}

		try {
			const res = await API.post(`/discussions/create/${id}`, {
				message,
				solutionId,
			});

			setDiscussions([res.data.discussion, ...discussions]);
			setDiscussionDrafts((prev) => ({ ...prev, [solutionId]: "" }));
			toast.success("Message added!");
		} catch {
			toast.error("Failed to add message");
		}
	};

	const handleVoteSolution = async (solutionId) => {
		try {
			await API.post(`/votes/upvote/${solutionId}`);
			fetchProblemDetails();
			toast.success("Vote added!");
		} catch {
			toast.error("Failed to vote");
		}
	};

	const handleSelectSolution = async (solutionId) => {
		try {
			const res = await API.patch(`/problems/select-solution/${id}`, {
				solutionId,
			});

			setProblems(res.data.problem);
			toast.success("Solution selected for implementation");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to select solution");
		}
	};

	const handleUpdateStatus = async () => {
		if (!statusDraft) {
			toast.error("Select a status");
			return;
		}

		try {
			const res = await API.patch(`/problems/status/${id}`, {
				status: statusDraft,
			});

			setProblems(res.data.problem);
			toast.success("Status updated");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update status");
		}
	};

	const handleDeleteProblem = async () => {
		const confirmDelete = window.confirm(
			"Are you sure you want to delete this problem?",
		);

		if (!confirmDelete) return;

		try {
			await API.delete(`/problems/delete/${id}`);
			toast.success("Problem deleted successfully");

			navigate("/problems"); // redirect after delete
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to delete problem");
		}
	};

	const handleAddTrackingNote = async (e) => {
		e.preventDefault();

		if (!trackingNote.trim()) {
			toast.error("Please enter a tracking note");
			return;
		}

		try {
			setTrackingSaving(true);
			await API.post(`/tracking/note/${id}`, {
				note: trackingNote.trim(),
			});

			setTrackingNote("");
			toast.success("Tracking note added");
		} catch (error) {
			toast.error(
				error.response?.data?.message || "Failed to add tracking note",
			);
		} finally {
			setTrackingSaving(false);
		}
	};

	const statusStyles = {
		open: "bg-blue-100 text-[#0c2340]",
		"in-progress": "bg-amber-100 text-[#92400e]",
		completed: "bg-[#d1fae5] text-[#065f46]",
	};

	const isOwner =
		user?.id && problem?.user?._id
			? user.id === problem.user._id
			: user?._id === problem?.user?._id;

	const isVolunteer = user?.role === "volunteer";
	const isVolunteerForCity =
		isVolunteer && user?.city && user.city === problem?.city;
	const statusOptions = ["open", "in-progress", "completed"];

	const selectedSolutionId =
		problem?.selectedSolutionId?._id || problem?.selectedSolutionId || null;

	const discussionsBySolution = discussions.reduce((acc, discussion) => {
		const key = discussion.solutionId || "problem";
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(discussion);
		return acc;
	}, {});

	if (loading) {
		return (
			<div className="min-h-screen bg-white flex flex-col">
				<Navbar user={user} notifications={notifications} />
				<div className="flex justify-center py-20">
					<div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
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
				{/* Top Buttons */}
				<div className="flex md:flex-row gap-4 justify-between items-center mb-8">
					<button
						onClick={() => navigate("/problems")}
						className="inline-flex items-center gap-2 text-[#10b981] hover:text-[#065f46] font-semibold transition hover:-translate-x-1"
					>
						<ArrowLeft size={20} />
						Back to Problems
					</button>

					<button
						onClick={() => navigate(`/tracking/${id}`)}
						className="border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
					>
						<Clock size={18} />
						Tracking History
					</button>
				</div>

				<div className="flex flex-col gap-8">
					{/* Problem Section */}
					<section className="bg-white border-2 border-[#d1fae5] rounded-xl p-8">
						<div className="flex md:flex-col gap-4 justify-between mb-6">
							<h1 className="text-[2rem] md:text-[1.5rem] font-bold text-[#065f46]">
								{problem.title}
							</h1>

							<span
								className={`px-4 py-2 rounded-md text-[0.85rem] font-semibold uppercase h-fit ${statusStyles[problem.status]}`}
							>
								{problem.status === "in-progress"
									? "In Progress"
									: problem.status}
							</span>
						</div>

						{isOwner && (
							<div className="bg-gray-100 rounded-lg p-4 mb-6 flex flex-col gap-4">
								<div className="flex md:flex-col gap-4 items-center justify-between">
									<div>
										{/* <p className="text-sm text-gray-500">
											Update status manually
										</p> */}
										<p className="text-[#065f46] font-semibold">
											Implementation progress
										</p>
									</div>

									<div className="flex md:flex-col gap-3 items-center">
										<select
											value={statusDraft}
											onChange={(e) => setStatusDraft(e.target.value)}
											className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#10b981]"
										>
											{statusOptions.map((value) => (
												<option
													key={value}
													value={value}
													disabled={!isVolunteer && value === "completed"}
												>
													{value === "in-progress"
														? "In Progress"
														: value.charAt(0).toUpperCase() + value.slice(1)}
												</option>
											))}
										</select>
                    <div className="flex gap-3 flex-col md:flex-row">
                      <button
											onClick={handleUpdateStatus}
											className="bg-[#10b981] hover:bg-[#065f46] text-white px-4 py-2 rounded-lg font-semibold"
										>
											Save Status
										</button>
											<button
												onClick={handleDeleteProblem}
												className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
											>
												Delete Problem
											</button>
                    </div>
										
									
									</div>
								</div>

								{problem.status === "in-progress" &&
									!problem.completionRequested && (
										<div className="flex md:flex-col items-center justify-between gap-4">
											<p className="text-sm text-gray-600">
												When the work is done, request a volunteer to approve
												completion.
											</p>
											<button
												onClick={async () => {
													try {
														const res = await API.patch(
															`/problems/request-completion/${id}`,
														);
														setProblems(res.data.problem);
														toast.success("Completion requested");
													} catch (error) {
														toast.error(
															error.response?.data?.message ||
																"Failed to request completion",
														);
													}
												}}
												className="border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white px-4 py-2 rounded-lg font-semibold"
											>
												Request Completion
											</button>
										</div>
									)}

								{problem.completionRequested && (
									<div className="text-sm text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-4 py-3">
										Completion requested. Waiting for volunteer approval.
									</div>
								)}

								<form
									onSubmit={handleAddTrackingNote}
									className="bg-white rounded-lg p-4 border border-[#d1fae5]"
								>
									<label className="text-sm font-semibold text-[#065f46]">
										Add progress note
									</label>
									<textarea
										value={trackingNote}
										onChange={(e) => setTrackingNote(e.target.value)}
										placeholder="Share a quick implementation update..."
										rows="3"
										className="w-full border rounded-lg p-3 mt-3 outline-none focus:ring-2 focus:ring-[#10b981]"
									/>

									<div className="flex justify-end mt-3">
										<button
											type="submit"
											disabled={trackingSaving}
											className="bg-[#10b981] hover:bg-[#065f46] text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
										>
											{trackingSaving ? "Saving..." : "Add Note"}
										</button>
									</div>
								</form>
							</div>
						)}

						{/* {isOwner && (
							<button
								onClick={handleDeleteProblem}
								className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
							>
								Delete Problem
							</button>
						)} */}

						{isVolunteerForCity && problem.completionRequested && (
							<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex md:flex-col items-center justify-between gap-4">
								<p className="text-amber-800 text-sm">
									This problem has a completion request. Approve if verified on
									the ground.
								</p>
								<button
									onClick={async () => {
										try {
											const res = await API.patch(
												`/problems/approve-completion/${id}`,
											);
											setProblems(res.data.problem);
											toast.success("Completion approved");
										} catch (error) {
											toast.error(
												error.response?.data?.message ||
													"Failed to approve completion",
											);
										}
									}}
									className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold"
								>
									Approve Completion
								</button>
							</div>
						)}

						<div className="grid md:grid-cols-1 grid-cols-3 gap-4 bg-gray-100 rounded-lg p-6 mb-6">
							<div>
								<p className="text-gray-500 text-sm">Posted by</p>
								<p className="font-semibold text-gray-700">
									{problem.user?.name}
								</p>
							</div>

							<div>
								<p className="text-gray-500 text-sm">Location</p>
								<p className="font-semibold text-gray-700 flex items-center gap-1">
									<MapPin size={18} />
									{problem.location}
								</p>
								{problem.city && (
									<p className="text-xs text-gray-500 mt-1">
										State: {problem.city}
									</p>
								)}
							</div>

							<div>
								<p className="text-gray-500 text-sm">Date</p>
								<p className="font-semibold text-gray-700">
									{new Date(problem.createdAt).toLocaleDateString()}
								</p>
							</div>
						</div>

						{(problem.image || mapCoords || mapLoading || mapError) && (
							<div className="grid gap-4 md:grid-cols-1 grid-cols-2 mb-6">
								{problem.image && (
									<div className="rounded-xl overflow-hidden border border-[#d1fae5] bg-white">
										<img
											src={problem.image}
											alt={problem.title}
											className="w-full h-[260px] object-cover"
										/>
									</div>
								)}

								<div className="rounded-xl overflow-hidden border border-[#d1fae5] bg-white flex items-center justify-center min-h-[260px]">
									{mapLoading && (
										<div className="text-sm text-gray-500">Loading map...</div>
									)}

									{!mapLoading && mapCoords && (
										<iframe
											title="Problem location"
											src={buildMapUrl(mapCoords.lat, mapCoords.lng)}
											className="w-full h-[260px]"
											loading="lazy"
										/>
									)}

									{!mapLoading && !mapCoords && mapError && (
										<div className="text-sm text-gray-500 px-4 text-center">
											{mapError}
										</div>
									)}
								</div>
							</div>
						)}

						<div className="pt-6 border-t-2 border-[#d1fae5]">
							<h3 className="text-[#065f46] font-bold mb-4">
								Problem Description
							</h3>

							<p className="text-gray-500 leading-7">{problem.description}</p>
						</div>
					</section>

					{/* AI Suggestions */}
					<section className="bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] border-2 border-[#10b981] rounded-xl p-8">
						<div className="flex md:flex-col gap-4 justify-between mb-6">
							<h2 className="text-[#065f46] text-xl font-bold">
								AI-Powered Suggestions
							</h2>

							<button
								onClick={async () => {
									setLoadingAI(true);
									try {
										const res = await API.get(`/ai/suggestions/${id}`);
										setAiSuggestions(res.data.suggestions || []);
										toast.success("AI suggestions loaded!");
									} catch {
										toast.error("Failed to get AI suggestions");
									} finally {
										setLoadingAI(false);
									}
								}}
								className="bg-[#10b981] hover:bg-[#065f46] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
							>
								{loadingAI ? (
									<>
										<Loader size={18} className="animate-spin" />
										Generating...
									</>
								) : (
									<>
										<Lightbulb size={18} />
										Get AI Ideas
									</>
								)}
							</button>
						</div>

						{aiSuggestions.length > 0 && (
							<div className="grid md:grid-cols-1 grid-cols-2 gap-4">
								{aiSuggestions.map((item, i) => (
									<div
										key={i}
										className="bg-white rounded-lg p-4 border-l-4 border-[#10b981] flex gap-4"
									>
										<span className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold shrink-0">
											{i + 1}
										</span>

										<p className="text-gray-700 leading-6">{item}</p>
									</div>
								))}
							</div>
						)}
					</section>

					{/* Selected Solution */}
					<section className="bg-white border-2 border-[#d1fae5] rounded-xl p-8">
						<h2 className="text-[#065f46] text-xl font-bold mb-4">
							Selected Solution
						</h2>

						{selectedSolutionId ? (
							<div className="bg-gray-100 rounded-lg p-6 border-l-4 border-[#10b981]">
								<div className="flex flex-wrap gap-3 items-center mb-3">
									<span className="bg-[#10b981] text-white px-3 py-1 rounded text-sm">
										Selected for Implementation
									</span>
									<span className="text-sm text-gray-500">
										Votes: {problem?.selectedSolutionId?.votes ?? 0}
									</span>
								</div>

								<p className="text-gray-700 leading-6 mb-3">
									{problem?.selectedSolutionId?.description ||
										"Selected solution details are not available."}
								</p>

								<div className="text-sm text-gray-500">
									By {problem?.selectedSolutionId?.user?.name || "Unknown"}
								</div>
							</div>
						) : (
							<div className="bg-gray-100 rounded-lg p-6 text-gray-500">
								No solution selected yet. The problem owner can choose one for
								implementation.
							</div>
						)}
					</section>

					{/* Solutions */}
					<section className="bg-white border-2 border-[#d1fae5] rounded-xl p-8">
						<h2 className="text-[#065f46] text-xl font-bold mb-6">
							Solutions ({solutions.length})
						</h2>

						<form
							onSubmit={handleAddSolution}
							className="bg-gray-100 rounded-lg p-6 mb-6"
						>
							<textarea
								value={newSolution}
								onChange={(e) => setNewSolution(e.target.value)}
								placeholder="Share your solution..."
								rows="4"
								className="w-full border rounded-lg p-4 mb-4 outline-none focus:ring-2 focus:ring-[#10b981]"
							/>

							<button className="bg-[#10b981] hover:bg-[#065f46] text-white px-5 py-2 rounded-lg font-semibold">
								Add Solution
							</button>
						</form>

						<div className="space-y-4">
							{solutions.map((solution) => {
								const solutionDiscussions =
									discussionsBySolution[solution._id] || [];

								return (
									<div
										key={solution._id}
										className="bg-gray-100 rounded-lg p-6 border-l-4 border-[#10b981]"
									>
										<div className="flex flex-wrap gap-3 mb-3 items-center">
											{solution.isBestSolution && (
												<span className="bg-yellow-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
													<Star size={14} fill="currentColor" />
													Best Solution
												</span>
											)}

											{selectedSolutionId === solution._id && (
												<span className="bg-[#10b981] text-white px-3 py-1 rounded text-sm flex items-center gap-1">
													Selected
												</span>
											)}

											<span className="text-sm text-gray-500">
												Rank #{solution.rank}
											</span>
										</div>

										<p className="text-gray-700 mb-4 leading-6">
											{solution.description}
										</p>

										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
											<div className="text-sm text-gray-500">
												By {solution.user?.name} •{" "}
												{new Date(solution.createdAt).toLocaleDateString()}
											</div>

											<div className="flex flex-col sm:flex-row gap-3 sm:items-center">
												{isOwner && (
													<button
														onClick={() => handleSelectSolution(solution._id)}
														className={`border px-4 py-2 rounded-lg font-semibold transition w-full sm:w-auto ${
															selectedSolutionId === solution._id
																? "border-[#10b981] text-[#10b981]"
																: "border-gray-300 text-gray-700 hover:border-[#10b981] hover:text-[#10b981]"
														}`}
													>
														{selectedSolutionId === solution._id
															? "Selected"
															: "Select for Implementation"}
													</button>
												)}

												<button
													onClick={() => handleVoteSolution(solution._id)}
													className="border px-4 py-2 rounded-lg hover:bg-[#10b981] hover:text-white flex items-center gap-2 transition w-full sm:w-auto justify-center"
												>
													<ThumbsUp size={18} />
													{solution.votes} Votes
												</button>
											</div>
										</div>

										<div className="mt-6 border-t border-gray-200 pt-4">
											<div className="flex items-center justify-between mb-3">
												<h3 className="text-sm font-semibold text-[#065f46]">
													Discussions ({solutionDiscussions.length})
												</h3>
											</div>

											<form
												onSubmit={(e) => {
													e.preventDefault();
													handleAddDiscussion(solution._id);
												}}
												className="bg-white rounded-lg p-4 mb-4"
											>
												<textarea
													value={discussionDrafts[solution._id] || ""}
													onChange={(e) =>
														setDiscussionDrafts((prev) => ({
															...prev,
															[solution._id]: e.target.value,
														}))
													}
													placeholder="Add a comment on this solution..."
													rows="3"
													className="w-full border rounded-lg p-3 mb-3 outline-none focus:ring-2 focus:ring-[#10b981]"
												/>

												<button className="bg-[#10b981] hover:bg-[#065f46] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
													<MessageSquare size={16} />
													Post Comment
												</button>
											</form>

											<div className="space-y-3">
												{solutionDiscussions.map((discussion) => (
													<div
														key={discussion._id}
														className="bg-white rounded-lg p-4 border border-gray-200"
													>
														<div className="text-sm text-gray-500 mb-2">
															<strong className="text-gray-700">
																{discussion.user?.name}
															</strong>{" "}
															•{" "}
															{new Date(
																discussion.createdAt,
															).toLocaleDateString()}
														</div>

														<p className="text-gray-700 leading-6">
															{discussion.message}
														</p>
													</div>
												))}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</section>
				</div>
			</div>
		</div>
	);
};

export default ProblemDetail;
