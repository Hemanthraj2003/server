import { promises as fs } from "fs";
import { b2, bucketName } from "./config.js";
import path from "path";
async function uploadFile(filePath, fileName) {
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
    const fileData = await fs.readFile(filePath);

    // Upload file to Backblaze B2
    const uploadResult = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authToken,
      fileName,
      data: fileData,
    });

    // Cleanup local file asynchronously
    await fs.unlink(filePath);

    return {
      fileName,
      url: `https://f002.backblazeb2.com/file/${bucketName}/${fileName}`,
      ...uploadResult.data,
    };
  } catch (error) {
    throw error;
  }
}

async function uploadFolder(folderPath) {
  try {
    const files = await fs.readdir(folderPath);
    const uploadResults = [];

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const uploadResult = await uploadFile(filePath, file);
      uploadResults.push(uploadResult);
    }

    return uploadResults;
  } catch (error) {
    throw error;
  }
}

export { uploadFile, uploadFolder };
