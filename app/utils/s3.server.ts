import {
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  writeAsyncIterableToWritable,
  UploadHandler,
} from '@remix-run/node';
import { PassThrough } from 'stream';
import type { Readable } from 'stream';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import cuid from 'cuid';

const s3 = new S3Client({
  region: process.env.KUDOS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.KUDOS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.KUDOS_SECRET_ACCESS_KEY ?? '',
  },
});

const uploadStream = ({ Key }) => {
  const pass = new PassThrough();
  const upload = new Upload({
    client: s3,
    leavePartsOnError: false,
    params: {
      Bucket: process.env.KUDOS_BUCKET_NAME || '',
      Key: Key || cuid(),
      Body: pass,
    },
  });
  return {
    writeStream: pass,
    promise: upload,
  };
};

export async function uploadStreamToS3(data: any, filename: string) {
  const stream = uploadStream({
    Key: filename,
  });
  console.log('stream', stream);
  await writeAsyncIterableToWritable(data, stream.writeStream);
  const file = await stream.promise.done();
  return file.Location;
}

export const s3UploadHandler: UploadHandler = async ({
  name,
  filename,
  data,
}) => {
  if (name !== 'profile-pic') {
    return undefined;
  }
  const uploadedFileLocation = await uploadStreamToS3(data, filename!);
  return uploadedFileLocation;
};

export async function uploadAvatar(request: Request) {
  const uploadHandler: UploadHandler = unstable_composeUploadHandlers(
    s3UploadHandler,
    createMemoryUploadHandler()
  );
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get('profile-pic')?.toString() || '';

  return file;
}
