package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bluetooth
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.Role
import com.example.data.Screen
import com.example.ui.theme.EmeraldCheck
import com.example.ui.theme.Slate100
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate600
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileBottomSheet(
    uiState: AttendanceUiState,
    viewModel: AttendanceViewModel,
    modifier: Modifier = Modifier
) {
    val isTeacher = uiState.currentRole == Role.TEACHER
    val brandColor = if (isTeacher) TeacherOrange else StudentTeal

    ModalBottomSheet(
        onDismissRequest = { viewModel.closeProfileSheet() },
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = Color.White,
        modifier = modifier.testTag("profile_bottom_sheet")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "GGU Attendance Security & Sensors",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                IconButton(
                    onClick = { viewModel.closeProfileSheet() },
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = Slate500,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (isTeacher) TeacherOrangeLight else StudentTealLight)
                    .border(1.dp, brandColor.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                    .padding(14.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .clip(CircleShape)
                            .background(brandColor),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                text = if (isTeacher) "Dr. Eleanor Vance" else "Alex Morgan",
                                fontSize = 14.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(SuccessGreenLight)
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "GGU Active",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EmeraldCheck
                                )
                            }
                        }

                        Text(
                            text = if (isTeacher) "FAC-CS-8924 • Dept of CSIT, GGU Bilaspur" else "2024-BTECH-CS-042 • CSIT Dept, GGU Bilaspur",
                            fontSize = 11.sp,
                            color = Slate600
                        )

                        Text(
                            text = if (isTeacher) "Course: CS401 (DBMS) + CS405 + SEC201" else "Courses: Major (CS401), Minor (CS405), SEC, VAC, AEC",
                            fontSize = 10.sp,
                            color = Slate500
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "ANTI-PROXY & LOCATION VERIFICATION",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = Slate400
            )

            Spacer(modifier = Modifier.height(8.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .border(1.dp, Slate200, RoundedCornerShape(10.dp))
                    .background(Color.White)
                    .padding(12.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.LocationOn, contentDescription = null, tint = Color(0xFFDC2626), modifier = Modifier.size(18.dp))
                            Column {
                                Text("GGU Bilaspur Campus GPS", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate800)
                                Text(
                                    text = if (uiState.campusGeofence.isWithinBoundary)
                                        "Inside Campus (${uiState.campusGeofence.currentDistanceMeters.toInt()}m from Center)"
                                    else
                                        "Outside Campus Boundary (${uiState.campusGeofence.currentDistanceMeters.toInt()}m away - BLOCKED)",
                                    fontSize = 10.sp,
                                    color = if (uiState.campusGeofence.isWithinBoundary) EmeraldCheck else Color(0xFFDC2626),
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }

                        Switch(
                            checked = uiState.campusGeofence.isWithinBoundary,
                            onCheckedChange = { viewModel.toggleCampusGeofence() },
                            colors = SwitchDefaults.colors(checkedThumbColor = StudentTeal, checkedTrackColor = StudentTeal.copy(alpha = 0.4f)),
                            modifier = Modifier.size(width = 38.dp, height = 24.dp).testTag("toggle_geofence_switch")
                        )
                    }

                    HorizontalDivider(color = Slate100, thickness = 1.dp)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Security, contentDescription = null, tint = TeacherOrange, modifier = Modifier.size(18.dp))
                            Column {
                                Text("Teacher Headcount Audit", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate800)
                                Text(
                                    text = "Sir can cross-check physical count & cancel proxy in 1-tap",
                                    fontSize = 10.sp,
                                    color = EmeraldCheck,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                        Text("Active", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = EmeraldCheck)
                    }

                    HorizontalDivider(color = Slate100, thickness = 1.dp)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(Icons.Default.Bluetooth, contentDescription = null, tint = Color(0xFF2563EB), modifier = Modifier.size(18.dp))
                            Column {
                                Text("Classroom BLE Gateway (CSIT)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate800)
                                Text("Room FB Gateway Active • No Mic Hardware Dependency", fontSize = 10.sp, color = Slate500)
                            }
                        }
                        Text("Linked", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = EmeraldCheck)
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            OutlinedButton(
                onClick = {
                    viewModel.closeProfileSheet()
                    viewModel.openMongoDbInfo()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(40.dp)
                    .testTag("view_mongodb_button"),
                shape = RoundedCornerShape(8.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF16A34A))
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(Icons.Default.Storage, contentDescription = null, tint = Color(0xFF16A34A), modifier = Modifier.size(16.dp))
                    Text("View MongoDB Schema & Architecture Plan", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFF16A34A))
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = {
                        viewModel.switchRole()
                        viewModel.closeProfileSheet()
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp)
                        .testTag("profile_switch_role_btn"),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Slate100)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(Icons.Default.SwapHoriz, contentDescription = null, tint = Slate700, modifier = Modifier.size(18.dp))
                        Text("Switch Role", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate800)
                    }
                }

                Button(
                    onClick = {
                        viewModel.navigateTo(Screen.ROLE_SELECTION)
                        viewModel.closeProfileSheet()
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp)
                        .testTag("profile_logout_btn"),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = brandColor)
                ) {
                    Text("Change Role / Logout", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                }
            }
        }
    }
}
