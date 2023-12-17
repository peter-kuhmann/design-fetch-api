"use client";

import Image from "next/image";
import axios from "axios";
import { ExtractedDesign } from "@/types/theme";
import { useRef, useState } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<ExtractedDesign | null>(null);

  return (
    <main className={"flex flex-row gap-12 px-8 py-16 max-w-[60rem] mx-auto"}>
      <div className={""}>
        <Image
          className={
            "h-[11rem] w-auto hover:rotate-[-8deg] hover:scale-105 cursor-pointer"
          }
          src={"/h-1.svg"}
          alt={"house"}
          width={200}
          height={200}
        />
      </div>

      <div className={"flex-grow"}>
        <h1 className={"leading-[100%] mb-12 -skew-x-6"}>
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
          <input
            className={
              "border-4 border-black px-6 py-2 text-[1.5rem] rotate-[-1deg] -skew-x-6 -translate-x-8"
            }
            placeholder={"Enter a web address"}
            id={"websiteUrl"}
            ref={inputRef}
          />

          <button
            type={"submit"}
            className={
              "bg-black text-white px-6 py-2 text-[1.5rem] rotate-[-1deg] -skew-x-6"
            }
            disabled={fetching}
          >
            {fetching ? (
              <span className="loading loading-spinner" />
            ) : (
              <span className={"inline-flex items-center gap-4"}>
                {fetching ? "Doing magic" : "Fetch design"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
              </span>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
