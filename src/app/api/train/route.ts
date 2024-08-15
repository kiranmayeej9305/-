import { NextRequest, NextResponse } from 'next/server';
import { loadS3IntoPinecone, vectorizeText, vectorizeWebsite, vectorizeQA, embedDocument, upsertVectors } from '@/lib/pinecone';
import { uploadRawDataToS3, getS3Url } from '@/lib/s3-upload';
import { createTrainingHistory } from '@/lib/queries';

export async function POST(req: NextRequest) {
  try {
    console.log("Received training request.");
    const { chatbotId, trainData } = await req.json();

    if (!trainData) {
      return NextResponse.json({ message: 'No training data provided' }, { status: 400 });
    }

    const { type, content, fileName } = trainData;
    let s3Key = "";

    if (type === 'file' && content) {
      console.log("Processing file data...");
      s3Key = content;

      const fileType = fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'json';
      await loadS3IntoPinecone(s3Key, chatbotId, fileType);

    } else if (type === 'text') {
      console.log("Processing text data...");
      s3Key = await uploadRawDataToS3(content, chatbotId, type);
      const documents = await vectorizeText(content, chatbotId);
      await upsertVectorsToPinecone(documents, chatbotId);

    } else if (type === 'website') {
      console.log("Processing website data...");
      s3Key = await uploadRawDataToS3(content, chatbotId, type);
      const documents = await vectorizeWebsite(content, chatbotId);
      await upsertVectorsToPinecone(documents, chatbotId);

    } else if (type === 'qa') {
      console.log("Processing QA data...");
      s3Key = await uploadRawDataToS3(JSON.stringify(content), chatbotId, type);
      const documents = await vectorizeQA(content, chatbotId);
      await upsertVectorsToPinecone(documents, chatbotId);

    } else {
      return NextResponse.json({ message: 'Invalid training data type' }, { status: 400 });
    }

    await createTrainingHistory(chatbotId, { ...trainData, s3Key });
    return NextResponse.json({ message: 'Training complete' }, { status: 200 });

  } catch (error) {
    console.error('Error during training:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

async function upsertVectorsToPinecone(documents: any[], chatbotId: string) {
  try {
    console.log('Embedding documents...');
    const vectors = await Promise.all(documents.map(embedDocument));

    if (!vectors || vectors.length === 0) {
      console.error('No vectors generated.');
      throw new Error('No vectors generated.');
    }

    console.log('Upserting vectors to Pinecone...');
    await upsertVectors(vectors, chatbotId);
    console.log('Vectors successfully upserted to Pinecone.');
  } catch (error) {
    console.error('Error in upserting vectors to Pinecone:', error);
    throw error;
  }
}