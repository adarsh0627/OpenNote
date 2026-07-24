import API from "./axios";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const signUp = async (formData) => {
  const res = await API.post("/auth/sign-up", formData);
  return res.data;
};

export const signIn = async (formData) => {
  const res = await API.post("/auth/sign-in", formData);
  return res.data;
};

export const refreshToken = async (token) => {
  const res = await API.post("/auth/refresh", { refreshToken: token });
  return res.data;
};

export const logoutAPI = async (token) => {
  const res = await API.post("/auth/logout", { refreshToken: token });
  return res.data;
};

export const getProfile = async () => {
  const res = await API.get("/auth/profile");
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await API.patch("/auth/profile", data);
  return res.data;
};

// ── Notes ─────────────────────────────────────────────────────────────────────

export const uploadNote = async (formData) => {
  const res = await API.post("/notes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getAllNotes = async (params = {}) => {
  const res = await API.get("/notes", { params });
  return res.data;
};

export const getNoteById = async (id) => {
  const res = await API.get(`/notes/${id}`);
  return res.data;
};

export const getMyNotes = async () => {
  const res = await API.get("/notes/my");
  return res.data;
};

export const deleteNote = async (id) => {
  const res = await API.delete(`/notes/${id}`);
  return res.data;
};

export const getNoteFileUrl = async (id) => {
  const res = await API.get(`/notes/${id}/file`);
  return res.data;
};

// ── Payment ───────────────────────────────────────────────────────────────────

export const createOrder = async (noteId) => {
  const res = await API.post("/payment/create-order", { noteId });
  return res.data;
};

export const verifyPayment = async (data) => {
  const res = await API.post("/payment/verify", data);
  return res.data;
};

export const claimFreeNote = async (noteId) => {
  const res = await API.post("/payment/claim-free", { noteId });
  return res.data;
};

// ── Purchases ─────────────────────────────────────────────────────────────────

export const getMyPurchases = async () => {
  const res = await API.get("/purchases");
  return res.data;
};

export const checkPurchase = async (noteId) => {
  const res = await API.get(`/purchases/check/${noteId}`);
  return res.data;
};

// ── Wallet ────────────────────────────────────────────────────────────────────

export const getWallet = async () => {
  const res = await API.get("/wallet");
  return res.data;
};

export const updatePaymentDetails = async (data) => {
  const res = await API.patch("/wallet/payment-details", data);
  return res.data;
};

export const requestRedemption = async (data) => {
  const res = await API.post("/wallet/redeem", data);
  return res.data;
};

export const getMyRedemptions = async () => {
  const res = await API.get("/wallet/redemptions");
  return res.data;
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const getNotifications = async () => {
  const res = await API.get("/notifications");
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await API.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await API.patch("/notifications/read-all");
  return res.data;
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAdminStats = async () => {
  const res = await API.get("/admin/stats");
  return res.data;
};

export const getAdminUsers = async (params = {}) => {
  const res = await API.get("/admin/users", { params });
  return res.data;
};

export const getAdminNotes = async (params = {}) => {
  const res = await API.get("/admin/notes", { params });
  return res.data;
};

export const adminDeleteNote = async (id) => {
  const res = await API.delete(`/admin/notes/${id}`);
  return res.data;
};

export const getAdminPurchases = async (params = {}) => {
  const res = await API.get("/admin/purchases", { params });
  return res.data;
};

export const getAdminRedemptions = async (params = {}) => {
  const res = await API.get("/admin/redemptions", { params });
  return res.data;
};

export const approveRedemption = async (id, adminNote = "") => {
  const res = await API.patch(`/admin/redemptions/${id}/approve`, { adminNote });
  return res.data;
};

export const rejectRedemption = async (id, adminNote = "") => {
  const res = await API.patch(`/admin/redemptions/${id}/reject`, { adminNote });
  return res.data;
};