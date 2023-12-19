"use client";

import Image from "next/image";
import axios from "axios";
import { ExtractedDesign } from "@/types/theme";
import { useRef, useState } from "react";
import clsx from "clsx";
import RenderExtractedDesign from "@/components/RenderExtractedDesign";

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<ExtractedDesign | null>(null);

  return (
    <main
      className={"px-16 pt-24 pb-32 min-h-screen flex flex-col justify-center"}
    >
      <div className={"w-full max-w-[40rem] mx-auto"}>
        <div
          className={
            "flex flex-row gap-6 md:gap-10 lg:gap-12 justify-center pr-12 relative"
          }
        >
          <div
            className={
              "absolute top-[-2rem] right-0 bg-red-700 text-white px-4 py-0.5 rotate-[-4deg] -skew-x-3"
            }
          >
            experimental
          </div>

          <Image
            className={
              "h-[7rem] md:h-[9rem] lg:h-[11rem] w-auto hover:rotate-[-8deg] hover:scale-105"
            }
            src={"/h-1.svg"}
            alt={"house"}
            width={200}
            height={200}
          />

          <h1 className={"leading-[100%] mb-12 -skew-x-6"}>
            design
            <br />
            fetch api
          </h1>
        </div>

        <form
          className={"flex flex-col gap-4"}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();

            const urlValue = (inputRef.current?.value ?? "").trim();
            if (urlValue.length === 0) {
              inputRef.current?.focus();
              return;
            }

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
          <input
            className={clsx(
              "border-4 border-black px-6 py-2 text-[1.5rem] rotate-[-1deg] -skew-x-6 -translate-x-4 placeholder-gray-500",
              "focus:outline-none focus:ring-4 focus:ring-sky-500",
            )}
            placeholder={"enter a domain"}
            id={"websiteUrl"}
            ref={inputRef}
          />

          <button
            type={"submit"}
            className={clsx(
              "bg-black text-white px-6 py-2 text-[1.5rem] rotate-[-1deg] -skew-x-6 translate-x-4 hover:scale-105 hover:rotate-[-1.5deg]",
              "disabled:bg-neutral-500 focus:outline-none focus:ring-4 focus:ring-sky-500",
            )}
            disabled={fetching}
          >
            {fetching ? (
              <span>doing magic ...</span>
            ) : (
              <span className={"inline-flex items-center gap-4"}>
                fetch design
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
              </span>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className={"w-full max-w-[60rem] mx-auto mt-24"}>
          <RenderExtractedDesign extractedDesign={result} />
        </div>
      )}
    </main>
  );
}
