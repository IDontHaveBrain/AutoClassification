import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "3.1.9"
    id("io.spring.dependency-management") version "1.1.4"
    id("org.asciidoctor.jvm.convert") version "3.3.2"

    kotlin("jvm") version "1.9.22"
    kotlin("plugin.spring") version "1.9.22"
    kotlin("plugin.jpa") version "1.9.22"
    kotlin("plugin.allopen") version "1.9.22"
    kotlin("kapt") version "1.9.22"
    idea
}

group = "cc.nobrain.dev"
version = "0.0.1-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

allOpen {
    // Spring Boot 3.0.0
    annotation("jakarta.persistence.Entity")
    annotation("jakarta.persistence.MappedSuperclass")
    annotation("jakarta.persistence.Embeddable")
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
//    implementation "org.springframework.boot:spring-boot-starter-data-r2dbc"
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("io.projectreactor.kotlin:reactor-kotlin-extensions")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")

    compileOnly("org.projectlombok:lombok")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    runtimeOnly("org.postgresql:postgresql")
//    runtimeOnly "org.postgresql:r2dbc-postgresql"
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
    annotationProcessor("org.projectlombok:lombok")
    annotationProcessor("org.hibernate.orm:hibernate-jpamodelgen")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("io.projectreactor:reactor-test")
    testImplementation("org.springframework.restdocs:spring-restdocs-mockmvc")
    testImplementation("org.springframework.security:spring-security-test")
    testCompileOnly("org.projectlombok:lombok")
    testAnnotationProcessor("org.projectlombok:lombok")

    implementation("org.springframework.boot:spring-boot-starter-oauth2-authorization-server")

    // querydsl
    implementation("com.querydsl:querydsl-jpa:5.0.0:jakarta")
    annotationProcessor("com.querydsl:querydsl-apt:5.0.0:jakarta")
//    kapt("com.querydsl:querydsl-apt:5.0.0:jakarta")
//    kapt ("jakarta.annotation:jakarta.annotation-api")
//    kapt ("jakarta.persistence:jakarta.persistence-api")

    // mapping library
    implementation("org.modelmapper:modelmapper:3.2.0")

    // encrypt
    implementation("com.github.ulisesbocchio:jasypt-spring-boot-starter:3.0.5")

}

val snippetsDir = file("build/generated-snippets")
tasks.withType<Test> {
    outputs.dir(snippetsDir)
    useJUnitPlatform()
}

tasks.named("asciidoctor") {
    inputs.dir(snippetsDir)
    dependsOn("test")
}

tasks.register("buildWithoutTest") {
    dependsOn("clean", "build")
    tasks.named<Test>("test").configure {
        isEnabled = false
    }
}

tasks.bootBuildImage {
    builder.set("paketobuildpacks/builder-jammy-base:latest")
}

// 어노테이션 프로세서 생성파일 위치 지정
val generated = "src/main/generated"
sourceSets {
    main {
        kotlin.srcDirs += file(generated)
        java.srcDirs += file(generated)
    }
}

tasks.withType<JavaCompile> {
//    dependsOn("clean")
    options.generatedSourceOutputDirectory.set(file(generated))
}

tasks.named<Delete>("clean") {
    doLast {
        file(generated).deleteRecursively()
        file("out").deleteRecursively()
    }
}

kapt {
    generateStubs = true
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
//        freeCompilerArgs += "-Xjsr305=strict"
        jvmTarget = "17"
    }
    destinationDirectory.set(file(generated))
}