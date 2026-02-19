"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Eye, EyeOff, CheckCircle } from "lucide-react";
import { register, login, loginWithGoogle, resendActivationEmail, forgotPassword } from "@/lib/api";
import { toast } from "@/lib/toast";
import { getErrorMessage, getErrorType } from "@/lib/errorMessages";
import { useAuth } from "@/context/AuthContext";
import { jwtDecode } from "jwt-decode";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

interface AuthFieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { checkAuth } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [showEmailActivationMessage, setShowEmailActivationMessage] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotPasswordSuccess, setShowForgotPasswordSuccess] = useState(false);
  const [forgotPasswordCooldown, setForgotPasswordCooldown] = useState(0);
  const [resendActivationCooldown, setResendActivationCooldown] = useState(0);
  const [resendingEmail, setResendingEmail] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const handleGoogleSignInRef = useRef<(response: { credential: string }) => Promise<void>>(() => Promise.resolve());

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (forgotPasswordCooldown > 0) {
      const timer = setTimeout(() => {
        setForgotPasswordCooldown(forgotPasswordCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [forgotPasswordCooldown]);

  useEffect(() => {
    if (resendActivationCooldown > 0) {
      const timer = setTimeout(() => {
        setResendActivationCooldown(resendActivationCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendActivationCooldown]);

  const handleGoogleSignIn = useCallback(
    async (response: { credential: string }) => {
      if (!response.credential) {
        toast.error("Помилка авторизації через Google");
        return;
      }

      setGoogleLoading(true);
      setError("");

      type GooglePayload = {
        email?: string;
        name?: string;
        picture?: string;
        sub?: string;
        aud?: string;
        iss?: string;
        exp?: number;
      };

      let decoded: GooglePayload = {};
      try {
        decoded = jwtDecode<GooglePayload>(response.credential);
      } catch {
        // use credential only if decode fails
      }

      const sendWithFallback = (extra?: { email?: string; name?: string; picture?: string; sub?: string }) =>
        loginWithGoogle({
          credential: response.credential,
          email: extra?.email ?? decoded.email ?? "",
          name: extra?.name ?? decoded.name,
          picture: extra?.picture ?? decoded.picture,
          sub: extra?.sub ?? decoded.sub,
        });

      try {
        try {
          await sendWithFallback();
          toast.success("Вітаємо! Ви успішно увійшли через Google");
          await onSuccess();
          onClose();
          setName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setFieldErrors({});
        } catch (err: unknown) {
          const errorResponse = err as {
            status?: number;
            error?: string;
            details?: string;
          };

          const useFrontendFallback =
            (errorResponse.status === 401 &&
              (errorResponse.error?.includes("Token verification failed") ||
                errorResponse.details?.includes("network restrictions"))) ||
            (errorResponse.status === 400 && decoded.email);

          if (useFrontendFallback && decoded.email) {
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
              throw new Error("Token expired");
            }
            if (
              decoded.iss &&
              decoded.iss !== "https://accounts.google.com" &&
              decoded.iss !== "accounts.google.com"
            ) {
              throw new Error("Invalid token issuer");
            }
            const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            if (googleClientId && decoded.aud && decoded.aud !== googleClientId) {
              throw new Error("Invalid token audience");
            }
            await sendWithFallback({
              email: decoded.email,
              name: decoded.name,
              picture: decoded.picture,
              sub: decoded.sub,
            });
            toast.success("Вітаємо! Ви успішно увійшли через Google");
            await onSuccess();
            onClose();
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setFieldErrors({});
          } else {
            throw err;
          }
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        const errorType = getErrorType(
          (err as { status?: number }).status,
          (err as { errorCode?: string }).errorCode
        );
        setError(errorMessage);
        toast[errorType](errorMessage);
      } finally {
        setGoogleLoading(false);
      }
    },
    [onSuccess, onClose]
  );

  handleGoogleSignInRef.current = handleGoogleSignIn;

  useEffect(() => {
    if (!isOpen || !googleButtonRef.current) return;

    const buttonElement = googleButtonRef.current;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
      return;
    }

    buttonElement.innerHTML = "";

    let retryCount = 0;
    const maxRetries = 50;

    const initGoogleAuth = () => {
      if (typeof window === "undefined") return;

      const g = (window as unknown as { google?: { accounts?: { id?: {
        initialize: (c: { client_id: string; callback: (r: { credential: string }) => void }) => void;
        renderButton: (el: HTMLElement | null, o: object) => void;
      }}}}).google?.accounts?.id;

      if (g) {
        try {
          g.initialize({
            client_id: clientId,
            callback: (r) => handleGoogleSignInRef.current(r),
          });
          g.renderButton(buttonElement, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
            locale: "ru",
          });
        } catch (e) {
          console.error("Google OAuth init:", e);
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(initGoogleAuth, 100);
      }
    };

    initGoogleAuth();

    return () => {
      buttonElement.innerHTML = "";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const errors: AuthFieldErrors = {};

    if (!isLogin) {
      if (name.trim().length < 2) {
        errors.name = "Ім'я повинно містити мінімум 2 символи";
      } else if (name.trim().length > 50) {
        errors.name = "Ім'я не може перевищувати 50 символів";
      }

      if (password !== confirmPassword) {
        errors.confirmPassword = "Паролі не співпадають";
      }

      if (!agreeToTerms) {
        setError("Будь ласка, прийміть умови використання");
        return false;
      }
    }

    if (!email.trim()) {
      errors.email = "Будь ласка, введіть email";
    } else if (!validateEmail(email.trim())) {
      errors.email = "Будь ласка, введіть коректний email адрес";
    }

    if (!password) {
      errors.password = "Будь ласка, введіть пароль";
    } else if (password.length < 6) {
      errors.password = "Пароль повинен містити мінімум 6 символів";
    } else if (password.length > 100) {
      errors.password = "Пароль не може перевищувати 100 символів";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email.trim(), password);
        toast.success("Вітаємо! Ви успішно увійшли");
        await onSuccess();
        onClose();
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFieldErrors({});
        setRememberMe(false);
        setAgreeToTerms(false);
      } else {
        const result = await register(name.trim(), email.trim(), password);
        if (result.user && result.user.isEmailActivated === false) {
          setShowEmailActivationMessage(true);
          toast.success("Реєстрація успішна! Перевірте email для активації");
        } else {
          await checkAuth();
          toast.success("Реєстрація успішна! Вітаємо на DOVI");
          await onSuccess();
          onClose();
          setName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setFieldErrors({});
          setRememberMe(false);
          setAgreeToTerms(false);
        }
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      const errorType = getErrorType(
        (err as { status?: number }).status,
        (err as { errorCode?: string }).errorCode
      );
      setError(errorMessage);
      toast[errorType](errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFieldErrors({});
    setName("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowEmailActivationMessage(false);
    setShowForgotPassword(false);
    setShowForgotPasswordSuccess(false);
    setResendActivationCooldown(0);
  };

  const handleResendActivationEmail = async () => {
    if (resendActivationCooldown > 0 || resendingEmail) return;
    
    setResendingEmail(true);
    setError("");
    try {
      await resendActivationEmail();
      setResendActivationCooldown(30);
      toast.success("Лист активації відправлено! Перевірте email");
    } catch (err: unknown) {
      let errorMessage = getErrorMessage(err);
      const errorType = getErrorType(
        (err as { status?: number }).status,
        (err as { errorCode?: string }).errorCode
      );
      const error = err as { remainingSeconds?: number };
      if (error.remainingSeconds !== undefined && error.remainingSeconds !== null) {
        errorMessage = `${errorMessage} Спробуйте через ${error.remainingSeconds} секунд.`;
        setResendActivationCooldown(error.remainingSeconds);
      }
      
      setError(errorMessage);
      toast[errorType](errorMessage);
    } finally {
      setResendingEmail(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Будь ласка, введіть email");
      return;
    }

    if (forgotPasswordCooldown > 0) return;

    setLoading(true);
    setError("");
    try {
      await forgotPassword(email.trim());
      setShowForgotPasswordSuccess(true);
      setForgotPasswordCooldown(30);
      toast.success("Лист для скидання пароля відправлено! Перевірте email");
    } catch (err: unknown) {
      let errorMessage = getErrorMessage(err);
      const errorType = getErrorType(
        (err as { status?: number }).status,
        (err as { errorCode?: string }).errorCode
      );
      const error = err as { remainingSeconds?: number };
      if (error.remainingSeconds !== undefined && error.remainingSeconds !== null) {
        errorMessage = `Спробуйте ще раз через ${error.remainingSeconds} секунд.`;
        setForgotPasswordCooldown(error.remainingSeconds);
      }
      
      setError(errorMessage);
      toast[errorType](errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1003] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10">
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-16 mb-4 relative">
              <Image
                src="/images/logosimple.png"
                alt="DOVI — логотип платформи відгуків"
                fill
                className="object-contain"
                sizes="64px"
              />
            </div>
            {isLogin && !showForgotPassword ? (
              <>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  З поверненням!
                </h2>
                <p className="text-slate-600">
                  Введіть свої дані для входу в акаунт DOVI.COM.UA
                </p>
              </>
            ) : !showForgotPassword ? (
              <>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Створити акаунт
                </h2>
                <p className="text-slate-600">
                  Приєднуйтесь до DOVI.COM.UA та діліться своїм досвідом
                </p>
              </>
            ) : null}
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {showEmailActivationMessage ? (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="size-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-emerald-900">
                  Реєстрація успішна!
                </h3>
              </div>
              <p className="text-sm text-emerald-800 mb-4">
                Ми відправили лист активації на вашу пошту <strong>{email}</strong>. 
                Будь ласка, перевірте пошту та натисніть на посилання для активації акаунта.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleResendActivationEmail}
                  disabled={resendingEmail || resendActivationCooldown > 0}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                  {resendingEmail
                    ? "Відправляємо лист..."
                    : resendActivationCooldown > 0
                    ? `Відправити повторно (${resendActivationCooldown}с)`
                    : "Відправити лист повторно"}
                </button>
                <Link
                  href="/profile"
                  onClick={async () => {
                    setShowEmailActivationMessage(false);
                    await checkAuth();
                    await onSuccess();
                  }}
                  className="w-full px-4 py-2 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-medium rounded-lg transition-colors text-sm text-center block">
                  До акаунту
                </Link>
              </div>
            </div>
          ) : showForgotPassword ? (
            showForgotPasswordSuccess ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="size-8 text-emerald-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Лист відправлено!
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Ми відправили лист для скидання пароля на вашу пошту <strong>{email}</strong>. 
                    Будь ласка, перевірте пошту та натисніть на посилання для скидання пароля.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setShowForgotPasswordSuccess(false);
                      setEmail("");
                      setError("");
                      setForgotPasswordCooldown(0);
                    }}
                    className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
                    Зрозуміло
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Скинути пароль
                  </h3>
                  <p className="text-sm text-slate-600">
                    Введіть ваш email, і ми надішлемо вам посилання для скидання пароля.
                  </p>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="Наприклад, ivan@mail.com"
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setEmail("");
                        setError("");
                        setForgotPasswordCooldown(0);
                      }}
                      className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      Назад
                    </button>
                    <button
                      type="submit"
                      disabled={loading || forgotPasswordCooldown > 0}
                      className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading
                        ? "Відправляємо лист..."
                        : forgotPasswordCooldown > 0
                        ? `Відправити повторно (${forgotPasswordCooldown}с)`
                        : "Відправити"}
                    </button>
                  </div>
                </form>
              </div>
            )
          ) : !showEmailActivationMessage ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Повне ім&apos;я
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) {
                      setFieldErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  placeholder="Іван Петренко"
                  required
                  maxLength={50}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors ${
                    fieldErrors.name ? "border-red-300" : "border-slate-300"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Електронна пошта
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder={isLogin ? "Наприклад, ivan@mail.com" : "Наприклад, ivan@mail.com"}
                required
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors ${
                  fieldErrors.email ? "border-red-300" : "border-slate-300"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }
                  }}
                  placeholder="Мінімум 6 символів"
                  required
                  minLength={6}
                  maxLength={100}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors ${
                    fieldErrors.password ? "border-red-300" : "border-slate-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Підтвердити пароль
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmPassword: undefined,
                        }));
                      }
                    }}
                    required
                    className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors ${
                      fieldErrors.confirmPassword
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">
                    Запам&apos;ятати мене
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  Забули пароль?
                </button>
              </div>
            )}

            {!isLogin && (
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700">
                  Я погоджуюсь з{" "}
                  <a
                    href="#"
                    className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Умовами використання
                  </a>{" "}
                  та{" "}
                  <a
                    href="#"
                    className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Політикою конфіденційності
                  </a>
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm">
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Завантаження...
                </>
              ) : isLogin ? (
                "Увійти"
              ) : (
                "Зареєструватися"
              )}
            </button>
          </form>
          ) : null}
          {!showEmailActivationMessage && !showForgotPassword && (
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">
                  {isLogin ? "АБО УВІЙТИ ЧЕРЕЗ" : "Або продовжити через"}
                </span>
              </div>
            </div>

            <div className="relative w-full">
              <div
                ref={googleButtonRef}
                className="w-full h-[40px] flex items-center justify-center shrink-0"></div>
              {googleLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-10">
                  <svg
                    className="animate-spin h-5 w-5 text-emerald-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
          )}
          {!showEmailActivationMessage && !showForgotPassword && (
          <div className="mt-6 text-center">
            <span className="text-sm text-slate-600">
              {isLogin
                ? "Немає облікового запису? "
                : "Вже є обліковий запис? "}
              <button
                type="button"
                onClick={handleToggleMode}
                className="text-emerald-600 hover:text-emerald-700 font-medium">
                {isLogin ? "Зареєструватися" : "Увійти"}
              </button>
            </span>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
