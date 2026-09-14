"use client";

import { useActionState } from "react";
import { Stethoscope } from "lucide-react";
import { login, type LoginState } from "@/actions/auth";

const initialState: LoginState = {};

const fieldClass =
  "w-full rounded-lg border border-[--c-border] bg-[--c-surface] px-3 py-2 text-sm text-[--c-text] outline-none transition focus:border-[--c-accent] focus:ring-2 focus:ring-[--c-accent]/20";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--c-bg] px-4">
      <form
        action={formAction}
        className="card-enter w-full max-w-sm space-y-5 rounded-2xl border border-[--c-border] bg-[--c-surface] p-8 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500/15 to-cyan-500/15">
            <Stethoscope className="h-4 w-4 text-[--c-accent]" aria-hidden />
          </span>
          <h1 className="font-semibold text-[--c-text]">Espace praticien</h1>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-[--c-text-soft]"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-[--c-text-soft]"
          >
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={fieldClass}
          />
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-600/25 transition hover:brightness-110 active:scale-95 disabled:opacity-60"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
