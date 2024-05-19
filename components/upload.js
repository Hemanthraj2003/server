// upload.js
import { promises as fs } from "fs";
import { b2, bucketName } from "./config.js";

async function uploadFile(file, fileName) {
  try {
    // Authorize with B2
    await b2.authorize();

    // Get the bucket ID
    const bucketResponse = await b2.getBucket({ bucketName });
    const bucketId = bucketResponse.data.buckets[0].bucketId;

    // Get upload URL
    const response = await b2.getUploadUrl({ bucketId });
    const uploadUrl = response.data.uploadUrl;
    const authToken = response.data.authorizationToken;

    // Read file data
    const fileData = await fs.readFile(file.path);

    // Upload file to Backblaze B2
    const uploadResult = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authToken,
      fileName,
      data: fileData,
    });

    // Cleanup local file asynchronously
    await fs.unlink(file.path);

    return uploadResult.data;
  } catch (error) {
    throw error;
  }
}

export { uploadFile };
