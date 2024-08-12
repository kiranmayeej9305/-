// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// // Function to create the S3 client
// function createS3Client() {
//   return new S3Client({
//     region: "us-west-002", // Set to your Backblaze region
//     endpoint: "https://s3.us-west-002.backblazeb2.com",
//     credentials: {
//       accessKeyId: process.env.B2_KEY_ID!,
//       secretAccessKey: process.env.B2_APPLICATION_KEY!,
//     },
//   });
// }

// export async function uploadToBackblaze(fileName: string, fileBuffer: ArrayBuffer): Promise<string> {
//   try {
//     const bucketName = process.env.B2_BUCKET_NAME;

//     if (!bucketName) {
//       throw new Error("Bucket name is not defined in the environment variables.");
//     }

//     const fileKey = `uploads/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
//     const s3Client = createS3Client();

//     const uploadParams = {
//       Bucket: bucketName!,
//       Key: fileKey,
//       Body: Buffer.from(fileBuffer), // Convert ArrayBuffer to Buffer
//       ContentType: "application/octet-stream", // Adjust the MIME type as needed
//     };

//     await s3Client.send(new PutObjectCommand(uploadParams));

//     return `https://${bucketName}.s3.us-west-002.backblazeb2.com/${fileKey}`;
//   } catch (error) {
//     console.error("Error uploading to Backblaze B2:", error);
//     throw new Error("Failed to upload file to Backblaze B2");
//   }
// }
