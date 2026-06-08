import type { TemplateConfig, SlideRenderProps } from "../../types";

function DarkPremiumSlide({ slide, position, total }: SlideRenderProps) {
  const isCover = slide.slide_type === "cover";
  const isCTA = slide.slide_type === "cta";

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        background: "#111827",
        display: "flex",
        fontFamily: "serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sidebar accent */}
      <div
        style={{
          width: 8,
          background: "linear-gradient(to bottom, #F59E0B, #D97706)",
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "64px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
          <div style={{ fontSize: 14, letterSpacing: 4, color: "#F59E0B", textTransform: "uppercase" }}>
            Premium
          </div>
          <div style={{ fontSize: 18, color: "#6B7280" }}>
            {position} / {total}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {isCover ? (
            <>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 700,
                  color: "#F9FAFB",
                  lineHeight: 1.15,
                  letterSpacing: "-1px",
                  marginBottom: 28,
                  fontStyle: "italic",
                }}
              >
                {slide.headline}
              </div>
              {slide.subheadline && (
                <div style={{ fontSize: 24, color: "#9CA3AF", lineHeight: 1.6 }}>
                  {slide.subheadline}
                </div>
              )}
            </>
          ) : isCTA ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
              <div style={{ fontSize: 52, fontWeight: 700, color: "#F9FAFB", lineHeight: 1.2, fontStyle: "italic" }}>
                {slide.headline}
              </div>
              {slide.cta_text && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                    color: "#111827",
                    padding: "20px 48px",
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    alignSelf: "flex-start",
                    borderRadius: 4,
                  }}
                >
                  {slide.cta_text}
                </div>
              )}
            </div>
          ) : (
            <>
              {slide.headline && (
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 700,
                    color: "#F9FAFB",
                    lineHeight: 1.3,
                    marginBottom: 24,
                    fontStyle: "italic",
                  }}
                >
                  {slide.headline}
                </div>
              )}
              {slide.body && (
                <div style={{ fontSize: 24, color: "#D1D5DB", lineHeight: 1.8 }}>
                  {slide.body}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ height: 1, background: "linear-gradient(to right, #F59E0B, transparent)" }} />
      </div>
    </div>
  );
}

export const darkPremiumTemplate: TemplateConfig = {
  id: "dark-premium",
  name: "Dark Premium",
  description: "Premium escuro. Ideal para empreendedorismo e negócios.",
  primaryColor: "#111827",
  secondaryColor: "#F9FAFB",
  accentColor: "#F59E0B",
  fontFamily: "Playfair Display",
  layoutType: "sidebar",
  tags: ["dark", "premium", "entrepreneur", "business"],
  renderSlide: (props) => <DarkPremiumSlide {...props} />,
};
