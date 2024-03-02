package cc.nobrain.dev.userserver.common.utils

object FileUtil {
    @JvmStatic
    fun getExtension(fileName: String): String {
        return fileName.substring(fileName.lastIndexOf("."))
    }

    @JvmStatic
    fun getFileName(fileName: String): String {
        return fileName.substring(0, fileName.lastIndexOf("."))
    }
}