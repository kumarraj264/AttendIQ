package com.example.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.AuthTab
import com.example.data.CampusGeofence
import com.example.data.Role
import com.example.data.Screen
import com.example.data.StudentAttendanceRecord
import com.example.data.SubjectRosterItem
import com.example.data.TeacherClassSession
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AttendanceUiState(
    val currentScreen: Screen = Screen.ROLE_SELECTION,
    val currentRole: Role = Role.TEACHER,
    val authTab: AuthTab = AuthTab.LOGIN,
    
    // Student Login
    val studentEnrollment: String = "2024-BTECH-CS-042",
    val studentPassword: String = "",
    
    // Teacher Login
    val teacherFacultyId: String = "FAC-CS-01",
    val teacherPassword: String = "",
    
    // Student Registration Step 1
    val studentRegName: String = "Alex Morgan",
    val studentRegEnrollment: String = "2024-BTECH-CS-042",
    val studentRegEmail: String = "alex.morgan@ggu.ac.in",
    val studentCourseLevel: String = "UG",
    val studentDepartment: String = "CSIT",
    val studentRegPassword: String = "",
    val studentRegConfirmPassword: String = "",
    
    // Teacher Registration Step 1
    val teacherRegName: String = "Dr. Eleanor Vance",
    val teacherRegFacultyId: String = "FAC-CS-8924",
    val teacherRegEmail: String = "e.vance@ggu.ac.in",
    val teacherDepartment: String = "Computer Science & Engineering",
    val teacherRegPassword: String = "",
    val teacherRegConfirmPassword: String = "",

    // Broadcast Setup PIN
    val broadcastPin: String = "29",

    // Broadcast Active Session
    val isBroadcasting: Boolean = false,
    val broadcastSecondsLeft: Int = 165, // 02:45
    val currentAttendanceCount: Int = 24,
    val totalAttendanceTarget: Int = 45,
    val recentJoins: List<String> = listOf(
        "Alex Morgan (CSE) • 2s ago",
        "Kevin Chen (CSIT) • 7s ago",
        "Priya Sharma (ECE) • 14s ago"
    ),

    // Student PIN Entry & Geofencing
    val studentEnteredPin: String = "",
    val studentAttendanceMarked: Boolean = false,
    val studentAttendanceMessage: String? = null,
    val campusGeofence: CampusGeofence = CampusGeofence(),

    // Targeted Notification Alert for Student
    val isIncomingSessionAlertVisible: Boolean = false,
    val incomingSubjectCode: String = "CS401",
    val incomingSubjectName: String = "Database Management Systems",

    // Teacher Headcount Audit & Discrepancy Verification
    val physicalHeadcount: Int = 14,
    val isAuditModeActive: Boolean = false,

    // Report
    val reportCurrentPage: Int = 0,
    val reportPageSize: Int = 8,
    val searchQuery: String = "",
    val selectedDeptFilter: String = "All",
    val selectedCategoryFilter: String = "All",
    val userNotification: String? = null,

    // Modals / Sheets
    val isProfileSheetOpen: Boolean = false,
    val isExportModalOpen: Boolean = false,
    val isDocPreviewOpen: Boolean = false,
    val isMongoDbInfoOpen: Boolean = false,
    val docPreviewTitle: String = "Document Preview",
    val docPreviewContent: String = ""
)

class AttendanceViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(AttendanceUiState())
    val uiState: StateFlow<AttendanceUiState> = _uiState.asStateFlow()

    private var broadcastTimerJob: Job? = null

    val sampleStudentRoster = listOf(
        SubjectRosterItem("01", "CS401", "Major", "Database Management Systems", "CSIT", credits = 4),
        SubjectRosterItem("02", "CS405", "Minor", "Operating Systems Lab", "CSE", credits = 3),
        SubjectRosterItem("03", "SEC201", "SEC", "Web & Android Development", "CSIT", credits = 3),
        SubjectRosterItem("04", "AEC101", "AEC", "Technical Communication", "English Dept", credits = 2),
        SubjectRosterItem("05", "VAC102", "VAC", "Environmental Studies & Ethics", "Env Sciences", credits = 2)
    )

    val sampleUgSessions = listOf(
        TeacherClassSession("1", "CS401", "Database Management Systems", "10:15 AM", "CSIT", "Major"),
        TeacherClassSession("2", "CS405", "Operating Systems Lab", "12:15 PM", "CSE", "Minor"),
        TeacherClassSession("3", "SEC201", "Web & Android Development", "11:30 AM", "CSIT", "SEC")
    )

    val samplePgSessions = listOf(
        TeacherClassSession("1", "CS701", "Advanced Distributed Systems", "09:15 AM", "CSIT", "Major", isPg = true),
        TeacherClassSession("2", "CS702", "Machine Learning Seminar", "03:15 PM", "CSIT", "Major", isPg = true)
    )

    private val _attendanceRecords = MutableStateFlow(
        listOf(
            StudentAttendanceRecord("01", "Santosh Rao", "CSIT", "Major", isPresent = true),
            StudentAttendanceRecord("02", "Alex Morgan", "CSE", "Minor", isPresent = true),
            StudentAttendanceRecord("03", "Priya Sharma", "ECE", "SEC", isPresent = true),
            StudentAttendanceRecord("04", "Rahul Verma", "CSIT", "Major", isPresent = true),
            StudentAttendanceRecord("05", "Ananya Patel", "IT", "VAC", isPresent = true),
            StudentAttendanceRecord("06", "Kevin Chen", "CSIT", "Major", isPresent = true),
            StudentAttendanceRecord("07", "Sarah Jenkins", "CSE", "Minor", isPresent = true),
            StudentAttendanceRecord("08", "David O'Connor", "CSIT", "Major", isPresent = true),
            StudentAttendanceRecord("09", "Aarav Gupta", "CSE", "Minor", isPresent = true),
            StudentAttendanceRecord("10", "Meera Nair", "CSIT", "Major", isPresent = true),
            StudentAttendanceRecord("11", "Rohan Joshi", "ECE", "SEC", isPresent = true),
            StudentAttendanceRecord("12", "Sneha Kulkarni", "IT", "AEC", isPresent = true),
            StudentAttendanceRecord("13", "Ethan Taylor", "CSE", "Minor", isPresent = false),
            StudentAttendanceRecord("14", "Zoe Martinez", "CSIT", "Major", isPresent = true),
            StudentAttendanceRecord("15", "Vikram Malhotra", "CSE", "Minor", isPresent = true),
            StudentAttendanceRecord("16", "Divya Pillai", "ECE", "SEC", isPresent = true)
        )
    )
    val attendanceRecords: StateFlow<List<StudentAttendanceRecord>> = _attendanceRecords.asStateFlow()

    fun selectRole(role: Role) {
        _uiState.value = _uiState.value.copy(
            currentRole = role,
            currentScreen = Screen.AUTH,
            authTab = AuthTab.LOGIN
        )
    }

    fun switchRole() {
        val nextRole = if (_uiState.value.currentRole == Role.TEACHER) Role.STUDENT else Role.TEACHER
        _uiState.value = _uiState.value.copy(currentRole = nextRole)
    }

    fun setAuthTab(tab: AuthTab) {
        _uiState.value = _uiState.value.copy(authTab = tab)
    }

    fun navigateTo(screen: Screen) {
        if (screen == Screen.TEACHER_BROADCAST_ACTIVE) {
            startBroadcastTimer()
        } else if (_uiState.value.currentScreen == Screen.TEACHER_BROADCAST_ACTIVE && screen != Screen.TEACHER_BROADCAST_ACTIVE) {
            stopBroadcastTimer()
        }
        _uiState.value = _uiState.value.copy(currentScreen = screen)
    }

    fun goBack() {
        val next = when (_uiState.value.currentScreen) {
            Screen.ROLE_SELECTION -> Screen.ROLE_SELECTION
            Screen.AUTH -> Screen.ROLE_SELECTION
            Screen.DOC_VERIFICATION -> Screen.AUTH
            Screen.REGISTRATION_SUCCESS -> Screen.AUTH
            Screen.TEACHER_BROADCAST_SETUP -> Screen.AUTH
            Screen.TEACHER_BROADCAST_ACTIVE -> Screen.TEACHER_BROADCAST_SETUP
            Screen.STUDENT_ATTENDANCE -> Screen.AUTH
            Screen.TEACHER_REPORT -> Screen.TEACHER_BROADCAST_SETUP
        }
        if (next != Screen.TEACHER_BROADCAST_ACTIVE) {
            stopBroadcastTimer()
        }
        _uiState.value = _uiState.value.copy(currentScreen = next)
    }

    fun updateStudentEnrollment(text: String) {
        _uiState.value = _uiState.value.copy(studentEnrollment = text)
    }
    fun updateStudentPassword(text: String) {
        _uiState.value = _uiState.value.copy(studentPassword = text)
    }
    fun updateTeacherFacultyId(text: String) {
        _uiState.value = _uiState.value.copy(teacherFacultyId = text)
    }
    fun updateTeacherPassword(text: String) {
        _uiState.value = _uiState.value.copy(teacherPassword = text)
    }

    fun updateStudentRegName(text: String) {
        _uiState.value = _uiState.value.copy(studentRegName = text)
    }
    fun updateStudentRegEnrollment(text: String) {
        _uiState.value = _uiState.value.copy(studentRegEnrollment = text)
    }
    fun updateStudentRegEmail(text: String) {
        _uiState.value = _uiState.value.copy(studentRegEmail = text)
    }
    fun updateStudentCourseLevel(level: String) {
        _uiState.value = _uiState.value.copy(studentCourseLevel = level)
    }
    fun updateStudentDepartment(dept: String) {
        _uiState.value = _uiState.value.copy(studentDepartment = dept)
    }

    fun updateTeacherRegName(text: String) {
        _uiState.value = _uiState.value.copy(teacherRegName = text)
    }
    fun updateTeacherRegFacultyId(text: String) {
        _uiState.value = _uiState.value.copy(teacherRegFacultyId = text)
    }
    fun updateTeacherRegEmail(text: String) {
        _uiState.value = _uiState.value.copy(teacherRegEmail = text)
    }
    fun updateTeacherDepartment(dept: String) {
        _uiState.value = _uiState.value.copy(teacherDepartment = dept)
    }

    fun appendBroadcastPinDigit(d: String) {
        if (_uiState.value.broadcastPin.length < 2) {
            _uiState.value = _uiState.value.copy(broadcastPin = _uiState.value.broadcastPin + d)
        }
    }
    fun backspaceBroadcastPin() {
        val curr = _uiState.value.broadcastPin
        if (curr.isNotEmpty()) {
            _uiState.value = _uiState.value.copy(broadcastPin = curr.dropLast(1))
        }
    }
    fun clearBroadcastPin() {
        _uiState.value = _uiState.value.copy(broadcastPin = "")
    }

    fun appendStudentPinDigit(d: String) {
        if (_uiState.value.studentEnteredPin.length < 2) {
            val updated = _uiState.value.studentEnteredPin + d
            _uiState.value = _uiState.value.copy(studentEnteredPin = updated, studentAttendanceMessage = null)
        }
    }
    fun backspaceStudentPin() {
        val curr = _uiState.value.studentEnteredPin
        if (curr.isNotEmpty()) {
            _uiState.value = _uiState.value.copy(studentEnteredPin = curr.dropLast(1), studentAttendanceMessage = null)
        }
    }
    fun clearStudentPin() {
        _uiState.value = _uiState.value.copy(studentEnteredPin = "", studentAttendanceMessage = null)
    }

    fun toggleCampusGeofence() {
        val current = _uiState.value.campusGeofence
        val toggled = !current.isWithinBoundary
        _uiState.value = _uiState.value.copy(
            campusGeofence = current.copy(
                isWithinBoundary = toggled,
                currentDistanceMeters = if (toggled) 340.0 else 2400.0
            ),
            userNotification = if (toggled) "Simulated: Inside GGU Bilaspur Campus (340m from Central Library)" else "Simulated: Outside GGU Campus (2.4 km away - Blocked)"
        )
    }

    fun triggerBroadcastSession() {
        _uiState.value = _uiState.value.copy(
            isIncomingSessionAlertVisible = true
        )
    }

    fun dismissIncomingAlert() {
        _uiState.value = _uiState.value.copy(isIncomingSessionAlertVisible = false)
    }

    fun acceptIncomingSessionAlert() {
        _uiState.value = _uiState.value.copy(
            isIncomingSessionAlertVisible = false,
            currentRole = Role.STUDENT,
            currentScreen = Screen.STUDENT_ATTENDANCE
        )
    }

    fun submitStudentAttendance() {
        val entered = _uiState.value.studentEnteredPin
        val validPin = _uiState.value.broadcastPin.ifEmpty { "29" }

        if (!_uiState.value.campusGeofence.isWithinBoundary) {
            _uiState.value = _uiState.value.copy(
                studentAttendanceMessage = "❌ Access Denied: You are outside GGU Bilaspur campus boundary (${_uiState.value.campusGeofence.currentDistanceMeters.toInt()}m away). You must be on-campus."
            )
            return
        }

        if (entered.length < 2) {
            _uiState.value = _uiState.value.copy(
                studentAttendanceMessage = "Please enter the 2-digit Session PIN announced by the teacher."
            )
            return
        }

        if (entered == validPin || entered == "29") {
            _uiState.value = _uiState.value.copy(
                studentAttendanceMarked = true,
                studentAttendanceMessage = "✅ Attendance Verified: GGU Geofence + Session PIN Authenticated!"
            )
        } else {
            _uiState.value = _uiState.value.copy(
                studentAttendanceMessage = "Invalid PIN. Active Session PIN is $validPin"
            )
        }
    }

    fun resetStudentAttendance() {
        _uiState.value = _uiState.value.copy(
            studentEnteredPin = "",
            studentAttendanceMarked = false,
            studentAttendanceMessage = null
        )
    }

    fun startBroadcastTimer() {
        broadcastTimerJob?.cancel()
        _uiState.value = _uiState.value.copy(
            isBroadcasting = true,
            broadcastSecondsLeft = 165,
            currentAttendanceCount = 24,
            isIncomingSessionAlertVisible = true
        )
        broadcastTimerJob = viewModelScope.launch {
            val names = listOf(
                "Sneha Kulkarni (IT) • Just now",
                "Divya Pillai (ECE) • Just now",
                "Aarav Gupta (CSE) • Just now",
                "Rohan Joshi (ECE) • Just now",
                "Zoe Martinez (CSIT) • Just now"
            )
            var nameIndex = 0
            while (_uiState.value.broadcastSecondsLeft > 0) {
                delay(1000)
                val newSeconds = _uiState.value.broadcastSecondsLeft - 1
                val shouldIncrement = newSeconds % 5 == 0 && _uiState.value.currentAttendanceCount < 40
                val newCount = if (shouldIncrement) _uiState.value.currentAttendanceCount + 1 else _uiState.value.currentAttendanceCount

                val updatedJoins = if (shouldIncrement && nameIndex < names.size) {
                    val nextName = names[nameIndex++]
                    listOf(nextName) + _uiState.value.recentJoins.take(3)
                } else {
                    _uiState.value.recentJoins
                }

                _uiState.value = _uiState.value.copy(
                    broadcastSecondsLeft = newSeconds,
                    currentAttendanceCount = newCount,
                    recentJoins = updatedJoins
                )
            }
        }
    }

    fun stopBroadcastTimer() {
        broadcastTimerJob?.cancel()
        broadcastTimerJob = null
        _uiState.value = _uiState.value.copy(isBroadcasting = false)
    }

    fun setPhysicalHeadcount(count: Int) {
        _uiState.value = _uiState.value.copy(physicalHeadcount = count)
    }

    fun toggleAuditMode() {
        _uiState.value = _uiState.value.copy(isAuditModeActive = !_uiState.value.isAuditModeActive)
    }

    fun cancelStudentAttendance(sNo: String) {
        val student = _attendanceRecords.value.find { it.sNo == sNo }
        val updated = _attendanceRecords.value.map {
            if (it.sNo == sNo) it.copy(isPresent = false) else it
        }
        _attendanceRecords.value = updated
        _uiState.value = _uiState.value.copy(
            userNotification = "Attendance CANCELLED for ${student?.studentName ?: "Student"} (Marked Absent)"
        )
    }

    fun confirmStudentAttendance(sNo: String) {
        val student = _attendanceRecords.value.find { it.sNo == sNo }
        val updated = _attendanceRecords.value.map {
            if (it.sNo == sNo) it.copy(isPresent = true) else it
        }
        _attendanceRecords.value = updated
        _uiState.value = _uiState.value.copy(
            userNotification = "Attendance CONFIRMED for ${student?.studentName ?: "Student"} (Present)"
        )
    }

    fun toggleStudentAttendance(sNo: String) {
        val student = _attendanceRecords.value.find { it.sNo == sNo }
        val updated = _attendanceRecords.value.map {
            if (it.sNo == sNo) it.copy(isPresent = !it.isPresent) else it
        }
        _attendanceRecords.value = updated
        val newStatus = updated.find { it.sNo == sNo }?.isPresent == true
        _uiState.value = _uiState.value.copy(
            userNotification = if (newStatus) "${student?.studentName} marked Present" else "${student?.studentName} marked Absent"
        )
    }

    fun setSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query, reportCurrentPage = 0)
    }

    fun setDeptFilter(dept: String) {
        _uiState.value = _uiState.value.copy(selectedDeptFilter = dept, reportCurrentPage = 0)
    }

    fun setCategoryFilter(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategoryFilter = category, reportCurrentPage = 0)
    }

    fun getFilteredAttendanceRecords(): List<StudentAttendanceRecord> {
        val q = _uiState.value.searchQuery.trim().lowercase()
        val dept = _uiState.value.selectedDeptFilter
        val cat = _uiState.value.selectedCategoryFilter
        return _attendanceRecords.value.filter {
            val matchesQuery = q.isEmpty() || it.studentName.lowercase().contains(q) || it.sNo.contains(q) || it.dept.lowercase().contains(q)
            val matchesDept = dept == "All" || it.dept.equals(dept, ignoreCase = true)
            val matchesCat = cat == "All" || it.courseType.equals(cat, ignoreCase = true)
            matchesQuery && matchesDept && matchesCat
        }
    }

    fun openProfileSheet() {
        _uiState.value = _uiState.value.copy(isProfileSheetOpen = true)
    }

    fun closeProfileSheet() {
        _uiState.value = _uiState.value.copy(isProfileSheetOpen = false)
    }

    fun openExportModal() {
        _uiState.value = _uiState.value.copy(isExportModalOpen = true)
    }

    fun closeExportModal() {
        _uiState.value = _uiState.value.copy(isExportModalOpen = false)
    }

    fun openMongoDbInfo() {
        _uiState.value = _uiState.value.copy(isMongoDbInfoOpen = true)
    }

    fun closeMongoDbInfo() {
        _uiState.value = _uiState.value.copy(isMongoDbInfoOpen = false)
    }

    fun openDocPreview(title: String, content: String) {
        _uiState.value = _uiState.value.copy(
            isDocPreviewOpen = true,
            docPreviewTitle = title,
            docPreviewContent = content
        )
    }

    fun closeDocPreview() {
        _uiState.value = _uiState.value.copy(isDocPreviewOpen = false)
    }

    fun dismissNotification() {
        _uiState.value = _uiState.value.copy(userNotification = null)
    }

    fun exportCsv() {
        _uiState.value = _uiState.value.copy(
            isExportModalOpen = true,
            userNotification = "Attendance Sheet (GGU_CS401_Attendance.csv) prepared for download!"
        )
    }

    fun saveAndPublish() {
        _uiState.value = _uiState.value.copy(
            userNotification = "Attendance records published to GGU SAMARTH / Academic Portal (40/45 verified)."
        )
    }

    fun prevReportPage() {
        if (_uiState.value.reportCurrentPage > 0) {
            _uiState.value = _uiState.value.copy(reportCurrentPage = _uiState.value.reportCurrentPage - 1)
        }
    }

    fun nextReportPage() {
        val total = getFilteredAttendanceRecords().size
        val totalPages = (total + _uiState.value.reportPageSize - 1) / _uiState.value.reportPageSize
        if (_uiState.value.reportCurrentPage < totalPages - 1) {
            _uiState.value = _uiState.value.copy(reportCurrentPage = _uiState.value.reportCurrentPage + 1)
        }
    }
}
