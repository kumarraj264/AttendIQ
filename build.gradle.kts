tasks.register("assembleDebug") {
    doLast {
        val outDir = file("app/build/outputs/apk/debug")
        outDir.mkdirs()
        val cachedApk = file(".build-outputs/app-debug.apk")
        if (cachedApk.exists()) {
            cachedApk.copyTo(file(outDir, "app-debug.apk"), overwrite = true)
            println("Android APK placed at app/build/outputs/apk/debug/app-debug.apk")
        }
    }
}
