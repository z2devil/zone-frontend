'use client';

import { getVerificationCodeAPI, signAPI } from '@/lib/api/user';
import useRequest from '@/lib/hooks/useRequest';
import { useAuthStore } from '@/lib/stores';
import { validate, FormRules } from '@/lib/utils/formRules';
import Button from '@/ui/Button';
import VerificationCodeInput from '@/ui/VerificationCodeInput';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

const LoginPage = () => {
  const router = useRouter();

  const [request] = useRequest();

  const [step, setStep] = useState(0);

  const [tip, setTip] = useState('');

  const [email, setEmail] = useState('');

  const [verificationCode, setVerificationCode] = useState('');

  const setUserInfo = useAuthStore(state => state.setUserInfo);

  const setToken = useAuthStore(state => state.setToken);

  const [isLoading, setIsLoading] = useState(false);

  // 返回
  const handleBack = useCallback(() => {
    setStep(0);
  }, []);

  // 发送验证码
  const handleSendVerificationCode = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setTip('');
    await Promise.resolve();
    if (email.length === 0) {
      setTip('邮箱不能为空');
      return;
    }
    const [pass, msg] = validate(email, FormRules.EMAIL);
    if (!pass) {
      setTip(msg);
      return;
    }
    try {
      setTip('发送中...');
      await getVerificationCodeAPI(request)({
        email,
      });
      setTip('已发送到 ' + email);
      setStep(1);
    } catch (error: any) {
      setTip(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [email, isLoading, request]);

  // 登录/注册
  const sign = useCallback(
    async (code: string) => {
      if (isLoading) return;
      setIsLoading(true);
      setTip('');
      await Promise.resolve();
      setTip('登录中...');
      try {
        const { token, info } = await signAPI(request)({
          email,
          code,
        });
        setTip('登录成功');
        setUserInfo(info);
        setToken(token);
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } catch (error: any) {
        setTip(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, request, email, setUserInfo, setToken, router]
  );

  // 验证码输入变化
  const handleVerificationCodeChange = useCallback(
    (code: string) => {
      setVerificationCode(code);
      if (code.length === 4) {
        sign(code);
      }
    },
    [sign]
  );

  // 登录/注册
  const handleSign = useCallback(() => {
    sign(verificationCode);
  }, [sign, verificationCode]);

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
      <span className=' relative animate-flash text-base font-medium text-black-250'>
        {tip}
      </span>
    );
  }, [tip]);

  const calcInputElement = useMemo(() => {
    if (step === 0) {
      return (
        <input
          className='h-[3.25rem] w-[17.5rem] rounded-full text-center text-lg font-medium text-black-900 placeholder:text-center placeholder:text-lg placeholder:text-black-250'
          placeholder='邮箱'
          maxLength={30}
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyUp={e => {
            if (e.key === 'Enter') {
              handleSendVerificationCode();
            }
          }}
        />
      );
    }
    if (step === 1) {
      return (
        <VerificationCodeInput
          length={4}
          onChange={handleVerificationCodeChange}
        />
      );
    }
  }, [email, handleSendVerificationCode, handleVerificationCodeChange, step]);

  const calcBottomBarElement = useMemo(() => {
    return (
      <div className='mb-10 flex items-center gap-3'>
        {step === 0 && (
          <Button
            className=' relative flex h-12 items-center justify-center gap-2.5 rounded-3xl bg-primary-50 py-3.5 pl-7 pr-5'
            onClick={handleSendVerificationCode}>
            <span className='text-lg font-medium text-white'>获取验证码</span>
            <i className='iconfont icon-arrow-right text-2xl text-white' />
          </Button>
        )}
        {step === 1 && (
          <>
            <Button
              className=' relative flex h-12 w-12 items-center justify-center gap-2.5 rounded-3xl bg-black-250 py-3.5 pr-1'
              onClick={handleBack}>
              <i className='iconfont icon-angle-left text-2xl text-white' />
            </Button>
            <Button
              className=' relative flex h-12 items-center justify-center gap-2.5 rounded-3xl bg-primary-50 py-3.5 pl-7 pr-5'
              onClick={handleSign}>
              <span className='text-lg font-medium text-white'>登录</span>
              <i className='iconfont icon-arrow-right text-2xl text-white' />
            </Button>
          </>
        )}
      </div>
    );
  }, [handleBack, handleSendVerificationCode, handleSign, step]);

  return (
    <div className=' flex h-full items-center justify-center'>
      <div className='flex h-full max-h-[40rem] w-96 flex-col items-center justify-between gap-32'>
        {/* main */}
        <div className='relative top-14 flex flex-col items-center justify-center gap-16'>
          <div className='flex flex-col items-center justify-center gap-7'>
            <i className='iconfont icon-logo text-[72px] text-[#FFC445]'></i>
            <div className=' flex flex-col items-center gap-[0.63rem]'>
              <span className='text-3xl font-medium text-black-900'>
                {calcTitle}
              </span>
              <div className='h-4'>{calcTip}</div>
            </div>
          </div>
          {calcInputElement}
        </div>
        {calcBottomBarElement}
      </div>
    </div>
  );
};

export default LoginPage;
