import satori from "satori";
import sharp from "sharp";
import type { CarouselSlide } from "@/types/database";
import type { TemplateConfig } from "@/features/templates/types";
import { logger } from "@/lib/logger";

const SLIDE_SIZE = 1080;

async function loadFont(fontFamily: string): Promise<ArrayBuffer> {
  const fontMap: Record<string, string> = {
    Inter: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff",
    Poppins: "https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff",
  };

  const url = fontMap[fontFamily] ?? fontMap.Inter;
  const res = await fetch(url);
  return res.arrayBuffer();
}

export async function renderSlideToBuffer(
  slide: CarouselSlide,
  template: TemplateConfig,
  totalSlides: number
): Promise<Buffer> {
  const start = Date.now();

  try {
    const fontData = await loadFont(template.fontFamily);

    const element = template.renderSlide({
      slide,
      template,
      position: slide.position,
      total: totalSlides,
    });

    const svg = await satori(element, {
      width: SLIDE_SIZE,
      height: SLIDE_SIZE,
      fonts: [
        {
          name: template.fontFamily,
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    });

    const pngBuffer = await sharp(Buffer.from(svg))
      .png({ quality: 95, compressionLevel: 6 })
      .toBuffer();

    logger.debug("Slide rendered", {
      slideId: slide.id,
      position: slide.position,
      duration: Date.now() - start,
    });

    return pngBuffer;
  } catch (err) {
    logger.error("Slide render failed", { slideId: slide.id, err });
    throw err;
  }
}
