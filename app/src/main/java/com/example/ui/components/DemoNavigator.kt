package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.AuthTab
import com.example.data.Role
import com.example.data.Screen
import com.example.ui.theme.DarkNavy
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate700
import com.example.ui.theme.StudentTeal
import com.example.viewmodel.AttendanceViewModel

@Composable
fun QuickScreenSwitcher(
    currentScreen: Screen,
    currentRole: Role,
    viewModel: AttendanceViewModel,
    modifier: Modifier = Modifier
) {
    var isExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        AnimatedVisibility(
            visible = isExpanded,
            enter = expandVertically(),
            exit = shrinkVertically()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(DarkNavy)
                    .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(14.dp))
                    .padding(8.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "PREVIEW SCREENS (12 Mockups)",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Color.White.copy(alpha = 0.7f),
                            modifier = Modifier
                                .size(18.dp)
                                .clickable { isExpanded = false }
                        )
                    }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        ScreenChip("1. Role Select", currentScreen == Screen.ROLE_SELECTION) {
                            viewModel.navigateTo(Screen.ROLE_SELECTION)
                        }
                        ScreenChip("2. Student Login", currentScreen == Screen.AUTH && currentRole == Role.STUDENT && viewModel.uiState.value.authTab == AuthTab.LOGIN) {
                            viewModel.selectRole(Role.STUDENT)
                            viewModel.setAuthTab(AuthTab.LOGIN)
                        }
                        ScreenChip("3. Teacher Login", currentScreen == Screen.AUTH && currentRole == Role.TEACHER && viewModel.uiState.value.authTab == AuthTab.LOGIN) {
                            viewModel.selectRole(Role.TEACHER)
                            viewModel.setAuthTab(AuthTab.LOGIN)
                        }
                        ScreenChip("4. Student Reg 1/2", currentScreen == Screen.AUTH && currentRole == Role.STUDENT && viewModel.uiState.value.authTab == AuthTab.REGISTER) {
                            viewModel.selectRole(Role.STUDENT)
                            viewModel.setAuthTab(AuthTab.REGISTER)
                        }
                        ScreenChip("5. Teacher Reg 1/2", currentScreen == Screen.AUTH && currentRole == Role.TEACHER && viewModel.uiState.value.authTab == AuthTab.REGISTER) {
                            viewModel.selectRole(Role.TEACHER)
                            viewModel.setAuthTab(AuthTab.REGISTER)
                        }
                    }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        ScreenChip("6. Student Doc Verify", currentScreen == Screen.DOC_VERIFICATION && currentRole == Role.STUDENT) {
                            viewModel.selectRole(Role.STUDENT)
                            viewModel.navigateTo(Screen.DOC_VERIFICATION)
                        }
                        ScreenChip("7. Teacher Doc Upload", currentScreen == Screen.DOC_VERIFICATION && currentRole == Role.TEACHER) {
                            viewModel.selectRole(Role.TEACHER)
                            viewModel.navigateTo(Screen.DOC_VERIFICATION)
                        }
                        ScreenChip("8. Reg Successful", currentScreen == Screen.REGISTRATION_SUCCESS) {
                            viewModel.navigateTo(Screen.REGISTRATION_SUCCESS)
                        }
                        ScreenChip("9. Teacher PIN Broadcast", currentScreen == Screen.TEACHER_BROADCAST_SETUP) {
                            viewModel.navigateTo(Screen.TEACHER_BROADCAST_SETUP)
                        }
                        ScreenChip("10. Broadcast Active", currentScreen == Screen.TEACHER_BROADCAST_ACTIVE) {
                            viewModel.navigateTo(Screen.TEACHER_BROADCAST_ACTIVE)
                        }
                        ScreenChip("11. Student PIN Entry", currentScreen == Screen.STUDENT_ATTENDANCE) {
                            viewModel.navigateTo(Screen.STUDENT_ATTENDANCE)
                        }
                        ScreenChip("12. Attendance Report", currentScreen == Screen.TEACHER_REPORT) {
                            viewModel.navigateTo(Screen.TEACHER_REPORT)
                        }
                    }
                }
            }
        }

        if (!isExpanded) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.White)
                    .border(1.dp, Slate200, RoundedCornerShape(20.dp))
                    .clickable { isExpanded = true }
                    .padding(horizontal = 12.dp, vertical = 5.dp)
                    .testTag("quick_nav_toggle")
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.GridView,
                        contentDescription = "Screens",
                        tint = Slate600,
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = "Screens Menu",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Slate700
                    )
                }
            }
        }
    }
}

@Composable
private fun ScreenChip(
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(if (isSelected) StudentTeal else Color.White.copy(alpha = 0.12f))
            .clickable { onClick() }
            .padding(horizontal = 10.dp, vertical = 5.dp)
    ) {
        Text(
            text = title,
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            color = Color.White
        )
    }
}
