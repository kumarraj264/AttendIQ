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
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.TableChart
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
import com.example.data.StudentAttendanceRecord
import com.example.ui.theme.EmeraldCheck
import com.example.ui.theme.Slate100
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate700
import com.example.ui.theme.Slate800
import com.example.ui.theme.Slate900
import com.example.ui.theme.SuccessGreenLight
import com.example.ui.theme.TeacherOrange

@Composable
fun ExportCsvDialog(
    records: List<StudentAttendanceRecord>,
    onDismiss: () -> Unit,
    onDownloadAction: () -> Unit,
    modifier: Modifier = Modifier
) {
    val clipboardManager: ClipboardManager = LocalClipboardManager.current
    val csvHeader = "S.No,Student Name,Department,Attendance Status,Verification Mode,Timestamp"
    val csvBody = records.joinToString("\n") {
        "${it.sNo},${it.studentName},${it.dept},${if (it.isPresent) "PRESENT" else "ABSENT"},Ultrasonic+BLE,10:18 AM"
    }
    val fullCsvText = "$csvHeader\n$csvBody"

    AlertDialog(
        onDismissRequest = onDismiss,
        modifier = modifier.testTag("export_csv_dialog"),
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
                            .background(Color(0xFFFEF3C7)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.TableChart,
                            contentDescription = null,
                            tint = TeacherOrange,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Text(
                        text = "Export Attendance Sheet",
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
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("CS401: Database Management Systems", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate800)
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(SuccessGreenLight)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text("${records.count { it.isPresent }} / ${records.size} Verified", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EmeraldCheck)
                    }
                }

                HorizontalDivider(color = Slate100, thickness = 1.dp)

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(130.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFF0F172A))
                        .padding(10.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(
                        text = fullCsvText,
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        color = Color(0xFF93C5FD),
                        lineHeight = 14.sp
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Filename: CS401_Attendance.csv", fontSize = 10.5.sp, color = Slate500)
                    OutlinedButton(
                        onClick = {
                            clipboardManager.setText(AnnotatedString(fullCsvText))
                        },
                        modifier = Modifier.height(30.dp),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(Icons.Default.ContentCopy, contentDescription = null, tint = Slate600, modifier = Modifier.size(12.dp))
                            Text("Copy CSV", fontSize = 10.sp, color = Slate700)
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onDownloadAction,
                colors = ButtonDefaults.buttonColors(containerColor = TeacherOrange),
                shape = RoundedCornerShape(8.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(Icons.Default.Download, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                    Text("Download .CSV", fontSize = 12.sp, color = Color.White)
                }
            }
        },
        dismissButton = {
            OutlinedButton(
                onClick = onDismiss,
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Cancel", fontSize = 12.sp, color = Slate700)
            }
        }
    )
}
