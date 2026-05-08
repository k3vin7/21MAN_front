import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/features/auth/auth.store';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/useToast';

type AuthMode = 'login' | 'register';

type AuthDraft = {
  email: string;
  username: string;
};

const usernamePattern = /^[A-Za-z0-9_]{3,30}$/;

export const AuthPage = ({ mode }: { mode: AuthMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isLoading, login, register, clearError, user } = useAuthStore();
  const [draft, setDraft, clearDraft] = useLocalStorage<AuthDraft>('worldbuild:auth-form-draft', {
    email: '',
    username: '',
  });
  const [email, setEmail] = useState(draft.email);
  const [username, setUsername] = useState(draft.username);
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const isRegister = mode === 'register';
  const title = isRegister ? '회원가입' : '로그인';
  const subtitle = isRegister ? '계정을 만들고 세계관 작업을 시작하세요.' : '다시 이어서 만들어볼까요?';
  const nextLink = isRegister ? '/login' : '/register';
  const nextLabel = isRegister ? '이미 계정이 있나요?' : '처음이신가요?';
  const nextAction = isRegister ? '로그인' : '회원가입';

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const next = params.get('redirect');
    return next?.startsWith('/') ? next : '/';
  }, [location.search]);

  useEffect(() => {
    clearError();
    setFieldError(null);
    setPassword('');
  }, [clearError, mode]);

  useEffect(() => {
    setDraft({ email, username });
  }, [email, setDraft, username]);

  useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, user]);

  const validate = () => {
    if (!email.includes('@')) {
      return '이메일 형식이 유효하지 않습니다.';
    }

    if (password.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다.';
    }

    if (isRegister && !usernamePattern.test(username)) {
      return 'username은 영문, 숫자, 언더스코어 3~30자로 입력해주세요.';
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validate();
    if (validationMessage) {
      setFieldError(validationMessage);
      return;
    }

    setFieldError(null);

    try {
      if (isRegister) {
        await register({
          email: email.trim(),
          password,
          username: username.trim(),
        });
        toast({
          title: '계정이 생성되었습니다.',
          tone: 'success',
        });
        setPassword('');
        navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`);
        return;
      }

      await login({
        email: email.trim(),
        password,
      });
      clearDraft();
      toast({
        title: '로그인되었습니다.',
        tone: 'success',
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast({
        title: isRegister ? '회원가입 실패' : '로그인 실패',
        description: error instanceof Error ? error.message : '입력값을 확인해주세요.',
        tone: 'error',
      });
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100svh-13rem)] w-full max-w-[420px] items-center py-8">
      <section className="w-full">
        <div className="mb-9">
          <h1 className="text-[32px] font-bold leading-tight tracking-normal text-slate-950">{title}</h1>
          <p className="mt-3 text-base leading-6 text-slate-500">{subtitle}</p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            autoComplete="email"
            className="h-14 w-full rounded-lg border-0 bg-slate-100 px-4 text-base font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-950/80"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="이메일"
            required
            type="email"
            value={email}
          />
          {fieldError?.includes('이메일') ? <p className="px-1 text-sm text-red-500">{fieldError}</p> : null}

          {isRegister ? (
            <>
              <input
                autoComplete="username"
                className="h-14 w-full rounded-lg border-0 bg-slate-100 px-4 text-base font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-950/80"
                name="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="username"
                required
                value={username}
              />
              {fieldError?.includes('username') ? <p className="px-1 text-sm text-red-500">{fieldError}</p> : null}
            </>
          ) : null}

          <input
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            className="h-14 w-full rounded-lg border-0 bg-slate-100 px-4 text-base font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-950/80"
            minLength={8}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호"
            required
            type="password"
            value={password}
          />
          {fieldError?.includes('비밀번호') ? <p className="px-1 text-sm text-red-500">{fieldError}</p> : null}

          {fieldError && !fieldError.includes('이메일') && !fieldError.includes('username') && !fieldError.includes('비밀번호') ? (
            <p className="px-1 text-sm text-red-500">{fieldError}</p>
          ) : null}

          <Button
            className="mt-3 h-14 w-full rounded-lg bg-slate-950 text-base font-bold hover:bg-slate-800 focus-visible:ring-slate-300"
            isLoading={isLoading}
            size="lg"
            type="submit"
          >
            {title}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
          <span>{nextLabel}</span>
          <Link className="font-bold text-slate-950 hover:text-slate-700" to={nextLink}>
            {nextAction}
          </Link>
        </div>
      </section>
    </div>
  );
};
