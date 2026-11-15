# TendonTrack · Achilles Recovery Journal

TendonTrack is a computer vision prototype for reviewing a heel-raise exercise already prescribed by a clinician. Choose a short side-view video, select the foot closest to the camera, and see the estimated repetition count and a movement trace. Save a summary to compare with future sessions.

## Why I built TendonTrack

I ruptured my Achilles in June 2026, and it changed my life. I love playing basketball and played professionally, so being away from the game has been hard. During recovery, I realized how many people go through this injury, from athletes in all kinds of sports to people who have never played competitively.

I built TendonTrack to help someone else going through Achilles rehab see how their movement changes from one session to the next. I wanted to make it easier to see progress while following the exercise plan their clinician gave them.

## Try the app

**[Open TendonTrack](https://mykeil-tzul.github.io/tendontrack/)**

From the repository root, run:

```sh
python3 -m http.server 8000 --directory site
```

Open `http://localhost:8000` in Chrome or Edge and choose **Explore sample sessions** to see three synthetic examples. To analyze your own video, select a 3–30 second clip under 150 MB. Use level ground and a still side-view camera, keep one person's full body and heel visible, and start with the heel at rest. Follow the exercise plan your clinician already gave you.

The app shows complete estimated repetitions, median peak lift, frame coverage, and rep-to-rep spread when there are at least three detected peaks. Repeat the same camera setup for comparisons.

## How the computer vision works

1. The browser samples the video at 10 frames per second and runs Google's [MediaPipe Pose Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker).
2. When the selected ankle, heel, and foot landmarks are visible, it measures the heel-to-toe line's image-plane angle relative to the starting position.
3. A rep counter looks for a rise followed by a return, using separate rise and return thresholds and short smoothing. Long tracking gaps reset an incomplete repetition.
4. The journal plots median peak lift for each recorded session by foot. The table also includes rep count, usable frames, and the difference between the 25th and 75th percentile rep peaks.

The thresholds are prototype settings. Camera angle, occlusion, foot placement, and landmark errors can affect the measurements. These are image-plane angles. Clinical range of motion, tendon healing, and readiness to return to sport require clinical assessment. This project has not been clinically validated and does not prescribe exercises.

## Privacy and deployment

The app downloads a pinned MediaPipe browser runtime and pretrained model from jsDelivr and Google. Video analysis runs in the browser. The app has no upload endpoint, backend, analytics, or accounts. A video is held in memory until removed or the tab closes.

Saving is optional. The browser stores session dates and summary measurements in local storage. It does not store video, landmarks, or filenames. Local storage is accessible to people who share the browser profile. You can remove one session, clear them all, or export the selected foot's summaries as a CSV. Exported files are your responsibility.

I used a static browser app so the demo can run without a server holding health information. A patient-facing release would require clinical validation and appropriate privacy, access-control, and retention policies.

## Tests

With Node.js 22 installed:

```sh
node --test tests/*.test.mjs
```

The tests cover complete and incomplete reps, tracking gaps, landmark confidence, and camera mirroring. The demo uses synthetic motion and does not establish real-video accuracy.
