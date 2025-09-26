import { IFetcher } from '@/lib/hooks/useRequest';
import { UploadParams } from './types';
import { configs } from '@/lib/constants';
import { asyncHandler } from '@/lib/utils';

export const upload =
  (fetcher: IFetcher<any>) => async (params: UploadParams) => {
    const [policyResult, policyError] = await asyncHandler(
      fetcher('/oss/policy', {
        method: 'GET',
      })
    );
    if (policyError || !policyResult) {
      throw new Error(policyError?.message || '获取上传凭证失败');
    }

    const { policy, signature, accessKeyId } = policyResult;

    if (!policy || !signature) {
      throw new Error('获取上传凭证失败');
    }

    if (!configs.oss.root) {
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
      configs.oss.root + '/' + params.fileType + '/' + '${filename}'
    );
    formData.append('success_action_status', '200');
    formData.append('file', params.file, fileName);

    return fileName;
  };
