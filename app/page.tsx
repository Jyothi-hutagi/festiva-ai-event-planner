"use client";

import { useRef, useState } from "react";
import { EventColumn } from "@/components/event-column";
import { Hero } from "@/components/hero";
import { PlanColumn } from "@/components/plan-column";
import { SavedPlans } from "@/components/saved-plans";
import { PlanLoading } from "@/components/plan-loading";
import { StatusMessage } from "@/components/status-message";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toran } from "@/components/toran";
import {
  useRecommendations,
  type RecommendationSnapshot,
} from "@/components/use-recommendations";
import { BRAND_NAME } from "@/lib/brand";
import { formatINR } from "@/lib/budget";
import { eventTypeLabel } from "@/lib/invitation-copy";
import { readApiError } from "@/lib/read-api-error";
import { savePlan, type SavedPlan } from "@/lib/saved-plans";
import { PlanSchema, type EventInput, type Plan } from "@/lib/schema";
import { reapplyTicks, type TickMap } from "@/lib/ticks";

type Status = "empty" | "loading" | "error" | "ready";
type Snapshot = {
  plan: Plan;
  ticks: TickMap;
  recommendations: RecommendationSnapshot;
};
type Board = {
  plan: Plan | null;
  ticks: TickMap;
  undo: Snapshot | null;
  budgetChange: string | null;
};

const emptyBoard: Board = {
  plan: null,
  ticks: {},
  undo: null,
  budgetChange: null,
};

export default function HomePage() {
  const [input, setInput] = useState<EventInput | null>(null);
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [status, setStatus] = useState<Status>("empty");
  const [message, setMessage] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [formSeed, setFormSeed] = useState<EventInput | null>(null);
  const [viewKey, setViewKey] = useState(0);
  const [savedVersion, setSavedVersion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [arrival, setArrival] = useState(0);
  const [fresh, setFresh] = useState(false);
  const rec = useRecommendations();
  const pending = useRef(false);
  const lastInput = useRef<EventInput | null>(null);

  async function createPlan(nextInput: EventInput) {
    if (pending.current) {
      return;
    }
    pending.current = true;
    lastInput.current = nextInput;
    setInput(nextInput);
    setShowResult(false);
    setFresh(false);
    setStatus("loading");
    setMessage("");
    setBoard((current) => ({ ...current, budgetChange: null }));

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextInput),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        setStatus("error");
        setMessage(readApiError(body));
        return;
      }
      const parsed = PlanSchema.safeParse(body);
      if (!parsed.success) {
        setStatus("error");
        setMessage("Could not generate a plan. Please try again.");
        return;
      }
      setBoard({ ...emptyBoard, plan: parsed.data });
      setActiveId(null);
      setStatus("ready");
      setFresh(true);
      setArrival((key) => key + 1);
      setShowResult(true);
      setViewKey((key) => key + 1);
      // Removed automatic background calls to rec.start to avoid hitting Gemini free tier quota (15 RPM)
    } catch {
      setStatus("error");
      setMessage("Could not generate a plan. Please try again.");
    } finally {
      pending.current = false;
    }
  }

  function acceptRefined(next: Plan) {
    if (!input) {
      return;
    }
    const previous = rec.snapshot();
    setFresh(false);
    setViewKey((key) => key + 1);
    setBoard((current) => {
      if (!current.plan) {
        return { ...current, plan: next };
      }
      const previousTotal = current.plan.budget.total;
      return {
        plan: next,
        ticks: reapplyTicks(current.ticks, next.vendors),
        undo: {
          plan: current.plan,
          ticks: current.ticks,
          recommendations: previous,
        },
        budgetChange:
          previousTotal === next.budget.total
            ? null
            : `Budget changed from ${formatINR(previousTotal)} to ${formatINR(next.budget.total)}`,
      };
    });
    rec.start(input, next);
  }

  function openSaved(entry: SavedPlan) {
    const shopping = entry.recommendations?.shopping ?? [];
    const venues = entry.recommendations?.venues ?? [];
    rec.restore({
      shopping: {
        status: shopping.length === 0 ? "empty" : "ready",
        items: shopping,
        message: "",
      },
      venues: {
        status: venues.length === 0 ? "empty" : "ready",
        venues,
        message: "",
      },
      imagePrompt: entry.imagePrompt ?? "",
    });
    setInput(entry.input);
    setFormSeed(entry.input);
    setFormVersion((version) => version + 1);
    setViewKey((key) => key + 1);
    setActiveId(entry.id);
    setMessage("");
    setFresh(false);
    setShowResult(true);
    setStatus("ready");
    setBoard({
      plan: entry.plan,
      ticks: entry.ticks,
      undo: null,
      budgetChange: null,
    });
  }

  function saveCurrent() {
    if (status !== "ready" || !input || !board.plan) {
      return;
    }
    const saved = savePlan({
      id: activeId ?? undefined,
      name: `${eventTypeLabel(input.eventType)} in ${input.city}`,
      input,
      plan: board.plan,
      ticks: board.ticks,
      imagePrompt: rec.imagePrompt,
      recommendations: {
        shopping: rec.shopping.status === "loading" ? [] : rec.shopping.items,
        venues: rec.venues.status === "loading" ? [] : rec.venues.venues,
      },
    });
    if (!saved) {
      return;
    }
    setActiveId(saved.id);
    setSavedVersion((version) => version + 1);
  }

  function undoRefine() {
    if (!board.undo || !input) {
      return;
    }
    const previous = board.undo;
    const listsWereLoading =
      previous.recommendations.shopping.status === "loading" ||
      previous.recommendations.venues.status === "loading";
    if (listsWereLoading) {
      rec.start(input, previous.plan);
      rec.setImagePrompt(previous.recommendations.imagePrompt);
    } else {
      rec.restore(previous.recommendations);
    }
    setViewKey((key) => key + 1);
    setBoard({
      plan: previous.plan,
      ticks: previous.ticks,
      undo: null,
      budgetChange: null,
    });
  }

  return (
    <main className="grid gap-8 print:block">
      <Toran />
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 md:px-8">
        <div className="flex items-start justify-between gap-4 print:hidden">
          <p className="font-heading text-2xl leading-none font-semibold">
            {BRAND_NAME}
          </p>
          <ThemeToggle />
        </div>
        <div hidden={showResult} className="grid gap-8 print:hidden">
          <Hero />
          <EventColumn
            busy={status === "loading"}
            formVersion={formVersion}
            formSeed={formSeed}
            onCreate={createPlan}
          />
          {status === "loading" ? <PlanLoading /> : null}
          {status === "error" ? (
            <StatusMessage
              message={message}
              onRetry={() => {
                if (lastInput.current) void createPlan(lastInput.current);
              }}
            />
          ) : null}
          <SavedPlans
            savedVersion={savedVersion}
            onOpen={openSaved}
            onDeleted={(id) => {
              if (activeId === id) setActiveId(null);
            }}
          />
        </div>
        {showResult && board.plan && input ? (
          <PlanColumn
            key={arrival}
            plan={board.plan}
            input={input}
            ticks={board.ticks}
            budgetChange={board.budgetChange}
            canUndo={board.undo !== null}
            viewKey={viewKey}
            shopping={rec.shopping}
            venues={rec.venues}
            imagePrompt={rec.imagePrompt}
            celebrate={fresh}
            onEdit={() => {
              setShowResult(false);
              window.scrollTo(0, 0);
            }}
            onToggleTick={(key) =>
              setBoard((current) => ({
                ...current,
                ticks: { ...current.ticks, [key]: !current.ticks[key] },
              }))
            }
            onRefined={acceptRefined}
            onUndo={undoRefine}
            onRetryShopping={() => {
              if (input && board.plan) rec.retryShopping(input, board.plan);
            }}
            onRetryVenues={() => {
              if (input && board.plan) rec.retryVenues(input, board.plan);
            }}
            onImagePrompt={rec.setImagePrompt}
            onSave={saveCurrent}
          />
        ) : null}
      </div>
    </main>
  );
}
