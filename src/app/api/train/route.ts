import { NextRequest, NextResponse } from 'next/server';
import { loadS3IntoPinecone, vectorizeText, vectorizeWebsite, vectorizeQA, embedDocument, upsertVectors } from '@/lib/pinecone';
import { uploadToS3 } from '@/lib/b2-upload';
import { createTrainingHistory } from '@/lib/queries'; // Import your createTraining function

export async function POST(req: NextRequest) {
  try {
    const { chatbotId, trainData } = await req.json();

    if (!trainData) {
      return NextResponse.json({ message: 'No training data provided' }, { status: 400 });
    }

    const { type, content, file } = trainData;

    if (type === 'file' && file) {
      const uploadResult = await uploadToS3(file);
      await loadS3IntoPinecone(uploadResult.file_key, chatbotId); // Updated to pass chatbotId
    } else if (type === 'text') {
      const documents = await vectorizeText(content, chatbotId); // Updated to pass chatbotId
      await upsertVectorsToPinecone(documents, chatbotId);
    } else if (type === 'website') {
      const documents = await vectorizeWebsite(content, chatbotId); // Updated to pass chatbotId
      await upsertVectorsToPinecone(documents, chatbotId);
    } else if (type === 'qa') {
      const documents = await vectorizeQA(content, chatbotId); // Updated to pass chatbotId
      await upsertVectorsToPinecone(documents, chatbotId);
    } else {
      return NextResponse.json({ message: 'Invalid training data type' }, { status: 400 });
    }

    // After training, save the data to the history
    await createTrainingHistory(chatbotId, trainData);

    return NextResponse.json({ message: 'Training complete' }, { status: 200 });
  } catch (error) {
    console.error('Error during training:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

async function upsertVectorsToPinecone(documents: any[], chatbotId: string) {
  const vectors = await Promise.all(documents.map(embedDocument));
  await upsertVectors(vectors, chatbotId);
}
