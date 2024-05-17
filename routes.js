// routes.js
import express from "express";
import multer from "multer";
import { uploadFile } from "./upload.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const fileName = file.originalname;

    // Upload file
    const uploadDetails = await uploadFile(file, fileName);

    // Send response with uploaded file details
    res.status(200).json({
      url: `https://f002.backblazeb2.com/file/${bucketName}/${fileName}`,
      fileId: uploadDetails.fileId,
      fileName: uploadDetails.fileName,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
});

export default router;
