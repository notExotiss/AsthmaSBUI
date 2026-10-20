import { MotionStage } from "./motion-examples/MotionStage";
import React, { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
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
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Feather,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Wind,
} from "lucide-react";
const steps = [
  {
    kicker: "A LITTLE MORE PEACE OF MIND",
    title: (
      <>
        Every breath
        <br />
        has a story.
        <br />
        <em>Start with yours.</em>
      </>
    ),
    text: "You can’t see the air. But you can notice how you feel in it. Let’s connect those little moments.",
    note: "Made for students & families in South Brunswick.",
    label: "Let’s take a look",
    color: "#c3d4f2",
  },
  {
    kicker: "01 / THE AIR AROUND YOU",
    title: (
      <>
        The air changes.
        <br />
        <em>Your context matters.</em>
      </>
    ),
    text: "Air conditions and your personal experiences belong in the same picture. Explore them together, without jumping to conclusions.",
    note: "Regional air data is context, not your personal exposure.",
    label: "Keep exploring",
    color: "#eac2ab",
  },
  {
    kicker: "02 / A MOMENT TO CHECK IN",
    title: (
      <>
        One small note.
        <br />
        <em>A clearer picture.</em>
      </>
    ),
    text: "Bring your prototype breathing readings and symptom logs together. Notice what changes, and what stays familiar.",
    note: "Prototype readings are not a clinical assessment.",
    label: "One more thing",
    color: "#b9dfd6",
  },
  {
    kicker: "03 / ALWAYS AT YOUR PACE",
    title: (
      <>
        Now bring it
        <br />
        <em>all together.</em>
      </>
    ),
    text: "Keep your existing care plan close and look at possible patterns over time. A companion for your day, with you in control.",
    note: "No diagnosis. No medication changes. Just room for context.",
    label: "Make yourself at home",
    color: "#d5c6f2",
  },
];
const storyHeadlines = [
  ["Every breath", "has a story.", "Start with yours."],
  ["The air changes.", "Your context", "matters."],
  ["One small note.", "A clearer", "picture."],
  ["Now bring it", "all together."],
];
function StoryInteraction({
  step,
  onPulse,
  onAirChange,
}: {
  step: number;
  onPulse: () => void;
  onAirChange: (choice: string) => void;
}) {
  const [choice, setChoice] = useState("A quiet afternoon");
  const [recorded, setRecorded] = useState(false);
  const [who, setWho] = useState("For myself");
  return (
    <motion.div
      className="story-interaction-panel"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      {step === 0 ? (
        <>
          <span className="story-instruction">
            A little space to notice how your breathing feels today.
          </span>
          <Button variant="ghost" className="story-play" onPress={onPulse}>
            Replay the breathing
          </Button>
        </>
      ) : step === 1 ? (
        <>
          <span className="story-instruction">CHANGE THE SCENE</span>
          <div className="story-choices">
            {["A quiet afternoon", "A busy street", "Pollen season"].map(
              (c) => (
                <Button
                  key={c}
                  variant="ghost"
                  onPress={() => {
                    setChoice(c);
                    onAirChange(c);
                    onPulse();
                  }}
                  className={choice === c ? "chosen" : ""}
                >
                  {choice === c && (
                    <motion.span
                      layoutId="air-choice"
                      className="choice-surface"
                    />
                  )}
                  <span>{c}</span>
                </Button>
              ),
            )}
          </div>
          <p>
            {choice === "A quiet afternoon"
              ? "Air is part of the picture, even on a calm day."
              : choice === "A busy street"
                ? "Regional pollution can vary. Personal exposure varies too."
                : "Pollen may be relevant to your experience. A log can add context."}
          </p>
        </>
      ) : step === 2 ? (
        <>
          <span className="story-instruction">TRY A SMALL CHECK-IN</span>
          <Card className="story-sample">
            <Card.Content>
              <motion.strong
                key={String(recorded)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {recorded ? "Check-in saved" : "How was your breathing?"}
              </motion.strong>
              <Button
                variant="ghost"
                onPress={() => {
                  setRecorded(!recorded);
                  onPulse();
                }}
              >
                {recorded ? (
                  <>
                    <Check size={15} />
                    Recorded
                  </>
                ) : (
                  <>
                    Feeling okay
                    <PlusIcon />
                  </>
                )}
              </Button>
            </Card.Content>
          </Card>
          <p>
            {recorded
              ? "One small observation becomes part of your story. This example stays here."
              : "A few words today can make patterns easier to explore later."}
          </p>
        </>
      ) : (
        <>
          <span className="story-instruction">WHO IS THIS SPACE FOR?</span>
          <div className="story-choices">
            {["For myself", "For my family"].map((c) => (
              <Button
                key={c}
                variant="ghost"
                onPress={() => {
                  setWho(c);
                  onPulse();
                }}
                className={who === c ? "chosen" : ""}
              >
                {who === c && (
                  <motion.span
                    layoutId="who-choice"
                    className="choice-surface"
                  />
                )}
                <span>{c}</span>
              </Button>
            ))}
          </div>
          <p>
            {who === "For myself"
              ? "Your check-ins. Your context. A place to begin."
              : "A shared starting point for noticing and understanding."}
          </p>
        </>
      )}
    </motion.div>
  );
}
function PlusIcon() {
  return <ArrowRight size={14} />;
}
export function EntryFlow({
  route,
  onNavigate,
  onEnter,
}: {
  route: string;
  onNavigate: (r: string) => void;
  onEnter: () => void;
}) {
  const [step, setStep] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [environment, setEnvironment] = useState("A quiet afternoon");
  const [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [agree, setAgree] = useState(false);
  const reduced = useReducedMotion();
  const welcome = route === "welcome";
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
    <MotionConfig reducedMotion="user">
      <div
        className={
          "entry-shell dark " + (welcome ? "onboarding" : "authentication")
        }
      >
        <header className="entry-header">
          <Button
            variant="ghost"
            className="entry-brand"
            onPress={() => {
              setStep(0);
              go("welcome");
            }}
            aria-label="AsthmaGuard welcome"
          >
            <span>
              AsthmaGuard <small>SB</small>
            </span>
          </Button>
          <div className="entry-header-action">
            {welcome ? (
              <>
                <span>Already feel at home?</span>
                <Button variant="ghost" onPress={() => go("signin")}>
                  Sign in
                  {step > 1 && <ArrowRight size={14} />}
                </Button>
              </>
            ) : (
              <>
                <span>
                  {signup ? "Already have an account?" : "New around here?"}
                </span>
                <Button
                  variant="ghost"
                  onPress={() => go(signup ? "signin" : "signup")}
                >
                  {signup ? "Sign in" : "Join us"}
                  <ArrowRight size={14} />
                </Button>
              </>
            )}
          </div>
        </header>
        <div className="entry-layout">
          {welcome && (
            <div className="onboarding-3d">
              <MotionStage
                variant={step}
                replay={pulse}
                environment={environment}
              />
            </div>
          )}
          <div className="entry-art">
            {!welcome && <MotionStage variant={0} />}
            <div className="art-bottom">
              <span>LESS GUESSWORK. MORE UNDERSTANDING.</span>
              <span>AsthmaGuard SB — Research prototype</span>
            </div>
          </div>
          <main className="entry-main">
            <AnimatePresence mode="wait" initial={false}>
              {welcome ? (
                <motion.section
                  key={"step-" + step}
                  className="welcome-content"
                  initial={{
                    opacity: 0,
                    x: reduced ? 0 : 60,
                    rotateY: reduced ? 0 : 7,
                  }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{
                    opacity: 0,
                    x: reduced ? 0 : -80,
                    rotateY: reduced ? 0 : -8,
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className="step-track"
                    aria-label={`Introduction ${step + 1} of 4`}
                  >
                    {steps.map((s, i) => (
                      <Button
                        key={i}
                        isIconOnly
                        variant="ghost"
                        className={
                          "step-button " + (i === step ? "current" : "")
                        }
                        aria-label={`Go to introduction ${i + 1}`}
                        aria-current={i === step ? "step" : undefined}
                        onPress={() => setStep(i)}
                      >
                        {i === step && (
                          <motion.span
                            layoutId="active-step"
                            className="active-step"
                          />
                        )}
                        <span className="step-line" />
                      </Button>
                    ))}
                    <span>
                      0{step + 1} <i>/ 04</i>
                    </span>
                  </div>
                  <p className="entry-kicker">{steps[step].kicker}</p>
                  <ChapterTitle lines={storyHeadlines[step]} mode={step} />
                  <p className="entry-description">{steps[step].text}</p>
                  <StoryInteraction
                    key={step}
                    step={step}
                    onAirChange={setEnvironment}
                    onPulse={() => setPulse((v) => v + 1)}
                  />
                  <div className="entry-note">
                    <ShieldCheck size={15} />
                    <span>{steps[step].note}</span>
                  </div>
                  <div className="welcome-actions">
                    <Button
                      className="entry-primary"
                      onPress={() =>
                        step < 3 ? setStep(step + 1) : go("signup")
                      }
                    >
                      {steps[step].label}
                      {step > 1 && <ArrowRight size={18} />}
                    </Button>
                    <div className="welcome-secondary">
                      {step > 0 ? (
                        <Button
                          variant="ghost"
                          onPress={() => setStep(step - 1)}
                        >
                          {step > 1 && <ArrowLeft size={14} />}
                          Back
                        </Button>
                      ) : (
                        <span>Thoughtfully made for your everyday.</span>
                      )}
                      <Button variant="ghost" onPress={onEnter}>
                        Skip introduction
                        {step > 1 && <ChevronRight size={13} />}
                      </Button>
                    </div>
                  </div>
                </motion.section>
              ) : (
                <motion.section
                  key={route}
                  className="auth-content"
                  initial={{ opacity: 0, y: reduced ? 0 : 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduced ? 0 : -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <Button
                    variant="ghost"
                    className="auth-back"
                    onPress={() => go(reset ? "signin" : "welcome")}
                  >
                    <ArrowLeft size={14} />
                    {reset ? "Back to sign in" : "Back to introduction"}
                  </Button>
                  <p className="entry-kicker">
                    {reset
                      ? "LET’S FIND YOUR WAY BACK"
                      : signup
                        ? "A LITTLE SPACE, JUST FOR YOU"
                        : "YOUR BREATHING SPACE AWAITS"}
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
                  <Card className="auth-form-card" variant="transparent">
                    <Card.Content>
                      <Form onSubmit={submit} className="auth-form">
                        {signup && (
                          <TextField
                            isRequired
                            value={name}
                            onChange={setName}
                            className="entry-field"
                          >
                            <Label>What should we call you?</Label>
                            <Input
                              placeholder="Your first name"
                              autoComplete="given-name"
                              maxLength={60}
                            />
                          </TextField>
                        )}
                        <TextField
                          isRequired
                          type="email"
                          value={email}
                          onChange={setEmail}
                          className="entry-field"
                        >
                          <Label>Email address</Label>
                          <div className="entry-input-wrap">
                            <Mail size={16} />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              autoComplete="off"
                            />
                          </div>
                        </TextField>
                        {!reset && (
                          <TextField
                            isRequired
                            value={password}
                            onChange={setPassword}
                            className="entry-field"
                          >
                            <div className="password-label">
                              <Label>Password</Label>
                              {!signup && (
                                <Button
                                  variant="ghost"
                                  onPress={() => go("reset")}
                                >
                                  Forgot password?
                                </Button>
                              )}
                            </div>
                            <div className="entry-input-wrap">
                              <LockKeyhole size={16} />
                              <Input
                                type={show ? "text" : "password"}
                                placeholder={
                                  signup
                                    ? "At least 8 characters"
                                    : "Your password"
                                }
                                autoComplete="off"
                                minLength={signup ? 8 : 1}
                              />
                              <Button
                                isIconOnly
                                variant="ghost"
                                aria-label={
                                  show ? "Hide password" : "Show password"
                                }
                                onPress={() => setShow(!show)}
                              >
                                {show ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </Button>
                            </div>
                          </TextField>
                        )}
                        {signup && (
                          <Checkbox
                            className="auth-checkbox"
                            isSelected={agree}
                            onChange={setAgree}
                          >
                            <Checkbox.Control>
                              <Checkbox.Indicator>
                                <Check size={12} />
                              </Checkbox.Indicator>
                            </Checkbox.Control>
                            <Checkbox.Content>
                              I understand this research prototype is not
                              medical advice.
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
                        <Button
                          type="submit"
                          className="entry-primary"
                          isDisabled={busy}
                        >
                          {busy
                            ? "Getting your space ready…"
                            : reset
                              ? "Reset password"
                              : signup
                                ? "Create account"
                                : "Sign in"}
                          {!busy && <ArrowRight size={17} />}
                        </Button>
                      </Form>
                      <div className="auth-divider">
                        <span />
                        or take a look around
                        <span />
                      </div>
                      <Button
                        variant="secondary"
                        className="entry-demo"
                        onPress={onEnter}
                      >
                        Explore the dashboard
                        <ArrowUpIcon />
                      </Button>
                      <p className="auth-demo-note">
                        <ShieldCheck size={13} />
                        Authentication is not connected yet. Details are not
                        sent or saved.
                      </p>
                    </Card.Content>
                  </Card>
                </motion.section>
              )}
            </AnimatePresence>
          </main>
        </div>
        <footer className="entry-footer">
          <span>
            <span className="entry-status" />A LITTLE MORE ROOM TO BREATHE
          </span>
          <span>
            Research prototype. Not for medical or emergency decisions.
          </span>
        </footer>
      </div>
    </MotionConfig>
  );
}
function ArrowUpIcon() {
  return <ChevronRight size={15} />;
}

/** Text treatments use Motion's public text guide: masked lines, split words,
 * character staggering, and clipped reveals. https://motion.dev/docs/text-animation */
function ChapterTitle({ lines, mode }: { lines: string[]; mode: number }) {
  const reduced = useReducedMotion();
  let offset = 0;
  return (
    <h1
      aria-label={lines.join(" ")}
      className={"chapter-title treatment-" + mode}
    >
      {lines.map((line, i) => {
        const units =
          mode === 1 ? line.split(" ") : mode === 2 ? Array.from(line) : [line];
        return (
          <span
            className={
              "chapter-line " + (i === lines.length - 1 ? "chapter-muted" : "")
            }
            key={line}
          >
            {units.map((unit, j) => {
              const index = offset++;
              const initial = reduced
                ? false
                : mode === 0
                  ? { y: "110%" }
                  : mode === 1
                    ? { opacity: 0, y: 18, scale: 0.9 }
                    : mode === 2
                      ? { opacity: 0, y: j % 2 ? 18 : -18, filter: "blur(5px)" }
                      : { clipPath: "inset(0 100% 0 0)", opacity: 0 };
              return (
                <span
                  className={mode === 0 ? "chapter-mask" : "chapter-unit"}
                  key={j}
                >
                  <motion.span
                    aria-hidden="true"
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                    initial={initial}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                      clipPath: "inset(0 0% 0 0)",
                    }}
                    transition={
                      mode === 1
                        ? {
                            type: "spring",
                            stiffness: 150,
                            damping: 18,
                            delay: index * 0.085,
                          }
                        : {
                            duration: mode === 3 ? 0.7 : 0.5,
                            delay: mode === 2 ? index * 0.022 : i * 0.14,
                            ease: [0.22, 1, 0.36, 1],
                          }
                    }
                  >
                    {unit}
                    {mode === 1 && j < units.length - 1 ? " " : ""}
                  </motion.span>
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}
