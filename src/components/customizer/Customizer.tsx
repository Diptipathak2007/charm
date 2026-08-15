import { useEffect, useState } from "react";
import { CHARMS, getCharm } from "../../charms/registry";
import { useCharmSettings } from "../../hooks/useCharmSettings";
import { getMonitorMetrics, type MonitorMetrics } from "../../services/settings";
import {
  CENTER_POSITION_X,
  CHARM_SCALE_STEP,
  LEFT_POSITION_X,
  MAX_CHARM_SCALE,
  MIN_CHARM_SCALE,
  RIGHT_POSITION_X,
  type CharmId,
  type ThreadId,
} from "../../types/settings";
import CharmAssembly from "../charm/CharmAssembly";
import { THREADS } from "../charm/Thread";
import CharmCard from "./CharmCard";
import "./Customizer.css";

const POSITION_PRESETS = [
  { id: "left", label: "Left", normalizedX: LEFT_POSITION_X },
  { id: "center", label: "Centre", normalizedX: CENTER_POSITION_X },
  { id: "right", label: "Right", normalizedX: RIGHT_POSITION_X },
] as const;

function Customizer() {
  const { settings, updateSettings, error } = useCharmSettings({
    listenForChanges: true,
  });
  const [monitor, setMonitor] = useState<MonitorMetrics | null>(null);

  useEffect(() => {
    getMonitorMetrics().then(setMonitor).catch(console.error);
  }, []);

  if (!settings) {
    return (
      <main className="studio studio--loading">
        <span className="studio__loading-dot" />
        Finding your charm…
      </main>
    );
  }

  const selectedCharm = getCharm(settings.charmId);
  const selectedThread = THREADS.find((thread) => thread.id === settings.thread.id);
  const minimumX = monitor?.minimumNormalizedX ?? 0.1;
  const maximumX = monitor?.maximumNormalizedX ?? 0.9;
  const selectCharm = (charmId: CharmId) =>
    updateSettings((current) => ({ ...current, charmId }));
  const selectThread = (id: ThreadId) =>
    updateSettings((current) => ({ ...current, thread: { id } }));
  const setPosition = (normalizedX: number) =>
    updateSettings((current) => ({ ...current, position: { normalizedX } }));
  const toggleVisible = () =>
    updateSettings((current) => ({ ...current, visible: !current.visible }));

  return (
    <main className="studio">
      <header className="studio__masthead">
        <div>
          <p className="studio__eyebrow">LuckyDrop</p>
          <h1>Hang a little luck</h1>
          <p className="studio__lede">
            Choose a charm and hang it from the top of your screen. It sways while you work,
            keeps behind your windows, and never takes a click.
          </p>
        </div>
        <button
          type="button"
          className={`dangle-toggle${settings.visible ? " dangle-toggle--on" : ""}`}
          aria-pressed={settings.visible}
          onClick={toggleVisible}
        >
          <span className="dangle-toggle__track" aria-hidden="true">
            <span />
          </span>
          {settings.visible ? "Hanging" : "Tucked away"}
        </button>
      </header>

      <section className="bench" aria-label="Charm placement and appearance">
        <figure className="bench__preview">
          <figcaption>On your desktop</figcaption>
          <div className="bench__stage">
            <span className="bench__rail" aria-hidden="true" />
            <CharmAssembly settings={settings} compact />
          </div>
          <p>
            {!settings.visible
              ? "Waiting to be called back"
              : settings.thread.id === "none"
                ? `${selectedCharm.shortName}, floating free`
                : `${selectedCharm.shortName} on ${selectedThread?.name.toLowerCase()}`}
          </p>
        </figure>

        <div className="bench__controls">
          <section className="control" aria-labelledby="place-heading">
            <div className="control__heading">
              <h2 id="place-heading">Where it hangs</h2>
              <output>{Math.round(settings.position.normalizedX * 100)}% across</output>
            </div>
            <div className="preset-row">
              {POSITION_PRESETS.map((preset) => {
                const selected =
                  Math.abs(settings.position.normalizedX - preset.normalizedX) < 0.015;
                return (
                  <button
                    type="button"
                    key={preset.id}
                    className={selected ? "is-selected" : ""}
                    aria-pressed={selected}
                    onClick={() => setPosition(preset.normalizedX)}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <input
              className="rail-slider"
              type="range"
              min={minimumX}
              max={maximumX}
              step={0.0025}
              value={settings.position.normalizedX}
              aria-label="Horizontal charm position"
              onChange={(event) => setPosition(Number(event.currentTarget.value))}
            />
            <p className="control__hint">
              The slider spans your primary display. You can also drag the charm along the top
              edge of the desktop.
            </p>
          </section>

          <section className="control" aria-labelledby="thread-heading">
            <div className="control__heading">
              <h2 id="thread-heading">What it hangs from</h2>
              <output>{selectedThread?.name}</output>
            </div>
            <div className="thread-row">
              {THREADS.map((thread) => (
                <button
                  type="button"
                  key={thread.id}
                  className={`thread-chip thread-chip--${thread.id}${
                    settings.thread.id === thread.id ? " is-selected" : ""
                  }`}
                  aria-label={`${thread.name}: ${thread.description}`}
                  aria-pressed={settings.thread.id === thread.id}
                  onClick={() => selectThread(thread.id)}
                >
                  <span className="thread-chip__sample" aria-hidden="true" />
                  {thread.name.replace(" Thread", "")}
                </button>
              ))}
            </div>
          </section>

          <section className="control" aria-labelledby="size-heading">
            <div className="control__heading">
              <h2 id="size-heading">How big</h2>
              <output>{Math.round(settings.scale * 100)}%</output>
            </div>
            <div className="size-row">
              <span>Small</span>
              <input
                type="range"
                min={MIN_CHARM_SCALE}
                max={MAX_CHARM_SCALE}
                step={CHARM_SCALE_STEP}
                value={settings.scale}
                aria-label="Charm size"
                onChange={(event) => {
                  const scale = Number(event.currentTarget.value);
                  updateSettings((current) => ({ ...current, scale }));
                }}
              />
              <span>Large</span>
            </div>
          </section>
        </div>
      </section>

      <section className="presence" aria-labelledby="presence-heading">
        <h2 id="presence-heading">It knows when to step back</h2>
        <p>
          The charm sits behind your apps and slips away while another window is in front, so it
          never covers your work or steals focus. It stays put while you are here choosing.
        </p>
        <p className="presence__keys">
          <kbd>⌘/Ctrl</kbd>
          <kbd>Shift</kbd>
          <kbd>L</kbd>
          <span>toggles it anywhere, and the tray icon has the rest.</span>
        </p>
      </section>

      <section className="collection" aria-labelledby="collection-heading">
        <div className="collection__heading">
          <div>
            <p className="studio__eyebrow">The collection</p>
            <h2 id="collection-heading">Twelve charms, twelve small rituals</h2>
            <p>
              Each one is drawn for LuckyDrop and comes from a living tradition. Try a ritual to
              see what it does, then hang the one that feels like yours.
            </p>
          </div>
          <span className="collection__count">
            {selectedCharm.name} is hanging
          </span>
        </div>
        <div className="collection__grid">
          {CHARMS.map((charm) => (
            <CharmCard
              key={charm.id}
              charm={charm}
              threadId={settings.thread.id}
              selected={settings.charmId === charm.id}
              onSelect={() => selectCharm(charm.id)}
            />
          ))}
        </div>
      </section>

      <footer className="studio__footer">
        <span className={error ? "save-note save-note--error" : "save-note"}>
          <i aria-hidden="true" />
          {error ?? "Every change is saved on this machine as you make it"}
        </span>
        <button type="button" className="ghost-button" onClick={toggleVisible}>
          {settings.visible ? "Tuck it away" : "Bring it back"}
        </button>
      </footer>
    </main>
  );
}

export default Customizer;
