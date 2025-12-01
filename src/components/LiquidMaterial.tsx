import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

const LiquidMaterial = shaderMaterial(
  // Uniforms: variables que pasamos desde React al shader
  {
    uTime: 0,
    uColor: new THREE.Color("#FFD700"),
    uAmplitude: 0.03, // Altura de las olas
    uFrequency: new THREE.Vector2(10, 5), // Frecuencia de las olas en X y Y
  },
  // Vertex Shader: posiciona los vértices del objeto
  `
    uniform float uTime;
    uniform float uAmplitude;
    uniform vec2 uFrequency;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      
      // Calcular la ondulación usando seno y coseno
      float waveX = sin(modelPosition.x * uFrequency.x + uTime * 0.5);
      float waveY = cos(modelPosition.y * uFrequency.y + uTime * 0.3);
      
      // Aplicar la ondulación a la posición Z (altura de la superficie)
      modelPosition.z += (waveX + waveY) * uAmplitude;

      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;

      gl_Position = projectedPosition;
    }
  `,
  // Fragment Shader: colorea cada píxel del objeto
  `
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      // Añadir un ligero gradiente para dar profundidad
      float gradient = 1.0 - vUv.y;
      vec3 finalColor = uColor * (0.8 + gradient * 0.4);
      
      gl_FragColor = vec4(finalColor, 0.85);
    }
  `
);

extend({ LiquidMaterial });

// TypeScript-friendly export
declare global {
  namespace JSX {
    interface IntrinsicElements {
      liquidMaterial: any;
    }
  }
}