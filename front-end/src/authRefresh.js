// authRefresh.js – automatic token refresh while user is active

let lastActivity = Date.now();

function recordActivity() {
  lastActivity = Date.now();
}

export function startTokenRefresh() {
  // Listen to common activity events
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((ev) => {
    document.addEventListener(ev, recordActivity, { passive: true });
  });

  // Refresh every 10 minutes if user was active in the last 5 minutes
  setInterval(async () => {
    const idle = Date.now() - lastActivity > 5 * 60 * 1000; // 5 min idle
    if (idle) return; // don’t refresh if idle

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/refresh-token`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include' // send refresh cookie
      });
      if (!res.ok) throw new Error('refresh failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
    } catch (e) {
      // Refresh failed – redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, 10 * 60 * 1000); // every 10 min
}

export function stopTokenRefresh() {
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((ev) => {
    document.removeEventListener(ev, recordActivity);
  });
}
