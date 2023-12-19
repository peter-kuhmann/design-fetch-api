import { ExtractedDesign, ExtractedLogo, ExtractedTheme } from "@/types/theme";
import "./RenderExtractedDesign.scss";

export type RenderExtractedDesignProps = {
  extractedDesign: ExtractedDesign;
};

export default function RenderExtractedDesign({
  extractedDesign,
}: RenderExtractedDesignProps) {
  return (
    <div className={"grid grid-cols-1 md:grid-cols-2 gap-8"}>
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
            The website&apos;s code was so tangled that even the browser asked
            for directions. The CSS tried to style itself out of the mess, but
            it ended up with an identity crisis. In the end, the homepage just
            sighed and said, &quot;404: Sense of Direction Not Found.&quot;
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
