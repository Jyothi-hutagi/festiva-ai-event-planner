export function shopQuantity(guestCount: number, quantity?: number | null) {
  if (
    typeof quantity === "number" &&
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= 40
  ) {
    return quantity;
  }
  const guests = Number.isFinite(guestCount) ? Math.trunc(guestCount) : 1;
  return Math.min(40, Math.max(1, guests));
}

export function shoppingListText(
  rows: { item: string; quantity: number; store: string }[],
) {
  return rows
    .map((row) => `${row.item}, ${row.quantity}, ${row.store}`)
    .join("\n");
}
