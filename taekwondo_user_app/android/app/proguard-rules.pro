# R8/ProGuard rules for Taekwondo User App
# Enables full code obfuscation and resource shrinking for Google Play Console compliance.

# Obfuscate classes and optimize packages
-repackageclasses ''
-allowaccessmodification

# Keep essential stacktrace attributes for bug reporting and Play Console crash mapping
-keepattributes SourceFile,LineNumberTable,Signature,InnerClasses,EnclosingMethod,*Annotation*

# Keep Flutter engine components intact to prevent application crashes
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.embedding.** { *; }
-keep class io.flutter.plugins.** { *; }

# Keep Play Core classes & suppress warnings for missing dependencies
-dontwarn com.google.android.play.core.**
-keep class com.google.android.play.core.** { *; }
-keep interface com.google.android.play.core.** { *; }

# Firebase & Google Services
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Plugins: Geolocator, Local Notifications, Secure Storage
-dontwarn com.baseflow.**
-dontwarn com.dexterous.flutterlocalnotifications.**
-dontwarn com.it_nomads.fluttersecurestorage.**

# Kotlin
-dontnote kotlin.**
-dontwarn kotlin.**
-keepclassmembers class * {
    @androidx.annotation.Keep <methods>;
    @androidx.annotation.Keep <fields>;
}

# Desugar Library
-dontwarn java.lang.invoke.**

