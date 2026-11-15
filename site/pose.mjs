import {FilesetResolver, PoseLandmarker} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs";
import {footAngle} from "./analysis.mjs";

const runtime = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm";
const asset = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task";

export async function openPose() {
  const files = await FilesetResolver.forVisionTasks(runtime);
  return PoseLandmarker.createFromOptions(files, {
    baseOptions: {modelAssetPath:asset,delegate:"CPU"}, runningMode:"VIDEO", numPoses:1,
    minPoseDetectionConfidence:0.55,minPosePresenceConfidence:0.55,minTrackingConfidence:0.55
  });
}

export function measure(detector, video, time, side) {
  const result = detector.detectForVideo(video, Math.round(time*1000));
  return footAngle(result.landmarks[0],side,video.videoWidth,video.videoHeight);
}
