package com.example.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Backspace
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate800

@Composable
fun NumericKeypad(
    onDigitClick: (String) -> Unit,
    onClearClick: () -> Unit,
    onBackspaceClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val rows = listOf(
        listOf("1", "2", "3"),
        listOf("4", "5", "6"),
        listOf("7", "8", "9"),
        listOf("CLR", "0", "DEL")
    )

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        rows.forEach { row ->
            Row(
                modifier = Modifier.width(280.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                row.forEach { item ->
                    KeypadButton(
                        text = item,
                        onClick = {
                            when (item) {
                                "CLR" -> onClearClick()
                                "DEL" -> onBackspaceClick()
                                else -> onDigitClick(item)
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun KeypadButton(
    text: String,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .width(72.dp)
            .height(52.dp)
            .clip(CircleShape)
            .bounceClick(scaleDown = 0.88f) { onClick() }
            .testTag("keypad_btn_$text"),
        contentAlignment = Alignment.Center
    ) {
        when (text) {
            "CLR" -> {
                Text(
                    text = "CLR",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    color = Slate400
                )
            }
            "DEL" -> {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.Backspace,
                    contentDescription = "Backspace",
                    tint = Slate600,
                    modifier = Modifier.size(20.dp)
                )
            }
            else -> {
                Text(
                    text = text,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Medium,
                    color = Slate800
                )
            }
        }
    }
}
