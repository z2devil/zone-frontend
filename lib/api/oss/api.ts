import { IFetcher } from '@/lib/hooks/useRequest';
import { UploadParams } from './types';
import { configs } from '@/lib/constants';
import { asyncHandler } from '@/lib/utils';

/**
 * 上传文件到 OSS
 * @returns 文件名（不含目录），完整对象路径为 `${configs.oss.root}/${fileType}/${fileName}`
 */
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

    if (!policy || !signature || !accessKeyId) {
      throw new Error('获取上传凭证失败');
    }

    const { root, bucket, endpoint } = configs.oss;
    if (!root || !bucket || !endpoint) {
      throw new Error('缺少 OSS 环境变量');
    }

    const dotIndex = params.file.name.lastIndexOf('.');
    const extension = dotIndex >= 0 ? params.file.name.substring(dotIndex) : '';
    const fileName = crypto.randomUUID() + extension;

    const formData = new FormData();

    formData.append('policy', policy);
    formData.append('Signature', signature);
    formData.append('OSSAccessKeyId', accessKeyId);
    formData.append('key', `${root}/${params.fileType}/${fileName}`);
    formData.append('success_action_status', '200');
    formData.append('file', params.file, fileName);

    const response = await fetch(`https://${bucket}.${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`文件上传失败（HTTP ${response.status}）`);
    }

    return fileName;
  };
