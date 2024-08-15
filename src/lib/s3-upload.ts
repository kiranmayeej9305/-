import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export async function uploadToS3(
  file: File
): Promise<{ file_key: string; file_name: string }> {
  try {
    console.log("Uploading file to S3...");
    const s3 = new S3({
      region: "us-east-005",
      endpoint: "https://s3.us-east-005.backblazeb2.com",
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_B2_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY!,
      },
    });

    const file_key = Date.now().toString() + "-" + file.name.replace(/\s+/g, "-");

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.NEXT_PUBLIC_B2_BUCKET_NAME!,
        Key: file_key,
        Body: file,
      },
    });

    await upload.done();
    console.log("File uploaded successfully.");

    return {
      file_key,
      file_name: file.name,
    };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
}

export async function uploadRawDataToS3(
  content: string,
  chatbotId: string,
  type: string
): Promise<string> {
  const file_key = `${chatbotId}/${type}/${Date.now().toString()}.txt`;
  try {
    console.log("Uploading raw data to S3...");
    const s3 = new S3({
      region: "us-east-005",
      endpoint: "https://s3.us-east-005.backblazeb2.com",
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_B2_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY!,
      },
    });

    const params = {
      Bucket: process.env.NEXT_PUBLIC_B2_BUCKET_NAME!,
      Key: file_key,
      Body: content,
    };

    await s3.putObject(params);
    console.log("Raw data uploaded successfully.");
    return file_key;
  } catch (error) {
    console.error("Error uploading raw data to S3:", error);
    throw error;
  }
}

export function getS3Url(file_key: string): string {
  return `https://${process.env.NEXT_PUBLIC_B2_BUCKET_NAME}.s3.us-east-005.backblazeb2.com/${file_key}`;
}
