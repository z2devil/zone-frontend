'use client';

import { getVerificationCodeAPI, signAPI } from '@/lib/api/user';
import useRequest from '@/lib/hooks/useRequest';
import { useAuthStore } from '@/lib/stores';
import { useNotesStore } from '@/lib/stores/notes';
import { validate, FormRules } from '@/lib/utils/formRules';
import Button from '@/ui/Button';
import VerificationCodeInput from '@/ui/VerificationCodeInput';
import { useRouter } from 'next/navigation';
import {
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const VERIFICATION_CODE_LENGTH = 6;

const RESEND_COOLDOWN_SECONDS = 60;

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : '请求失败，请稍后重试';
};

const LoginPage = () => {
  const router = useRouter();

  const [request] = useRequest();

  const [step, setStep] = useState(0);

  const [tip, setTip] = useState('');

  const [email, setEmail] = useState('');

  const [verificationCode, setVerificationCode] = useState('');

  const [verificationInputKey, setVerificationInputKey] = useState(0);

  const [resendSeconds, setResendSeconds] = useState(0);

  const [isLoginComplete, setIsLoginComplete] = useState(false);

  const setUserInfo = useAuthStore(state => state.setUserInfo);

  const setToken = useAuthStore(state => state.setToken);

  const clearNotes = useNotesStore(state => state.clear);

  const [isLoading, setIsLoading] = useState(false);

  const isEmailComposingRef = useRef(false);

  const submissionLockRef = useRef(false);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = window.setTimeout(() => {
      setResendSeconds(current => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const resetVerificationCode = useCallback(() => {
    setVerificationCode('');
    setVerificationInputKey(current => current + 1);
  }, []);

  // 返回
  const handleBack = useCallback(() => {
    if (submissionLockRef.current) return;
    resetVerificationCode();
    setTip('');
    setStep(0);
  }, [resetVerificationCode]);

  // 发送验证码
  const handleSendVerificationCode = useCallback(async () => {
    const normalizedEmail = email.trim();
    setTip('');

    if (normalizedEmail.length === 0) {
      setTip('邮箱不能为空');
      return;
    }

    const [pass, msg] = validate(normalizedEmail, FormRules.EMAIL);
    if (!pass) {
      setTip(msg);
      return;
    }

    if (submissionLockRef.current) return;

    submissionLockRef.current = true;
    setIsLoading(true);
    try {
      setTip('发送中...');
      await getVerificationCodeAPI(request)({
        email: normalizedEmail,
      });
      setEmail(normalizedEmail);
      resetVerificationCode();
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      setTip('已发送到 ' + normalizedEmail);
      setStep(1);
    } catch (error: unknown) {
      setTip(getErrorMessage(error));
    } finally {
      submissionLockRef.current = false;
      setIsLoading(false);
    }
  }, [email, request, resetVerificationCode]);

  // 登录/注册
  const sign = useCallback(
    async (code: string) => {
      if (!new RegExp(`^\\d{${VERIFICATION_CODE_LENGTH}}$`).test(code)) {
        setTip(`请输入完整的 ${VERIFICATION_CODE_LENGTH} 位验证码`);
        return;
      }

      if (submissionLockRef.current || isLoginComplete) return;

      submissionLockRef.current = true;
      setIsLoading(true);
      setTip('');
      setTip('登录中...');
      try {
        const { token, info } = await signAPI(request)({
          email,
          code,
        });
        setTip('登录成功');
        setUserInfo(info);
        setToken(token);
        clearNotes();
        setIsLoginComplete(true);
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } catch (error: unknown) {
        setTip(getErrorMessage(error));
      } finally {
        submissionLockRef.current = false;
        setIsLoading(false);
      }
    },
    [clearNotes, email, isLoginComplete, request, router, setToken, setUserInfo]
  );

  // 验证码输入变化
  const handleVerificationCodeChange = useCallback(
    (code: string) => {
      setVerificationCode(code);
      if (code.length === VERIFICATION_CODE_LENGTH) {
        sign(code);
      }
    },
    [sign]
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isEmailComposingRef.current) return;

      if (step === 0) {
        void handleSendVerificationCode();
        return;
      }

      void sign(verificationCode);
    },
    [handleSendVerificationCode, sign, step, verificationCode]
  );

  const handleEmailKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;

      const nativeEvent = event.nativeEvent;
      if (
        isEmailComposingRef.current ||
        nativeEvent.isComposing ||
        nativeEvent.keyCode === 229
      ) {
        event.preventDefault();
      }
    },
    []
  );

  const calcTitle = useMemo(() => {
    if (step === 0) {
      return '邮箱登录/注册';
    }
    if (step === 1) {
      return '输入验证码';
    }
  }, [step]);

  const calcTip = useMemo(() => {
    if (!tip) return null;
    return (
      <span className='relative animate-flash text-base font-medium text-black-250'>
        {tip}
      </span>
    );
  }, [tip]);

  const calcInputElement = useMemo(() => {
    if (step === 0) {
      return (
        <input
          autoComplete='email'
          className='h-[3.25rem] w-[17.5rem] rounded-full text-center text-lg font-medium text-black-900 placeholder:text-center placeholder:text-lg placeholder:text-black-250'
          disabled={isLoading}
          inputMode='email'
          maxLength={30}
          placeholder='邮箱'
          value={email}
          onChange={e => setEmail(e.target.value)}
          onCompositionEnd={() => {
            isEmailComposingRef.current = false;
          }}
          onCompositionStart={() => {
            isEmailComposingRef.current = true;
          }}
          onKeyDown={handleEmailKeyDown}
        />
      );
    }
    if (step === 1) {
      return (
        <VerificationCodeInput
          disabled={isLoading || isLoginComplete}
          key={verificationInputKey}
          length={VERIFICATION_CODE_LENGTH}
          onChange={handleVerificationCodeChange}
        />
      );
    }
  }, [
    email,
    handleEmailKeyDown,
    handleVerificationCodeChange,
    isLoading,
    isLoginComplete,
    step,
    verificationInputKey,
  ]);

  const calcBottomBarElement = useMemo(() => {
    return (
      <div className='mb-10 flex items-center gap-3'>
        {step === 0 && (
          <Button
            className='relative flex h-12 items-center justify-center gap-2.5 rounded-3xl bg-primary-50 py-3.5 pl-7 pr-5'
            loading={isLoading}
            type='submit'>
            <span className='text-lg font-medium text-white'>获取验证码</span>
            <i className='iconfont icon-arrow-right text-2xl text-white' />
          </Button>
        )}
        {step === 1 && (
          <>
            <Button
              aria-label='返回修改邮箱'
              className='relative flex h-12 w-12 items-center justify-center gap-2.5 rounded-3xl bg-black-250 py-3.5 pr-1'
              disabled={isLoading || isLoginComplete}
              onClick={handleBack}>
              <i className='iconfont icon-angle-left text-2xl text-white' />
            </Button>
            <Button
              className='relative flex h-12 items-center justify-center rounded-3xl bg-black-250 px-5'
              disabled={isLoading || resendSeconds > 0 || isLoginComplete}
              onClick={handleSendVerificationCode}>
              <span className='text-base font-medium text-white'>
                {resendSeconds > 0
                  ? `重新发送（${resendSeconds}s）`
                  : '重新发送'}
              </span>
            </Button>
            <Button
              className='relative flex h-12 items-center justify-center gap-2.5 rounded-3xl bg-primary-50 py-3.5 pl-7 pr-5'
              disabled={isLoginComplete}
              loading={isLoading}
              type='submit'>
              <span className='text-lg font-medium text-white'>登录</span>
              <i className='iconfont icon-arrow-right text-2xl text-white' />
            </Button>
          </>
        )}
      </div>
    );
  }, [
    handleBack,
    handleSendVerificationCode,
    isLoading,
    isLoginComplete,
    resendSeconds,
    step,
  ]);

  return (
    <div className='flex h-full items-center justify-center'>
      <form
        className='flex h-full max-h-[40rem] w-96 flex-col items-center justify-between gap-32'
        onSubmit={handleSubmit}>
        {/* main */}
        <div className='relative top-14 flex flex-col items-center justify-center gap-16'>
          <div className='flex flex-col items-center justify-center gap-7'>
            <i className='iconfont icon-logo text-[72px] text-[#FFC445]'></i>
            <div className='flex flex-col items-center gap-[0.63rem]'>
              <span className='text-3xl font-medium text-black-900'>
                {calcTitle}
              </span>
              <div className='h-4'>{calcTip}</div>
            </div>
          </div>
          {calcInputElement}
        </div>
        {calcBottomBarElement}
      </form>
    </div>
  );
};

export default LoginPage;
