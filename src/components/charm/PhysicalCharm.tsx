import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { getCharm, type CharmInteraction } from "../../charms/registry";
import {
  clamp,
  DEFAULT_PHYSICS,
  isSettled,
  stepPhysics,
  type PhysicsState,
  type PhysicsTarget,
} from "../../physics/engine";
import {
  beginCharmDrag,
  previewDragPosition,
  saveSettings,
  type MonitorMetrics,
} from "../../services/settings";
import type { CharmSettings } from "../../types/settings";
import "./PhysicalCharm.css";

interface PhysicalCharmProps {
  settings: CharmSettings;
}

interface DragState {
  active: boolean;
  pointerId: number;
  startScreenX: number;
  startScreenY: number;
  lastScreenX: number;
  lastScreenY: number;
  lastTime: number;
  moved: boolean;
  finalNormalizedX: number;
  visualNormalizedX: number;
  metrics: MonitorMetrics | null;
  expansionRequested: boolean;
  lastPreviewTime: number;
  releaseVelocityX: number;
  releaseVelocityY: number;
}

const THREAD_LENGTH = 105;
const PREVIEW_INTERVAL_MS = 32;

function PhysicalCharm({ settings }: PhysicalCharmProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const artworkRef = useRef<HTMLDivElement>(null);
  const primaryPathRef = useRef<SVGPathElement>(null);
  const secondaryPathRef = useRef<SVGPathElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousFrameRef = useRef(0);
  const physicsRef = useRef<PhysicsState>({
    x: 0,
    y: DEFAULT_PHYSICS.gravity / DEFAULT_PHYSICS.springStrength,
    velocityX: 0,
    velocityY: 0,
  });
  const targetRef = useRef<PhysicsTarget>({ x: 0, y: 0 });
  const reducedMotionRef = useRef(false);
  const dragRef = useRef<DragState>({
    active: false,
    pointerId: -1,
    startScreenX: 0,
    startScreenY: 0,
    lastScreenX: 0,
    lastScreenY: 0,
    lastTime: 0,
    moved: false,
    finalNormalizedX: settings.position.normalizedX,
    visualNormalizedX: settings.position.normalizedX,
    metrics: null,
    expansionRequested: false,
    lastPreviewTime: 0,
    releaseVelocityX: 0,
    releaseVelocityY: 0,
  });

  const charm = getCharm(settings.charmId);
  const Artwork = charm.artwork;
  const physicsConfig = useMemo(
    () => ({
      ...DEFAULT_PHYSICS,
      maxSwing: DEFAULT_PHYSICS.maxSwing * settings.scale,
    }),
    [settings.scale],
  );

  const renderPhysicalState = useCallback(() => {
    const root = rootRef.current;
    const artwork = artworkRef.current;
    const primaryPath = primaryPathRef.current;
    if (!root || !artwork || !primaryPath) return;

    const physics = physicsRef.current;
    const drag = dragRef.current;
    const width = root.clientWidth;
    const expandedForDrag = width > 400 && drag.metrics !== null;
    const anchorX = expandedForDrag ? drag.visualNormalizedX * width : width / 2;
    const baseLength = settings.thread.id === "none" ? 28 : THREAD_LENGTH;
    const scaledLength = baseLength * settings.scale;
    const endX = anchorX + physics.x;
    const endY = scaledLength + physics.y;
    const controlX = anchorX + physics.x * 0.18;
    const path = `M ${anchorX.toFixed(2)} 0 Q ${controlX.toFixed(2)} ${(endY * 0.5).toFixed(
      2,
    )} ${endX.toFixed(2)} ${endY.toFixed(2)}`;
    const angle = Math.atan2(physics.x, Math.max(endY, 1)) * 34;
    const artworkScale = settings.scale * charm.defaultScale;

    primaryPath.setAttribute("d", path);
    secondaryPathRef.current?.setAttribute("d", path);
    artwork.style.transform = `translate3d(${endX.toFixed(2)}px, ${endY.toFixed(
      2,
    )}px, 0) translateX(-50%) rotate(${angle.toFixed(2)}deg) scale(${artworkScale})`;
  }, [charm.defaultScale, settings.scale, settings.thread.id]);

  const animate = useCallback(
    (time: number) => {
      animationFrameRef.current = null;
      if (!settings.visible || document.hidden) return;

      const previous = previousFrameRef.current || time;
      previousFrameRef.current = time;
      const deltaSeconds = (time - previous) / 1000;
      const drag = dragRef.current;

      if (!reducedMotionRef.current) {
        stepPhysics(physicsRef.current, targetRef.current, physicsConfig, deltaSeconds);
      } else if (drag.active) {
        physicsRef.current.x = targetRef.current.x;
        physicsRef.current.y = targetRef.current.y;
        physicsRef.current.velocityX = 0;
        physicsRef.current.velocityY = 0;
      }

      renderPhysicalState();

      if (
        drag.active ||
        !isSettled(physicsRef.current, targetRef.current, physicsConfig)
      ) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        physicsRef.current.x = targetRef.current.x;
        physicsRef.current.y =
          targetRef.current.y + physicsConfig.gravity / physicsConfig.springStrength;
        physicsRef.current.velocityX = 0;
        physicsRef.current.velocityY = 0;
        renderPhysicalState();
      }
    },
    [physicsConfig, renderPhysicalState, settings.visible],
  );

  const ensureAnimating = useCallback(() => {
    if (animationFrameRef.current === null && settings.visible) {
      previousFrameRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [animate, settings.visible]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reducedMotionRef.current = media.matches;
    };
    updatePreference();
    media.addEventListener("change", updatePreference);
    renderPhysicalState();
    ensureAnimating();

    return () => {
      media.removeEventListener("change", updatePreference);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [ensureAnimating, renderPhysicalState]);

  useEffect(() => {
    dragRef.current.finalNormalizedX = settings.position.normalizedX;
    dragRef.current.visualNormalizedX = settings.position.normalizedX;
    renderPhysicalState();
  }, [renderPhysicalState, settings.position.normalizedX]);

  const triggerInteraction = useCallback(
    (interaction: CharmInteraction) => {
      const physics = physicsRef.current;
      const direction = Math.random() > 0.5 ? 1 : -1;
      const impulses: Record<CharmInteraction, [number, number]> = {
        flick: [310, -45],
        freshen: [180, -120],
        beckon: [90, -260],
        pendulum: [360, 0],
        flutter: [170, -170],
        glow: [110, -80],
        wobble: [260, -40],
        nod: [120, 180],
        wings: [190, -190],
        flip: [80, -290],
        sway: [280, -30],
        sparkle: [300, -110],
      };
      const [velocityX, velocityY] = impulses[interaction];
      physics.velocityX += velocityX * direction;
      physics.velocityY += velocityY;

      const artwork = artworkRef.current;
      if (artwork) {
        artwork.dataset.interaction = "";
        void artwork.offsetWidth;
        artwork.dataset.interaction = interaction;
      }
      ensureAnimating();
    },
    [ensureAnimating],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();

    const now = performance.now();
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startScreenX: event.screenX,
      startScreenY: event.screenY,
      lastScreenX: event.screenX,
      lastScreenY: event.screenY,
      lastTime: now,
      moved: false,
      finalNormalizedX: settings.position.normalizedX,
      visualNormalizedX: settings.position.normalizedX,
      metrics: null,
      expansionRequested: false,
      lastPreviewTime: 0,
      releaseVelocityX: 0,
      releaseVelocityY: 0,
    };
    targetRef.current = { x: physicsRef.current.x, y: physicsRef.current.y };
    ensureAnimating();

  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    const deltaX = event.screenX - drag.startScreenX;
    const deltaY = event.screenY - drag.startScreenY;
    drag.moved ||= Math.hypot(deltaX, deltaY) > 4;

    if (drag.moved && !drag.metrics && !drag.expansionRequested) {
      drag.expansionRequested = true;
      void beginCharmDrag()
        .then((metrics) => {
          if (dragRef.current.active && dragRef.current.pointerId === event.pointerId) {
            dragRef.current.metrics = metrics;
            renderPhysicalState();
          } else {
            // A very quick release can beat the native resize response.
            // Re-applying settings restores the compact window in that race.
            void saveSettings(settings);
          }
        })
        .catch((cause: unknown) => {
          drag.expansionRequested = false;
          console.error("Could not begin charm drag", cause);
        });
    }

    if (drag.metrics) {
      const { logicalX, logicalWidth, minimumNormalizedX, maximumNormalizedX } =
        drag.metrics;
      const normalizedX = clamp(
        (event.screenX - logicalX) / logicalWidth,
        minimumNormalizedX,
        maximumNormalizedX,
      );
      const originalAnchorX =
        logicalX + settings.position.normalizedX * logicalWidth;
      const stretchX = clamp(
        event.screenX - originalAnchorX,
        -physicsConfig.maxSwing,
        physicsConfig.maxSwing,
      );
      const visualAnchorX = event.screenX - stretchX;

      drag.finalNormalizedX = normalizedX;
      drag.visualNormalizedX = clamp(
        (visualAnchorX - logicalX) / logicalWidth,
        minimumNormalizedX,
        maximumNormalizedX,
      );
      targetRef.current.x = stretchX * physicsConfig.dragInfluence;
      targetRef.current.y = clamp(
        deltaY * physicsConfig.dragInfluence,
        -physicsConfig.maxSwing * 0.3,
        physicsConfig.maxSwing * 0.7,
      );

      const now = performance.now();
      if (now - drag.lastPreviewTime >= PREVIEW_INTERVAL_MS) {
        drag.lastPreviewTime = now;
        void previewDragPosition(normalizedX);
      }
    } else {
      targetRef.current.x = clamp(
        deltaX,
        -physicsConfig.maxSwing,
        physicsConfig.maxSwing,
      );
      targetRef.current.y = clamp(
        deltaY,
        -physicsConfig.maxSwing * 0.3,
        physicsConfig.maxSwing * 0.7,
      );
    }

    const now = performance.now();
    const sampleSeconds = Math.max((now - drag.lastTime) / 1000, 1 / 120);
    drag.releaseVelocityX = (event.screenX - drag.lastScreenX) / sampleSeconds;
    drag.releaseVelocityY = (event.screenY - drag.lastScreenY) / sampleSeconds;
    drag.lastScreenX = event.screenX;
    drag.lastScreenY = event.screenY;
    drag.lastTime = now;
    ensureAnimating();
  };

  const finishDrag = async (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    drag.active = false;

    physicsRef.current.velocityX = clamp(
      drag.releaseVelocityX,
      -850,
      850,
    );
    physicsRef.current.velocityY = clamp(
      drag.releaseVelocityY,
      -700,
      700,
    );
    physicsRef.current.x *= -0.28;
    targetRef.current = { x: 0, y: 0 };

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!drag.moved) {
      triggerInteraction(charm.animation.interaction);
      return;
    }

    const normalizedX = drag.finalNormalizedX;
    void previewDragPosition(normalizedX);
    try {
      await saveSettings({
        ...settings,
        position: { normalizedX },
      });
    } catch (cause) {
      console.error("Could not save dragged charm position", cause);
    } finally {
      drag.metrics = null;
      renderPhysicalState();
      ensureAnimating();
    }
  };

  return (
    <div className="physical-charm" ref={rootRef}>
      <svg
        className="physical-charm__thread"
        data-thread={settings.thread.id}
        aria-hidden="true"
      >
        <path ref={secondaryPathRef} className="physical-charm__thread-secondary" />
        <path ref={primaryPathRef} className="physical-charm__thread-primary" />
      </svg>
      <div
        ref={artworkRef}
        className="physical-charm__artwork"
        role="button"
        tabIndex={0}
        aria-label={`${charm.name}. Drag to reposition or press to interact.`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            triggerInteraction(charm.animation.interaction);
          }
        }}
      >
        <span className="physical-charm__idle">
          <Artwork />
        </span>
      </div>
    </div>
  );
}

export default PhysicalCharm;
