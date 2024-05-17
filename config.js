// config.js
import dotenv from "dotenv";
import B2 from "backblaze-b2";

dotenv.config();

const b2 = new B2({
  applicationKeyId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

const bucketName = process.env.B2_BUCKET_NAME;

export { b2, bucketName };
