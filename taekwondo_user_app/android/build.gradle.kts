allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
    afterEvaluate {
        if (project.hasProperty("android")) {
            val androidExt = project.property("android")
            try {
                androidExt?.javaClass?.getMethod("setNdkPath", String::class.java)?.invoke(androidExt, "/home/beni/development/ndk/27.0.12077973")
                androidExt?.javaClass?.getMethod("setNdkVersion", String::class.java)?.invoke(androidExt, "27.0.12077973")
            } catch (e: Exception) {
                // Ignore if not applicable
            }
        }
    }
}
subprojects {
    project.evaluationDependsOn(":app")
}

subprojects {
    val configureNamespace = {
        if (project.hasProperty("android")) {
            val android = project.property("android") as? com.android.build.gradle.BaseExtension
            if (android != null && android.namespace == null) {
                android.namespace = "com.example." + project.name.replace("-", "_").replace(".", "_")
            }
        }
    }
    if (project.state.executed) {
        configureNamespace()
    } else {
        project.afterEvaluate { configureNamespace() }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
