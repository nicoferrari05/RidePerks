"use client";

// WebGL dot-matrix reveal effect (react-three-fiber + a custom GLSL
// shader). Adapted from a community "sign-in-flow" component; ported to
// TypeScript and recolored for the RidePerks brand. Used exclusively on
// the isolated /admin/login page — kept out of the public site's tree,
// which uses GSAP for all of its motion (see components/ScrollAnimations.tsx).
import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

type UniformType = "uniform1f" | "uniform1i" | "uniform3f" | "uniform1fv" | "uniform3fv" | "uniform2f";

interface UniformDescriptor {
  value: number | number[] | number[][];
  type: UniformType;
}

type UniformsMap = Record<string, UniformDescriptor>;

export function CanvasRevealEffect({
  animationSpeed = 3,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[255, 255, 255]],
  containerClassName,
  dotSize = 6,
  showGradient = false,
  reverse = false,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
  reverse?: boolean;
}) {
  return (
    <div className={cn("relative h-full w-full", containerClassName)}>
      <div className="h-full w-full">
        <DotMatrix
          colors={colors}
          dotSize={dotSize}
          opacities={opacities}
          reverse={reverse}
          animationSpeed={animationSpeed}
          center={["x", "y"]}
        />
      </div>
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent" />
      )}
    </div>
  );
}

function DotMatrix({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 2,
  reverse = false,
  animationSpeed = 3,
  center = ["x", "y"],
}: {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  reverse?: boolean;
  animationSpeed?: number;
  center?: ("x" | "y")[];
}) {
  const uniforms = useMemo<UniformsMap>(() => {
    let colorsArray = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]];
    if (colors.length === 2) {
      colorsArray = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]];
    } else if (colors.length === 3) {
      colorsArray = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];
    }
    return {
      u_colors: {
        value: colorsArray.map((color) => [color[0] / 255, color[1] / 255, color[2] / 255]),
        type: "uniform3fv",
      },
      u_opacities: { value: opacities, type: "uniform1fv" },
      u_total_size: { value: totalSize, type: "uniform1f" },
      u_dot_size: { value: dotSize, type: "uniform1f" },
      u_reverse: { value: reverse ? 1 : 0, type: "uniform1i" },
      u_animation_speed: { value: animationSpeed, type: "uniform1f" },
    };
  }, [colors, opacities, totalSize, dotSize, reverse, animationSpeed]);

  return (
    <Shader
      source={`
        precision mediump float;
        in vec2 fragCoord;

        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse;
        uniform float u_animation_speed;

        out vec4 fragColor;

        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) {
            return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }

        void main() {
            vec2 st = fragCoord.xy;
            ${center.includes("x") ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));" : ""}
            ${center.includes("y") ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));" : ""}

            float opacity = step(0.0, st.x);
            opacity *= step(0.0, st.y);

            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

            float frequency = 5.0;
            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

            vec3 color = u_colors[int(show_offset * 6.0)];

            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist_from_center = distance(center_grid, st2);

            float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);
            float max_grid_dist = distance(center_grid, vec2(0.0, 0.0));
            float timing_offset_outro = (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + 42.0) * 0.2);

            float current_timing_offset;
            if (u_reverse == 1) {
                current_timing_offset = timing_offset_outro;
                opacity *= 1.0 - step(current_timing_offset, u_time * u_animation_speed);
                opacity *= clamp((step(current_timing_offset + 0.1, u_time * u_animation_speed)) * 1.25, 1.0, 1.25);
            } else {
                current_timing_offset = timing_offset_intro;
                opacity *= step(current_timing_offset, u_time * u_animation_speed);
                opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * u_animation_speed)) * 1.25, 1.0, 1.25);
            }

            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
        }
      `}
      uniforms={uniforms}
    />
  );
}

function ShaderMaterial({ source, uniforms }: { source: string; uniforms: UniformsMap }) {
  const { size } = useThree();
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const material = mesh.material as THREE.ShaderMaterial;
    material.uniforms.u_time.value = clock.getElapsedTime();
  });

  const getUniforms = () => {
    const prepared: Record<string, { value: unknown }> = {};
    for (const name in uniforms) {
      const uniform = uniforms[name];
      switch (uniform.type) {
        case "uniform1f":
        case "uniform1i":
        case "uniform1fv":
          prepared[name] = { value: uniform.value };
          break;
        case "uniform3f":
          prepared[name] = { value: new THREE.Vector3().fromArray(uniform.value as number[]) };
          break;
        case "uniform3fv":
          prepared[name] = {
            value: (uniform.value as number[][]).map((v) => new THREE.Vector3().fromArray(v)),
          };
          break;
        case "uniform2f":
          prepared[name] = { value: new THREE.Vector2().fromArray(uniform.value as number[]) };
          break;
      }
    }
    prepared["u_time"] = { value: 0 };
    prepared["u_resolution"] = { value: new THREE.Vector2(size.width * 2, size.height * 2) };
    return prepared;
  };

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        precision mediump float;
        in vec2 coordinates;
        uniform vec2 u_resolution;
        out vec2 fragCoord;
        void main(){
          gl_Position = vec4(position.x, position.y, 0.0, 1.0);
          fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
          fragCoord.y = u_resolution.y - fragCoord.y;
        }
      `,
      fragmentShader: source,
      uniforms: getUniforms(),
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, source]);

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function Shader({ source, uniforms }: { source: string; uniforms: UniformsMap }) {
  return (
    <Canvas className="absolute inset-0 h-full w-full">
      <ShaderMaterial source={source} uniforms={uniforms} />
    </Canvas>
  );
}
