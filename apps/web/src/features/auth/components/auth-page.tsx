import { Fuel, LockKeyhole, LogIn, Mail, UserRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { login, signUp } from "../api/auth.api";
import { type AuthMode } from "../types/auth.types";

type AuthPageProps = {
  onAuthenticated: () => Promise<void>;
};

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      if (mode === "signup") {
        const name = String(form.get("name") ?? "").trim();
        const passwordConfirmation = String(
          form.get("passwordConfirmation") ?? "",
        );

        if (password !== passwordConfirmation) {
          setMessage("Passwords do not match.");
          return;
        }

        const { error } = await signUp({
          name,
          email,
          password,
        });

        if (error) {
          setMessage(error.message ?? "Unable to create the account.");
          return;
        }
      } else {
        const { error } = await login({
          email,
          password,
          rememberMe: form.get("rememberMe") === "on",
        });

        if (error) {
          setMessage(error.message ?? "Unable to sign in.");
          return;
        }
      }

      await onAuthenticated();
    } catch {
      setMessage("Unable to reach the authentication service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
  }

  return (
    <main className="authShell">
      <section className="authIntro" aria-label="Station access">
        <div className="brand">
          <Fuel size={24} />
          <span>DSR</span>
        </div>
        <h1>Petrol pump shift control</h1>
        <p>
          Sign in to reconcile sales, meter readings, stock, and station cash.
        </p>
        <div className="authStatus">
          <strong>Operator access</strong>
          <span>Sales ledger, tank stock, and credit records</span>
        </div>
      </section>

      <section className="authPanel" aria-labelledby="auth-title">
        <div
          className="authModes"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            aria-selected={mode === "login"}
            className={mode === "login" ? "active" : ""}
            onClick={() => changeMode("login")}
            role="tab"
            type="button"
          >
            Sign in
          </button>
          <button
            aria-selected={mode === "signup"}
            className={mode === "signup" ? "active" : ""}
            onClick={() => changeMode("signup")}
            role="tab"
            type="button"
          >
            Sign up
          </button>
        </div>

        <header className="authHeader">
          <p className="eyebrow">Station account</p>
          <h2 id="auth-title">
            {mode === "login" ? "Sign in" : "Create account"}
          </h2>
        </header>

        <form className="authForm" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label>
              Name
              <span className="authInput">
                <UserRound size={18} />
                <input
                  autoComplete="name"
                  name="name"
                  placeholder="Shift operator"
                  required
                />
              </span>
            </label>
          ) : null}
          <label>
            Email
            <span className="authInput">
              <Mail size={18} />
              <input
                autoComplete="email"
                name="email"
                placeholder="operator@station.in"
                required
                type="email"
              />
            </span>
          </label>
          <label>
            Password
            <span className="authInput">
              <LockKeyhole size={18} />
              <input
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={8}
                name="password"
                placeholder="At least 8 characters"
                required
                type="password"
              />
            </span>
          </label>
          {mode === "signup" ? (
            <label>
              Confirm password
              <span className="authInput">
                <LockKeyhole size={18} />
                <input
                  autoComplete="new-password"
                  minLength={8}
                  name="passwordConfirmation"
                  placeholder="Repeat password"
                  required
                  type="password"
                />
              </span>
            </label>
          ) : (
            <label className="remember">
              <input defaultChecked name="rememberMe" type="checkbox" />
              Keep me signed in
            </label>
          )}

          {message ? (
            <p className="authMessage" role="alert">
              {message}
            </p>
          ) : null}

          <button className="authSubmit" disabled={isSubmitting} type="submit">
            <LogIn size={18} />
            {isSubmitting
              ? "Working..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
