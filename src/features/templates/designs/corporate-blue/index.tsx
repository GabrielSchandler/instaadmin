import type { TemplateConfig, SlideRenderProps } from "../../types";

function CorporateBlueSlide({ slide, position, total }: SlideRenderProps) {
  const isCover = slide.slide_type === "cover";
  const isCTA = slide.slide_type === "cta";

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        background: isCover ? "#1E3A8A" : "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
        position: "relative",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          background: isCover ? "#1E40AF" : "#1E3A8A",
          padding: "24px 64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: 40, height: 4, background: "#3B82F6", borderRadius: 2 }} />
        <span style={{ color: isCover ? "#93C5FD" : "#93C5FD", fontSize: 18, fontWeight: 600 }}>
          {position} / {total}
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "48px 64px",
          justifyContent: "center",
        }}
      >
        {isCover ? (
          <>
            <div style={{ fontSize: 64, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.1, marginBottom: 24 }}>
              {slide.headline}
            </div>
            {slide.subheadline && (
              <div style={{ fontSize: 26, color: "#BFDBFE", lineHeight: 1.5 }}>
                {slide.subheadline}
              </div>
            )}
          </>
        ) : isCTA ? (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: "#1E3A8A", lineHeight: 1.2 }}>
              {slide.headline}
            </div>
            {slide.cta_text && (
              <div
                style={{
                  background: "#1E3A8A",
                  color: "#FFFFFF",
                  padding: "20px 48px",
                  borderRadius: 8,
                  fontSize: 24,
                  fontWeight: 700,
                  alignSelf: "center",
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
                  color: "#1E3A8A",
                  lineHeight: 1.2,
                  marginBottom: 28,
                  borderLeft: "6px solid #3B82F6",
                  paddingLeft: 20,
                }}
              >
                {slide.headline}
              </div>
            )}
            {slide.body && (
              <div style={{ fontSize: 26, color: "#374151", lineHeight: 1.7 }}>
                {slide.body}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export const corporateBlueTemplate: TemplateConfig = {
  id: "corporate-blue",
  name: "Corporate Blue",
  description: "Profissional e confiável. Ideal para negócios e finanças.",
  primaryColor: "#1E3A8A",
  secondaryColor: "#FFFFFF",
  accentColor: "#3B82F6",
  fontFamily: "Inter",
  layoutType: "centered",
  tags: ["corporate", "finance", "professional", "blue"],
  renderSlide: (props) => <CorporateBlueSlide {...props} />,
};
