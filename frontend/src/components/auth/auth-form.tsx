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
  const [submitMessageTone, setSubmitMessageTone] = useState<"neutral" | "success" | "error">(
    "neutral",
  );

  const formErrorIds = [
    errors.username ? "username-error" : null,
    errors.email ? "email-error" : null,
    errors.password ? "password-error" : null,
    errors.confirmPassword ? "confirm-password-error" : null,
  ]
    .filter(Boolean)
    .join(" ");

  function validate(nextValues: FormValues): FormErrors {
    const nextErrors: FormErrors = {};

    if (isRegister && !nextValues.username.trim()) {
      nextErrors.username = "Nazwa użytkownika jest wymagana.";
    }

    if (!nextValues.email.trim()) {
      nextErrors.email = "Adres e-mail jest wymagany.";
    } else if (!emailPattern.test(nextValues.email.trim())) {
      nextErrors.email = "Wpisz poprawny adres e-mail.";
    }

    if (!nextValues.password) {
      nextErrors.password = "Hasło jest wymagane.";
    } else if (nextValues.password.length < 8) {
      nextErrors.password = "Hasło musi mieć co najmniej 8 znaków.";
    }

    if (isRegister && !nextValues.confirmPassword) {
      nextErrors.confirmPassword = "Potwierdź hasło.";
    } else if (
      isRegister &&
      nextValues.confirmPassword &&
      nextValues.password !== nextValues.confirmPassword
    ) {
      nextErrors.confirmPassword = "Hasła muszą być identyczne.";
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
    setSubmitMessageTone("neutral");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitMessage("Popraw wyróżnione pola.");
      setSubmitMessageTone("error");
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
          "Konto zostało utworzone. Możesz teraz zalogować się adresem e-mail i hasłem.",
        );
        setSubmitMessageTone("success");
        setValues(initialValues);
        router.push("/login");
      } else {
        const user = await login({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        });
        setSubmitMessage(`Zalogowano jako ${user.username}.`);
        setSubmitMessageTone("success");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Żądanie uwierzytelnienia nie powiodło się.",
      );
      setSubmitMessageTone("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-panel" aria-labelledby={`${mode}-title`}>
      <div className="auth-panel__intro">
        <p className="eyebrow">Atlas Wspomnień</p>
        <h1 id={`${mode}-title`}>
          {isRegister ? "Załóż konto twórcy." : "Zaloguj się, aby kontynuować."}
        </h1>
        <p className="lede">
          {isRegister
            ? "Załóż konto, aby dodawać zdjęcia, opisywać miejsca i budować wspólne archiwum."
            : "Zaloguj się, aby zarządzać swoimi materiałami i korzystać z funkcji twórcy."}
        </p>
      </div>

      <form className="auth-form" noValidate onSubmit={handleSubmit} aria-describedby="auth-form-status">
        {formErrorIds ? (
          <div className="auth-form__error-summary" role="alert" aria-labelledby={`${mode}-error-summary-title`}>
            <p id={`${mode}-error-summary-title`}>Formularz wymaga poprawek.</p>
            <p>Sprawdź oznaczone pola i popraw błędy przed wysłaniem.</p>
          </div>
        ) : null}

        {isRegister ? (
          <div className="auth-field">
            <label htmlFor="username">Nazwa użytkownika</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={values.username}
              onChange={handleValueChange}
              required
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
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleValueChange}
            required
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
          <label htmlFor="password">Hasło</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={values.password}
            onChange={handleValueChange}
            required
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
            <label htmlFor="confirmPassword">Powtórz hasło</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={handleValueChange}
              required
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
            ? "Trwa przetwarzanie..."
            : isRegister
              ? "Utwórz konto"
              : "Zaloguj się"}
        </button>

        <p
          id="auth-form-status"
          className={`auth-form__message auth-form__message--${submitMessageTone}`}
          aria-live="polite"
          role={submitMessageTone === "error" ? "alert" : "status"}
        >
          {submitMessage}
        </p>

        <p className="auth-form__switch">
          {isRegister ? "Masz już konto?" : "Nie masz jeszcze konta?"}{" "}
          <Link href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Przejdź do logowania" : "Załóż je tutaj"}
          </Link>
        </p>
      </form>
    </section>
  );
}
