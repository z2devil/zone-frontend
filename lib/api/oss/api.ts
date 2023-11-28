import { IFetcher } from '@/lib/hooks/useRequest';
import { UploadParams } from './types';

export const upload =
  (fetcher: IFetcher<any>) => async (params: UploadParams) => {
    const { policy, signature, accessKeyId } = await fetcher('/oss/policy', {
      method: 'GET',
    });

    if (!policy || !signature) {
      throw new Error('获取上传凭证失败');
    }

    if (!process.env.OSS_ROOT) {
      throw new Error('缺少 OSS 环境变量');
    }

    const uuid = Math.random().toString(36).substr(2);

    const fileName =
      uuid +
      params.file.name.substring(
        params.file.name.lastIndexOf('.'),
        params.file.name.length
      );

    const formData = new FormData();

    formData.append('policy', policy);
    formData.append('Signature', signature);
    formData.append('OSSAccessKeyId', accessKeyId);
    formData.append(
      'key',
      process.env.OSS_ROOT + '/' + params.fileType + '/' + '${filename}'
    );
    formData.append('success_action_status', '200');
    formData.append('file', params.file, fileName);

    const host = `https://${process.env.OSS_BUCKET}.${process.env.OSS_ENDPOINT}`;

    await fetch(host, {
      method: 'POST',
      body: formData,
      redirect: 'follow',
    });

    return fileName;
  };
