# AttendIQ - Smart Classroom Attendance System

AttendIQ is an intelligent, dual-role classroom attendance verification and management system engineered in React, TypeScript, and Tailwind CSS (migrated from Android Jetpack Compose).

## Features

### Dual Role Architecture
- **Interactive Role Selection:** Gesture/swipe and tap-based split interface:
  - Teacher view (Warm Orange theme): Swipe down or tap to manage broadcasts, live PIN generation, and headcount discrepancy auditing.
  - Student view (Deep Teal theme): Swipe up or tap for campus GPS geofence verification and session PIN attendance submission.
- **Role Switcher & Quick Navigation:** In-app floating screen switcher offering instant access across all 12 mockup presets.

### Teacher Features
1. **Wireless PIN Broadcast Setup:**
   - 2-digit session PIN generator with custom tactile numeric keypad.
   - Interactive classroom session details (Course CS401: DBMS, Room FB, Faculty: Dr. Eleanor Vance).
2. **Active Broadcast Hub:**
   - Live session timer countdown with visual radar ripples.
   - Live student joins feed with real-time check-in notifications.
   - Session termination controls ("Stop Broadcast Early", "End Session & View Report").
3. **Headcount Audit & Attendance Report:**
   - Discrepancy detector comparing app registrations with real room count.
   - Missing student call-out workflow with 1-tap "Cancel" (marked absent) or restore actions.
   - Search by student name, roll number, or department.
   - Department filtering (`All`, `CSIT`, `CSE`, `ECE`, `IT`).
   - Pagination and instant CSV download (`GGU_CS401_Attendance.csv`).
   - Slide-to-Confirm "Save & Publish" to academic portals.

### Student Features
1. **Two-Tier Authentication & Enrollment:**
   - Multi-course registration (NEP 2020 multidisciplinary roster: Major, Minor, SEC, VAC, AEC).
   - Document verification preview with OCR parsing simulation (Student ID Card, Course Selection PDF).
2. **Campus Geofence + Session PIN Check-in:**
   - GGU Bilaspur Campus GPS Geofence boundary detection (with toggle for testing inside/outside campus).
   - Classroom acoustic/session PIN 2-digit keypad input.
   - Slide-to-Confirm action for tamper-resistant attendance submission.
   - Verified digital pass receipt with timestamp and room metadata.

### Shared & Administrative
- **Profile & Device Telemetry Modal:** Displays security sensors, campus GPS simulation toggle, BLE gateway connection, and role management.
- **MongoDB Schema & Architecture:** Detailed 4-collection database design documentation (`Users`, `Courses`, `AttendanceSessions`, `AttendanceRecords`).
- **Targeted Broadcast Notifications:** Live incoming session alerts prompting students to check in when teacher broadcasts begin.

## Tech Stack
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
