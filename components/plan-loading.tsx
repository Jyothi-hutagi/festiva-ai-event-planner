"use client";

import { useEffect, useState } from "react";
import { LoadingBlock } from "@/components/loading-block";
import { planLoadingMessages, startLoadingCycle } from "@/lib/loading-cycle";

export function PlanLoading() {
  const [message, setMessage] = useState<string>(planLoadingMessages[0]);

  useEffect(() => startLoadingCycle(planLoadingMessages, setMessage), []);

  return <LoadingBlock message={message} />;
}
