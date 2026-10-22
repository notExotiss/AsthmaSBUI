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
  HeartPulse,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { ThemeContext, type Theme } from "./theme";

export function EntryFlow({
  route,
  onNavigate,
  onEnter,
  theme,
  setTheme,
}: {
  route: string;
  onNavigate: (r: string) => void;
  onEnter: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}) {
  const [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [agree, setAgree] = useState(false);
  const signup = route === "signup";
  const reset = route === "reset";
  useEffect(() => {
    setMessage("");
    setPassword("");
    setBusy(false);
  }, [route]);
  const go = (r: string) => onNavigate(r);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (signup && password.length < 8) {
      setMessage("Use at least 8 characters for your password.");
      return;
    }
    if (signup && !agree) {
      setMessage("Please acknowledge the prototype notice before continuing.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (reset) {
        setMessage("Password reset is not connected yet. No email was sent.");
      } else onEnter();
    }, 850);
  }
  return (
    <ThemeContext.Provider value={theme}>
      <div className={"entry-shell " + theme}>
        <header className="entry-header">
          <div className="entry-brand">
            <HeartPulse size={22} />
            <span>
              AsthmaGuard <small>SB</small>
            </span>
          </div>
          <div className="entry-header-action">
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
            <p className="entry-kicker">
              {reset ? "LET'S FIND YOUR WAY BACK" : signup ? "A LITTLE SPACE, JUST FOR YOU" : "YOUR BREATHING SPACE AWAITS"}
            </p>
            <h1>
              {reset ? (
                <>
                  A fresh
                  <br />
                  <em>start.</em>
                </>
              ) : signup ? (
                <>
                  Make yourself
                  <br />
                  <em>at home.</em>
                </>
              ) : (
                <>
                  Good to have
                  <br />
                  <em>you back.</em>
                </>
              )}
            </h1>
            <p className="auth-description">
              {reset
                ? "Enter your email to find your way back."
                : signup
                  ? "A place for your check-ins, patterns, and a little perspective."
                  : "Pick up where you left off. A little more in sync."}
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
                      I understand this research prototype is not medical advice.
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
                  {busy ? "Getting your space ready…" : reset ? "Reset password" : signup ? "Create account" : "Sign in"}
                  {!busy && <ArrowRight size={17} />}
                </Button>
              </Form>
              <div className="auth-divider">
                <span />
                or take a look around
                <span />
              </div>
              <Button variant="secondary" className="entry-demo" onPress={onEnter}>
                Explore the dashboard
                <ArrowRight size={16} />
              </Button>
              <p className="auth-demo-note">
                <ShieldCheck size={13} />
                Authentication is not connected yet. Details are not sent or saved.
              </p>
            </Card.Content>
          </Card>
        </main>
        <footer className="entry-footer">
          <span>A LITTLE MORE ROOM TO BREATHE</span>
          <span>Research prototype. Not for medical or emergency decisions.</span>
        </footer>
      </div>
    </ThemeContext.Provider>
  );
}
