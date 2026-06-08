import type { TemplateConfig, SlideRenderProps } from "../../types";

function ModernGradientSlide({ slide, position, total }: SlideRenderProps) {
  const isCover = slide.slide_type === "cover";
  const isCTA = slide.slide_type === "cta";
  const gradient = "linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #F093FB 100%)";

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        background: isCover || isCTA ? gradient : "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Poppins', Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      {(isCover || isCTA) && (
        <>
          <div
            style={{
              position: "absolute",
              top: -120,
              right: -120,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -80,
              left: -80,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }}
          />
        </>
      )}

      {/* Content badge */}
      {!isCover && !isCTA && (
        <div
          style={{
            background: gradient,
            padding: "12px 24px",
            margin: 48,
            marginBottom: 0,
            borderRadius: 999,
            display: "inline-flex",
            alignSelf: "flex-start",
          }}
        >
          <span style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 700 }}>
            {position} / {total}
          </span>
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 64,
          justifyContent: "center",
        }}
      >
        {isCover ? (
          <>
            <div style={{ fontSize: 68, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.1, marginBottom: 24 }}>
              {slide.headline}
            </div>
            {slide.subheadline && (
              <div style={{ fontSize: 26, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                {slide.subheadline}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 48 }}>
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === 0 ? 32 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === 0 ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                  }}
                />
              ))}
            </div>
          </>
        ) : isCTA ? (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2 }}>
              {slide.headline}
            </div>
            {slide.cta_text && (
              <div
                style={{
                  background: "#FFFFFF",
                  color: "#764BA2",
                  padding: "20px 56px",
                  borderRadius: 999,
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
              <div style={{ fontSize: 44, fontWeight: 700, color: "#1A1A1A", lineHeight: 1.2, marginBottom: 24 }}>
                {slide.headline}
              </div>
            )}
            {slide.body && (
              <div style={{ fontSize: 26, color: "#444444", lineHeight: 1.7 }}>
                {slide.body}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export const modernGradientTemplate: TemplateConfig = {
  id: "modern-gradient",
  name: "Modern Gradient",
  description: "Vibrante e moderno. Ideal para marketing e tecnologia.",
  primaryColor: "#667EEA",
  secondaryColor: "#764BA2",
  accentColor: "#F093FB",
  fontFamily: "Poppins",
  layoutType: "overlay",
  tags: ["modern", "gradient", "marketing", "tech"],
  renderSlide: (props) => <ModernGradientSlide {...props} />,
};
