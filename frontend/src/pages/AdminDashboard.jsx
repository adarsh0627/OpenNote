import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, ShoppingBag, Wallet,
  CheckCircle, XCircle, Trash2, TrendingUp,
  ChevronLeft, Search, RefreshCw
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Spinner from "../components/common/Spinner";
import {
  getAdminStats, getAdminUsers, getAdminNotes,
  adminDeleteNote, getAdminPurchases,
  getAdminRedemptions, approveRedemption, rejectRedemption,
} from "../api/apis";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const TAB_OVERVIEW    = "overview";
const TAB_REDEMPTIONS = "redemptions";
const TAB_USERS       = "users";
const TAB_NOTES       = "notes";
const TAB_PURCHASES   = "purchases";

const StatusBadge = ({ status }) => {
  const colors = {
    PENDING:  "bg-amber-100 text-amber-700",
    APPROVED: "bg-blue-100 text-blue-700",
    PAID:     "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    SUCCESS:  "bg-green-100 text-green-700",
    FREE:     "bg-indigo-100 text-indigo-700",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TAB_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [redemptionFilter, setRedemptionFilter] = useState("PENDING");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) {
      toast.error("Admin access required");
      navigate("/");
    }
  }, [user]);

  const loadStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getAdminStats();
      setStats(data.stats);
    } catch { toast.error("Failed to load stats"); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  const loadUsers = useCallback(async (silent = false, search = userSearch) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getAdminUsers({ search });
      setUsers(data.users || []);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); setRefreshing(false); }
  }, [userSearch]);

  const loadNotes = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getAdminNotes();
      setNotes(data.notes || []);
    } catch { toast.error("Failed to load notes"); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  const loadPurchases = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getAdminPurchases();
      setPurchases(data.purchases || []);
    } catch { toast.error("Failed to load purchases"); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  const loadRedemptions = useCallback(async (silent = false, filter = redemptionFilter) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getAdminRedemptions({ status: filter || undefined });
      setRedemptions(data.redemptions || []);
    } catch { toast.error("Failed to load redemptions"); }
    finally { setLoading(false); setRefreshing(false); }
  }, [redemptionFilter]);

  useEffect(() => { loadStats(); }, []);

  useEffect(() => {
    if (activeTab === TAB_USERS) loadUsers();
    else if (activeTab === TAB_NOTES) loadNotes();
    else if (activeTab === TAB_PURCHASES) loadPurchases();
    else if (activeTab === TAB_REDEMPTIONS) loadRedemptions();
    else if (activeTab === TAB_OVERVIEW) loadStats();
  }, [activeTab, redemptionFilter]);

  const handleRefresh = () => {
    if (activeTab === TAB_OVERVIEW) loadStats(true);
    else if (activeTab === TAB_USERS) loadUsers(true);
    else if (activeTab === TAB_NOTES) loadNotes(true);
    else if (activeTab === TAB_PURCHASES) loadPurchases(true);
    else if (activeTab === TAB_REDEMPTIONS) loadRedemptions(true);
  };

  const handleApprove = async (id) => {
    try {
      await approveRedemption(id, "Payment processed by admin");
      toast.success("Redemption approved!");
      await Promise.all([loadRedemptions(true), loadStats(true)]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await rejectRedemption(rejectModal, rejectNote || "Rejected by admin");
      toast.success("Redemption rejected. Amount refunded.");
      setRejectModal(null);
      setRejectNote("");
      await Promise.all([loadRedemptions(true), loadStats(true)]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    }
  };

  const handleDeleteNote = async (id) => {
    if (!confirm("Remove this note from the platform?")) return;
    try {
      await adminDeleteNote(id);
      toast.success("Note removed");
      await Promise.all([loadNotes(true), loadStats(true)]);
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const tabs = [
    { id: TAB_OVERVIEW,    label: "Overview",  icon: <TrendingUp size={15} /> },
    { id: TAB_REDEMPTIONS, label: "Payouts",   icon: <Wallet size={15} /> },
    { id: TAB_USERS,       label: "Users",     icon: <Users size={15} /> },
    { id: TAB_NOTES,       label: "Notes",     icon: <BookOpen size={15} /> },
    { id: TAB_PURCHASES,   label: "Purchases", icon: <ShoppingBag size={15} /> },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-600">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Signed in as {user.email}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 border border-gray-200 bg-white px-3 py-2 rounded-lg transition"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Tab nav — scrollable on mobile */}
        <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 text-xs md:text-sm font-medium px-3 md:px-4 py-2 rounded-lg transition whitespace-nowrap ${
                activeTab === t.id ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.id === TAB_REDEMPTIONS && stats?.pendingRedemptions > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pendingRedemptions}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === TAB_OVERVIEW && (
          loading
            ? <div className="flex justify-center py-24"><Spinner size="lg" /></div>
            : <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Total Users",      value: stats?.totalUsers,        color: "text-indigo-600", bg: "bg-indigo-50", icon: <Users size={20} /> },
                  { label: "Total Notes",      value: stats?.totalNotes,        color: "text-green-600",  bg: "bg-green-50",  icon: <BookOpen size={20} /> },
                  { label: "Total Purchases",  value: stats?.totalPurchases,    color: "text-blue-600",   bg: "bg-blue-50",   icon: <ShoppingBag size={20} /> },
                  { label: "Pending Payouts",  value: stats?.pendingRedemptions,color: "text-amber-600",  bg: "bg-amber-50",  icon: <Wallet size={20} /> },
                  { label: "Platform Revenue", value: `₹${stats?.platformRevenue?.toFixed(2) || "0.00"}`, color: "text-purple-600", bg: "bg-purple-50", icon: <TrendingUp size={20} /> },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 ${s.bg} rounded-xl flex items-center justify-center ${s.color} shrink-0`}>{s.icon}</div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">{s.label}</p>
                      <p className={`text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
        )}

        {/* ── Redemptions ── */}
        {activeTab === TAB_REDEMPTIONS && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex gap-2 flex-wrap">
              {["PENDING", "PAID", "REJECTED", ""].map((f) => (
                <button
                  key={f || "ALL"}
                  onClick={() => setRedemptionFilter(f)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                    redemptionFilter === f ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400"
                  }`}
                >
                  {f || "ALL"}
                </button>
              ))}
            </div>

            {loading
              ? <div className="flex justify-center py-12"><Spinner /></div>
              : redemptions.length === 0
              ? <div className="text-center py-16 text-gray-400">
                  <Wallet size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No redemption requests</p>
                </div>
              : <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">User</th>
                          <th className="px-4 py-3 text-left">Amount</th>
                          <th className="px-4 py-3 text-left">Method</th>
                          <th className="px-4 py-3 text-left">Payment Details</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {redemptions.map((r) => (
                          <tr key={r._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-800">{r.user?.userName}</p>
                              <p className="text-xs text-gray-400">{r.user?.email}</p>
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-900">₹{r.amount}</td>
                            <td className="px-4 py-3 text-gray-600">{r.paymentMethod}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {r.paymentMethod === "UPI" ? r.paymentDetails?.upiId || "—" : `${r.paymentDetails?.bankAccount || "—"} / ${r.paymentDetails?.ifsc || "—"}`}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
                            <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                            <td className="px-4 py-3">
                              {r.status === "PENDING"
                                ? <div className="flex gap-2">
                                    <button onClick={() => handleApprove(r._id)} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium transition">
                                      <CheckCircle size={13} /> Approve
                                    </button>
                                    <button onClick={() => { setRejectModal(r._id); setRejectNote(""); }} className="flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition">
                                      <XCircle size={13} /> Reject
                                    </button>
                                  </div>
                                : <span className="text-xs text-gray-400">{r.adminNote || "—"}</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {redemptions.map((r) => (
                      <div key={r._id} className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{r.user?.userName}</p>
                            <p className="text-xs text-gray-400">{r.user?.email}</p>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="font-bold text-gray-900">₹{r.amount}</span>
                          <span className="text-gray-500">{r.paymentMethod}</span>
                          <span className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {r.paymentMethod === "UPI" ? r.paymentDetails?.upiId || "—" : `${r.paymentDetails?.bankAccount || "—"} / ${r.paymentDetails?.ifsc || "—"}`}
                        </p>
                        {r.status === "PENDING" && (
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => handleApprove(r._id)} className="flex-1 flex items-center justify-center gap-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-lg font-medium transition">
                              <CheckCircle size={13} /> Approve
                            </button>
                            <button onClick={() => { setRejectModal(r._id); setRejectNote(""); }} className="flex-1 flex items-center justify-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg font-medium transition">
                              <XCircle size={13} /> Reject
                            </button>
                          </div>
                        )}
                        {r.status !== "PENDING" && r.adminNote && (
                          <p className="text-xs text-gray-400 italic">{r.adminNote}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
            }
          </div>
        )}

        {/* ── Users ── */}
        {activeTab === TAB_USERS && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadUsers(false, userSearch)}
                  className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button onClick={() => loadUsers(false, userSearch)} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 shrink-0">
                Search
              </button>
            </div>

            {loading
              ? <div className="flex justify-center py-12"><Spinner /></div>
              : <>
                  {/* Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">User</th>
                          <th className="px-4 py-3 text-left">Education</th>
                          <th className="px-4 py-3 text-left">Wallet Balance</th>
                          <th className="px-4 py-3 text-left">Total Earned</th>
                          <th className="px-4 py-3 text-left">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-800">{u.userName}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{u.education || "—"}</td>
                            <td className="px-4 py-3 font-medium text-indigo-600">₹{u.wallet?.balance?.toFixed(2) || "0.00"}</td>
                            <td className="px-4 py-3 text-green-600">₹{u.wallet?.totalEarned?.toFixed(2) || "0.00"}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {users.map((u) => (
                      <div key={u._id} className="p-4 space-y-1">
                        <p className="font-medium text-gray-800 text-sm">{u.userName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                        <div className="flex gap-4 pt-1 text-xs">
                          <span className="text-indigo-600 font-medium">Balance: ₹{u.wallet?.balance?.toFixed(2) || "0.00"}</span>
                          <span className="text-green-600">Earned: ₹{u.wallet?.totalEarned?.toFixed(2) || "0.00"}</span>
                        </div>
                        <p className="text-xs text-gray-400">Joined {new Date(u.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                </>
            }
          </div>
        )}

        {/* ── Notes ── */}
        {activeTab === TAB_NOTES && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {loading
              ? <div className="flex justify-center py-12"><Spinner /></div>
              : <>
                  {/* Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">Note</th>
                          <th className="px-4 py-3 text-left">Uploader</th>
                          <th className="px-4 py-3 text-left">Price</th>
                          <th className="px-4 py-3 text-left">Sales</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {notes.map((n) => (
                          <tr key={n._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img src={n.thumbnail} alt={n.title} className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                                <p className="font-medium text-gray-800 max-w-xs truncate">{n.title}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-gray-700">{n.uploadedBy?.userName}</p>
                              <p className="text-xs text-gray-400">{n.uploadedBy?.email}</p>
                            </td>
                            <td className="px-4 py-3 font-medium">{n.price === 0 ? <span className="text-green-600">Free</span> : `₹${n.price}`}</td>
                            <td className="px-4 py-3 text-gray-600">{n.totalSales || 0}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${n.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                {n.isActive ? "Active" : "Removed"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {n.isActive && (
                                <button onClick={() => handleDeleteNote(n._id)} className="flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition">
                                  <Trash2 size={13} /> Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {notes.map((n) => (
                      <div key={n._id} className="p-4 flex gap-3">
                        <img src={n.thumbnail} alt={n.title} className="w-14 h-14 rounded-xl object-cover border shrink-0" />
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="font-medium text-gray-800 text-sm truncate">{n.title}</p>
                          <p className="text-xs text-gray-400">{n.uploadedBy?.userName}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-medium">{n.price === 0 ? <span className="text-green-600">Free</span> : `₹${n.price}`}</span>
                            <span className="text-gray-400">{n.totalSales || 0} sales</span>
                            <span className={`px-1.5 py-0.5 rounded-full font-medium ${n.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                              {n.isActive ? "Active" : "Removed"}
                            </span>
                          </div>
                          {n.isActive && (
                            <button onClick={() => handleDeleteNote(n._id)} className="flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg transition mt-1">
                              <Trash2 size={12} /> Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
            }
          </div>
        )}

        {/* ── Purchases ── */}
        {activeTab === TAB_PURCHASES && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {loading
              ? <div className="flex justify-center py-12"><Spinner /></div>
              : <>
                  {/* Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">Buyer</th>
                          <th className="px-4 py-3 text-left">Note</th>
                          <th className="px-4 py-3 text-left">Amount</th>
                          <th className="px-4 py-3 text-left">Platform Cut</th>
                          <th className="px-4 py-3 text-left">Seller Gets</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {purchases.map((p) => (
                          <tr key={p._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-800">{p.user?.userName}</p>
                              <p className="text-xs text-gray-400">{p.user?.email}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{p.note?.title}</td>
                            <td className="px-4 py-3 font-medium">₹{p.amount}</td>
                            <td className="px-4 py-3 text-purple-600">₹{p.platformAmount?.toFixed(2)}</td>
                            <td className="px-4 py-3 text-green-600">₹{p.sellerAmount?.toFixed(2)}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                            <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {purchases.map((p) => (
                      <div key={p._id} className="p-4 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{p.user?.userName}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[180px]">{p.note?.title}</p>
                          </div>
                          <StatusBadge status={p.status} />
                        </div>
                        <div className="flex gap-3 text-xs pt-1">
                          <span className="font-medium text-gray-800">₹{p.amount}</span>
                          <span className="text-purple-600">Platform: ₹{p.platformAmount?.toFixed(2)}</span>
                          <span className="text-green-600">Seller: ₹{p.sellerAmount?.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                </>
            }
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setRejectModal(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 p-6 w-[90vw] max-w-md">
            <h2 className="font-semibold text-gray-900 mb-1">Reject Redemption</h2>
            <p className="text-sm text-gray-500 mb-4">Amount will be refunded back to the user's wallet.</p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleReject} className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium">
                Confirm Reject
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;