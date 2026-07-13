# R8/ProGuard rules for Taekwondo User App
# Secure release builds by obfuscating classes, fields, and helper methods.

-repackageclasses ''
-allowaccessmodification
-flattenpackagehierarchy ''

# Keep essential stacktrace attributes for bug reporting but remove debug info
-keepattributes SourceFile,LineNumberTable,Signature,InnerClasses,EnclosingMethod

# Obfuscate Kotlin internal helpers to prevent analysis of language features
-dontnote kotlin.**
-dontwarn kotlin.**

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
