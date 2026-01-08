import { Dithering } from "@paper-design/shaders-react";

export default function Background() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <Dithering
        style={{ height: "100%", width: "100%" }}
        colorBack="#000000"
        colorFront="#788387"
        shape="wave"
        type="4x4"
        size={6.6}
        speed={0.76}
        scale={2.2}
        rotation={264}
        offsetX={0.16}
      />
    </div>
  );
}
