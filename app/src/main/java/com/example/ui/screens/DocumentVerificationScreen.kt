package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.Role
import com.example.data.Screen
import com.example.ui.theme.DeptAecBg
import com.example.ui.theme.DeptAecText
import com.example.ui.theme.DeptCsitBg
import com.example.ui.theme.DeptCsitText
import com.example.ui.theme.DeptEceBg
import com.example.ui.theme.DeptEceText
import com.example.ui.theme.EmeraldCheck
import com.example.ui.theme.Slate50
import com.example.ui.theme.Slate100
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate700
import com.example.ui.theme.Slate800
import com.example.ui.theme.Slate900
import com.example.ui.theme.StudentTeal
import com.example.ui.theme.StudentTealLight
import com.example.ui.theme.SuccessGreenLight
import com.example.ui.theme.TeacherOrange
import com.example.ui.theme.TeacherOrangeLight
import com.example.viewmodel.AttendanceUiState
import com.example.viewmodel.AttendanceViewModel

@Composable
fun DocumentVerificationScreen(
    uiState: AttendanceUiState,
    viewModel: AttendanceViewModel,
    modifier: Modifier = Modifier
) {
    val isTeacher = uiState.currentRole == Role.TEACHER
    val brandColor = if (isTeacher) TeacherOrange else StudentTeal

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .testTag("document_verification_screen")
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { viewModel.goBack() },
                modifier = Modifier.size(44.dp).testTag("doc_verify_back_button")
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = Slate700,
                    modifier = Modifier.size(22.dp)
                )
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "STEP 2 OF 2",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    color = if (isTeacher) Slate400 else brandColor
                )
                Text(
                    text = if (isTeacher) "Document Upload" else "Student Document Verification",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    text = if (isTeacher) "Schedule & ID Verification" else "Review uploaded credentials and extracted registration records below.",
                    fontSize = 10.sp,
                    color = Slate500,
                    maxLines = 1
                )
            }

            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(CircleShape)
                    .background(if (isTeacher) TeacherOrangeLight else StudentTealLight)
                    .clickable { viewModel.openProfileSheet() }
                    .testTag("doc_verify_avatar_button"),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "User",
                    tint = brandColor,
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        HorizontalDivider(color = Slate100, thickness = 1.dp)

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 18.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            if (isTeacher) {
                TeacherVerificationContent(viewModel = viewModel)
            } else {
                StudentVerificationContent(viewModel = viewModel)
            }
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .clip(CircleShape)
                    .background(brandColor)
                    .clickable { viewModel.navigateTo(Screen.REGISTRATION_SUCCESS) }
                    .testTag("confirm_complete_button"),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "Confirm & Complete",
                    tint = Color.White,
                    modifier = Modifier.size(28.dp)
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Confirm & Complete",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Slate800
            )
            Text(
                text = if (isTeacher) "Finalize schedule & verified timetable" else "Finalize enrollment and sync student timetable",
                fontSize = 10.sp,
                color = Slate400
            )
        }

        if (uiState.isDocPreviewOpen) {
            com.example.ui.components.DocPreviewDialog(
                title = uiState.docPreviewTitle,
                content = uiState.docPreviewContent,
                onDismiss = { viewModel.closeDocPreview() },
                onReplaceAction = {
                    viewModel.closeDocPreview()
                    viewModel.exportCsv()
                }
            )
        }
    }
}

@Composable
private fun StudentVerificationContent(viewModel: AttendanceViewModel) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, Slate200, RoundedCornerShape(12.dp))
            .background(Color.White)
            .padding(14.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "1. Student ID Card",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate800
                )
                Text(
                    text = "Replace ID",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = StudentTeal,
                    modifier = Modifier.clickable {
                        viewModel.openDocPreview(
                            "Student ID Card",
                            "Document: Student_ID_Card.jpg\nIdentity: Alex Morgan (2024-BTECH-CS-042)\nInstitution: Apex Institute of Technology\nDigital Seal: SHA-256 Validated\nStatus: Active Validated Pass"
                        )
                    }
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .border(1.dp, Color(0xFFCBEAF4), RoundedCornerShape(8.dp))
                    .background(Color(0xFFF0F9FB))
                    .padding(12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(width = 46.dp, height = 54.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(Slate200),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = Slate400,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "APEX INSTITUTE OF TECH",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                            color = Color(0xFF155E75)
                        )
                        Text(
                            text = "Alex Morgan",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Text(
                            text = "2024-BTECH-CS-042",
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            color = Slate500
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(12.dp))
                                .background(SuccessGreenLight)
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(CircleShape)
                                        .background(EmeraldCheck)
                                )
                                Text(
                                    text = "Active Validated Pass",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF047857)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, Slate200, RoundedCornerShape(12.dp))
            .background(Color.White)
            .padding(14.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "2. Course Selection Form",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate800
                )
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(SuccessGreenLight)
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "Parsed Successfully",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF047857)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .border(1.dp, Slate200, RoundedCornerShape(8.dp))
                    .background(Slate50)
                    .padding(10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(Color(0xFFF43F5E))
                            .padding(horizontal = 6.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "PDF",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                    Column {
                        Text("subject_selects", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate800)
                        Text("1.2 MB • Extracted via OCR", fontSize = 9.sp, color = Slate400)
                    }
                }

                Text(
                    text = "Re-upload PDF",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = StudentTeal,
                    modifier = Modifier.clickable {
                        viewModel.openDocPreview(
                            "Course Selection Document",
                            "Filename: subject_selects.pdf\nSize: 1.2 MB\nParsed Subjects: 5 Courses (DBMS, OS, DSA, etc.)\nExtraction: OCR Text Extractor v2\nStatus: 100% Parsed Successfully"
                        )
                    }
                )
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, Slate200, RoundedCornerShape(12.dp))
            .background(Color.White)
            .padding(14.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Extracted Academic Details",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate800
                )
                Text(
                    text = "READ-ONLY",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    color = Slate400
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("CANDIDATE NAME", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Slate400)
                    Text("Alex Morgan", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate800)
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text("CURRENT TERM", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Slate400)
                    Text("Semester 4", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate800)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Column {
                Text("ENROLLED DEGREE", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Slate400)
                Text("B.Tech Computer Science & Engineering", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate800)
            }

            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("PARSED SUBJECT ROSTER", fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp, color = Slate500)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(StudentTealLight)
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text("5 Subjects", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = StudentTeal)
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .border(1.dp, Slate200, RoundedCornerShape(8.dp))
            ) {
                Column {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Slate100)
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("S.NO.", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate500, modifier = Modifier.width(36.dp))
                        Text("TYPE", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate500, modifier = Modifier.width(54.dp))
                        Text("SUBJECT NAME", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate500, modifier = Modifier.weight(1f))
                    }

                    viewModel.sampleStudentRoster.forEachIndexed { _, item ->
                        HorizontalDivider(color = Slate100, thickness = 1.dp)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color.White)
                                .padding(horizontal = 10.dp, vertical = 7.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(item.sNo, fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = Slate400, modifier = Modifier.width(36.dp))

                            val (bg, textColor) = if (item.type == "Major") {
                                DeptCsitBg to DeptCsitText
                            } else if (item.sNo == "04") {
                                DeptAecBg to DeptAecText
                            } else {
                                DeptEceBg to DeptEceText
                            }

                            Box(
                                modifier = Modifier
                                    .width(54.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(bg)
                                        .padding(horizontal = 4.dp, vertical = 2.dp)
                                ) {
                                    Text(item.type, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = textColor)
                                }
                            }

                            Text(item.subjectName, fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate700, modifier = Modifier.weight(1f))
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TeacherVerificationContent(viewModel: AttendanceViewModel) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, Slate200, RoundedCornerShape(12.dp))
            .background(Color.White)
            .padding(14.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Faculty ID Card", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate700)
                Text(
                    text = "Replace ID",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = StudentTeal,
                    modifier = Modifier.clickable {
                        viewModel.openDocPreview(
                            "Faculty ID Card",
                            "Faculty: Dr. Eleanor Vance\nID: FAC-CS-8924\nDepartment: Computer Science & Engineering\nAccess Level: Classroom Broadcast Authority\nStatus: Active Faculty Verified"
                        )
                    }
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .border(1.dp, Slate200, RoundedCornerShape(8.dp))
                    .background(Color(0xFFFAFBFD))
                    .padding(12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(width = 46.dp, height = 54.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(Slate200),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Person, contentDescription = null, tint = Slate400, modifier = Modifier.size(28.dp))
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("FACULTY ID", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate400)
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(SuccessGreenLight)
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("Active", fontSize = 9.sp, fontWeight = FontWeight.Medium, color = Color(0xFF047857))
                            }
                        }
                        Text("FAC-CS-8924", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, color = Slate800)
                        Text("Dr. Eleanor Vance", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Slate700)
                        Text("Dept: Computer Science & Engineering", fontSize = 10.sp, color = Slate500)
                    }
                }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, Slate200, RoundedCornerShape(12.dp))
            .background(Color.White)
            .padding(14.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Time Table Document", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate700)
                Text(
                    text = "Re-upload PDF",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = StudentTeal,
                    modifier = Modifier.clickable {
                        viewModel.openDocPreview(
                            "Faculty Timetable Document",
                            "Filename: Faculty_timetable_spring2024.pdf\nSize: 2.4 MB\nExtracted: 5 Semesters\nActive Sessions: 3 UG + 2 PG Sessions\nStatus: Schedule Verified"
                        )
                    }
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .border(1.dp, Slate200, RoundedCornerShape(8.dp))
                    .background(Slate50)
                    .padding(10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(Color(0xFFEF4444))
                            .padding(horizontal = 6.dp, vertical = 3.dp)
                    ) {
                        Text("PDF", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Column {
                        Text("Faculty_timetable_spring2024.pdf", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate800)
                        Text("2.4 MB • Extracted 5 Semesters", fontSize = 9.sp, color = Slate400)
                    }
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(SuccessGreenLight)
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text("Parsed", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF047857))
                }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, Slate200, RoundedCornerShape(12.dp))
            .background(Color.White)
            .padding(14.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Extracted Faculty Details", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate800)
            Column {
                Text("TEACHER NAME", fontSize = 9.sp, fontWeight = FontWeight.Medium, color = Slate400)
                Text("Dr. Eleanor Vance", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate800)
            }
            Column {
                Text("DEPARTMENT", fontSize = 9.sp, fontWeight = FontWeight.Medium, color = Slate400)
                Text("Computer Science & Engineering", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate800)
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, Slate200, RoundedCornerShape(12.dp))
            .background(Color.White)
            .padding(14.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("UG Classes (Undergraduate)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate800)
                Text("3 Sessions", fontSize = 10.sp, color = Slate400)
            }

            Spacer(modifier = Modifier.height(8.dp))

            Column {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("S.NO.", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Slate400, modifier = Modifier.width(36.dp))
                    Text("SUBJECT", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Slate400, modifier = Modifier.width(60.dp))
                    Text("SUBJECT NAME", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Slate400, modifier = Modifier.weight(1f))
                    Text("ALLOT", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Slate400)
                }

                HorizontalDivider(color = Slate100, thickness = 1.dp)

                viewModel.sampleUgSessions.forEach { item ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 7.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(item.sNo, fontSize = 11.sp, color = Slate400, modifier = Modifier.width(36.dp))
                        Text(item.subjectCode, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TeacherOrange, modifier = Modifier.width(60.dp))
                        Text(item.subjectName, fontSize = 11.sp, color = Slate700, modifier = Modifier.weight(1f))
                        Text(item.allotTime, fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500)
                    }
                    HorizontalDivider(color = Color(0xFFF8FAFC), thickness = 1.dp)
                }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(1.dp, Slate200, RoundedCornerShape(12.dp))
            .background(Color.White)
            .padding(14.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("PG Classes (Postgraduate)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate800)
                Text("2 Sessions", fontSize = 10.sp, color = Slate400)
            }

            Spacer(modifier = Modifier.height(8.dp))

            Column {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("S.NO.", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Slate400, modifier = Modifier.width(36.dp))
                    Text("SUBJECT", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Slate400, modifier = Modifier.width(60.dp))
                    Text("SUBJECT NAME", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Slate400, modifier = Modifier.weight(1f))
                    Text("ALLOT", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Slate400)
                }

                HorizontalDivider(color = Slate100, thickness = 1.dp)

                viewModel.samplePgSessions.forEach { item ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 7.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(item.sNo, fontSize = 11.sp, color = Slate400, modifier = Modifier.width(36.dp))
                        Text(item.subjectCode, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TeacherOrange, modifier = Modifier.width(60.dp))
                        Text(item.subjectName, fontSize = 11.sp, color = Slate700, modifier = Modifier.weight(1f))
                        Text(item.allotTime, fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500)
                    }
                    HorizontalDivider(color = Color(0xFFF8FAFC), thickness = 1.dp)
                }
            }
        }
    }
}
