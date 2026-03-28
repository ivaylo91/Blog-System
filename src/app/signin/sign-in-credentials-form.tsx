"use client";

import { useState } from "react";
import { FaCheck } from "react-icons/fa6";

type SignInCredentialsFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  callbackUrl: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function SignInCredentialsForm({ action, callbackUrl }: SignInCredentialsFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailIsValid = isValidEmail(email.trim());
  const passwordIsValid = password.trim().length >= 5;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Имейл
        <span className="relative block">
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-sm outline-none transition ${
              emailIsValid
                ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]"
                : "border-black/10 text-stone-900 focus:border-stone-950"
            }`}
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
            minLength={5}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-sm outline-none transition ${
              passwordIsValid
                ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]"
                : "border-black/10 text-stone-900 focus:border-stone-950"
            }`}
            placeholder="Минимум 5 символа"
          />
          {passwordIsValid ? (
            <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-emerald-600">
              <FaCheck aria-hidden="true" className="h-4 w-4" />
            </span>
          ) : null}
        </span>
      </label>

      <button
        type="submit"
        className="flex w-full items-center justify-center whitespace-nowrap rounded-full border border-amber-200/80 bg-amber-50/90 px-5 py-3 text-sm font-semibold text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950"
      >
        Влез
      </button>
    </form>
  );
}