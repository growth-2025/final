import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // always run on request (no static cache)
// or: export const revalidate = 300; // cache for 5 min if you prefer

type TopMover = {
  stockSymbol: string;
  companyName: string;
  closingPrice: number;
  percentChange: number;
  amount?: number;
  asOfDateString?: string;
  // ...add other fields if you need them
};

type ApiShape = {
  statusCode: number;
  message: string;
  result: TopMover[];
};

export async function GET(req: Request) {
  try {
    // pass through query params, with sensible defaults
    const { searchParams } = new URL(req.url);
    const indicator = searchParams.get("indicator") ?? "gainers";
    // sectorCode param on that API can be blank, but we’ll forward whatever you send
    const sectorCode = searchParams.get("sectorCode") ?? "";

    const upstream = new URL(
      "https://www.nepalipaisa.com/api/GetTopMarketMovers"
    );
    upstream.searchParams.set("indicator", indicator);
    if (sectorCode !== "") upstream.searchParams.set("sectorCode", sectorCode);
    else upstream.searchParams.set("sectorCode", ""); // keep parity with your screenshot

    const res = await fetch(upstream.toString(), {
      // Avoid caching stale results while you’re building
      cache: "no-store",
      // If that API ever requires headers, add them here
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error ${res.status}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as ApiShape;

    if (data.statusCode !== 200) {
      return NextResponse.json(
        { error: data.message ?? "Unexpected API response" },
        { status: 502 }
      );
    }

    // Return only what your UI needs (or return data as-is)
    return NextResponse.json({ items: data.result }, { status: 200 });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { error: "Failed to fetch market movers" },
      { status: 500 }
    );
  }
}
