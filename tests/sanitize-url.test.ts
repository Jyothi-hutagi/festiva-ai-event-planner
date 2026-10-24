import { describe, expect, it } from "vitest";
import { filterToSources, sanitizeUrl } from "@/lib/sanitize-url";

describe("sanitizeUrl", () => {
  it("returns the hostname and strips credentials", () => {
    expect(sanitizeUrl("https://user:pass@Shop.Example.com/paint")).toBe(
      "shop.example.com",
    );
    expect(sanitizeUrl("http://shop.example/paint")).toBe("shop.example");
  });

  it("rejects javascript, data, and malformed urls", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeUrl("data:text/html,hi")).toBeNull();
    expect(sanitizeUrl("not a url")).toBeNull();
    expect(sanitizeUrl("")).toBeNull();
    expect(sanitizeUrl("ftp://shop.example/paint")).toBeNull();
  });
});

describe("filterToSources", () => {
  it("drops links that are not in the sources", () => {
    const sources = [
      { uri: "https://user:pass@shop.example/paint", title: "Shop" },
    ];
    const items = [
      { item: "Paint", url: "https://shop.example/paint" },
      { item: "Other", url: "https://other.example/paint" },
      { item: "Bad", url: "javascript:alert(1)" },
    ];
    expect(filterToSources(items, sources)).toEqual([
      { item: "Paint", url: "https://shop.example/paint" },
    ]);
  });

  it("drops venue links that are not in the sources", () => {
    const sources = [{ uri: "https://hall.example/book" }];
    const venues = [
      { name: "Garden Hall", url: "https://hall.example/book" },
      { name: "Other Hall", url: "https://other.example/book" },
    ];
    expect(filterToSources(venues, sources)).toEqual([
      { name: "Garden Hall", url: "https://hall.example/book" },
    ]);
  });
});
