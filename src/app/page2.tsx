"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ExtractedDesign, ExtractedTheme } from "@/types/theme";
import Image from "next/image";

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
      <Image
        className={"h-[4rem] w-auto absolute top-[10%] left-[5%]"}
        src={"/h-1.svg"}
        alt={"house"}
        width={200}
        height={200}
      />

      <h1 className={"leading-[100%]"}>
        design
        <br />
        fetch api
      </h1>

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
          <RenderTheme theme={result.lightMode} />
          <RenderTheme theme={result.darkMode} />
        </div>
      )}
    </main>
  );
}

function RenderTheme({ theme }: { theme: ExtractedTheme }) {
  return (
    <div
      className={"rounded-lg p-4"}
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <div className={"mb-4"}>Theme</div>

      {theme.logo?.type === "hostedImage" && (
        <img src={theme.logo.src} className={"w-full h-auto"} />
      )}
      {theme.logo?.type === "inlinedSvg" && (
        <div dangerouslySetInnerHTML={{ __html: theme.logo.rawSvg }} />
      )}
    </div>
  );
}
