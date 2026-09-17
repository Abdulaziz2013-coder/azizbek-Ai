import * as THREE from "three";
import { EmotionType } from "../types";

export interface EmotionColorConfig {
  primary: number;
  secondary: number;
  glow: number;
  lightIntensity: number;
}

const EMOTION_COLORS: Record<EmotionType, EmotionColorConfig> = {
  neutral: {
    primary: 0x00f0ff, // Cyber cyan
    secondary: 0x3b82f6, // Blue
    glow: 0x06b6d4,
    lightIntensity: 1.2,
  },
  happy: {
    primary: 0x10b981, // Emerald green
    secondary: 0xf59e0b, // Amber gold
    glow: 0x34d399,
    lightIntensity: 1.5,
  },
  thinking: {
    primary: 0x8b5cf6, // Violet
    secondary: 0x06b6d4, // Cyan
    glow: 0xa855f7,
    lightIntensity: 1.1,
  },
  surprised: {
    primary: 0x38bdf8, // Electric sky blue
    secondary: 0xffffff, // Pure white flash
    glow: 0x67e8f9,
    lightIntensity: 1.8,
  },
  excited: {
    primary: 0xf59e0b, // Bright gold
    secondary: 0xec4899, // Cyber magenta
    glow: 0xfbbf24,
    lightIntensity: 1.9,
  },
  empathetic: {
    primary: 0xf43f5e, // Warm rose
    secondary: 0xc084fc, // Lavender
    glow: 0xfb7185,
    lightIntensity: 1.3,
  },
};

export class CyberAvatar3D {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;

  // Avatar group
  private avatarGroup: THREE.Group;
  private headGroup: THREE.Group;
  private jawGroup: THREE.Group;
  private leftBrow: THREE.Mesh;
  private rightBrow: THREE.Mesh;
  private leftEye: THREE.Group;
  private rightEye: THREE.Group;
  private leftUpperLid: THREE.Mesh;
  private rightUpperLid: THREE.Mesh;
  private mouthMesh: THREE.Mesh;
  private energyCore: THREE.Mesh;
  private neuralRings: THREE.Group[] = [];
  private particleSystem: THREE.Points;

  // Materials to update colors
  private glowMaterials: THREE.MeshStandardMaterial[] = [];
  private coreMaterial: THREE.MeshStandardMaterial;
  private keyLight: THREE.PointLight;
  private rimLight: THREE.PointLight;
  private ambientLight: THREE.AmbientLight;

  // State
  private currentEmotion: EmotionType = "neutral";
  private targetEmotion: EmotionType = "neutral";
  private isSpeaking = false;
  private audioLevel = 0;
  private cursorX = 0;
  private cursorY = 0;
  private targetRotY = 0;
  private targetRotX = 0;

  // Animation values
  private clock: THREE.Clock;
  private blinkProgress = 0;
  private isBlinking = false;
  private nextBlinkTime = 2.5;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // Scene & Renderer
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0.4, 4.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    // Initialize root avatar groups
    this.avatarGroup = new THREE.Group();
    this.headGroup = new THREE.Group();
    this.jawGroup = new THREE.Group();
    this.avatarGroup.add(this.headGroup);
    this.scene.add(this.avatarGroup);

    // Lights
    this.ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.PointLight(0x00f0ff, 2.5, 10);
    this.keyLight.position.set(1.5, 2, 2.5);
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.PointLight(0x3b82f6, 3, 10);
    this.rimLight.position.set(-2, 1, -1.5);
    this.scene.add(this.rimLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(0, -2, 2);
    this.scene.add(fillLight);

    // Build 3D Avatar
    this.buildAvatar();
    this.buildParticles();

    // Start loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private buildAvatar() {
    // Shared materials
    const cyberPlatingMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });

    const cyberDarkMat = new THREE.MeshStandardMaterial({
      color: 0x0b0f19,
      metalness: 0.9,
      roughness: 0.35,
    });

    const glowColor = EMOTION_COLORS.neutral.primary;

    const accentGlowMat = new THREE.MeshStandardMaterial({
      color: glowColor,
      emissive: glowColor,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.5,
    });
    this.glowMaterials.push(accentGlowMat);

    // 1. Head Cranium (Sculpted organic-cyber head)
    const craniumGeom = new THREE.SphereGeometry(0.9, 32, 32);
    craniumGeom.scale(0.95, 1.15, 1.05);
    const craniumMesh = new THREE.Mesh(craniumGeom, cyberPlatingMat);
    this.headGroup.add(craniumMesh);

    // Cyber visor face shield plate
    const visorGeom = new THREE.CylinderGeometry(0.75, 0.65, 0.7, 32, 1, false, 0, Math.PI);
    visorGeom.rotateY(-Math.PI / 2);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x030712,
      metalness: 0.9,
      roughness: 0.1,
      transmission: 0.3,
      thickness: 0.5,
    });
    const visorMesh = new THREE.Mesh(visorGeom, visorMat);
    visorMesh.position.set(0, 0.05, 0.38);
    this.headGroup.add(visorMesh);

    // Glowing temple circuit stripes
    const stripeGeom = new THREE.BoxGeometry(0.04, 0.6, 0.02);
    const leftStripe = new THREE.Mesh(stripeGeom, accentGlowMat);
    leftStripe.position.set(-0.85, 0.1, 0.15);
    leftStripe.rotation.z = 0.2;
    this.headGroup.add(leftStripe);

    const rightStripe = new THREE.Mesh(stripeGeom, accentGlowMat);
    rightStripe.position.set(0.85, 0.1, 0.15);
    rightStripe.rotation.z = -0.2;
    this.headGroup.add(rightStripe);

    // 2. High-Tech Cyber Eyes (Left & Right)
    this.leftEye = this.createEyeGroup(-0.35, accentGlowMat, cyberDarkMat);
    this.rightEye = this.createEyeGroup(0.35, accentGlowMat, cyberDarkMat);
    this.headGroup.add(this.leftEye);
    this.headGroup.add(this.rightEye);

    // 3. Expressive Eyebrows
    const browGeom = new THREE.BoxGeometry(0.32, 0.05, 0.08);
    this.leftBrow = new THREE.Mesh(browGeom, accentGlowMat);
    this.leftBrow.position.set(-0.35, 0.34, 0.86);
    this.headGroup.add(this.leftBrow);

    this.rightBrow = new THREE.Mesh(browGeom, accentGlowMat);
    this.rightBrow.position.set(0.35, 0.34, 0.86);
    this.headGroup.add(this.rightBrow);

    // 4. Articulated Cyber Mouth & Viseme
    const mouthGeom = new THREE.BoxGeometry(0.35, 0.08, 0.06);
    this.mouthMesh = new THREE.Mesh(mouthGeom, accentGlowMat);
    this.mouthMesh.position.set(0, -0.36, 0.85);
    this.headGroup.add(this.mouthMesh);

    // 5. Lower Jaw & Chin Plate
    const chinGeom = new THREE.BoxGeometry(0.48, 0.26, 0.4);
    const chinMesh = new THREE.Mesh(chinGeom, cyberPlatingMat);
    chinMesh.position.set(0, -0.6, 0.6);
    this.jawGroup.position.set(0, -0.2, 0.5);
    this.jawGroup.add(chinMesh);
    this.headGroup.add(this.jawGroup);

    // 6. Cyber Audio Sensor Ears
    const earGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 24);
    earGeom.rotateZ(Math.PI / 2);
    const leftEar = new THREE.Mesh(earGeom, cyberDarkMat);
    leftEar.position.set(-0.95, 0, 0);
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeom, cyberDarkMat);
    rightEar.position.set(0.95, 0, 0);
    this.headGroup.add(rightEar);

    // Ear glowing neon core
    const earCoreGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.18, 16);
    earCoreGeom.rotateZ(Math.PI / 2);
    const leftEarGlow = new THREE.Mesh(earCoreGeom, accentGlowMat);
    leftEarGlow.position.set(-0.96, 0, 0);
    this.headGroup.add(leftEarGlow);

    const rightEarGlow = new THREE.Mesh(earCoreGeom, accentGlowMat);
    rightEarGlow.position.set(0.96, 0, 0);
    this.headGroup.add(rightEarGlow);

    // 7. Futuristic Neck & Collar Platform
    const neckGeom = new THREE.CylinderGeometry(0.35, 0.42, 0.7, 24);
    const neckMesh = new THREE.Mesh(neckGeom, cyberDarkMat);
    neckMesh.position.set(0, -1.05, -0.05);
    this.avatarGroup.add(neckMesh);

    // Collar / Shoulders cyber bust
    const collarGeom = new THREE.CylinderGeometry(1.2, 1.4, 0.45, 32);
    collarGeom.scale(1.2, 0.8, 0.8);
    const collarMesh = new THREE.Mesh(collarGeom, cyberPlatingMat);
    collarMesh.position.set(0, -1.45, 0);
    this.avatarGroup.add(collarMesh);

    // Energy Core in chest
    const coreGeom = new THREE.OctahedronGeometry(0.22, 2);
    this.coreMaterial = new THREE.MeshStandardMaterial({
      color: glowColor,
      emissive: glowColor,
      emissiveIntensity: 1.8,
      roughness: 0.1,
      metalness: 0.8,
    });
    this.glowMaterials.push(this.coreMaterial);
    this.energyCore = new THREE.Mesh(coreGeom, this.coreMaterial);
    this.energyCore.position.set(0, -1.45, 0.7);
    this.avatarGroup.add(this.energyCore);

    // 8. Floating Neural Gyroscopic Rings
    this.createNeuralRings(accentGlowMat);
  }

  private createEyeGroup(
    xPos: number,
    glowMat: THREE.MeshStandardMaterial,
    socketMat: THREE.MeshStandardMaterial
  ): THREE.Group {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(xPos, 0.12, 0.76);

    // Socket base
    const socketGeom = new THREE.SphereGeometry(0.22, 24, 24);
    const socketMesh = new THREE.Mesh(socketGeom, socketMat);
    eyeGroup.add(socketMesh);

    // Glowing Iris ring
    const irisGeom = new THREE.RingGeometry(0.04, 0.14, 24);
    const irisMesh = new THREE.Mesh(irisGeom, glowMat);
    irisMesh.position.set(0, 0, 0.17);
    eyeGroup.add(irisMesh);

    // Outer pupil dot
    const pupilGeom = new THREE.CircleGeometry(0.05, 16);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
    const pupilMesh = new THREE.Mesh(pupilGeom, pupilMat);
    pupilMesh.position.set(0, 0, 0.175);
    eyeGroup.add(pupilMesh);

    // Animated Cyber Eyelid
    const lidGeom = new THREE.BoxGeometry(0.3, 0.18, 0.25);
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.3,
    });
    const upperLid = new THREE.Mesh(lidGeom, lidMat);
    upperLid.position.set(0, 0.18, 0.1);
    eyeGroup.add(upperLid);

    if (xPos < 0) {
      this.leftUpperLid = upperLid;
    } else {
      this.rightUpperLid = upperLid;
    }

    return eyeGroup;
  }

  private createNeuralRings(glowMat: THREE.MeshStandardMaterial) {
    const ringRadii = [1.45, 1.85, 2.25];
    const ringTubes = [0.018, 0.015, 0.012];

    ringRadii.forEach((radius, i) => {
      const ringGroup = new THREE.Group();
      const geom = new THREE.TorusGeometry(radius, ringTubes[i], 16, 64);
      const ringMesh = new THREE.Mesh(geom, glowMat);
      ringGroup.add(ringMesh);

      // Add a couple of glowing satellite nodes on the ring
      const nodeGeom = new THREE.SphereGeometry(0.045, 12, 12);
      const nodeMesh1 = new THREE.Mesh(nodeGeom, glowMat);
      nodeMesh1.position.set(radius, 0, 0);
      ringGroup.add(nodeMesh1);

      const nodeMesh2 = new THREE.Mesh(nodeGeom, glowMat);
      nodeMesh2.position.set(-radius, 0, 0);
      ringGroup.add(nodeMesh2);

      ringGroup.rotation.x = Math.PI / 2 + (i * 0.4);
      ringGroup.rotation.y = (i * 0.6);
      this.avatarGroup.add(ringGroup);
      this.neuralRings.push(ringGroup);
    });
  }

  private buildParticles() {
    const count = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const baseColor = new THREE.Color(0x00f0ff);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 2.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i3] = radius * Math.cos(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi);
      positions[i3 + 2] = radius * Math.cos(phi) * Math.sin(theta);

      colors[i3] = baseColor.r * (0.5 + Math.random() * 0.5);
      colors[i3 + 1] = baseColor.g * (0.5 + Math.random() * 0.5);
      colors[i3 + 2] = baseColor.b * (0.5 + Math.random() * 0.5);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  public setEmotion(emotion: EmotionType) {
    this.targetEmotion = emotion;
  }

  public setSpeaking(isSpeaking: boolean) {
    this.isSpeaking = isSpeaking;
  }

  public setAudioLevel(level: number) {
    this.audioLevel = THREE.MathUtils.clamp(level, 0, 1);
  }

  public setCursor(x: number, y: number) {
    // Normalised -1 to 1
    this.cursorX = x;
    this.cursorY = y;
    this.targetRotY = x * 0.45; // Max 25 degrees tilt
    this.targetRotX = -y * 0.3; // Max 17 degrees pitch
  }

  public resize(width: number, height: number) {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smooth Head Tracking (Lerp)
    this.headGroup.rotation.y = THREE.MathUtils.lerp(
      this.headGroup.rotation.y,
      this.targetRotY,
      0.08
    );
    this.headGroup.rotation.x = THREE.MathUtils.lerp(
      this.headGroup.rotation.x,
      this.targetRotX,
      0.08
    );

    // Natural idle breathing and subtle hover sway
    const breathingOffset = Math.sin(elapsedTime * 1.8) * 0.035;
    this.avatarGroup.position.y = -0.15 + breathingOffset;
    this.headGroup.rotation.z = Math.sin(elapsedTime * 1.2) * 0.02;

    // 2. Color & Lighting Transitions based on Emotion
    const targetColors = EMOTION_COLORS[this.targetEmotion] || EMOTION_COLORS.neutral;
    const targetPrimaryColor = new THREE.Color(targetColors.primary);
    const targetGlowColor = new THREE.Color(targetColors.glow);

    this.glowMaterials.forEach((mat) => {
      mat.color.lerp(targetPrimaryColor, 0.06);
      mat.emissive.lerp(targetGlowColor, 0.06);
    });

    this.keyLight.color.lerp(targetPrimaryColor, 0.06);
    this.keyLight.intensity = THREE.MathUtils.lerp(
      this.keyLight.intensity,
      targetColors.lightIntensity + (this.isSpeaking ? this.audioLevel * 0.8 : 0),
      0.08
    );

    // 3. Eye Blinking Logic
    if (elapsedTime > this.nextBlinkTime && !this.isBlinking) {
      this.isBlinking = true;
      this.blinkProgress = 0;
    }

    if (this.isBlinking) {
      this.blinkProgress += delta * 12; // Fast blink
      const lidY = 0.18 - Math.sin(this.blinkProgress) * 0.16;
      if (this.leftUpperLid && this.rightUpperLid) {
        this.leftUpperLid.position.y = Math.max(0.02, lidY);
        this.rightUpperLid.position.y = Math.max(0.02, lidY);
      }
      if (this.blinkProgress >= Math.PI) {
        this.isBlinking = false;
        this.blinkProgress = 0;
        this.nextBlinkTime = elapsedTime + 2.5 + Math.random() * 3.5;
        if (this.leftUpperLid && this.rightUpperLid) {
          this.leftUpperLid.position.y = 0.18;
          this.rightUpperLid.position.y = 0.18;
        }
      }
    }

    // 4. Facial Expressions: Eyebrows & Mouth
    let targetLeftBrowY = 0.34;
    let targetRightBrowY = 0.34;
    let targetLeftBrowRot = 0;
    let targetRightBrowRot = 0;
    let targetMouthScaleY = 1.0;
    let targetMouthScaleX = 1.0;

    switch (this.targetEmotion) {
      case "happy":
        targetLeftBrowY = 0.37;
        targetRightBrowY = 0.37;
        targetLeftBrowRot = -0.15;
        targetRightBrowRot = 0.15;
        targetMouthScaleX = 1.35;
        targetMouthScaleY = 1.2;
        break;
      case "surprised":
        targetLeftBrowY = 0.44;
        targetRightBrowY = 0.44;
        targetLeftBrowRot = 0.05;
        targetRightBrowRot = -0.05;
        targetMouthScaleX = 0.8;
        targetMouthScaleY = 1.6;
        break;
      case "thinking":
        targetLeftBrowY = 0.38;
        targetRightBrowY = 0.31; // Asymmetric inquisitiveness
        targetLeftBrowRot = 0.2;
        targetRightBrowRot = -0.15;
        targetMouthScaleX = 0.9;
        targetMouthScaleY = 0.8;
        break;
      case "excited":
        targetLeftBrowY = 0.42;
        targetRightBrowY = 0.42;
        targetLeftBrowRot = -0.2;
        targetRightBrowRot = 0.2;
        targetMouthScaleX = 1.45;
        targetMouthScaleY = 1.4;
        break;
      case "empathetic":
        targetLeftBrowY = 0.36;
        targetRightBrowY = 0.36;
        targetLeftBrowRot = 0.18;
        targetRightBrowRot = -0.18;
        targetMouthScaleX = 1.15;
        targetMouthScaleY = 0.9;
        break;
      default: // neutral
        targetLeftBrowY = 0.34;
        targetRightBrowY = 0.34;
        targetLeftBrowRot = 0;
        targetRightBrowRot = 0;
        targetMouthScaleX = 1.0;
        targetMouthScaleY = 1.0;
    }

    // 5. Speech Audio Lip-Sync & Mouth Modulation
    if (this.isSpeaking) {
      const speechOsc = Math.sin(elapsedTime * 22) * 0.5 + 0.5;
      const combinedLevel = Math.max(this.audioLevel * 1.8, speechOsc * 0.7);
      targetMouthScaleY = 0.8 + combinedLevel * 2.5;
      this.jawGroup.position.y = -0.2 - combinedLevel * 0.12;
      this.jawGroup.rotation.x = combinedLevel * 0.15;
    } else {
      this.jawGroup.position.y = THREE.MathUtils.lerp(this.jawGroup.position.y, -0.2, 0.1);
      this.jawGroup.rotation.x = THREE.MathUtils.lerp(this.jawGroup.rotation.x, 0, 0.1);
    }

    // Apply smoothly
    this.leftBrow.position.y = THREE.MathUtils.lerp(this.leftBrow.position.y, targetLeftBrowY, 0.1);
    this.rightBrow.position.y = THREE.MathUtils.lerp(this.rightBrow.position.y, targetRightBrowY, 0.1);
    this.leftBrow.rotation.z = THREE.MathUtils.lerp(this.leftBrow.rotation.z, targetLeftBrowRot, 0.1);
    this.rightBrow.rotation.z = THREE.MathUtils.lerp(this.rightBrow.rotation.z, targetRightBrowRot, 0.1);

    this.mouthMesh.scale.x = THREE.MathUtils.lerp(this.mouthMesh.scale.x, targetMouthScaleX, 0.15);
    this.mouthMesh.scale.y = THREE.MathUtils.lerp(this.mouthMesh.scale.y, targetMouthScaleY, 0.2);

    // 6. Energy Core Pulse
    if (this.energyCore) {
      const pulseSpeed = this.targetEmotion === "thinking" || this.targetEmotion === "excited" ? 6 : 2.5;
      const coreScale = 1 + Math.sin(elapsedTime * pulseSpeed) * 0.15 + (this.isSpeaking ? 0.2 : 0);
      this.energyCore.scale.set(coreScale, coreScale, coreScale);
      this.energyCore.rotation.y += delta * 1.5;
      this.energyCore.rotation.x += delta * 0.8;
    }

    // 7. Neural Gyroscopic Rings Rotation
    const ringSpeedMultiplier =
      this.targetEmotion === "thinking"
        ? 2.8
        : this.targetEmotion === "excited"
        ? 3.2
        : 1.0;

    this.neuralRings.forEach((ring, i) => {
      ring.rotation.x += delta * (0.2 + i * 0.15) * ringSpeedMultiplier;
      ring.rotation.y += delta * (0.3 - i * 0.1) * ringSpeedMultiplier;
      ring.rotation.z += delta * (0.15 + i * 0.1) * ringSpeedMultiplier;
    });

    // 8. Particle Constellation drift
    if (this.particleSystem) {
      this.particleSystem.rotation.y = elapsedTime * 0.04;
      this.particleSystem.rotation.x = Math.sin(elapsedTime * 0.03) * 0.1;
    }

    this.renderer.render(this.scene, this.camera);
  }

  public triggerCelebration() {
    // Excited jump and flare
    this.targetEmotion = "excited";
    const initialY = this.avatarGroup.position.y;
    let t = 0;
    const jumpInterval = setInterval(() => {
      t += 0.1;
      this.avatarGroup.position.y = initialY + Math.sin(t * Math.PI) * 0.35;
      if (t >= 1) {
        clearInterval(jumpInterval);
        this.avatarGroup.position.y = initialY;
      }
    }, 30);
  }

  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
