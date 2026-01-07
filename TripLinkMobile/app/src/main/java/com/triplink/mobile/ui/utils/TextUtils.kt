package com.triplink.mobile.ui.utils

/**
 * Utility functions for safe text handling to prevent null crashes
 */
object TextUtils {
    /**
     * Safely converts a nullable string to a non-null string for Text components
     */
    fun safeText(text: String?): String {
        return text?.takeIf { it.isNotEmpty() } ?: ""
    }
    
    /**
     * Formats user name safely
     */
    fun formatUserName(firstName: String?, lastName: String?, email: String? = null): String {
        val first = firstName?.takeIf { it.isNotEmpty() }
        val last = lastName?.takeIf { it.isNotEmpty() }
        return when {
            first != null && last != null -> "$first $last"
            first != null -> first
            last != null -> last
            email != null -> email
            else -> "Anonymous"
        }
    }
    
    /**
     * Formats destination location safely
     */
    fun formatLocation(city: String?, country: String?): String {
        val cityStr = city?.takeIf { it.isNotEmpty() }
        val countryStr = country?.takeIf { it.isNotEmpty() }
        return when {
            cityStr != null && countryStr != null -> "$cityStr, $countryStr"
            cityStr != null -> cityStr
            countryStr != null -> countryStr
            else -> "Unknown Location"
        }
    }
    
    /**
     * Formats price safely
     */
    fun formatPrice(price: Double?): String {
        return if (price != null && price > 0) {
            "$${String.format("%.0f", price)}"
        } else {
            "Price on request"
        }
    }
    
    /**
     * Formats price range safely (Int version)
     */
    fun formatPriceRange(min: Int?, max: Int?): String {
        return when {
            min != null && max != null -> "$$min - $$max"
            min != null -> "$$min"
            max != null -> "$$max"
            else -> "Price on request"
        }
    }
    
    /**
     * Formats price range safely (Double version)
     */
    fun formatPriceRange(min: Double?, max: Double?): String {
        return when {
            min != null && max != null -> "$${min.toInt()} - $${max.toInt()}"
            min != null -> "$${min.toInt()}"
            max != null -> "$${max.toInt()}"
            else -> "Price on request"
        }
    }
}

