package com.triplink.mobile.ui.utils

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

data class WindowSize(
    val width: WindowType,
    val height: WindowType
)

enum class WindowType {
    Compact, Medium, Expanded
}

val LocalWindowSize = compositionLocalOf<WindowSize> {
    error("No WindowSize provided")
}

@Composable
fun rememberWindowSize(): WindowSize {
    val configuration = LocalConfiguration.current
    val screenWidth = configuration.screenWidthDp.dp
    val screenHeight = configuration.screenHeightDp.dp
    
    val widthType = when {
        screenWidth < 600.dp -> WindowType.Compact
        screenWidth < 840.dp -> WindowType.Medium
        else -> WindowType.Expanded
    }
    
    val heightType = when {
        screenHeight < 480.dp -> WindowType.Compact
        screenHeight < 900.dp -> WindowType.Medium
        else -> WindowType.Expanded
    }
    
    return remember(screenWidth, screenHeight) {
        WindowSize(widthType, heightType)
    }
}

// Helper functions for responsive values
fun cardWidth(windowSize: WindowSize): Dp = when (windowSize.width) {
    WindowType.Compact -> 320.dp
    WindowType.Medium -> 280.dp
    WindowType.Expanded -> 350.dp
}

fun columns(windowSize: WindowSize): Int = when (windowSize.width) {
    WindowType.Compact -> 1
    WindowType.Medium -> 2
    WindowType.Expanded -> 3
}

fun heroHeight(windowSize: WindowSize): Dp = when (windowSize.height) {
    WindowType.Compact -> 400.dp
    WindowType.Medium -> 500.dp
    WindowType.Expanded -> 600.dp
}

fun horizontalPadding(windowSize: WindowSize): Dp = when (windowSize.width) {
    WindowType.Compact -> 16.dp
    WindowType.Medium -> 24.dp
    WindowType.Expanded -> 32.dp
}

fun fontSizeScale(windowSize: WindowSize): Float = when (windowSize.width) {
    WindowType.Compact -> 0.9f
    WindowType.Medium -> 1.0f
    WindowType.Expanded -> 1.1f
}

