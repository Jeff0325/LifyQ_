import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { answerCrossDomain } from '@/features/assistant/context-engine/mockContextEngine';
import { useSpeechSynthesis } from '@/features/assistant/hooks/useSpeechSynthesis';
import { looksLikeQuery } from '@/features/assistant/ice/extractionRules';
import { mockICEEngine } from '@/features/assistant/ice/mockICEEngine';
import { generateDailyBriefing } from '@/features/assistant/mock/dailyBriefing';
import { tryNavigationCommand } from '@/features/assistant/mock/navigationCommands';
import { buildOnboardingGreeting } from '@/features/assistant/mock/onboardingGreeting';
import { generateProactiveInsight } from '@/features/assistant/mock/proactiveInsights';
import {
  suggestNextSteps,
  type SuggestionChip,
} from '@/features/assistant/mock/suggestNextSteps';
import type {
  CaptureSourceType,
  ChatMessage,
  StructuredCapture,
} from '@/features/assistant/types';
import { useProfileStore } from '@/features/settings/store';
import { useJarvisStore } from '@/stores/useJarvisStore';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

export type ConversationPhase =
  'idle' | 'listening' | 'understanding' | 'thinking' | 'speaking' | 'ready';

export interface UseConversationManagerResult {
  messages: ChatMessage[];
  phase: ConversationPhase;
  isThinking: boolean;
  isStreaming: boolean;
  isInitializing: boolean;
  error: boolean;
  capture: StructuredCapture | null;
  suggestions: SuggestionChip[];
  dismissCapture: () => void;
  sendMessage: (text: string, sourceType?: CaptureSourceType) => Promise<void>;
  /** Called by `CaptureConfirmSheet` after a successful save — closes the
   * lifecycle loop ("Done — I've added X") and updates Session Memory so a
   * later pronoun follow-up ("move it to Friday") can resolve. */
  reportCompletion: (label: string, domain: string, entityRef?: string) => void;
}

function acknowledgment(proposalCount: number): string {
  return proposalCount === 1
    ? "I've got the details ready — take a quick look before I save it."
    : `I've pulled together ${proposalCount} things to add — take a look before I save them.`;
}

const ANAPHORA_PATTERN =
  /\b(?:about|regarding|on)\s+(?:this|that|it)\b|\b(?:this|that|it)[?.!]?\s*$/i;

function tryContextAwareAnswer(
  message: string,
  context: { label: string; summary: string } | null,
): string | null {
  if (!context || !ANAPHORA_PATTERN.test(message)) return null;
  return `You're looking at ${context.label} — ${context.summary}`;
}

interface LastDiscussedEntity {
  domain: string;
  label: string;
  entityRef?: string;
}

/**
 * One-hop conversation memory, not full multi-turn slot-filling (that
 * would need real NLU — out of scope for a pattern-matched mock). Before
 * a message reaches `extract()`, a bare pronoun ("move it to Friday") gets
 * substituted with the last-discussed entity's own label so ICE's
 * existing fuzzy-title-match still finds it; "add X" right after a
 * grocery-list capture is nudged onto the grocery rule the same way.
 */
function resolveWithSessionMemory(
  text: string,
  entity: LastDiscussedEntity | null,
): string {
  if (!entity) return text;
  if (/\b(it|that)\b/i.test(text)) {
    return text.replace(/\b(it|that)\b/i, entity.label);
  }
  if (entity.domain === 'grocery-list-item' && /^add\s+/i.test(text.trim())) {
    return text.trim().replace(/^add\s+/i, 'buy ');
  }
  return text;
}

/** Domain-priming prefixes used only to re-run `extract()` — never shown
 * to the user, never sent as the displayed message. See the
 * context-biased capture routing note in `sendMessage`. */
const CONTEXT_DOMAIN_PRIMER: Partial<Record<string, string>> = {
  bill: 'bill: ',
  reminder: 'remind me to ',
  'health-medicine': 'medicine: ',
  'grocery-list-item': 'buy ',
  'calendar-event': 'schedule ',
};

/** Topic chips shown alongside the first greeting — the same examples from
 * the intro script, each already answerable from what's in the repositories
 * today, so a click gets a real answer immediately. */
const ONBOARDING_TOPICS: SuggestionChip[] = [
  {
    label: "What's on my schedule today?",
    kind: 'ask',
    prompt: "What's on my schedule today?",
  },
  {
    label: 'What bills are due this week?',
    kind: 'ask',
    prompt: 'What bills are due this week?',
  },
  {
    label: 'When does my passport expire?',
    kind: 'ask',
    prompt: 'When does my passport expire?',
  },
  {
    label: 'Add coffee, eggs, and milk',
    kind: 'ask',
    prompt: 'Add coffee, eggs, and milk to my grocery list.',
  },
];

const STREAM_CHARS_PER_TICK = 2;
const STREAM_TICK_MS = 16;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * LifyQ's Conversation Manager — the orchestration layer between Jarvis's
 * UI and the existing engines (`Jarvis UI → Conversation Manager → ICE →
 * Context Engine → Repositories`). Five responsibilities stay explicitly
 * separated so a real AI provider can replace MockAI later by touching
 * only the AI Provider piece: Conversation History (`messages`), Session
 * Memory (future: last-discussed entity/intent), Application Context
 * (`useJarvisStore.activeContext`), Personal Knowledge (the domain
 * repositories, called via ICE/Context Engine, never merged in here), and
 * the AI Provider itself (`mockICEEngine`, untouched).
 */
export function useConversationManager(): UseConversationManagerResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isUnderstanding, setIsUnderstanding] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(false);
  const [capture, setCapture] = useState<StructuredCapture | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionChip[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [lastDiscussedEntity, setLastDiscussedEntity] =
    useState<LastDiscussedEntity | null>(null);
  const speech = useSpeechSynthesis();
  const activeContext = useJarvisStore((state) => state.activeContext);
  const voiceEnabled = useJarvisStore((state) => state.voiceEnabled);
  const panelState = useJarvisStore((state) => state.panelState);
  const minimizePanel = useJarvisStore((state) => state.minimizePanel);
  const hasSeenIntro = useJarvisStore((state) => state.hasSeenIntro);
  const completeIntro = useJarvisStore((state) => state.completeIntro);
  const firstName =
    useProfileStore((state) => state.name.split(' ')[0]) || 'there';
  const onboardingFocusAreas = useOnboardingStore(
    (state) => state.focusAreas,
  );
  const navigate = useNavigate();
  const hasGreetedRef = useRef(false);

  const pushAssistantMessage = useCallback(
    async (content: string) => {
      const id = crypto.randomUUID();
      const assistantMessage: ChatMessage = {
        id,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, assistantMessage]);
      if (voiceEnabled) speech.speak(content);

      const setContent = (partial: string) =>
        setMessages((current) =>
          current.map((message) =>
            message.id === id ? { ...message, content: partial } : message,
          ),
        );

      if (prefersReducedMotion()) {
        setContent(content);
        return;
      }

      setIsStreaming(true);
      for (
        let i = STREAM_CHARS_PER_TICK;
        i < content.length;
        i += STREAM_CHARS_PER_TICK
      ) {
        setContent(content.slice(0, i));
        await new Promise((resolve) => setTimeout(resolve, STREAM_TICK_MS));
      }
      setContent(content);
      setIsStreaming(false);
    },
    [speech, voiceEnabled],
  );

  const sendMessage = useCallback(
    async (text: string, sourceType: CaptureSourceType = 'text') => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, userMessage]);
      setIsUnderstanding(true);
      setError(false);

      try {
        // Priority 1 — Information Request. "Tell me", "give me", "show me",
        // "explain", "what/when/how…" (and bare "this/that/it" resolved
        // against the active page context) always answer from existing
        // data and never fall through to navigation or a create/update
        // proposal, no matter what domain keywords they also contain.
        const contextAnswer = tryContextAwareAnswer(trimmed, activeContext);
        if (contextAnswer) {
          setIsUnderstanding(false);
          void pushAssistantMessage(contextAnswer);
          setSuggestions(suggestNextSteps(trimmed + ' ' + contextAnswer));
          return;
        }

        const isInformationRequest = looksLikeQuery(trimmed);
        if (isInformationRequest) {
          setIsUnderstanding(false);
          setIsThinking(true);
          const reply =
            (await answerCrossDomain(trimmed)) ??
            (await mockICEEngine.converse([...messages, userMessage], trimmed));
          setIsThinking(false);
          void pushAssistantMessage(reply);
          setSuggestions(suggestNextSteps(trimmed + ' ' + reply));
          return;
        }

        // Priority 2 — Navigation Command. Only unambiguous verb+noun
        // phrasing ("open bills", "go to calendar") — never bare "show",
        // which collides with "show me X" information requests above.
        const navigation = tryNavigationCommand(trimmed);
        if (navigation) {
          setIsUnderstanding(false);
          navigate(navigation.route);
          minimizePanel();
          void pushAssistantMessage(`Opening ${navigation.label}.`);
          return;
        }

        // Priority 3 — Create/Update Intent.
        let result = await mockICEEngine.extract({
          sourceType,
          text: resolveWithSessionMemory(trimmed, lastDiscussedEntity),
        });

        // Context-biased capture routing — only overrides the generic
        // `taskRule` catch-all (the single weakest signal: every other
        // domain's own keyword already won if it matched), and only when
        // the current page maps to one of ICE's wired domains. A confident
        // keyword match is never second-guessed.
        const contextDomain = activeContext?.domain;
        const primer = contextDomain
          ? CONTEXT_DOMAIN_PRIMER[contextDomain]
          : undefined;
        if (
          primer &&
          contextDomain !== 'task' &&
          result.proposals.length === 1 &&
          result.proposals[0]!.domain === 'task'
        ) {
          result = await mockICEEngine.extract({
            sourceType,
            text: primer + trimmed,
          });
        }
        setIsUnderstanding(false);

        if (result.proposals.length > 0) {
          setCapture(result);
          const clarifying = result.proposals.find(
            (p) => p.clarifyingQuestion,
          )?.clarifyingQuestion;
          const ack = clarifying ?? acknowledgment(result.proposals.length);
          void pushAssistantMessage(ack);
          setSuggestions(suggestNextSteps(trimmed + ' ' + ack));
          return;
        }

        setIsThinking(true);
        const reply =
          (await answerCrossDomain(trimmed)) ??
          (await mockICEEngine.converse([...messages, userMessage], trimmed));
        setIsThinking(false);
        void pushAssistantMessage(reply);

        setSuggestions(suggestNextSteps(trimmed + ' ' + reply));
      } catch {
        setError(true);
        setIsUnderstanding(false);
        setIsThinking(false);
      }
    },
    [
      messages,
      activeContext,
      lastDiscussedEntity,
      pushAssistantMessage,
      navigate,
      minimizePanel,
    ],
  );

  const reportCompletion = useCallback(
    (label: string, domain: string, entityRef?: string) => {
      setLastDiscussedEntity({ domain, label, entityRef });
      const message = entityRef
        ? `All set — I've updated "${label}" for you.`
        : `All set — "${label}" is added. Anything else you'd like me to take care of?`;
      void pushAssistantMessage(message);
      setSuggestions(suggestNextSteps(`${domain} ${label}`));
    },
    [pushAssistantMessage],
  );

  // Intelligent greeting — fires once per fresh conversation (every fresh
  // page load, since history isn't persisted), typed straight into the chat
  // thread like any other reply. The full introduction only ever plays
  // once, the very first time the user opens Jarvis (`hasSeenIntro`
  // persisted); every open after that gets a short, time-of-day, grounded-
  // in-repositories contextual greeting instead — reusing the exact same
  // summarizers the Dashboard already uses.
  useEffect(() => {
    if (panelState !== 'expanded') return;
    if (hasGreetedRef.current || messages.length > 0) {
      hasGreetedRef.current = true;
      return;
    }
    hasGreetedRef.current = true;
    setIsInitializing(true);
    void (async () => {
      // A brief "Initializing Jarvis…" beat in the chat box itself before
      // the greeting reveals — mirrors the boot moment observed in KURAMA.
      const [, hour] = await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 900)),
        Promise.resolve(new Date().getHours()),
      ]);

      if (!hasSeenIntro) {
        completeIntro();
        setIsInitializing(false);
        void pushAssistantMessage(
          buildOnboardingGreeting(onboardingFocusAreas),
        );
        setSuggestions(ONBOARDING_TOPICS);
        return;
      }

      const timeGreeting =
        hour < 12
          ? 'Good morning'
          : hour < 18
            ? 'Good afternoon'
            : 'Good evening';
      const [briefing, insight] = await Promise.all([
        generateDailyBriefing(),
        generateProactiveInsight(),
      ]);
      const body = briefing.startsWith('Nothing urgent')
        ? 'Everything looks up to date. What would you like to do?'
        : insight
          ? `${briefing} ${insight}`
          : briefing;
      setIsInitializing(false);
      void pushAssistantMessage(`${timeGreeting}, ${firstName}. ${body}`);
      setSuggestions(ONBOARDING_TOPICS);
    })();
  }, [
    panelState,
    messages.length,
    hasSeenIntro,
    completeIntro,
    firstName,
    onboardingFocusAreas,
    pushAssistantMessage,
  ]);

  const dismissCapture = useCallback(() => setCapture(null), []);

  const phase: ConversationPhase =
    panelState === 'listening'
      ? 'listening'
      : isUnderstanding
        ? 'understanding'
        : isThinking
          ? 'thinking'
          : isStreaming || speech.isSpeaking
            ? 'speaking'
            : messages.length === 0
              ? 'idle'
              : 'ready';

  return {
    messages,
    phase,
    isThinking,
    isStreaming,
    isInitializing,
    error,
    capture,
    suggestions,
    dismissCapture,
    sendMessage,
    reportCompletion,
  };
}
