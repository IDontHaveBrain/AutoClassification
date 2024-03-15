package cc.nobrain.dev.userserver.common.utils

import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.nio.file.Paths
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream

object FileUtil {
    @JvmStatic
    fun getExtension(fileName: String): String {
        return fileName.substring(fileName.lastIndexOf("."))
    }

    @JvmStatic
    fun getFileName(fileName: String): String {
        return fileName.substring(0, fileName.lastIndexOf("."))
    }

    fun unzipFile(zipFile: InputStream, destDir: String) {
        ZipInputStream(zipFile).use { zis ->
            var zipEntry = zis.nextEntry
            while (zipEntry != null) {
                val newFile = newFile(destDir, zipEntry)
                FileOutputStream(newFile).use { fos ->
                    val buffer = ByteArray(1024)
                    var len: Int
                    while (zis.read(buffer).also { len = it } > 0) {
                        fos.write(buffer, 0, len)
                    }
                }
                zipEntry = zis.nextEntry
            }
            zis.closeEntry()
        }
    }

    private fun newFile(destinationDir: String, zipEntry: ZipEntry): File {
        val destFile = File(destinationDir, zipEntry.name)

        val destDirPath = Paths.get(destinationDir)
        val destFilePath = Paths.get(destFile.toURI())

        if (!destFilePath.startsWith(destDirPath)) {
            throw IOException("Entry is outside of the target dir: " + zipEntry.name)
        }

        return destFile
    }
}