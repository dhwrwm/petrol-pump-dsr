import { Eye, EyeOff, Fuel, LockKeyhole, LogIn, Mail, UserRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, signUp } from "../api/auth.api";
import { type AuthMode } from "../types/auth.types";

type AuthPageProps = {
  onAuthenticated: () => Promise<void>;
};

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <main
      className="min-h-screen grid grid-cols-[minmax(340px,1fr)_minmax(380px,520px)] items-center gap-[clamp(28px,6vw,96px)] p-[clamp(24px,6vw,84px)] text-brand-50 max-md:grid-cols-1 max-md:gap-7 max-md:content-center"
      style={{
        background:
          "linear-gradient(120deg, rgba(22,35,31,0.96), rgba(22,35,31,0.84)), url('https://images.unsplash.com/photo-1652924217034-6da42546c12f?auto=format&fit=crop&w=1800&q=80') center / cover",
      }}
    >
      <section className="w-full max-w-[560px] grid gap-5" aria-label="Station access">
        <div className="flex items-center gap-2.5 text-xl font-extrabold mb-2.5">
          <Fuel size={24} />
          <span>DSR</span>
        </div>
        <h1 className="max-w-[620px] text-[clamp(38px,5.6vw,76px)] leading-none max-md:text-[40px]">
          Petrol pump shift control
        </h1>
        <p className="max-w-[520px] text-[#d8e2dd] text-lg leading-relaxed max-md:text-base">
          Sign in to reconcile sales, meter readings, stock, and station cash.
        </p>
        <div className="w-full max-w-[420px] grid gap-1 py-4 border-y border-white/[0.24]">
          <strong>Operator access</strong>
          <span className="text-[#c3d0ca] text-sm">
            Sales ledger, tank stock, and credit records
          </span>
        </div>
      </section>

      <section
        className="w-full grid gap-6 p-[clamp(22px,4vw,38px)] border border-[#dfe5e0] rounded-lg bg-white shadow-[0_20px_58px_rgba(7,13,11,0.28)] text-foreground"
        aria-labelledby="auth-title"
      >
        <div
          className="grid grid-cols-2 gap-1 p-1 border border-[#d8ded9] rounded-lg bg-[#eff3f0]"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            aria-selected={mode === "login"}
            className={`flex justify-center items-center gap-2 py-2.5 px-3 rounded-md font-extrabold text-sm cursor-pointer ${
              mode === "login"
                ? "border border-[#d8ded9] bg-white shadow-sm text-foreground"
                : "border-0 bg-transparent text-muted-foreground"
            }`}
            onClick={() => changeMode("login")}
            role="tab"
            type="button"
          >
            Sign in
          </button>
          <button
            aria-selected={mode === "signup"}
            className={`flex justify-center items-center gap-2 py-2.5 px-3 rounded-md font-extrabold text-sm cursor-pointer ${
              mode === "signup"
                ? "border border-[#d8ded9] bg-white shadow-sm text-foreground"
                : "border-0 bg-transparent text-muted-foreground"
            }`}
            onClick={() => changeMode("signup")}
            role="tab"
            type="button"
          >
            Sign up
          </button>
        </div>

        <header className="grid gap-1">
          <p className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
            Station account
          </p>
          <h2 id="auth-title" className="text-[28px] font-bold">
            {mode === "login" ? "Sign in" : "Create account"}
          </h2>
        </header>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label className="grid gap-2 text-sm font-bold text-muted-foreground">
              Name
              <span className="flex items-center gap-2.5 border border-input rounded-lg pl-3 bg-white text-muted-foreground focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15">
                <UserRound size={18} />
                <Input
                  autoComplete="name"
                  name="name"
                  placeholder="Shift operator"
                  required
                  className="border-0 pl-0 shadow-none focus-visible:ring-0"
                />
              </span>
            </label>
          ) : null}
          <label className="grid gap-2 text-sm font-bold text-muted-foreground">
            Email
            <span className="flex items-center gap-2.5 border border-input rounded-lg pl-3 bg-white text-muted-foreground focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15">
              <Mail size={18} />
              <Input
                autoComplete="email"
                name="email"
                placeholder="operator@station.in"
                required
                type="email"
                className="border-0 pl-0 shadow-none focus-visible:ring-0"
              />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-bold text-muted-foreground">
            Password
            <span className="flex items-center gap-2.5 border border-input rounded-lg pl-3 bg-white text-muted-foreground focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15">
              <LockKeyhole size={18} />
              <Input
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={8}
                name="password"
                placeholder="At least 8 characters"
                required
                type={showPassword ? "text" : "password"}
                className="border-0 pl-0 shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="pr-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>
          {mode === "signup" ? (
            <label className="grid gap-2 text-sm font-bold text-muted-foreground">
              Confirm password
              <span className="flex items-center gap-2.5 border border-input rounded-lg pl-3 bg-white text-muted-foreground focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15">
                <LockKeyhole size={18} />
                <Input
                  autoComplete="new-password"
                  minLength={8}
                  name="passwordConfirmation"
                  placeholder="Repeat password"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  className="border-0 pl-0 shadow-none focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="pr-3 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
          ) : (
            <label className="grid grid-cols-[18px_1fr] items-center gap-2 text-foreground font-semibold text-sm">
              <input
                defaultChecked
                name="rememberMe"
                type="checkbox"
                className="h-4 m-0 accent-primary"
              />
              Keep me signed in
            </label>
          )}

          {message ? (
            <Alert variant="destructive">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            className="mt-1 h-11 font-extrabold"
            disabled={isSubmitting}
            type="submit"
          >
            <LogIn size={18} />
            {isSubmitting
              ? "Working..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>
      </section>
    </main>
  );
}
