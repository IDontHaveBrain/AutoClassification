package cc.nobrain.dev.userserver.common.config

import org.modelmapper.ModelMapper
import org.modelmapper.convention.MatchingStrategies
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class ModelMapperConfig {

    @Bean(name = ["modelMapper"])
    fun modelMapper(): ModelMapper {
        val modelMapper = ModelMapper()
        modelMapper.configuration
                .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
                .setMethodAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
                .setFieldMatchingEnabled(true)
                .setMatchingStrategy(MatchingStrategies.STRICT)
                .setSkipNullEnabled(true)
        // .setPreferNestedProperties(false) // 순환참조 무시 옵션.

        return modelMapper
    }

    // @Bean(name = ["flatMapper"])
    // fun flatMapper(): ModelMapper {
    //     val modelMapper = ModelMapper()
    //     modelMapper.configuration
    //         .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
    //         .setMethodAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
    //         .setFieldMatchingEnabled(true)
    //         .setMatchingStrategy(MatchingStrategies.LOOSE)
    //         .setSkipNullEnabled(true)
    //     // .setPreferNestedProperties(false) // 순환참조 무시 옵션.

    //     return modelMapper
    // }
}