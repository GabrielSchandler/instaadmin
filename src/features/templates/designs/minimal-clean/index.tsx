import type { TemplateConfig, SlideRenderProps } from "../../types";

function MinimalCleanSlide({ slide, position, total }: SlideRenderProps) {
  const isCover = slide.slide_type === "cover";
  const isCTA = slide.slide_type === "cta";

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
        padding: 80,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 80 }}>
        <div style={{ width: 48, height: 3, background: "#1A1A1A" }} />
        <span style={{ fontSize: 18, color: "#999999" }}>{position} / {total}</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {isCover ? (
          <>
            <div style={{ fontSize: 72, fontWeight: 800, color: "#1A1A1A", lineHeight: 1.0, letterSpacing: "-3px", marginBottom: 32 }}>
              {slide.headline}
            </div>
            {slide.subheadline && (
              <div style={{ fontSize: 26, color: "#666666", lineHeight: 1.5, maxWidth: 800 }}>
                {slide.subheadline}
              </div>
            )}
          </>
        ) : isCTA ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: "#1A1A1A", lineHeight: 1.1 }}>
              {slide.headline}
            </div>
            {slide.cta_text && (
              <div
                style={{
                  border: "3px solid #1A1A1A",
                  color: "#1A1A1A",
                  padding: "20px 48px",
                  fontSize: 24,
                  fontWeight: 700,
                  display: "inline-block",
                  alignSelf: "flex-start",
                }}
              >
                {slide.cta_text}
              </div>
            )}
          </div>
        ) : (
          <>
            {slide.headline && (
              <div style={{ fontSize: 48, fontWeight: 700, color: "#1A1A1A", lineHeight: 1.2, marginBottom: 28 }}>
                {slide.headline}
              </div>
            )}
            {slide.body && (
              <div style={{ fontSize: 28, color: "#444444", lineHeight: 1.7 }}>
                {slide.body}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ height: 3, background: "#6366F1", width: 48 }} />
    </div>
  );
}

export const minimalCleanTemplate: TemplateConfig = {
  id: "minimal-clean",
  name: "Minimal Clean",
  description: "Limpo e minimalista. Ideal para design e lifestyle.",
  primaryColor: "#FFFFFF",
  secondaryColor: "#1A1A1A",
  accentColor: "#6366F1",
  fontFamily: "Inter",
  layoutType: "minimal",
  tags: ["minimal", "clean", "lifestyle", "design"],
  renderSlide: (props) => <MinimalCleanSlide {...props} />,
};
