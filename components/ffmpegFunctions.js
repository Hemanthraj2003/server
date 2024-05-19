import ffmpeg from "fluent-ffmpeg";
import path from "path";

export function extractAllAudioAndSubtitles(videoPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      const streams = metadata.streams;
      const audioStreams = streams.filter(
        (stream) => stream.codec_type === "audio"
      );
      const subtitleStreams = streams.filter(
        (stream) => stream.codec_type === "subtitle"
      );

      const tasks = [];

      /// Extracting audio streams
      audioStreams.forEach((_audioStream, index) => {
        // Sanitize the file name
        const outputAudioPath = path.join(outputPath, `audio_${index + 1}.aac`);
        tasks.push(
          new Promise((res, rej) => {
            ffmpeg(videoPath)
              .output(outputAudioPath)
              .audioCodec("aac") // Use AAC codec
              .audioBitrate("32k") // Lower bitrate for smaller file size
              .audioChannels(2) // Set number of audio channels
              .outputOptions([`-map 0:a:${index}`]) // Include only audio streams
              .on("progress", (progress) => {
                console.log(`Extracting audio ${index}: ${progress.percent}%`);
              })
              .on("error", rej)
              .on("end", () => res(outputAudioPath))
              .run();
          })
        );
      });

      // Extracting subtitle streams
      subtitleStreams.forEach((subtitleStream, index) => {
        const outputSubtitlePath = path.join(
          outputPath,
          `subtitle_${index}.srt`
        );
        tasks.push(
          new Promise((res, rej) => {
            ffmpeg(videoPath)
              .output(outputSubtitlePath)
              .outputOptions(`-map 0:s:${index}`)
              .on("progress", (progress) => {
                console.log(
                  `Extracting subtitle ${index}: ${progress.percent}%`
                );
              })
              .on("error", rej)
              .on("end", () => res(outputSubtitlePath))
              .run();
          })
        );
      });

      // Extracting video stream without audio using copy codec
      const outputVideoPath = path.join(outputPath, "video_without_audio.mp4");
      tasks.push(
        new Promise((res, rej) => {
          ffmpeg(videoPath)
            .output(outputVideoPath)
            .outputOptions("-c copy") // Copy codec for faster processing
            .noAudio() // Remove audio
            .on("progress", (progress) => {
              console.log(
                `Extracting video without audio: ${progress.percent}%`
              );
            })
            .on("error", rej)
            .on("end", () => res(outputVideoPath)) // Resolve with video path
            .run();
        })
      );

      // Handling all promises
      Promise.all(tasks)
        .then((results) => {
          const audioResults = results.slice(0, audioStreams.length);
          const subtitleResults = results.slice(
            audioStreams.length,
            audioStreams.length + subtitleStreams.length
          );
          const videoResult = results[results.length - 1]; // Last result is video path
          resolve({
            audio: audioResults,
            subtitles: subtitleResults,
            video: videoResult, // Assign video path to video key
          });
        })
        .catch(reject);
    });
  });
}
