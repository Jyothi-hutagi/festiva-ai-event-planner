export type CategoryAmount = {
  name: string;
  amount: number;
};

export type CategoryShare = CategoryAmount & {
  share: number;
};

export function perGuest(total: number, guestCount: number) {
  if (guestCount <= 0) {
    return 0;
  }
  return total / guestCount;
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function venueBudgetShare(
  categories: CategoryAmount[],
  total: number,
): CategoryShare | null {
  return (
    categoryShares(categories, total).find((category) =>
      /venue/i.test(category.name),
    ) ?? null
  );
}

export function categoryShares(
  categories: CategoryAmount[],
  total: number,
): CategoryShare[] {
  return categories.map((category) => ({
    ...category,
    share: total > 0 ? (category.amount / total) * 100 : 0,
  }));
}
