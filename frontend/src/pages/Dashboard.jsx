import { useEffect, useState } from "react";
import { ChevronLeft, Wallet, Upload, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Spinner from "../components/common/Spinner";
import {
  getProfile, updateProfile,
  getWallet, updatePaymentDetails, requestRedemption, getMyRedemptions,
  getMyNotes,
} from "../api/apis";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const TAB_PROFILE = "profile";
const TAB_WALLET  = "wallet";
const TAB_NOTES   = "notes";

const StatusBadge = ({ status }) => {
  const colors = {
    PENDING:  "bg-amber-100 text-amber-700",
    APPROVED: "bg-blue-100 text-blue-700",
    PAID:     "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(TAB_PROFILE);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [userName, setUserName] = useState("");
  const [education, setEducation] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Wallet state
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState({ upiId: "", bankAccount: "", ifsc: "" });
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemMethod, setRedeemMethod] = useState("UPI");
  const [redemptions, setRedemptions] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);

  // Notes state
  const [myNotes, setMyNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => {
    if (authUser) {
      setUserName(authUser.userName || "");
      setEducation(authUser.education || "");
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (activeTab === TAB_WALLET) loadWallet();
    if (activeTab === TAB_NOTES) loadMyNotes();
  }, [activeTab]);

  const loadWallet = async () => {
    setWalletLoading(true);
    try {
      const [walletData, redemptionData] = await Promise.all([getWallet(), getMyRedemptions()]);
      setWallet(walletData.wallet);
      setTransactions(walletData.transactions || []);
      setPaymentDetails(walletData.paymentDetails || { upiId: "", bankAccount: "", ifsc: "" });
      setRedemptions(redemptionData.redemptions || []);
    } catch {
      toast.error("Could not load wallet");
    } finally {
      setWalletLoading(false);
    }
  };

  const loadMyNotes = async () => {
    setNotesLoading(true);
    try {
      const data = await getMyNotes();
      setMyNotes(data.notes || []);
    } catch {
      toast.error("Could not load your notes");
    } finally {
      setNotesLoading(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const data = await updateProfile({ userName, education });
      updateUser({ userName: data.user.userName, education: data.user.education });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setProfileSaving(false);
    }
  };

  const savePaymentDetails = async (e) => {
    e.preventDefault();
    try {
      await updatePaymentDetails(paymentDetails);
      toast.success("Payment details saved");
    } catch {
      toast.error("Could not save payment details");
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    const amount = Number(redeemAmount);
    if (amount < 50) { toast.error("Minimum redemption is ₹50"); return; }

    try {
      await requestRedemption({ amount, paymentMethod: redeemMethod });
      toast.success("Redemption request submitted!");
      setRedeemAmount("");
      loadWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment">
        <Navbar />
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      </div>
    );
  }

  const tabs = [
    { id: TAB_PROFILE, label: "Profile" },
    { id: TAB_WALLET,  label: "Wallet" },
    { id: TAB_NOTES,   label: "My Uploads" },
  ];

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 fade-up">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h1 className="font-display text-2xl text-ink mb-6">Dashboard</h1>

        {/* Tab nav */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition ${
                activeTab === t.id ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ─────────────────────────────────────────────────── */}
        {activeTab === TAB_PROFILE && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Profile Info</h2>
            <form onSubmit={saveProfile} className="flex flex-col gap-4 max-w-md">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-600">Username</label>
                <input value={userName} onChange={(e) => setUserName(e.target.value)} className="input-field" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-600">Email</label>
                <input value={authUser?.email || ""} readOnly className="input-field opacity-60 cursor-not-allowed" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-600">Education</label>
                <input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. B.Tech CSE" className="input-field" />
              </div>
              <button type="submit" disabled={profileSaving} className="btn-primary">
                {profileSaving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* ── Wallet Tab ──────────────────────────────────────────────────── */}
        {activeTab === TAB_WALLET && (
          <div className="flex flex-col gap-6">
            {walletLoading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Available Balance", value: `₹${wallet?.balance?.toFixed(2) || "0.00"}`, color: "text-indigo-600", icon: <Wallet size={18} /> },
                    { label: "Total Earned", value: `₹${wallet?.totalEarned?.toFixed(2) || "0.00"}`, color: "text-green-600", icon: <TrendingUp size={18} /> },
                    { label: "Total Redeemed", value: `₹${wallet?.totalRedeemed?.toFixed(2) || "0.00"}`, color: "text-gray-700", icon: <RefreshCw size={18} /> },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                      <div className={`w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
                      <div>
                        <p className="text-xs text-gray-400">{s.label}</p>
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Redeem */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-800 mb-4">Request Payout</h2>
                  <form onSubmit={handleRedeem} className="flex flex-col gap-4 max-w-sm">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-600">Amount (₹)</label>
                      <input
                        type="number"
                        min={50}
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(e.target.value)}
                        placeholder="Minimum ₹50"
                        className="input-field"
                      />
                    </div>
                    <div className="flex gap-3">
                      {["UPI", "BANK"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setRedeemMethod(m)}
                          className={`flex-1 py-2 text-sm font-medium rounded-xl border transition ${
                            redeemMethod === m ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <button type="submit" className="btn-primary">Request Payout</button>
                    <div className="flex items-start gap-2 text-xs text-gray-400">
                      <AlertCircle size={12} className="mt-0.5 shrink-0" />
                      <span>Payouts are processed within 3–5 business days. Make sure your payment details below are saved.</span>
                    </div>
                  </form>
                </div>

                {/* Payment Details */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-800 mb-4">Payment Details</h2>
                  <form onSubmit={savePaymentDetails} className="flex flex-col gap-4 max-w-sm">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-600">UPI ID</label>
                      <input
                        value={paymentDetails.upiId || ""}
                        onChange={(e) => setPaymentDetails((p) => ({ ...p, upiId: e.target.value }))}
                        placeholder="yourname@upi"
                        className="input-field"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-600">Bank Account Number</label>
                      <input
                        value={paymentDetails.bankAccount || ""}
                        onChange={(e) => setPaymentDetails((p) => ({ ...p, bankAccount: e.target.value }))}
                        placeholder="Account number"
                        className="input-field"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-600">IFSC Code</label>
                      <input
                        value={paymentDetails.ifsc || ""}
                        onChange={(e) => setPaymentDetails((p) => ({ ...p, ifsc: e.target.value }))}
                        placeholder="e.g. SBIN0001234"
                        className="input-field"
                      />
                    </div>
                    <button type="submit" className="btn-secondary">Save Details</button>
                  </form>
                </div>

                {/* Recent Transactions */}
                {transactions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-semibold text-gray-800 mb-4">Recent Transactions</h2>
                    <div className="flex flex-col divide-y divide-gray-50">
                      {transactions.map((t) => (
                        <div key={t._id} className="py-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-700">{t.description}</p>
                            <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString("en-IN")}</p>
                          </div>
                          <span className={`text-sm font-semibold ${t.type === "CREDIT" ? "text-green-600" : "text-red-500"}`}>
                            {t.type === "CREDIT" ? "+" : "-"}₹{t.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Redemption history */}
                {redemptions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-semibold text-gray-800 mb-4">Redemption Requests</h2>
                    <div className="flex flex-col gap-3">
                      {redemptions.map((r) => (
                        <div key={r._id} className="flex items-center justify-between py-2 border-b border-gray-50">
                          <div>
                            <p className="text-sm font-medium text-gray-700">₹{r.amount} via {r.paymentMethod}</p>
                            <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── My Uploads Tab ──────────────────────────────────────────────── */}
        {activeTab === TAB_NOTES && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">My Uploaded Notes</h2>
            {notesLoading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : myNotes.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Upload size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">You haven't uploaded any notes yet</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-50">
                {myNotes.map((note) => (
                  <div key={note._id} className="py-4 flex items-center gap-4">
                    <img src={note.thumbnail} alt={note.title} className="w-14 h-14 rounded-lg object-cover border border-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{note.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{note.totalSales || 0} sales · ₹{note.totalRevenue || 0} gross</p>
                    </div>
                    <span className="text-sm font-bold text-indigo-600 shrink-0">
                      {note.price === 0 ? "Free" : `₹${note.price}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;