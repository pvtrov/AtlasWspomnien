"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

type FormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const { login, register } = useAuth();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(nextValues: FormValues): FormErrors {
    const nextErrors: FormErrors = {};

    if (isRegister && !nextValues.username.trim()) {
      nextErrors.username = "Username is required.";
    }

    if (!nextValues.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(nextValues.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!nextValues.password) {
      nextErrors.password = "Password is required.";
    } else if (nextValues.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long.";
    }

    if (isRegister && !nextValues.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (
      isRegister &&
      nextValues.confirmPassword &&
      nextValues.password !== nextValues.confirmPassword
    ) {
      nextErrors.confirmPassword = "Passwords must match.";
    }

    return nextErrors;
  }

  function handleValueChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const { name, value } = event.target;

    setValues((currentValues) => {
      const nextValues = { ...currentValues, [name]: value };
      setErrors(validate(nextValues));
      return nextValues;
    });

    setSubmitMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitMessage("Please correct the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register({
          username: values.username.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
        });
        setSubmitMessage(
          "Account created successfully. You can now log in with your email and password.",
        );
        setValues(initialValues);
        router.push("/login");
      } else {
        const user = await login({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        });
        setSubmitMessage(`Logged in as ${user.username}.`);
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Authentication request failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-panel" aria-labelledby={`${mode}-title`}>
      <div className="auth-panel__intro">
        <p className="eyebrow">Sprint 2</p>
        <h1 id={`${mode}-title`}>
          {isRegister ? "Create your creator account." : "Sign in to continue."}
        </h1>
        <p className="lede">
          {isRegister
            ? "Start with a simple registration form that prepares the frontend for the first creator authentication flow."
            : "Use the initial login screen to enter your creator credentials once backend authentication is connected."}
        </p>
      </div>

      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        {isRegister ? (
          <div className="auth-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={values.username}
              onChange={handleValueChange}
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? "username-error" : undefined}
            />
            {errors.username ? (
              <p id="username-error" className="auth-field__error">
                {errors.username}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleValueChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email ? (
            <p id="email-error" className="auth-field__error">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={values.password}
            onChange={handleValueChange}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password ? (
            <p id="password-error" className="auth-field__error">
              {errors.password}
            </p>
          ) : null}
        </div>

        {isRegister ? (
          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={handleValueChange}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? "confirm-password-error" : undefined
              }
            />
            {errors.confirmPassword ? (
              <p id="confirm-password-error" className="auth-field__error">
                {errors.confirmPassword}
              </p>
            ) : null}
          </div>
        ) : null}

        <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Working..."
            : isRegister
              ? "Create account"
              : "Log in"}
        </button>

        <p className="auth-form__message" aria-live="polite">
          {submitMessage}
        </p>

        <p className="auth-form__switch">
          {isRegister ? "Already have an account?" : "Need an account?"}{" "}
          <Link href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Go to login" : "Create one here"}
          </Link>
        </p>
      </form>
    </section>
  );
}
