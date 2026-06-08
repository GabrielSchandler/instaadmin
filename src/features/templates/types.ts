import type { CarouselSlide } from "@/types/database";

export interface SlideRenderProps {
  slide: CarouselSlide;
  template: TemplateConfig;
  position: number;
  total: number;
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  layoutType: "split" | "centered" | "sidebar" | "overlay" | "minimal";
  tags: string[];
  renderSlide: (props: SlideRenderProps) => React.ReactElement;
}
