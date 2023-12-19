import { ExtractedDesign, ExtractedLogo, ExtractedTheme } from "@/types/theme";
import "./RenderExtractedDesign.scss";

export type RenderExtractedDesignProps = {
  extractedDesign: ExtractedDesign;
};

export default function RenderExtractedDesign({
  extractedDesign,
}: RenderExtractedDesignProps) {
  return (
    <div className={"grid grid-cols-2 gap-8"}>
      <RenderExtractedTheme
        title={"Light Mode"}
        theme={extractedDesign.lightMode}
        fallbackBackground={"white"}
      />
      <RenderExtractedTheme
        title={"Dark Mode"}
        fallbackBackground={"black"}
        theme={extractedDesign.darkMode}
      />
    </div>
  );
}

function RenderExtractedTheme({
  title,
  theme,
  fallbackBackground,
}: {
  title: string;
  fallbackBackground: string;
  theme: ExtractedTheme;
}) {
  return (
    <div>
      <h2 className={"text-[1.5rem] mb-4 text-center"}>{title}</h2>

      <div
        className={"border-4 border-black"}
        style={{ background: fallbackBackground }}
      >
        <div
          className={"px-4 py-6"}
          style={{ color: theme.textColor, background: theme.backgroundColor }}
        >
          <div className={"mb-8"}>
            <RenderExtractedLogo logo={theme.logo} />
          </div>

          <p className={"mb-4 px-2"}>
            Once upon a time, in the pixelated kingdom of Lorem Ipsum, a humble
            web designer named CodeWizard struggled with bland templates. One
            day, armed with coffee and determination, he unleashed the magic of
            CSS, transforming his designs from dull to dazzling.
          </p>

          <p className={"px-2"}>
            Clients rejoiced, and CodeWizard ascended the throne of web
            greatness, ruling over a kingdom of dynamic pages and
            laughter-inducing hover effects. And they all coded happily ever
            after, embracing the quirks of divs and the joy of responsive
            layouts. The end.
          </p>
        </div>
      </div>
    </div>
  );
}

function RenderExtractedLogo({ logo }: { logo: ExtractedLogo | null }) {
  return (
    <div
      className={
        "render-extracted-logo flex flex-row items-center justify-center"
      }
    >
      {!logo ? (
        <div>Logo not found.</div>
      ) : logo.type === "hostedImage" ? (
        <img src={logo.src} alt={"Logo"} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: logo.rawSvg }} />
      )}
    </div>
  );
}
