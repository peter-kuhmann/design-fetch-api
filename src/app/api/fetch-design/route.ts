import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Page } from "puppeteer";
import { ExtractedDesign, ExtractedLogo, ExtractedTheme } from "@/types/theme";

export const dynamic = "force-dynamic"; // defaults to force-static

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url) {
    return Response.json(
      { message: "No 'url' query param given." },
      { status: 400 },
    );
  }

  const browser = await puppeteer
    .use(StealthPlugin())
    .launch({ headless: "new" });

  const context = await browser.createIncognitoBrowserContext();

  async function getThemeViaBrowser(
    url: string,
    preparer?: (page: Page) => Promise<void>,
  ) {
    const page = await context.newPage();
    if (preparer) {
      await preparer(page);
    }

    await page.setViewport({ width: 1080, height: 1024 });

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await waitForSettledContent(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForSettledContent(page);
    const theme = await extractTheme(page);

    await page.close();
    return theme;
  }

  const lightMode = await getThemeViaBrowser(url, async (page) => {
    return page.emulateMediaFeatures([
      { name: "prefers-color-scheme", value: "light" },
    ]);
  });

  const darkMode = await getThemeViaBrowser(url, async (page) => {
    return page.emulateMediaFeatures([
      { name: "prefers-color-scheme", value: "dark" },
    ]);
  });

  await browser.close();

  const design: ExtractedDesign = {
    url: url,
    lightMode,
    darkMode,
  };

  return Response.json(design);
}

async function waitForSettledContent(
  page: Page,
  timeout: number = 30000,
  checkDelay: number = 250,
) {
  const startTime = Date.now();
  const contentLengths = [];

  while (Date.now() - startTime < timeout) {
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    contentLengths.push(bodyHtml);

    if (contentLengths.length >= 3) {
      const lastThreeContentLengths = contentLengths.slice(
        contentLengths.length - 3,
        contentLengths.length,
      );

      if (
        lastThreeContentLengths.every((l) => l === lastThreeContentLengths[0])
      ) {
        break;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, checkDelay));
  }
}

async function extractTheme(page: Page): Promise<ExtractedTheme> {
  return {
    logo: await extractLogo(page),
    backgroundColor: await extractBackgroundColor(page),
  };
}

async function extractBackgroundColor(page: Page): Promise<string> {
  return page.evaluate(() => {
    return getComputedStyle(document.body).backgroundColor;
  });
}

type ImageElement = {
  tag: string;
  id?: string;
  className?: string;
  alt?: string;
  src?: string;
  isInNavigation: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  rawSvg?: string;
};

async function extractLogo(page: Page): Promise<ExtractedLogo | null> {
  const imageElements: ImageElement[] = await page.evaluate(() => {
    const imageElements = Array.from(document.querySelectorAll("img, svg"));

    const elementsWithBackgroundImages = Array.from(
      document.querySelectorAll("*:not(img):not(svg)"),
    ).filter((element) => {
      const computedStyle = getComputedStyle(element);

      return (
        computedStyle.backgroundImage.length > 0 &&
        computedStyle.backgroundImage !== "none"
      );
    });

    return [...imageElements, ...elementsWithBackgroundImages].map(
      (element) => {
        const { x, y, width, height } = element.getBoundingClientRect();
        const tag = element.tagName.toLowerCase();

        let srcValue = element.getAttribute("src");

        const backgroundImage = getComputedStyle(element).backgroundImage;
        if (backgroundImage.length > 0 && backgroundImage !== "none") {
          const match = /url\(["']([^()"']+)["']\)/.exec(backgroundImage);
          if (match) {
            srcValue = match[1];
          }
        }

        const normalizedSrc =
          srcValue && srcValue.length > 0 && srcValue !== "none"
            ? srcValue.startsWith("data:")
              ? srcValue
              : new URL(srcValue, window.location.origin).href
            : undefined;

        let rawSvg = undefined;
        if (tag === "svg") {
          const helper = document.createElement("div");
          helper.innerHTML = element.outerHTML;
          const clone = helper.firstElementChild as HTMLElement | null;

          if (clone) {
            clone.outerHTML = element.outerHTML;
            clone.style.color = getComputedStyle(element).color;
            clone.style.fill = getComputedStyle(element).fill;
            rawSvg = clone.outerHTML;
          }
        }

        let isInNavigation = false;
        let parent = element.parentElement;
        while (parent) {
          isInNavigation =
            parent.tagName.toLowerCase() === "nav" ||
            parent.tagName.toLowerCase() === "header" ||
            parent.id === "nav" ||
            parent.id === "navigation" ||
            parent.id === "header" ||
            parent.classList.contains("nav") ||
            parent.classList.contains("navigation") ||
            parent.classList.contains("header");

          if (isInNavigation) {
            break;
          }
          parent = parent.parentElement;
        }

        return {
          tag,
          id: element.id,
          className: element.classList.value,
          alt: element.getAttribute("alt") ?? undefined,
          src: normalizedSrc,
          isInNavigation: isInNavigation,
          rawSvg,
          x,
          y,
          width,
          height,
          naturalWidth:
            tag === "img"
              ? (element as HTMLImageElement).naturalWidth
              : tag === "svg"
                ? 100000
                : width,
          naturalHeight:
            tag === "img"
              ? (element as HTMLImageElement).naturalHeight
              : tag === "svg"
                ? 100000
                : height,
        };
      },
    );
  });

  const filteredImageElements = imageElements.filter((imageElement) => {
    return (
      imageElement.naturalWidth > 4 &&
      imageElement.naturalHeight > 4 &&
      imageElement.width > 4 &&
      imageElement.height > 4
    );
  });

  const filteredImageElementsWithLogoScore: {
    imageElement: ImageElement;
    score: number;
  }[] = await Promise.all(
    filteredImageElements.map((imageElement) =>
      (async () => {
        return {
          imageElement: imageElement,
          score: await computeLogoScore(imageElement, page),
        };
      })(),
    ),
  );

  filteredImageElementsWithLogoScore.sort((a, b) => b.score - a.score);

  if (filteredImageElementsWithLogoScore.length > 0) {
    const extractedLogoElement = filteredImageElementsWithLogoScore[0];

    if (extractedLogoElement.imageElement.rawSvg) {
      return {
        type: "inlinedSvg",
        rawSvg: extractedLogoElement.imageElement.rawSvg,
      };
    }

    if (extractedLogoElement.imageElement.src) {
      return {
        type: "hostedImage",
        src: extractedLogoElement.imageElement.src,
      };
    }
  }

  return null;
}

async function computeLogoScore(element: ImageElement, page: Page) {
  const weights = {
    aboveTheFoldScore: 24,
    domTreeLocationScore: 14,
    idScore: 10,
    altScore: 10,
    classScore: 10,
    filenameScore: 10,
    sizeScore: 6,
    screenPositionScore: 3,
    aspectRatioScore: 4,
  };

  return (
    computeLogoAboveTheFoldScore(element, page) * weights.aboveTheFoldScore +
    computeLogoIdScore(element) * weights.idScore +
    (await computeLogoFilenameScore(element, page)) * weights.filenameScore +
    computeLogoClassScore(element) * weights.classScore +
    computeLogoScreenPositionScore(element, page) *
      weights.screenPositionScore +
    computeLogoAspectRationScore(element) * weights.aspectRatioScore +
    computeLogoDomTreeLocationScore(element) * weights.domTreeLocationScore +
    (await computeLogoSizeScore(element, page)) * weights.sizeScore +
    computeLogoAltScore(element, page) * weights.altScore
  );
}

function computeLogoAboveTheFoldScore(element: ImageElement, page: Page) {
  const viewport = page.viewport();
  if (viewport) {
    const viewportHeight = viewport.height;

    if (element.y + element.height <= viewportHeight) {
      return 1.0;
    }

    if (element.y <= viewportHeight * 1.05) {
      return 0.4;
    }
  }

  return 0;
}

function computeLogoIdScore(element: ImageElement) {
  if (element.id && element.id.includes("logo")) {
    return 0.5 + ("logo".length / element.id.length) * 0.5;
  }

  if (element.id && element.id.includes("brand")) {
    return 0.5 + ("brand".length / element.id.length) * 0.5;
  }

  return 0;
}

function computeLogoClassScore(element: ImageElement) {
  if (element.className && element.className.includes("logo")) {
    return 0.5 * ("logo".length / element.className.length) * 0.5;
  }

  if (element.className && element.className.includes("brand")) {
    return 0.5 * ("brand".length / element.className.length) * 0.5;
  }

  return 0;
}

function computeLogoAltScore(element: ImageElement, page: Page) {
  if (element.alt) {
    const url = new URL(page.url());
    const domainNameMatch = /^[^.]+/.exec(url.host);

    if (
      domainNameMatch &&
      element.alt.toLowerCase() === domainNameMatch[0].toLowerCase()
    ) {
      return 1.0;
    }

    if (element.alt.includes("logo")) {
      return 0.5 * ("logo".length / element.alt.length) * 0.3;
    }

    if (element.alt.includes("brand")) {
      return 0.5 * ("brand".length / element.alt.length) * 0.3;
    }

    const tokens = element.alt.toLowerCase().trim().split(" ");
    const someTokenInHost = tokens.some(
      (token) => url.host.includes(token) || token.includes(url.host),
    );
    if (someTokenInHost) {
      return 0.3;
    }
  }

  return 0;
}

async function computeLogoFilenameScore(element: ImageElement, page: Page) {
  if (element.src && !element.src.startsWith("data:")) {
    const filenameMatch = /\/?([^\/.]+)(.[a-zA-Z0-9]+)$/.exec(element.src);

    if (filenameMatch) {
      const filename = filenameMatch[1];
      return 0.5 + ("logo".length / filename.length) * 0.5;
    }
  }

  return 0;
}

function computeLogoScreenPositionScore(element: ImageElement, page: Page) {
  const viewport = page.viewport();
  if (viewport) {
    if (element.y <= viewport.height) {
      return (viewport.height - element.y) / viewport.height;
    }
  }

  return 0;
}

function computeLogoAspectRationScore(element: ImageElement) {
  const aspectRatio = element.width / element.height;

  if (aspectRatio > 2) return 1.0;
  if (aspectRatio > 1.2) return 0.85;
  if (aspectRatio > 1.0) return 0.4;
  if (aspectRatio > 0.8) return 0.2;

  return 0;
}

function computeLogoDomTreeLocationScore(element: ImageElement) {
  if (element.isInNavigation) {
    return 1.0;
  }

  return 0;
}

async function computeLogoSizeScore(element: ImageElement, page: Page) {
  const documentFontSize = await page.evaluate(() => {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  });

  if (element.height > 7 * documentFontSize) {
    return 1.0;
  }

  if (element.height > 2.5 * documentFontSize) {
    return (
      0.5 +
      ((element.height - 2.5 * documentFontSize) /
        ((7 - 2.5) * documentFontSize)) *
        0.5
    );
  }

  return 0;
}
