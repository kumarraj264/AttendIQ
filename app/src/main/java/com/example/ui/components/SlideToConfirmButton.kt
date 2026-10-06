package com.example.ui.components

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
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.draggable
import androidx.compose.foundation.gestures.rememberDraggableState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@Composable
fun SlideToConfirmButton(
    title: String,
    brandColor: Color,
    onConfirmed: () -> Unit,
    modifier: Modifier = Modifier,
    isConfirmed: Boolean = false,
    enabled: Boolean = true
) {
    val coroutineScope = rememberCoroutineScope()
    val dragOffset = remember { Animatable(0f) }
    var confirmedState by remember { mutableStateOf(false) }
    val haptic = LocalHapticFeedback.current
    var lastTickStep by remember { mutableStateOf(0) }

    val infiniteTransition = rememberInfiniteTransition(label = "shimmer")
    val chevronAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(750, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "chevronAlpha"
    )

    BoxWithConstraints(
        modifier = modifier
            .fillMaxWidth()
            .height(52.dp)
            .clip(RoundedCornerShape(26.dp))
            .background(Color(0xFFF1F5F9))
            .border(1.5.dp, Color(0xFFE2E8F0), RoundedCornerShape(26.dp))
            .testTag("slide_to_confirm_container")
    ) {
        val density = LocalDensity.current
        val thumbSizePx = with(density) { 46.dp.toPx() }
        val maxDragPx = (constraints.maxWidth.toFloat() - thumbSizePx - with(density) { 6.dp.toPx() }).coerceAtLeast(0f)

        val currentFraction = if (maxDragPx > 0f) (dragOffset.value / maxDragPx).coerceIn(0f, 1f) else 0f

        Box(
            modifier = Modifier
                .fillMaxHeight()
                .width(with(density) { (dragOffset.value + thumbSizePx).toDp() })
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(brandColor.copy(alpha = 0.25f), brandColor.copy(alpha = 0.55f))
                    )
                )
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight()
                .padding(start = 54.dp, end = 20.dp),
            contentAlignment = Alignment.Center
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = if (confirmedState || isConfirmed) "CONFIRMED ✓" else title,
                    color = if (confirmedState || isConfirmed) brandColor else Color(0xFF64748B),
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                if (!confirmedState && !isConfirmed) {
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "»",
                        color = brandColor.copy(alpha = chevronAlpha),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }
        }

        Box(
            modifier = Modifier
                .offset { IntOffset(dragOffset.value.roundToInt() + with(density) { 3.dp.toPx() }.roundToInt(), with(density) { 3.dp.toPx() }.roundToInt()) }
                .size(46.dp)
                .shadow(4.dp, CircleShape)
                .clip(CircleShape)
                .background(if (confirmedState || isConfirmed) Color(0xFF10B981) else brandColor)
                .draggable(
                    orientation = Orientation.Horizontal,
                    enabled = enabled && !confirmedState && !isConfirmed,
                    onDragStopped = {
                        val current = dragOffset.value
                        if (current >= maxDragPx * 0.75f) {
                            coroutineScope.launch {
                                dragOffset.animateTo(
                                    targetValue = maxDragPx,
                                    animationSpec = spring(stiffness = Spring.StiffnessMediumLow)
                                )
                                confirmedState = true
                                try {
                                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                } catch (e: Exception) {}
                                onConfirmed()
                            }
                        } else {
                            coroutineScope.launch {
                                dragOffset.animateTo(
                                    targetValue = 0f,
                                    animationSpec = spring(
                                        dampingRatio = Spring.DampingRatioMediumBouncy,
                                        stiffness = Spring.StiffnessMedium
                                    )
                                )
                            }
                        }
                    },
                    state = rememberDraggableState { delta ->
                        if (!confirmedState && !isConfirmed) {
                            coroutineScope.launch {
                                val target = (dragOffset.value + delta).coerceIn(0f, maxDragPx)
                                dragOffset.snapTo(target)

                                if (maxDragPx > 0f) {
                                    val ratio = target / maxDragPx
                                    val currentTickStep = (ratio * 8).toInt()
                                    if (currentTickStep != lastTickStep) {
                                        try {
                                            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                        } catch (e: Exception) {}
                                        lastTickStep = currentTickStep
                                    }
                                }
                            }
                        }
                    }
                )
                .testTag("slide_thumb"),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = if (confirmedState || isConfirmed) Icons.Default.Check else Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = "Slide to confirm",
                tint = Color.White,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
