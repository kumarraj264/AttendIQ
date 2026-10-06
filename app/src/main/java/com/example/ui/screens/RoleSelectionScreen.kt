package com.example.ui.screens

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.UnfoldMore
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.Role
import com.example.ui.theme.DarkNavy
import com.example.ui.theme.StudentSplit
import com.example.ui.theme.TeacherSplit
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@Composable
fun RoleSelectionScreen(
    onSelectRole: (Role) -> Unit,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val dragAnimatable = remember { Animatable(0f) }
    var isTriggered by remember { mutableStateOf(false) }

    val infiniteTransition = rememberInfiniteTransition(label = "ambientPulse")

    val arrowBounceY by infiniteTransition.animateFloat(
        initialValue = -4f,
        targetValue = 4f,
        animationSpec = infiniteRepeatable(
            animation = tween(700, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "arrowBounceY"
    )

    val badgeGlowScale by infiniteTransition.animateFloat(
        initialValue = 0.98f,
        targetValue = 1.025f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "badgeGlowScale"
    )

    val badgeBorderAlpha by infiniteTransition.animateFloat(
        initialValue = 0.2f,
        targetValue = 0.5f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "badgeBorderAlpha"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                var accumulatedDrag = 0f
                detectVerticalDragGestures(
                    onDragStart = {
                        accumulatedDrag = 0f
                    },
                    onDragEnd = {
                        if (isTriggered) return@detectVerticalDragGestures
                        val threshold = 70f
                        if (accumulatedDrag > threshold) {
                            isTriggered = true
                            coroutineScope.launch {
                                dragAnimatable.animateTo(
                                    targetValue = 1000f,
                                    animationSpec = tween(280, easing = FastOutSlowInEasing)
                                )
                                onSelectRole(Role.TEACHER)
                            }
                        } else if (accumulatedDrag < -threshold) {
                            isTriggered = true
                            coroutineScope.launch {
                                dragAnimatable.animateTo(
                                    targetValue = -1000f,
                                    animationSpec = tween(280, easing = FastOutSlowInEasing)
                                )
                                onSelectRole(Role.STUDENT)
                            }
                        } else {
                            coroutineScope.launch {
                                dragAnimatable.animateTo(
                                    targetValue = 0f,
                                    animationSpec = spring(
                                        dampingRatio = Spring.DampingRatioMediumBouncy,
                                        stiffness = Spring.StiffnessMedium
                                    )
                                )
                            }
                        }
                    },
                    onDragCancel = {
                        coroutineScope.launch {
                            dragAnimatable.animateTo(0f, spring(dampingRatio = Spring.DampingRatioMediumBouncy))
                        }
                    },
                    onVerticalDrag = { change, dragAmount ->
                        change.consume()
                        if (!isTriggered) {
                            accumulatedDrag += dragAmount
                            coroutineScope.launch {
                                dragAnimatable.snapTo(accumulatedDrag * 0.9f)
                            }
                        }
                    }
                )
            }
            .testTag("role_selection_screen")
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .offset { IntOffset(0, dragAnimatable.value.roundToInt()) }
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxSize()
                    .background(TeacherSplit)
                    .clickable {
                        if (!isTriggered) {
                            isTriggered = true
                            coroutineScope.launch {
                                dragAnimatable.animateTo(1000f, tween(260, easing = FastOutSlowInEasing))
                                onSelectRole(Role.TEACHER)
                            }
                        }
                    }
                    .testTag("select_teacher_card"),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "TEACHER",
                        color = Color.White,
                        fontSize = 34.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 4.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "SWIPE DOWN",
                        color = Color.White.copy(alpha = 0.95f),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 2.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = "Swipe Down",
                        tint = Color.White,
                        modifier = Modifier
                            .size(28.dp)
                            .offset(y = arrowBounceY.dp)
                    )
                }
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxSize()
                    .background(StudentSplit)
                    .clickable {
                        if (!isTriggered) {
                            isTriggered = true
                            coroutineScope.launch {
                                dragAnimatable.animateTo(-1000f, tween(260, easing = FastOutSlowInEasing))
                                onSelectRole(Role.STUDENT)
                            }
                        }
                    }
                    .testTag("select_student_card"),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowUp,
                        contentDescription = "Swipe Up",
                        tint = Color.White,
                        modifier = Modifier
                            .size(28.dp)
                            .offset(y = (-arrowBounceY).dp)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "SWIPE UP",
                        color = Color.White.copy(alpha = 0.95f),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 2.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "STUDENT",
                        color = Color.White,
                        fontSize = 34.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 4.sp
                    )
                }
            }
        }

        Box(
            modifier = Modifier
                .align(Alignment.Center)
                .scale(badgeGlowScale)
                .shadow(8.dp, RoundedCornerShape(24.dp), ambientColor = Color.Black.copy(alpha = 0.3f))
                .background(DarkNavy, RoundedCornerShape(24.dp))
                .border(1.5.dp, Color.White.copy(alpha = badgeBorderAlpha), RoundedCornerShape(24.dp))
                .padding(horizontal = 22.dp, vertical = 9.dp)
                .testTag("role_indicator_badge"),
            contentAlignment = Alignment.Center
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(7.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.UnfoldMore,
                    contentDescription = null,
                    tint = Color.White.copy(alpha = 0.9f),
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = "SELECT ROLE",
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 2.sp
                )
            }
        }
    }
}
