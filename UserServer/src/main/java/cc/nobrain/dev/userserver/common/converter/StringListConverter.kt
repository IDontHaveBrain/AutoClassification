package cc.nobrain.dev.userserver.common.converter

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter
class StringListConverter : AttributeConverter<List<String>, String> {

    private val separator = ","

    override fun convertToDatabaseColumn(stringList: List<String>?): String {
        return stringList?.joinToString(separator) ?: "";
    }

    override fun convertToEntityAttribute(string: String?): List<String> {
        return string?.split(separator) ?: mutableListOf();
    }
}