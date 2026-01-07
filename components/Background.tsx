import { Dithering } from "@paper-design/shaders-react";

export default function Background() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <Dithering
        style={{ height: "100%", width: "100%" }}
        colorBack="#000000"
        colorFront="#9ea2a3"
        shape="swirl"
        type="4x4"
        size={2}
        speed={1}
        scale={0.6}
      />
    </div>
  );
}
