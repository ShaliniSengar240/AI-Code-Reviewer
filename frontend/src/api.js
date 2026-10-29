// Central place for every backend call.
// USE_MOCK = true  -> returns fake data matching API_Contract.md, no backend needed
// USE_MOCK = false -> hits the real FastAPI backend at BASE_URL
//
// Once the backend is ready, flip USE_MOCK to false. Nothing else in the app changes,
// because every function here returns data in the same shape either way.

import { mockUser, mockReviewResponse, mockReviewsByFocus, mockHistory, mockAnalytics } from "./mockData";

const USE_MOCK = false;
const BASE_URL = "http://127.0.0.1:8000";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email, password) {
  if (USE_MOCK) {
    await delay(600);
    return { token: "mock_token", ...mockUser };
  }
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid email or password");
  return res.json();
}

export async function getReview(reviewId) {
  if (USE_MOCK) {
    await delay(300);
    return { ...mockReviewResponse, review_id: reviewId };
  }
  const res = await fetch(`${BASE_URL}/review/${reviewId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Could not load review");
  return res.json();
}

export async function signup(name, email, password) {
  if (USE_MOCK) {
    await delay(600);
    return { token: "mock_token", ...mockUser, name, email };
  }
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error("Could not create account");
  return res.json();
}

export async function submitReview(code, language, focus) {
  if (USE_MOCK) {
       await delay(1800); // mimics the real AI call latency
    return mockReviewsByFocus[focus] || mockReviewResponse;
  }
  const res = await fetch(`${BASE_URL}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ code, language, focus }),
  });
  if (!res.ok) throw new Error("Review failed. Please try again.");
  return res.json();
}

export async function getHistory() {
  if (USE_MOCK) {
    await delay(400);
    return mockHistory;
  }
  const res = await fetch(`${BASE_URL}/review/history`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Could not load history");
  return res.json();
}

export async function getAnalytics() {
  if (USE_MOCK) {
    await delay(400);
    return mockAnalytics;
  }
  const res = await fetch(`${BASE_URL}/analytics/summary`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Could not load analytics");
  return res.json();
}
