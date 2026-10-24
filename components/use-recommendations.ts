"use client";

import { useRef, useState } from "react";
import {
  loadShops,
  loadVenues,
  type ShopState,
  type VenueState,
} from "@/lib/load-recommendations";
import type { EventInput, Plan } from "@/lib/schema";

export type RecommendationSnapshot = {
  shopping: ShopState;
  venues: VenueState;
  imagePrompt: string;
};

const emptyShopping: ShopState = { status: "empty", items: [], message: "" };
const emptyVenues: VenueState = { status: "empty", venues: [], message: "" };

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Could not generate a plan. Please try again.";
}

export function useRecommendations() {
  const [shopping, setShopping] = useState<ShopState>(emptyShopping);
  const [venues, setVenues] = useState<VenueState>(emptyVenues);
  const [imagePrompt, setImagePrompt] = useState("");
  const shopRequest = useRef(0);
  const venueRequest = useRef(0);
  const shopAbort = useRef<AbortController | null>(null);
  const venueAbort = useRef<AbortController | null>(null);

  function beginShop(input: EventInput, plan: Plan) {
    shopAbort.current?.abort();
    const controller = new AbortController();
    shopAbort.current = controller;
    const id = ++shopRequest.current;
    setShopping({ status: "loading", items: [], message: "" });
    void loadShops(input, plan, controller.signal).then(
      (items) => {
        if (id !== shopRequest.current) {
          return;
        }
        setShopping(
          items.length === 0
            ? { status: "empty", items: [], message: "" }
            : { status: "ready", items, message: "" },
        );
      },
      (error: unknown) => {
        if (id !== shopRequest.current || isAbort(error)) {
          return;
        }
        setShopping({
          status: "error",
          items: [],
          message: errorMessage(error),
        });
      },
    );
  }

  function beginVenues(input: EventInput, plan: Plan) {
    venueAbort.current?.abort();
    const controller = new AbortController();
    venueAbort.current = controller;
    const id = ++venueRequest.current;
    setVenues({ status: "loading", venues: [], message: "" });
    void loadVenues(input, plan, controller.signal).then(
      (next) => {
        if (id !== venueRequest.current) {
          return;
        }
        setVenues(
          next.length === 0
            ? { status: "empty", venues: [], message: "" }
            : { status: "ready", venues: next, message: "" },
        );
      },
      (error: unknown) => {
        if (id !== venueRequest.current || isAbort(error)) {
          return;
        }
        setVenues({
          status: "error",
          venues: [],
          message: errorMessage(error),
        });
      },
    );
  }

  function start(input: EventInput, plan: Plan) {
    setImagePrompt("");
    beginShop(input, plan);
    beginVenues(input, plan);
  }

  function snapshot(): RecommendationSnapshot {
    return { shopping, venues, imagePrompt };
  }

  function restore(next: RecommendationSnapshot) {
    shopAbort.current?.abort();
    venueAbort.current?.abort();
    shopRequest.current += 1;
    venueRequest.current += 1;
    setShopping(next.shopping);
    setVenues(next.venues);
    setImagePrompt(next.imagePrompt);
  }

  return {
    shopping,
    venues,
    imagePrompt,
    setImagePrompt,
    snapshot,
    restore,
    start,
    retryShopping: beginShop,
    retryVenues: beginVenues,
  };
}
