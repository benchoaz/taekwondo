pluginManagement {
    val flutterSdkPath =
        run {
            val properties = java.util.Properties()
            val propertiesFile = file("local.properties")
            var sdkPath: String? = null
            if (propertiesFile.exists()) {
                propertiesFile.inputStream().use { properties.load(it) }
                sdkPath = properties.getProperty("flutter.sdk")
            }
            if (sdkPath == null) {
                sdkPath = System.getenv("FLUTTER_ROOT")
            }
            require(sdkPath != null) { "Flutter SDK path not found. Please set flutter.sdk in local.properties or FLUTTER_ROOT env variable." }
            sdkPath
        }

    includeBuild("$flutterSdkPath/packages/flutter_tools/gradle")

    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id("dev.flutter.flutter-plugin-loader") version "1.0.0"
    id("com.android.application") version "8.9.1" apply false
    // START: FlutterFire Configuration
    id("com.google.gms.google-services") version("4.4.4") apply false
    // END: FlutterFire Configuration
    id("org.jetbrains.kotlin.android") version "2.2.20" apply false
}

include(":app")
