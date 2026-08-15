//! Single source of truth for the floating charm window's geometry.

/// Width of the charm window, in logical pixels.
pub const WINDOW_WIDTH: f64 = 260.0;

/// Height of the charm window, in logical pixels.
pub const WINDOW_HEIGHT: f64 = 300.0;

/// Distance between the top of the monitor work area and the top of the window,
/// in logical pixels. Zero keeps the charm's cord visually attached to the edge
/// of the screen (below the menu bar on macOS, below a top panel on Linux).
pub const TOP_OFFSET: f64 = 0.0;

/// Minimum distance between the charm window and a monitor edge, in logical
/// pixels. This also protects future custom positions from going off-screen.
pub const HORIZONTAL_EDGE_MARGIN: f64 = 16.0;

/// Whether the charm floats above regular application windows.
pub const ALWAYS_ON_TOP: bool = false;

/// The monitor the charm is attached to.
///
/// Only [`MonitorTarget::Primary`] is used today. The enum exists so that a
/// user-selected monitor can be introduced later without changing the shape of
/// the placement code, and so unknown monitors have a defined fallback.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MonitorTarget {
    /// The monitor the OS reports as primary.
    Primary,
    /// A monitor matched by the name the OS reports for it. Handled by the
    /// placement code already; nothing constructs it until monitor selection is
    /// exposed in settings.
    #[allow(dead_code)]
    Named(String),
}

/// Geometry and behaviour of the floating charm window, in logical pixels.
#[derive(Debug, Clone, PartialEq)]
pub struct CharmWindowConfig {
    pub width: f64,
    pub height: f64,
    pub top_offset: f64,
    pub always_on_top: bool,
    pub monitor: MonitorTarget,
}

impl Default for CharmWindowConfig {
    fn default() -> Self {
        Self {
            width: WINDOW_WIDTH,
            height: WINDOW_HEIGHT,
            top_offset: TOP_OFFSET,
            always_on_top: ALWAYS_ON_TOP,
            monitor: MonitorTarget::Primary,
        }
    }
}

impl CharmWindowConfig {
    /// Replaces values that would produce an unusable window with the defaults,
    /// so a bad stored configuration can never leave the charm invisible or
    /// off-screen.
    pub fn sanitized(mut self) -> Self {
        if !self.width.is_finite() || self.width < MIN_WINDOW_SIDE {
            self.width = WINDOW_WIDTH;
        }
        if !self.height.is_finite() || self.height < MIN_WINDOW_SIDE {
            self.height = WINDOW_HEIGHT;
        }
        if !self.top_offset.is_finite() || self.top_offset < 0.0 {
            self.top_offset = TOP_OFFSET;
        }
        self
    }
}

/// Smallest window side that can still show a charm.
const MIN_WINDOW_SIDE: f64 = 40.0;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn defaults_are_the_documented_constants() {
        let config = CharmWindowConfig::default();

        assert_eq!(config.width, WINDOW_WIDTH);
        assert_eq!(config.height, WINDOW_HEIGHT);
        assert_eq!(config.top_offset, TOP_OFFSET);
        assert!(!config.always_on_top);
        assert_eq!(config.monitor, MonitorTarget::Primary);
    }

    #[test]
    fn defaults_survive_sanitizing() {
        let config = CharmWindowConfig::default();

        assert_eq!(config.clone().sanitized(), config);
    }

    #[test]
    fn unusable_sizes_fall_back_to_defaults() {
        let config = CharmWindowConfig {
            width: 0.0,
            height: f64::NAN,
            top_offset: -12.0,
            ..CharmWindowConfig::default()
        }
        .sanitized();

        assert_eq!(config.width, WINDOW_WIDTH);
        assert_eq!(config.height, WINDOW_HEIGHT);
        assert_eq!(config.top_offset, TOP_OFFSET);
    }

    #[test]
    fn usable_custom_sizes_are_kept() {
        let config = CharmWindowConfig {
            width: 320.0,
            height: 420.0,
            top_offset: 8.0,
            ..CharmWindowConfig::default()
        }
        .sanitized();

        assert_eq!(config.width, 320.0);
        assert_eq!(config.height, 420.0);
        assert_eq!(config.top_offset, 8.0);
    }
}
