package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ClipboardManager
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.DarkNavy
import com.example.ui.theme.Slate100
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate700
import com.example.ui.theme.Slate800
import com.example.ui.theme.Slate900
import com.example.ui.theme.StudentTeal

@Composable
fun MongoDbSetupDialog(
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val clipboardManager: ClipboardManager = LocalClipboardManager.current

    val mongoSchemaCode = """
// 1. Users Collection
{
  "_id": ObjectId("..."),
  "role": "student" | "teacher",
  "name": "Alex Morgan",
  "enrollmentNo": "2024-BTECH-CS-042",
  "email": "alex.morgan@ggu.ac.in",
  "department": "CSIT",
  "degree": "UG",
  "semester": 4,
  "enrolledCourseIds": ["CS401", "CS405", "SEC201", "AEC101", "VAC102"]
}

// 2. Courses Collection (NEP 2020)
{
  "_id": "CS401",
  "courseName": "Database Management Systems",
  "offeringDept": "CSIT",
  "courseType": "Major",
  "credits": 4,
  "teacherId": "FAC-CS-8924",
  "classroom": "Room FB"
}

// 3. AttendanceSessions (Live 3-4 min Token)
{
  "_id": ObjectId("..."),
  "courseId": "CS401",
  "teacherId": "FAC-CS-8924",
  "sessionPin": "29",
  "acousticFrequencyKHz": 18.5,
  "campusGeofence": { "lat": 22.1293, "lng": 82.1360, "radius": 1500 },
  "startTime": ISODate("2026-10-01T10:15:00Z"),
  "expiryTime": ISODate("2026-10-01T10:19:00Z"),
  "isActive": true
}

// 4. AttendanceRecords
{
  "sessionId": ObjectId("..."),
  "studentId": "2024-BTECH-CS-042",
  "studentName": "Alex Morgan",
  "department": "CSIT",
  "status": "PRESENT",
  "verifiedVia": ["GGU_GPS_GEOFENCE", "ULTRASONIC_18.5KHZ", "SESSION_PIN"],
  "timestamp": ISODate("2026-10-01T10:17:22Z")
}
""".trimIndent()

    AlertDialog(
        onDismissRequest = onDismiss,
        modifier = modifier.testTag("mongodb_setup_dialog"),
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFDCFCE7)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Storage,
                            contentDescription = null,
                            tint = Color(0xFF15803D),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Text(
                        text = "MongoDB Schema & Architecture",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                }
                IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate500, modifier = Modifier.size(18.dp))
                }
            }
        },
        text = {
            Column(
                modifier = Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "Aapke plan ke liye MongoDB me 4 collections banengi:",
                    fontSize = 12.sp,
                    color = Slate700,
                    fontWeight = FontWeight.Medium
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(DarkNavy)
                        .padding(10.dp)
                ) {
                    Text(
                        text = mongoSchemaCode,
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        color = Color(0xFF86EFAC),
                        lineHeight = 14.sp
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Connection URI: mongodb+srv://cluster.mongodb.net", fontSize = 10.sp, color = Slate500)
                    OutlinedButton(
                        onClick = { clipboardManager.setText(AnnotatedString(mongoSchemaCode)) },
                        shape = RoundedCornerShape(6.dp),
                        modifier = Modifier.height(28.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(Icons.Default.ContentCopy, contentDescription = null, tint = Slate700, modifier = Modifier.size(12.dp))
                            Text("Copy Schema", fontSize = 10.sp, color = Slate800)
                        }
                    }
                }

                HorizontalDivider(color = Slate100, thickness = 1.dp)

                Text(
                    text = "Backend Requirements (Node.js/FastAPI + MongoDB):\n• MongoDB Atlas Free Cluster (M0 Sandbox)\n• Socket.io ya Firebase FCM: Teacher ke 'Collect Attendance' click karte hi enrolled students ko targeted event push karne ke liye.\n• Geofence index: 2dsphere index on coordinates.",
                    fontSize = 10.5.sp,
                    lineHeight = 15.sp,
                    color = Slate600
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = StudentTeal)
            ) {
                Text("Got It!", fontSize = 12.sp, color = Color.White)
            }
        }
    )
}
