import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Moon,
  Sun,
} from "lucide-react";
import { ThemeContext, type Theme } from "./theme";
import { LanguageContext, TranslateTree } from "./i18n";
import { languages, type Language } from "./mock";

export function EntryFlow({
  route,
  onNavigate,
  onEnter,
  theme,
  setTheme,
  onSignIn,
  onSignUp,
  onReset,
  onGoogle,
  firebaseReady,
  language,
  setLanguage,
}: {
  route: string;
  onNavigate: (r: string) => void;
  onEnter: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name: string, profile: { ageYears: number; heightCm: number; referenceSex: "Male" | "Female" }) => Promise<void>;
  onReset: (email: string) => Promise<void>;
  onGoogle: (profile?: { ageYears: number; heightCm: number; referenceSex: "Male" | "Female" }) => Promise<void>;
  firebaseReady: boolean;
  language: Language;
  setLanguage: (language: Language) => void;
}) {
  const [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [ageYears, setAgeYears] = useState(""),
    [heightCm, setHeightCm] = useState(""),
    [referenceSex, setReferenceSex] = useState<"Male" | "Female" | "">(""),
    [agree, setAgree] = useState(false);
  const signup = route === "signup";
  const reset = route === "reset";
  useEffect(() => {
    setMessage("");
    setPassword("");
    setBusy(false);
  }, [route]);
  const go = (r: string) => onNavigate(r);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (signup && password.length < 8) {
      setMessage("Use at least 8 characters for your password.");
      return;
    }
    if (signup && (!Number.isFinite(Number(ageYears)) || Number(ageYears) < 5 || Number(ageYears) > 110 || !Number.isFinite(Number(heightCm)) || Number(heightCm) < 50 || Number(heightCm) > 250 || !referenceSex)) {
      setMessage("Enter age, height, and a reference option to create your account.");
      return;
    }
    if (signup && !agree) {
      setMessage("Please acknowledge that readings are estimates before continuing.");
      return;
    }
    setBusy(true);
    try {
      if (reset) await onReset(email);
      else if (signup) await onSignUp(email, password, name, { ageYears: Number(ageYears), heightCm: Number(heightCm), referenceSex: referenceSex as "Male" | "Female" });
      else await onSignIn(email, password);
      if (reset) setMessage("If an account exists, a reset email is on its way.");
      else onEnter();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not complete sign in.");
    } finally {
      setBusy(false);
    }
  }
  async function googleSignIn() {
    if (signup && !agree) {
      setMessage("Please acknowledge that readings are estimates before continuing.");
      return;
    }
    if (signup && (!Number.isFinite(Number(ageYears)) || Number(ageYears) < 5 || Number(ageYears) > 110 || !Number.isFinite(Number(heightCm)) || Number(heightCm) < 50 || Number(heightCm) > 250 || !referenceSex)) {
      setMessage("Enter age, height, and a reference option to create your account.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await onGoogle(signup ? { ageYears: Number(ageYears), heightCm: Number(heightCm), referenceSex: referenceSex as "Male" | "Female" } : undefined);
      onEnter();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in with Google.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <ThemeContext.Provider value={theme}>
      <LanguageContext.Provider value={language}>
        <TranslateTree>
      <div className={"entry-shell " + theme}>
        <header className="entry-header">
          <div className="entry-brand">
            <img className="brand-logo" src="/icons/brand-lungs.png" alt="" aria-hidden="true" />
            <span>
              AsthmaGuard <small>SB</small>
            </span>
          </div>
          <div className="entry-header-action">
            <select className="entry-language-select" aria-label="App language" value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
              {languages.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <Button
              isIconOnly
              variant="ghost"
              className="theme-toggle"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </Button>
            <span>
              {signup ? "Already have an account?" : "New around here?"}
            </span>
            <Button variant="ghost" onPress={() => go(signup ? "signin" : "signup")}>
              {signup ? "Sign in" : "Create account"}
              <ArrowRight size={14} />
            </Button>
          </div>
        </header>
        <main className="auth-main">
          <div className="auth-hero">
            <h1>{reset ? "Reset password" : signup ? "Create account" : "Sign in"}</h1>
            <p className="auth-description">
              {reset
                ? "Enter your email to reset your password."
                : signup
                  ? "Save your check-ins and measurements to your account."
                  : "Sign in to view your saved information."}
            </p>
          </div>
          <Card className="auth-form-card" variant="transparent">
            <Card.Content>
              <Form onSubmit={submit} className="auth-form">
                {signup && (
                  <TextField isRequired value={name} onChange={setName} className="entry-field">
                    <Label>What should we call you?</Label>
                    <Input placeholder="Your first name" autoComplete="given-name" maxLength={60} />
                  </TextField>
                )}
                {signup && <>
                  <div className="entry-demographics">
                    <TextField isRequired value={ageYears} onChange={setAgeYears} className="entry-field">
                      <Label>Age (years)</Label>
                      <Input type="number" min="5" max="110" step="1" placeholder="Age" autoComplete="off" />
                    </TextField>
                    <TextField isRequired value={heightCm} onChange={setHeightCm} className="entry-field">
                      <Label>Height (cm)</Label>
                      <Input type="number" min="50" max="250" step="0.1" placeholder="Height" autoComplete="off" />
                    </TextField>
                  </div>
                  <label className="entry-reference-field">
                    <span>Sex</span>
                    <select required className="entry-select" value={referenceSex} onChange={(event) => setReferenceSex(event.target.value as "Male" | "Female" | "")}>
                      <option value="">Select sex</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </label>
                </>}
                <TextField isRequired type="email" value={email} onChange={setEmail} className="entry-field">
                  <Label>Email address</Label>
                  <div className="entry-input-wrap">
                    <Mail size={16} />
                    <Input type="email" placeholder="you@example.com" autoComplete="off" />
                  </div>
                </TextField>
                {!reset && (
                  <TextField isRequired value={password} onChange={setPassword} className="entry-field">
                    <div className="password-label">
                      <Label>Password</Label>
                      {!signup && (
                        <Button variant="ghost" onPress={() => go("reset")}>
                          Forgot password?
                        </Button>
                      )}
                    </div>
                    <div className="entry-input-wrap">
                      <LockKeyhole size={16} />
                      <Input
                        type={show ? "text" : "password"}
                        placeholder={signup ? "At least 8 characters" : "Your password"}
                        autoComplete="off"
                        minLength={signup ? 8 : 1}
                      />
                      <Button
                        isIconOnly
                        variant="ghost"
                        aria-label={show ? "Hide password" : "Show password"}
                        onPress={() => setShow(!show)}
                      >
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </TextField>
                )}
                {signup && (
                  <Checkbox className="auth-checkbox" isSelected={agree} onChange={setAgree}>
                    <Checkbox.Control>
                      <Checkbox.Indicator>
                        <Check size={12} />
                      </Checkbox.Indicator>
                    </Checkbox.Control>
                    <Checkbox.Content>
                      I understand that readings and risk trends are estimates.
                    </Checkbox.Content>
                  </Checkbox>
                )}
                {message && (
                  <Alert className="entry-alert">
                    <Alert.Content>
                      <Alert.Description>{message}</Alert.Description>
                    </Alert.Content>
                  </Alert>
                )}
                <Button type="submit" className="entry-primary" isDisabled={busy}>
                  {busy ? "Please wait…" : reset ? "Reset password" : signup ? "Create account" : "Sign in"}
                  {!busy && <ArrowRight size={17} />}
                </Button>
              </Form>
              {!reset && (
                <>
                  <div className="auth-divider"><span />or<span /></div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="google-sign-in-button"
                    isDisabled={busy || !firebaseReady}
                    onPress={googleSignIn}
                  >
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2l6.4 5A19.8 19.8 0 0 0 43.6 24.5Z" />
                      <path fill="#34A853" d="M24 44c5.6 0 10.3-1.9 13.7-5.1l-6.4-5c-1.8 1.2-4.2 2-7.3 2-5.6 0-10.3-3.8-12-8.8l-6.6 5.1C8.8 39.2 15.9 44 24 44Z" />
                      <path fill="#FBBC05" d="M12 27.1a12 12 0 0 1 0-7.7l-6.6-5.1a20 20 0 0 0 0 17.9l6.6-5.1Z" />
                      <path fill="#EA4335" d="M24 11.5c3 0 5.7 1 7.8 3l5.8-5.8C34.1 5.4 29.6 3.5 24 3.5c-8.1 0-15.2 4.8-18.6 11.8l6.6 5.1c1.7-5.1 6.4-8.9 12-8.9Z" />
                    </svg>
                    {signup ? "Create account with Google" : "Sign in with Google"}
                  </Button>
                </>
              )}
              {!firebaseReady && <p className="auth-demo-note">Sign in is unavailable until Firebase is configured.</p>}
            </Card.Content>
          </Card>
        </main>
        <footer className="entry-footer">
          <span>AsthmaGuard SB</span>
          <span>Your readings and records are saved to your account.</span>
        </footer>
      </div>
        </TranslateTree>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}
