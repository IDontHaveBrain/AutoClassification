package cc.nobrain.dev.userserver.common.config;

import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean(name="modelMapper")
    public org.modelmapper.ModelMapper modelMapper() {
        org.modelmapper.ModelMapper modelMapper = new org.modelmapper.ModelMapper();
        modelMapper.getConfiguration()
                .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
                .setMethodAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
                .setFieldMatchingEnabled(true)
                .setMatchingStrategy(MatchingStrategies.STRICT)
                .setSkipNullEnabled(true)
//                .setPreferNestedProperties(false) // 순환참조 무시 옵션.
        ;

        return modelMapper;
    }

//    @Bean(name="flatMapper")
//    public org.modelmapper.ModelMapper flatMapper() {
//        org.modelmapper.ModelMapper modelMapper = new org.modelmapper.ModelMapper();
//        modelMapper.getConfiguration()
//                .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
//                .setMethodAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
//                .setFieldMatchingEnabled(true)
//                .setMatchingStrategy(MatchingStrategies.LOOSE)
//                .setSkipNullEnabled(true)
////                .setPreferNestedProperties(false) // 순환참조 무시 옵션.
//        ;
//
//        return modelMapper;
//    }


}
