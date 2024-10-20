import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";

/**
 * Downloads a file from S3 and saves it locally.
 * @param file_key - The key of the file in S3.
 * @returns A promise resolving to the local file path.
 */
export async function downloadFromS3(file_key: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Starting to download file from S3 with key: ${file_key}`);
      const s3 = new S3({
        region: "us-east-005", // Your Backblaze region
        endpoint: "https://s3.us-east-005.backblazeb2.com", // Explicit Backblaze endpoint
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_B2_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY!,
        },
      });

      const params = {
        Bucket: process.env.NEXT_PUBLIC_B2_BUCKET_NAME!,
        Key: file_key,
      };

      const obj = await s3.getObject(params);
      const file_name = `/tmp/insert-bot${Date.now().toString()}.pdf`;

      if (obj.Body instanceof Blob) {
        const file = fs.createWriteStream(file_name);
        const stream = obj.Body.transformToWebStream();
        const reader = stream.getReader();
        
        const writeStream = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            file.write(Buffer.from(value));
          }
          file.end();
        };

        writeStream()
          .then(() => {
            console.log(`File downloaded and saved as: ${file_name}`);
            resolve(file_name);
          })
          .catch((err) => {
            console.error("Error writing file to disk:", err);
          reject(err);
        });
      }
    } catch (error) {
      console.error("Error downloading file from S3:", error);
      reject(error);
    }
  });
}
