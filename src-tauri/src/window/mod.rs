//! Creation and placement of the transparent desktop charm window.
//!
//! # Interaction model
//!
//! The window is a transparent rectangle that currently receives every mouse
//! event inside its bounds, even where the desktop shows through. A later phase
//! replaces this with hit testing driven by the charm's rendered shape: the
//! window becomes click-through by default (`set_ignore_cursor_events(true)`)
//! and only accepts input while the pointer is over the charm itself. Keeping
//! the window small limits how much of the desktop is affected until then.

pub mod config;
pub mod placement;

use serde::Serialize;
use tauri::{
    AppHandle, LogicalSize, Manager, Monitor, PhysicalPosition, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder,
};

use crate::{
    platform,
    settings::{CharmSettings, PositionSettings},
};
use config::{CharmWindowConfig, MonitorTarget};
use placement::WorkArea;

/// Label used to address the charm window from Rust and from capabilities.
pub const CHARM_WINDOW_LABEL: &str = "charm";
pub const CUSTOMIZER_WINDOW_LABEL: &str = "customizer";
const CUSTOMIZER_WIDTH: f64 = 760.0;
const CUSTOMIZER_HEIGHT: f64 = 720.0;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MonitorMetrics {
    pub logical_x: f64,
    pub logical_width: f64,
    pub minimum_normalized_x: f64,
    pub maximum_normalized_x: f64,
}

/// Creates the floating charm window, places it on the target monitor and shows
/// it.
///
/// The window is built hidden so it is never painted at the default position
/// before being moved. Placement problems are logged rather than propagated: a
/// charm at the wrong position is recoverable, a missing charm is not.
pub fn create_charm_window(
    app: &AppHandle,
    config: &CharmWindowConfig,
    settings: &CharmSettings,
) -> tauri::Result<WebviewWindow> {
    let window = WebviewWindowBuilder::new(
        app,
        CHARM_WINDOW_LABEL,
        WebviewUrl::App("index.html?view=charm".into()),
    )
    .title("LuckyDrop Charm")
    .inner_size(config.width, config.height)
    .resizable(false)
    .maximizable(false)
    .minimizable(false)
    .decorations(false)
    .transparent(true)
    .shadow(false)
    .always_on_top(config.always_on_top)
    .focused(false)
    .focusable(false)
    .visible(false)
    .build()?;

    platform::apply_companion_traits(&window);
    place_on_target_monitor(&window, config, &settings.position);

    Ok(window)
}

/// Creates the normal customization window. It deliberately remains separate
/// from the transparent desktop charm, so hiding the charm never hides the
/// controls needed to bring it back.
pub fn create_customizer_window(app: &AppHandle) -> tauri::Result<WebviewWindow> {
    WebviewWindowBuilder::new(
        app,
        CUSTOMIZER_WINDOW_LABEL,
        WebviewUrl::App("index.html?view=customizer".into()),
    )
    .title("Customize LuckyDrop")
    .inner_size(CUSTOMIZER_WIDTH, CUSTOMIZER_HEIGHT)
    .min_inner_size(620.0, 620.0)
    .resizable(true)
    .center()
    .build()
}

pub fn place_charm_window(window: &WebviewWindow, position: &PositionSettings) {
    let config = CharmWindowConfig::default();
    if let Err(error) = window.set_size(LogicalSize::new(config.width, config.height)) {
        eprintln!("[luckydrop] could not restore the charm window size: {error}");
    }
    place_on_target_monitor(window, &config, position);
}

/// Temporarily expands the transparent window across the current monitor while
/// the pointer is captured. This prevents the dragged charm from clipping at
/// the normal 260px window edge. The window returns to its compact size when
/// settings are persisted on release.
pub fn begin_drag(app: &AppHandle) -> Result<MonitorMetrics, String> {
    let window = app
        .get_webview_window(CHARM_WINDOW_LABEL)
        .ok_or_else(|| "charm window is unavailable".to_string())?;
    let monitor = resolve_monitor(&window, &MonitorTarget::Primary)
        .ok_or_else(|| "primary monitor is unavailable".to_string())?;
    let area = work_area_of(&monitor);
    let scale = if area.scale_factor.is_finite() && area.scale_factor > 0.0 {
        area.scale_factor
    } else {
        1.0
    };
    let logical_width = f64::from(area.width) / scale;
    let config = CharmWindowConfig::default();
    let (minimum, maximum) = placement::valid_normalized_range(area, &config);

    window
        .set_size(LogicalSize::new(logical_width, config.height))
        .map_err(|error| format!("could not expand charm window: {error}"))?;
    window
        .set_position(PhysicalPosition::new(area.x, area.y))
        .map_err(|error| format!("could not align charm window: {error}"))?;

    Ok(MonitorMetrics {
        logical_x: f64::from(area.x) / scale,
        logical_width,
        minimum_normalized_x: minimum,
        maximum_normalized_x: maximum,
    })
}

pub fn monitor_metrics(app: &AppHandle) -> Result<MonitorMetrics, String> {
    let window = app
        .get_webview_window(CHARM_WINDOW_LABEL)
        .ok_or_else(|| "charm window is unavailable".to_string())?;
    let monitor = resolve_monitor(&window, &MonitorTarget::Primary)
        .ok_or_else(|| "primary monitor is unavailable".to_string())?;
    let area = work_area_of(&monitor);
    let scale = if area.scale_factor.is_finite() && area.scale_factor > 0.0 {
        area.scale_factor
    } else {
        1.0
    };
    let (minimum, maximum) = placement::valid_normalized_range(area, &CharmWindowConfig::default());

    Ok(MonitorMetrics {
        logical_x: f64::from(area.x) / scale,
        logical_width: f64::from(area.width) / scale,
        minimum_normalized_x: minimum,
        maximum_normalized_x: maximum,
    })
}

fn place_on_target_monitor(
    window: &WebviewWindow,
    config: &CharmWindowConfig,
    position_settings: &PositionSettings,
) {
    let Some(monitor) = resolve_monitor(window, &config.monitor) else {
        eprintln!("[luckydrop] no monitor reported; keeping the charm's default position");
        return;
    };

    let position = placement::top_position(work_area_of(&monitor), config, position_settings);

    if let Err(error) = window.set_position(PhysicalPosition::new(position.x, position.y)) {
        eprintln!("[luckydrop] could not position the charm window: {error}");
    }
}

/// Finds the monitor to attach to, falling back through the monitors the OS
/// does report so an unplugged or unnamed monitor never leaves the charm
/// unplaced.
fn resolve_monitor(window: &WebviewWindow, target: &MonitorTarget) -> Option<Monitor> {
    if let MonitorTarget::Named(name) = target {
        let named = window.available_monitors().ok().and_then(|monitors| {
            monitors
                .into_iter()
                .find(|monitor| monitor.name().is_some_and(|found| found == name))
        });

        if let Some(monitor) = named {
            return Some(monitor);
        }

        eprintln!("[luckydrop] monitor {name:?} is unavailable; using the primary monitor");
    }

    window
        .primary_monitor()
        .ok()
        .flatten()
        .or_else(|| window.current_monitor().ok().flatten())
        .or_else(|| {
            window
                .available_monitors()
                .ok()
                .and_then(|monitors| monitors.into_iter().next())
        })
}

/// Reads a monitor's usable area, ignoring the full monitor bounds so the charm
/// stays clear of the macOS menu bar and of desktop panels. Falls back to the
/// full bounds on platforms that report an empty work area.
fn work_area_of(monitor: &Monitor) -> WorkArea {
    let area = monitor.work_area();
    let usable = area.size.width > 0 && area.size.height > 0;

    WorkArea {
        x: if usable {
            area.position.x
        } else {
            monitor.position().x
        },
        y: if usable {
            area.position.y
        } else {
            monitor.position().y
        },
        width: if usable {
            area.size.width
        } else {
            monitor.size().width
        },
        height: if usable {
            area.size.height
        } else {
            monitor.size().height
        },
        scale_factor: monitor.scale_factor(),
    }
}
