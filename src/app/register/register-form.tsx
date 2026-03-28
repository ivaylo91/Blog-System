"use client";

import { useMemo, useState } from "react";
import { FaCheck } from "react-icons/fa6";

type RegisterFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  callbackUrl: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getInputClassName(isValid: boolean) {
  return `w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-sm outline-none transition ${
    isValid
      ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]"
      : "border-black/10 text-stone-900 focus:border-stone-950"
  }`;
}

export function RegisterForm({ action, callbackUrl }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const nameIsValid = name.trim().length >= 2;
  const emailIsValid = isValidEmail(email.trim());
  const passwordIsValid = password.trim().length >= 8;
  const confirmPasswordIsValid = useMemo(() => {
    if (confirmPassword.trim().length < 8) {
      return false;
    }

    return confirmPassword === password;
  }, [confirmPassword, password]);

  return (
    <form action={action} className="mt-8 grid gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Име
        <span className="relative block">
          <input
            name="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={getInputClassName(nameIsValid)}
            placeholder="Иво"
          />
          {nameIsValid ? (
            <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-emerald-600">
              <FaCheck aria-hidden="true" className="h-4 w-4" />
            </span>
          ) : null}
        </span>
      </label>

      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Имейл
        <span className="relative block">
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={getInputClassName(emailIsValid)}
            placeholder="ivo@example.com"
          />
          {emailIsValid ? (
            <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-emerald-600">
              <FaCheck aria-hidden="true" className="h-4 w-4" />
            </span>
          ) : null}
        </span>
      </label>

      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Парола
        <span className="relative block">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={getInputClassName(passwordIsValid)}
            placeholder="Минимум 8 символа"
          />
          {passwordIsValid ? (
            <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-emerald-600">
              <FaCheck aria-hidden="true" className="h-4 w-4" />
            </span>
          ) : null}
        </span>
      </label>

      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Потвърди паролата
        <span className="relative block">
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={getInputClassName(confirmPasswordIsValid)}
            placeholder="Повтори паролата"
          />
          {confirmPasswordIsValid ? (
            <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-emerald-600">
              <FaCheck aria-hidden="true" className="h-4 w-4" />
            </span>
          ) : null}
        </span>
      </label>

      <button
        type="submit"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-rose-200/70 bg-rose-50/85 px-6 py-3 font-serif text-sm font-semibold tracking-[0.08em] text-center text-rose-800 shadow-[0_10px_24px_rgba(190,24,93,0.12)] transition hover:border-rose-300 hover:bg-rose-100/90 hover:text-rose-950"
      >
        Създай профил
      </button>
    </form>
  );
}