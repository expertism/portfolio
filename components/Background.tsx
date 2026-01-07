import { Dithering } from "@paper-design/shaders-react";

export default function Background() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <Dithering
        style={{ height: "100%", width: "100%" }}
        colorBack={"hsl(0, 0%, 0%)"}
        colorFront={"hsl(0, 0%, 70%)"}
        type="8x8"
        pxSize={3}
        offsetX={0}
        offsetY={0}
        scale={1}
        rotation={0}
        speed={0.1}
      />
    </div>
  );
}
