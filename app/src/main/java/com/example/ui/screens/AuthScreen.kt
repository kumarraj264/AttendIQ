package com.example.ui.screens

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import com.example.ui.components.bounceClick
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.AuthTab
import com.example.data.Role
import com.example.data.Screen
import com.example.ui.components.AuthTopBar
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate300
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate700
import com.example.ui.theme.Slate800
import com.example.ui.theme.Slate900
import com.example.ui.theme.StudentTeal
import com.example.ui.theme.TeacherOrange
import com.example.viewmodel.AttendanceUiState
import com.example.viewmodel.AttendanceViewModel

@Composable
fun AuthScreen(
    uiState: AttendanceUiState,
    viewModel: AttendanceViewModel,
    modifier: Modifier = Modifier
) {
    val isTeacher = uiState.currentRole == Role.TEACHER
    val brandColor = if (isTeacher) TeacherOrange else StudentTeal
    var showForgotPasswordDialog by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .testTag("auth_screen")
    ) {
        AuthTopBar(
            onBackClick = { viewModel.goBack() },
            onSwitchRoleClick = { viewModel.switchRole() }
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 28.dp, vertical = 6.dp)
        ) {
            Text(
                text = if (isTeacher) "TEACHER" else "STUDENT",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.5.sp,
                color = Slate900,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp)
                    .testTag("auth_role_title"),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )

            SegmentedAuthControl(
                selectedTab = uiState.authTab,
                brandColor = brandColor,
                onTabSelect = { viewModel.setAuthTab(it) }
            )

            Spacer(modifier = Modifier.height(18.dp))

            if (uiState.authTab == AuthTab.LOGIN) {
                if (isTeacher) {
                    TeacherLoginForm(
                        facultyId = uiState.teacherFacultyId,
                        password = uiState.teacherPassword,
                        onFacultyIdChange = { viewModel.updateTeacherFacultyId(it) },
                        onPasswordChange = { viewModel.updateTeacherPassword(it) },
                        onForgotPassword = { showForgotPasswordDialog = true },
                        onSubmit = { viewModel.navigateTo(Screen.TEACHER_BROADCAST_SETUP) },
                        brandColor = brandColor
                    )
                } else {
                    StudentLoginForm(
                        enrollmentNo = uiState.studentEnrollment,
                        password = uiState.studentPassword,
                        onEnrollmentChange = { viewModel.updateStudentEnrollment(it) },
                        onPasswordChange = { viewModel.updateStudentPassword(it) },
                        onForgotPassword = { showForgotPasswordDialog = true },
                        onSubmit = { viewModel.navigateTo(Screen.STUDENT_ATTENDANCE) },
                        brandColor = brandColor
                    )
                }
            } else {
                Text(
                    text = "STEP 1 OF 2",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    color = brandColor,
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                if (isTeacher) {
                    TeacherRegisterForm(
                        name = uiState.teacherRegName,
                        facultyId = uiState.teacherRegFacultyId,
                        email = uiState.teacherRegEmail,
                        department = uiState.teacherDepartment,
                        onNameChange = { viewModel.updateTeacherRegName(it) },
                        onFacultyIdChange = { viewModel.updateTeacherRegFacultyId(it) },
                        onEmailChange = { viewModel.updateTeacherRegEmail(it) },
                        onDepartmentChange = { viewModel.updateTeacherDepartment(it) },
                        onSubmit = { viewModel.navigateTo(Screen.DOC_VERIFICATION) },
                        brandColor = brandColor
                    )
                } else {
                    StudentRegisterForm(
                        name = uiState.studentRegName,
                        enrollment = uiState.studentRegEnrollment,
                        email = uiState.studentRegEmail,
                        courseLevel = uiState.studentCourseLevel,
                        onNameChange = { viewModel.updateStudentRegName(it) },
                        onEnrollmentChange = { viewModel.updateStudentRegEnrollment(it) },
                        onEmailChange = { viewModel.updateStudentRegEmail(it) },
                        onCourseChange = { viewModel.updateStudentCourseLevel(it) },
                        onSubmit = { viewModel.navigateTo(Screen.DOC_VERIFICATION) },
                        brandColor = brandColor
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    if (showForgotPasswordDialog) {
        AlertDialog(
            onDismissRequest = { showForgotPasswordDialog = false },
            title = { Text("Reset Password", fontWeight = FontWeight.Bold) },
            text = {
                Text(
                    "Password reset instructions have been dispatched to your institutional email.",
                    fontSize = 13.sp,
                    color = Slate700
                )
            },
            confirmButton = {
                Button(
                    onClick = { showForgotPasswordDialog = false },
                    colors = ButtonDefaults.buttonColors(containerColor = brandColor)
                ) {
                    Text("OK", color = Color.White)
                }
            }
        )
    }
}

@Composable
private fun SegmentedAuthControl(
    selectedTab: AuthTab,
    brandColor: Color,
    onTabSelect: (AuthTab) -> Unit
) {
    val isLogin = selectedTab == AuthTab.LOGIN
    val loginBg by animateColorAsState(
        targetValue = if (isLogin) brandColor else Color.Transparent,
        animationSpec = spring(stiffness = Spring.StiffnessMediumLow),
        label = "loginBg"
    )
    val registerBg by animateColorAsState(
        targetValue = if (!isLogin) brandColor else Color.Transparent,
        animationSpec = spring(stiffness = Spring.StiffnessMediumLow),
        label = "registerBg"
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .border(1.dp, Slate200, RoundedCornerShape(8.dp))
            .background(Color(0xFFF8FAFC))
            .padding(3.dp)
            .testTag("auth_segmented_control")
    ) {
        Row(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(6.dp))
                    .background(loginBg)
                    .bounceClick { onTabSelect(AuthTab.LOGIN) }
                    .padding(vertical = 8.dp)
                    .testTag("tab_login"),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Log In",
                    fontSize = 12.sp,
                    fontWeight = if (isLogin) FontWeight.SemiBold else FontWeight.Medium,
                    color = if (isLogin) Color.White else Slate500
                )
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(6.dp))
                    .background(registerBg)
                    .bounceClick { onTabSelect(AuthTab.REGISTER) }
                    .padding(vertical = 8.dp)
                    .testTag("tab_register"),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Register",
                    fontSize = 12.sp,
                    fontWeight = if (!isLogin) FontWeight.SemiBold else FontWeight.Medium,
                    color = if (!isLogin) Color.White else Slate500
                )
            }
        }
    }
}

@Composable
private fun StudentLoginForm(
    enrollmentNo: String,
    password: String,
    onEnrollmentChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onForgotPassword: () -> Unit,
    onSubmit: () -> Unit,
    brandColor: Color
) {
    var isPasswordVisible by remember { mutableStateOf(false) }

    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Column {
            Text(
                text = "Enrollment No.",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Slate500,
                modifier = Modifier.padding(bottom = 4.dp)
            )
            OutlinedTextField(
                value = enrollmentNo,
                onValueChange = onEnrollmentChange,
                placeholder = { Text("e.g. 2024-BTECH-CS-042", fontSize = 12.sp, color = Slate300) },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("student_enrollment_input"),
                singleLine = true,
                shape = RoundedCornerShape(6.dp),
                colors = outlinedFieldColors(brandColor)
            )
        }

        Column {
            Text(
                text = "Password",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Slate500,
                modifier = Modifier.padding(bottom = 4.dp)
            )
            OutlinedTextField(
                value = password,
                onValueChange = onPasswordChange,
                placeholder = { Text("••••••••", fontSize = 12.sp, color = Slate300) },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("student_password_input"),
                singleLine = true,
                visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                shape = RoundedCornerShape(6.dp),
                trailingIcon = {
                    IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                        Icon(
                            imageVector = if (isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = if (isPasswordVisible) "Hide password" else "Show password",
                            tint = Slate400,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                },
                colors = outlinedFieldColors(brandColor)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End
        ) {
            Text(
                text = "Forgot Password?",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = brandColor,
                modifier = Modifier
                    .clickable { onForgotPassword() }
                    .padding(vertical = 2.dp)
                    .testTag("student_forgot_password")
            )
        }

        Spacer(modifier = Modifier.height(4.dp))

        Button(
            onClick = onSubmit,
            modifier = Modifier
                .fillMaxWidth()
                .height(46.dp)
                .bounceClick()
                .testTag("student_login_button"),
            shape = RoundedCornerShape(6.dp),
            colors = ButtonDefaults.buttonColors(containerColor = brandColor)
        ) {
            Text(
                text = "Log In",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )
        }
    }
}

@Composable
private fun TeacherLoginForm(
    facultyId: String,
    password: String,
    onFacultyIdChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onForgotPassword: () -> Unit,
    onSubmit: () -> Unit,
    brandColor: Color
) {
    var isPasswordVisible by remember { mutableStateOf(false) }

    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Column {
            Text(
                text = "Faculty ID",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Slate700,
                modifier = Modifier.padding(bottom = 4.dp)
            )
            OutlinedTextField(
                value = facultyId,
                onValueChange = onFacultyIdChange,
                placeholder = { Text("e.g. FAC-CS-01", fontSize = 13.sp, color = Slate400) },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("teacher_faculty_id_input"),
                singleLine = true,
                shape = RoundedCornerShape(8.dp),
                colors = outlinedFieldColors(brandColor)
            )
        }

        Column {
            Text(
                text = "Password",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Slate700,
                modifier = Modifier.padding(bottom = 4.dp)
            )
            OutlinedTextField(
                value = password,
                onValueChange = onPasswordChange,
                placeholder = { Text("••••••••••••", fontSize = 13.sp, color = Slate400) },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("teacher_password_input"),
                singleLine = true,
                visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                shape = RoundedCornerShape(8.dp),
                trailingIcon = {
                    IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                        Icon(
                            imageVector = if (isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = if (isPasswordVisible) "Hide password" else "Show password",
                            tint = Slate400,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                },
                colors = outlinedFieldColors(brandColor)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End
        ) {
            Text(
                text = "Forgot Password?",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = brandColor,
                modifier = Modifier
                    .clickable { onForgotPassword() }
                    .padding(vertical = 2.dp)
                    .testTag("teacher_forgot_password")
            )
        }

        Spacer(modifier = Modifier.height(6.dp))

        Button(
            onClick = onSubmit,
            modifier = Modifier
                .fillMaxWidth()
                .height(46.dp)
                .bounceClick()
                .testTag("teacher_login_button"),
            shape = RoundedCornerShape(8.dp),
            colors = ButtonDefaults.buttonColors(containerColor = brandColor)
        ) {
            Text(
                text = "Log In",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = Color.White
            )
        }
    }
}

@Composable
private fun StudentRegisterForm(
    name: String,
    enrollment: String,
    email: String,
    courseLevel: String,
    onNameChange: (String) -> Unit,
    onEnrollmentChange: (String) -> Unit,
    onEmailChange: (String) -> Unit,
    onCourseChange: (String) -> Unit,
    onSubmit: () -> Unit,
    brandColor: Color
) {
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    Column(verticalArrangement = Arrangement.spacedBy(11.dp)) {
        Column {
            Text("Name", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500, modifier = Modifier.padding(bottom = 2.dp))
            OutlinedTextField(
                value = name,
                onValueChange = onNameChange,
                placeholder = { Text("e.g. Alex Morgan", fontSize = 12.sp, color = Slate300) },
                modifier = Modifier.fillMaxWidth().testTag("student_reg_name"),
                singleLine = true,
                shape = RoundedCornerShape(4.dp),
                colors = outlinedFieldColors(brandColor)
            )
        }

        Column {
            Text("Enrollment No.", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500, modifier = Modifier.padding(bottom = 2.dp))
            OutlinedTextField(
                value = enrollment,
                onValueChange = onEnrollmentChange,
                placeholder = { Text("e.g. 2024-BTECH-CS-042", fontSize = 12.sp, color = Slate300) },
                modifier = Modifier.fillMaxWidth().testTag("student_reg_enrollment"),
                singleLine = true,
                shape = RoundedCornerShape(4.dp),
                colors = outlinedFieldColors(brandColor)
            )
        }

        Column {
            Text("Email", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500, modifier = Modifier.padding(bottom = 2.dp))
            OutlinedTextField(
                value = email,
                onValueChange = onEmailChange,
                placeholder = { Text("e.g. alex.morgan@apex.edu", fontSize = 12.sp, color = Slate300) },
                modifier = Modifier.fillMaxWidth().testTag("student_reg_email"),
                singleLine = true,
                shape = RoundedCornerShape(4.dp),
                colors = outlinedFieldColors(brandColor)
            )
        }

        Column {
            Text("Course", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500, modifier = Modifier.padding(bottom = 2.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable { onCourseChange("UG") }
                ) {
                    RadioButton(
                        selected = courseLevel == "UG",
                        onClick = { onCourseChange("UG") },
                        colors = RadioButtonDefaults.colors(selectedColor = brandColor),
                        modifier = Modifier.size(32.dp).testTag("radio_ug")
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("UG", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Slate700)
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable { onCourseChange("PG") }
                ) {
                    RadioButton(
                        selected = courseLevel == "PG",
                        onClick = { onCourseChange("PG") },
                        colors = RadioButtonDefaults.colors(selectedColor = brandColor),
                        modifier = Modifier.size(32.dp).testTag("radio_pg")
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("PG", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Slate700)
                }
            }
        }

        Column {
            Text("Password", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500, modifier = Modifier.padding(bottom = 2.dp))
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                placeholder = { Text("Create password", fontSize = 12.sp, color = Slate400) },
                modifier = Modifier.fillMaxWidth().testTag("student_reg_password"),
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                shape = RoundedCornerShape(4.dp),
                colors = outlinedFieldColors(brandColor)
            )
        }

        Column {
            Text("Confirm password", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500, modifier = Modifier.padding(bottom = 2.dp))
            OutlinedTextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                placeholder = { Text("Confirm password", fontSize = 12.sp, color = Slate400) },
                modifier = Modifier.fillMaxWidth().testTag("student_reg_confirm_password"),
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                shape = RoundedCornerShape(4.dp),
                colors = outlinedFieldColors(brandColor)
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Button(
            onClick = onSubmit,
            modifier = Modifier
                .fillMaxWidth()
                .height(46.dp)
                .testTag("student_register_submit"),
            shape = RoundedCornerShape(4.dp),
            colors = ButtonDefaults.buttonColors(containerColor = brandColor)
        ) {
            Text(
                text = "REGISTER",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 1.sp,
                color = Color.White
            )
        }
    }
}

@Composable
private fun TeacherRegisterForm(
    name: String,
    facultyId: String,
    email: String,
    department: String,
    onNameChange: (String) -> Unit,
    onFacultyIdChange: (String) -> Unit,
    onEmailChange: (String) -> Unit,
    onDepartmentChange: (String) -> Unit,
    onSubmit: () -> Unit,
    brandColor: Color
) {
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var deptExpanded by remember { mutableStateOf(false) }

    val departments = listOf(
        "Computer Science",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Information Technology",
        "Mathematics"
    )

    Column(verticalArrangement = Arrangement.spacedBy(11.dp)) {
        Column {
            Text("Faculty Name", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500, modifier = Modifier.padding(bottom = 2.dp))
            OutlinedTextField(
                value = name,
                onValueChange = onNameChange,
                placeholder = { Text("Full Name", fontSize = 12.sp, color = Slate400) },
                modifier = Modifier.fillMaxWidth().testTag("teacher_reg_name"),
                singleLine = true,
                shape = RoundedCornerShape(6.dp),
                colors = outlinedFieldColors(brandColor)
            )
        }

        Column {
            Text("Faculty ID", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500, modifier = Modifier.padding(bottom = 2.dp))
            OutlinedTextField(
                value = facultyId,
                onValueChange = onFacultyIdChange,
                placeholder = { Text("e.g. FAC-CS-8924", fontSize = 12.sp, color = Slate400) },
                modifier = Modifier.fillMaxWidth().testTag("teacher_reg_faculty_id"),
                singleLine = true,
                shape = RoundedCornerShape(6.dp),
                colors = outlinedFieldColors(brandColor)
            )
        }

        Column {
            Text("Email", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500, modifier = Modifier.padding(bottom = 2.dp))
            OutlinedTextField(
                value = email,
                onValueChange = onEmailChange,
                placeholder = { Text("name@university.edu", fontSize = 12.sp, color = Slate400) },
                modifier = Modifier.fillMaxWidth().testTag("teacher_reg_email"),
                singleLine = true,
                shape = RoundedCornerShape(6.dp),
                colors = outlinedFieldColors(brandColor)
            )
        }

        Column {
            Text("Department", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500, modifier = Modifier.padding(bottom = 2.dp))
            Box(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = department,
                    onValueChange = {},
                    readOnly = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { deptExpanded = true }
                        .testTag("teacher_reg_dept_dropdown"),
                    trailingIcon = {
                        IconButton(onClick = { deptExpanded = !deptExpanded }) {
                            Icon(Icons.Default.ArrowDropDown, contentDescription = "Select Department")
                        }
                    },
                    shape = RoundedCornerShape(6.dp),
                    colors = outlinedFieldColors(brandColor)
                )

                DropdownMenu(
                    expanded = deptExpanded,
                    onDismissRequest = { deptExpanded = false }
                ) {
                    departments.forEach { dept ->
                        DropdownMenuItem(
                            text = { Text(dept, fontSize = 12.sp) },
                            onClick = {
                                onDepartmentChange(dept)
                                deptExpanded = false
                            }
                        )
                    }
                }
            }
        }

        Column {
            Text("Password", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500, modifier = Modifier.padding(bottom = 2.dp))
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                placeholder = { Text("Create password", fontSize = 12.sp, color = Slate400) },
                modifier = Modifier.fillMaxWidth().testTag("teacher_reg_password"),
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                shape = RoundedCornerShape(6.dp),
                colors = outlinedFieldColors(brandColor)
            )
        }

        Column {
            Text("Confirm password", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500, modifier = Modifier.padding(bottom = 2.dp))
            OutlinedTextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                placeholder = { Text("Confirm password", fontSize = 12.sp, color = Slate400) },
                modifier = Modifier.fillMaxWidth().testTag("teacher_reg_confirm_password"),
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                shape = RoundedCornerShape(6.dp),
                colors = outlinedFieldColors(brandColor)
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Button(
            onClick = onSubmit,
            modifier = Modifier
                .fillMaxWidth()
                .height(46.dp)
                .testTag("teacher_register_submit"),
            shape = RoundedCornerShape(6.dp),
            colors = ButtonDefaults.buttonColors(containerColor = brandColor)
        ) {
            Text(
                text = "Register",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = Color.White
            )
        }
    }
}

@Composable
private fun outlinedFieldColors(focusColor: Color) = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = focusColor,
    unfocusedBorderColor = Slate200,
    focusedContainerColor = Color.White,
    unfocusedContainerColor = Color.White,
    focusedTextColor = Slate900,
    unfocusedTextColor = Slate800
)
