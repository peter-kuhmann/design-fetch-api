export type ExtractedDesign = {
  url: string;
  lightMode: ExtractedTheme;
  darkMode: ExtractedTheme;
};

export type ExtractedTheme = {
  logo: ExtractedLogo | null;
  backgroundColor: string;
};

export type ExtractedLogo =
  | { type: "hostedImage"; src: string }
  | { type: "inlinedSvg"; rawSvg: string };
