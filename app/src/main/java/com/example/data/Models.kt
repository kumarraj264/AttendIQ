package com.example.data

enum class Role {
    STUDENT,
    TEACHER
}

enum class AuthTab {
    LOGIN,
    REGISTER
}

enum class Screen {
    ROLE_SELECTION,
    AUTH,
    DOC_VERIFICATION,
    REGISTRATION_SUCCESS,
    TEACHER_BROADCAST_SETUP,
    TEACHER_BROADCAST_ACTIVE,
    STUDENT_ATTENDANCE,
    TEACHER_REPORT
}

data class SubjectRosterItem(
    val sNo: String,
    val code: String,
    val type: String, // Major, Minor, SEC, VAC, AEC
    val subjectName: String,
    val offeringDept: String = "CSIT",
    val credits: Int = 4
)

data class TeacherClassSession(
    val sNo: String,
    val subjectCode: String,
    val subjectName: String,
    val allotTime: String,
    val offeringDept: String = "CSIT",
    val courseType: String = "Major",
    val isPg: Boolean = false
)

data class StudentAttendanceRecord(
    val sNo: String,
    val studentName: String,
    val dept: String,
    val courseType: String = "Major",
    val isPresent: Boolean = true,
    val checkInTime: String = "10:17 AM",
    val verificationMethod: String = "GGU GPS Geofence + Session PIN"
)

data class CampusGeofence(
    val campusName: String = "Guru Ghasidas Vishwavidyalaya (GGU)",
    val locationName: String = "Koni, Bilaspur, Chhattisgarh",
    val centerLat: Double = 22.1293,
    val centerLng: Double = 82.1360,
    val radiusMeters: Double = 1500.0,
    val currentDistanceMeters: Double = 320.0,
    val isWithinBoundary: Boolean = true
)
