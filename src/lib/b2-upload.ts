import { PutObjectCommandOutput, S3 } from "@aws-sdk/client-s3";

export async function uploadToS3(
  file: File
): Promise<{ file_key: string; file_name: string }> {
  return new Promise((resolve, reject) => {
    try {
      const s3 = new S3({
        region: "us-east-005", // Set to your Backblaze region
        endpoint: "https://s3.us-east-005.backblazeb2.com", // Explicit Backblaze endpoint
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_B2_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY!,
        },
      });

      const file_key =
         Date.now().toString() + "-" + file.name.replace(/\s+/g, "-");

      const params = {
        Bucket: process.env.NEXT_PUBLIC_B2_BUCKET_NAME!,
        Key: file_key,
        Body: file,
      };

      s3.putObject(
        params,
        (err: any, data: PutObjectCommandOutput | undefined) => {
          if (err) {
            return reject(err);
          }
          resolve({
            file_key,
            file_name: file.name,
          });
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

export function getS3Url(file_key: string): string {
  // Construct the URL using Backblaze's S3-compatible structure
  const url = `https://${process.env.NEXT_PUBLIC_B2_BUCKET_NAME}.s3.us-east-005.backblazeb2.com/${file_key}`;
  return url;
}
