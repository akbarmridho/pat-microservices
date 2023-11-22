FROM gradle:7-jdk17 AS build
WORKDIR /home/gradle/src
COPY --chown=gradle:gradle . /home/gradle/src
RUN --mount=type=cache,target=/root/.gradle gradle buildFatJar --no-daemon

FROM openjdk:17
EXPOSE 8000
RUN mkdir /app
COPY --from=build /home/gradle/src/build/libs/*.jar /app/ticketing.jar
ENTRYPOINT ["java","-jar","/app/ticketing.jar"]