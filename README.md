# Commands

```shell
./gradlew docker
./gradlew assemble
./gradlew jib
./gradlew jibDockerBuild
gcloud builds submit --tag gcr.io/smartphone-broadcast/mn-broadcast build/docker/main/
gcloud beta run deploy mn-broadcast --image gcr.io/smartphone-broadcast/mn-broadcast:latest --allow-unauthenticated --session-affinity --cpu-boost
```