"use client";

import { useEffect, useRef } from "react";

function MarketOverviewWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.async = true;
    script.textContent = JSON.stringify({
      colorTheme: "dark",
      dateRange: "1D",
      showChart: true,
      locale: "en",
      width: "100%",
      height: "100%",
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      plotLineColorGrowing: "rgba(29, 155, 240, 1)",
      plotLineColorFalling: "rgba(244, 33, 46, 1)",
      gridLineColor: "rgba(47, 51, 54, 0)",
      scaleFontColor: "rgba(113, 118, 123, 1)",
      belowLineFillColorGrowing: "rgba(29, 155, 240, 0.06)",
      belowLineFillColorFalling: "rgba(244, 33, 46, 0.06)",
      belowLineFillColorGrowingBottom: "rgba(29, 155, 240, 0)",
      belowLineFillColorFallingBottom: "rgba(244, 33, 46, 0)",
      symbolActiveColor: "rgba(29, 155, 240, 0.12)",
      tabs: [
        {
          title: "Indices",
          symbols: [
            { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
            { s: "FOREXCOM:NSXUSD", d: "NASDAQ" },
            { s: "FOREXCOM:DJI", d: "Dow Jones" },
            { s: "AMEX:EWY", d: "Korea (EWY)" },
          ],
        },
        {
          title: "Stock US",
          symbols: [
            { s: "NASDAQ:AAPL", d: "Apple" },
            { s: "NASDAQ:MSFT", d: "Microsoft" },
            { s: "NASDAQ:NVDA", d: "NVIDIA" },
            { s: "NASDAQ:AMZN", d: "Amazon" },
            { s: "NASDAQ:GOOG", d: "Google" },
            { s: "NASDAQ:META", d: "Meta" },
            { s: "NASDAQ:TSLA", d: "Tesla" },
            { s: "NYSE:BRK.B", d: "Berkshire" },
          ],
        },
        {
          title: "Crypto",
          symbols: [
            { s: "BINANCE:BTCUSDT", d: "BTC" },
            { s: "BINANCE:ETHUSDT", d: "ETH" },
            { s: "BINANCE:SOLUSDT", d: "SOL" },
            { s: "BINANCE:XRPUSDT", d: "XRP" },
          ],
        },
        {
          title: "Forex",
          symbols: [
            { s: "PEPPERSTONE:DXY", d: "Dollar Index" },
            { s: "FX:USDKRW", d: "USD/KRW" },
            { s: "FX:EURUSD", d: "EUR/USD" },
            { s: "FX:USDJPY", d: "USD/JPY" },
          ],
        },
      ],
    });
    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} className="h-full" />;
}

export default function RightPanel() {
  return (
    <div className="sticky top-0 flex h-screen flex-col py-3 pl-3 pr-2">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface">
        <h2 className="shrink-0 px-4 pt-3 pb-1 text-xl font-bold">Markets</h2>
        <div className="min-h-0 flex-1">
          <MarketOverviewWidget />
        </div>
      </div>
    </div>
  );
}
