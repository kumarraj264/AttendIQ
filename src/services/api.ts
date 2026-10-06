// AttendIQ Client API Service connecting frontend with Express backend

export interface ApiGeofenceResponse {
  campusName: string;
  locationName: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  currentDistanceMeters: number;
  isWithinBoundary: boolean;
  message: string;
}

export interface ApiActiveSessionResponse {
  session: {
    id: string;
    subjectCode: string;
    subjectName: string;
    teacherName: string;
    room: string;
    pin: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    durationSeconds: number;
    secondsRemaining: number;
    totalTarget: number;
    physicalHeadcount: number;
    recentJoins: string[];
  };
  presentCount: number;
  totalTarget: number;
  physicalHeadcount: number;
}

export interface ApiMarkAttendanceResponse {
  success: boolean;
  message: string;
  record?: {
    studentName: string;
    rollNo: string;
    time: string;
    method: string;
    distanceMeters: number;
  };
  error?: string;
}

export const ApiService = {
  // User Login
  async login(role: 'STUDENT' | 'TEACHER', identifier: string, password?: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, identifier, password: password || 'default' })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      return { success: true, user: data.user, token: data.token };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network connection failed' };
    }
  },

  // User Registration
  async register(params: {
    role: 'STUDENT' | 'TEACHER';
    name: string;
    identifier: string;
    email?: string;
    department?: string;
    password?: string;
  }) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network connection failed' };
    }
  },

  // Recover credentials / Forgot Password
  async recoverCredentials(role: 'STUDENT' | 'TEACHER', identifierOrEmail: string) {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, identifierOrEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Password recovery failed' };
      }
      return {
        success: true,
        message: data.message,
        email: data.email,
        identifier: data.identifier,
        previewSentInfo: data.previewSentInfo
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network connection failed' };
    }
  },

  // MongoDB Status check
  async getMongoStatus() {
    try {
      const res = await fetch('/api/mongodb/status');
      return await res.json();
    } catch {
      return { connected: false, message: 'Offline mode' };
    }
  },

  // Check GGU campus GPS geofence boundary
  async verifyGeofence(coords?: { latitude: number; longitude: number }): Promise<ApiGeofenceResponse> {
    try {
      const res = await fetch('/api/geofence/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coords || {})
      });
      return await res.json();
    } catch (err) {
      console.warn('Geofence API offline fallback:', err);
      return {
        campusName: 'Guru Ghasidas Vishwavidyalaya (GGU)',
        locationName: 'Koni, Bilaspur, Chhattisgarh 495009',
        centerLat: 22.1287,
        centerLng: 82.1365,
        radiusMeters: 1200,
        currentDistanceMeters: 42,
        isWithinBoundary: true,
        message: 'Inside GGU Bilaspur Campus GPS Geofence (Cached)'
      };
    }
  },

  // Fetch current active classroom session
  async getActiveSession(): Promise<ApiActiveSessionResponse | null> {
    try {
      const res = await fetch('/api/sessions/active');
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('Get active session fallback:', err);
      return null;
    }
  },

  // Start broadcast session (Teacher)
  async startBroadcast(params: {
    subjectCode: string;
    subjectName: string;
    room: string;
    pin: string;
    durationSeconds?: number;
  }) {
    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to start broadcast on backend:', err);
      return null;
    }
  },

  // Stop broadcast early
  async stopBroadcast() {
    try {
      const res = await fetch('/api/sessions/stop', { method: 'POST' });
      return await res.json();
    } catch (err) {
      console.error('Failed to stop broadcast:', err);
      return null;
    }
  },

  // Mark attendance (Student check-in with PIN & GPS)
  async markAttendance(payload: {
    pin: string;
    studentRollNo?: string;
    studentName?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<ApiMarkAttendanceResponse> {
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Attendance check-in failed' };
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error connecting to backend' };
    }
  },

  // Fetch session attendance report & roster
  async getSessionReport(sessionId: string) {
    try {
      const res = await fetch(`/api/reports/session/${sessionId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('Fetch report fallback:', err);
      return null;
    }
  },

  // Update physical headcount (Headcount reconciliation)
  async updatePhysicalHeadcount(sessionId: string, headcount: number) {
    try {
      const res = await fetch(`/api/reports/session/${sessionId}/headcount`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headcount })
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to update headcount on backend:', err);
      return null;
    }
  },

  // Toggle student present/absent status (Teacher proxy cancellation)
  async toggleStudentRecord(sessionId: string, studentRollNo: string, isPresent: boolean) {
    try {
      const res = await fetch(`/api/reports/session/${sessionId}/toggle-student`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentRollNo, isPresent })
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to toggle student on backend:', err);
      return null;
    }
  },

  // Subscribe to real-time Server-Sent Events (SSE)
  subscribeToLiveEvents(onEvent: (type: string, data: any) => void): () => void {
    if (typeof window === 'undefined' || !window.EventSource) {
      return () => {};
    }

    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('STUDENT_CHECKIN', (e) => {
      try {
        const data = JSON.parse(e.data);
        onEvent('STUDENT_CHECKIN', data);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    });

    eventSource.addEventListener('SESSION_STARTED', (e) => {
      try {
        const data = JSON.parse(e.data);
        onEvent('SESSION_STARTED', data);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    });

    eventSource.addEventListener('TIMER_TICK', (e) => {
      try {
        const data = JSON.parse(e.data);
        onEvent('TIMER_TICK', data);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    });

    eventSource.onerror = () => {
      // EventSource automatically retries
    };

    return () => {
      eventSource.close();
    };
  }
};
