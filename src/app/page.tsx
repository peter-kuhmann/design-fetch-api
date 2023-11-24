"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ExtractedDesign, ExtractedTheme } from "@/types/theme";

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<ExtractedDesign | null>(null);

  useEffect(() => {
    if (result) {
      console.log(result);
    }
  }, [result]);

  return (
    <main className={"container py-16"}>
      <form
        className={"flex flex-col gap-4"}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();

          setFetching(true);
          setResult(null);
          axios
            .get("/api/fetch-design", {
              params: { url: inputRef.current?.value ?? "" },
            })
            .then((response) => {
              setResult(response.data as ExtractedDesign);
            })
            .finally(() => {
              setFetching(false);
            });
        }}
      >
        <label htmlFor={"websiteUrl"}>Website URL</label>
        <input
          defaultValue={"https://twitter.com"}
          id={"websiteUrl"}
          className={"input input-bordered"}
          ref={inputRef}
        />

        <button type={"submit"} className={"btn"} disabled={fetching}>
          {fetching ? (
            <span className="loading loading-spinner" />
          ) : (
            "Fetch design"
          )}
        </button>
      </form>

      {result && (
        <div className={"grid grid-cols-2 gap-8"}>
          <div style={{ backgroundColor: result.lightMode.backgroundColor }}>
            <RenderTheme theme={result.lightMode} />
          </div>

          <div style={{ backgroundColor: result.darkMode.backgroundColor }}>
            <RenderTheme theme={result.darkMode} />
          </div>
        </div>
      )}
    </main>
  );
}

function RenderTheme({ theme }: { theme: ExtractedTheme }) {
  return (
    <div>
      {theme.logo?.type === "hostedImage" && (
        <img src={theme.logo.src} className={"w-full h-auto"} />
      )}
      {theme.logo?.type === "inlinedSvg" && (
        <div dangerouslySetInnerHTML={{ __html: theme.logo.rawSvg }} />
      )}
    </div>
  );
}
