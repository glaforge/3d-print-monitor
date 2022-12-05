Monitor your 3D prints with Cloud Run, WebSockets, and WebRTC
===

Slides of the accompanying [presentation](https://speakerdeck.com/glaforge/reuse-old-smartphones-to-monitor-3d-prints-with-webrtc-websockets-and-serverless).

## Commands

```shell
./gradlew docker
./gradlew assemble
./gradlew jib
./gradlew jibDockerBuild
gcloud builds submit --tag gcr.io/smartphone-broadcast/mn-broadcast build/docker/main/
gcloud beta run deploy mn-broadcast --image gcr.io/smartphone-broadcast/mn-broadcast:latest --allow-unauthenticated --session-affinity --cpu-boost
```

---
The code is licensed under the Apache 2 [license](LICENSE).

---
This is not an official Google product.
