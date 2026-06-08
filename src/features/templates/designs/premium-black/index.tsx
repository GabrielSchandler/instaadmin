import type { TemplateConfig, SlideRenderProps } from "../../types";

function PremiumBlackSlide({ slide, position, total }: SlideRenderProps) {
  const isCover = slide.slide_type === "cover";
  const isCTA = slide.slide_type === "cta";

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        background: isCover ? "#0A0A0A" : "#111111",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent line top */}
      <div style={{ height: 4, background: "#FF3B30", width: "100%" }} />

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "64px",
          justifyContent: isCover ? "center" : "space-between",
        }}
      >
        {isCover ? (
          <>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1.1,
                letterSpacing: "-2px",
                marginBottom: 24,
              }}
            >
              {slide.headline}
            </div>
            {slide.subheadline && (
              <div style={{ fontSize: 28, color: "#AAAAAA", lineHeight: 1.4 }}>
                {slide.subheadline}
              </div>
            )}
          </>
        ) : isCTA ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 32,
            }}
          >
            <div style={{ fontSize: 56, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2 }}>
              {slide.headline}
            </div>
            {slide.cta_text && (
              <div
                style={{
                  background: "#FF3B30",
                  color: "#FFFFFF",
                  padding: "20px 48px",
                  borderRadius: 8,
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {slide.cta_text}
              </div>
            )}
          </div>
        ) : (
          <>
            <div>
              {slide.headline && (
                <div style={{ fontSize: 48, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2, marginBottom: 24 }}>
                  {slide.headline}
                </div>
              )}
              {slide.body && (
                <div style={{ fontSize: 28, color: "#CCCCCC", lineHeight: 1.6 }}>
                  {slide.body}
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 2, background: "#FF3B30" }} />
              <span style={{ color: "#666666", fontSize: 20 }}>
                {position} / {total}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const premiumBlackTemplate: TemplateConfig = {
  id: "premium-black",
  name: "Premium Black",
  description: "Elegante, impactante. Ideal para luxury e premium.",
  primaryColor: "#0A0A0A",
  secondaryColor: "#FFFFFF",
  accentColor: "#FF3B30",
  fontFamily: "Inter",
  layoutType: "split",
  tags: ["luxury", "premium", "dark", "business"],
  renderSlide: (props) => <PremiumBlackSlide {...props} />,
};
