import { useCallback } from 'react';
import { logoutAPI } from '@/lib/api/auth';
import useRequest from '@/lib/hooks/useRequest';
import { clearAllNoteDrafts } from '@/lib/note-draft';
import { useAuthStore, useNotesStore } from '@/lib/stores';

/**
 * 退出登录：先携带当前 token 通知服务端失效（失败忽略、不等待），再清理本地登录态、
 * 笔记缓存与所有草稿，避免私密笔记正文残留在 localStorage。
 */
const useLogout = () => {
  const [request] = useRequest();

  const { setUserInfo, setToken } = useAuthStore();

  const clearNotes = useNotesStore(state => state.clear);

  return useCallback(() => {
    logoutAPI(request)().catch(() => undefined);
    setUserInfo(null);
    setToken(null);
    clearNotes();
    clearAllNoteDrafts();
  }, [clearNotes, request, setToken, setUserInfo]);
};

export default useLogout;
