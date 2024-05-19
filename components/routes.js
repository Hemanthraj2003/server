import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { extractAllAudioAndSubtitles } from "./ffmpegFunctions.js";
// import { uploadFile } from "./upload.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }
    const filePath = file.path;
    const fileName = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );
    console.log(fileName);
    const outputPath = path.join("uploads/", fileName); // Define the output directory
    ensureDirectoryExists(outputPath);
    const extractionResult = await extractAllAudioAndSubtitles(
      filePath,
      outputPath
    );

    // Send response with extracted files details
    res.status(200).json({
      audio: extractionResult.audio,
      subtitles: extractionResult.subtitles,
      video: extractionResult.video,
    });

    // Upload file
    // const uploadDetails = await uploadFile(file, fileName);

    // Send response with uploaded file details
    // res.status(200).json({
    //   url: `https://f002.backblazeb2.com/file/${bucketName}/${fileName}`,
    //   fileId: uploadDetails.fileId,
    //   fileName: uploadDetails.fileName,
    // });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
});

export default router;
