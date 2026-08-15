//! Screen-aware conversion between normalized attachment points and native
//! window coordinates.

use crate::settings::PositionSettings;

use super::config::{CharmWindowConfig, HORIZONTAL_EDGE_MARGIN};

/// Usable monitor geometry in physical pixels.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct WorkArea {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub scale_factor: f64,
}

/// Native top-left window coordinates in physical pixels.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct WindowPosition {
    pub x: i32,
    pub y: i32,
}

/// Places the fixed-size charm window around its normalized attachment point.
pub fn top_position(
    work_area: WorkArea,
    config: &CharmWindowConfig,
    position: &PositionSettings,
) -> WindowPosition {
    let scale = valid_scale(work_area.scale_factor);
    let window_height = to_physical(config.height, scale);
    let free_height = i64::from(work_area.height) - window_height;

    let x = normalized_to_window_x(work_area, config, position.normalized_x);
    let y =
        i64::from(work_area.y) + to_physical(config.top_offset, scale).clamp(0, free_height.max(0));

    WindowPosition { x, y: saturate(y) }
}

/// Converts the normalized attachment point to the fixed charm window's left
/// edge, preserving margins and supporting negative virtual-desktop origins.
pub fn normalized_to_window_x(
    work_area: WorkArea,
    config: &CharmWindowConfig,
    normalized_x: f64,
) -> i32 {
    let scale = valid_scale(work_area.scale_factor);
    let window_width = to_physical(config.width, scale);
    let free_width = i64::from(work_area.width) - window_width;

    if free_width <= 0 {
        return work_area.x;
    }

    let normalized_x = clamp_drag_normalized(work_area, config, normalized_x);
    let anchor = (f64::from(work_area.width) * normalized_x).round() as i64;
    saturate(i64::from(work_area.x) + anchor - (window_width / 2))
}

/// Converts a physical desktop x-coordinate into the monitor-independent value
/// persisted by settings.
#[cfg_attr(not(test), allow(dead_code))]
pub fn screen_x_to_normalized(work_area: WorkArea, screen_x: i32) -> f64 {
    if work_area.width == 0 {
        return 0.5;
    }

    (f64::from(screen_x - work_area.x) / f64::from(work_area.width)).clamp(0.0, 1.0)
}

/// Clamps drag/slider values so the fixed charm window remains within the
/// monitor's usable area with the configured logical margin.
pub fn clamp_drag_normalized(
    work_area: WorkArea,
    config: &CharmWindowConfig,
    normalized_x: f64,
) -> f64 {
    if work_area.width == 0 {
        return 0.5;
    }

    let scale = valid_scale(work_area.scale_factor);
    let half_window = to_physical(config.width, scale) as f64 / 2.0;
    let margin = to_physical(HORIZONTAL_EDGE_MARGIN, scale) as f64;
    let minimum = ((half_window + margin) / f64::from(work_area.width)).min(0.5);
    let maximum = 1.0 - minimum;
    let normalized_x = if normalized_x.is_finite() {
        normalized_x
    } else {
        0.5
    };
    normalized_x.clamp(minimum, maximum)
}

pub fn valid_normalized_range(work_area: WorkArea, config: &CharmWindowConfig) -> (f64, f64) {
    (
        clamp_drag_normalized(work_area, config, 0.0),
        clamp_drag_normalized(work_area, config, 1.0),
    )
}

fn valid_scale(scale: f64) -> f64 {
    if scale.is_finite() && scale > 0.0 {
        scale
    } else {
        1.0
    }
}

fn to_physical(logical: f64, scale: f64) -> i64 {
    if !logical.is_finite() || logical <= 0.0 {
        return 0;
    }
    (logical * scale).round() as i64
}

fn saturate(value: i64) -> i32 {
    value.clamp(i64::from(i32::MIN), i64::from(i32::MAX)) as i32
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::settings::{CENTER_PRESET_X, LEFT_PRESET_X, RIGHT_PRESET_X};

    fn area(x: i32, y: i32, width: u32, height: u32, scale: f64) -> WorkArea {
        WorkArea {
            x,
            y,
            width,
            height,
            scale_factor: scale,
        }
    }

    fn at(normalized_x: f64) -> PositionSettings {
        PositionSettings { normalized_x }
    }

    #[test]
    fn normalized_center_maps_to_screen_center() {
        let config = CharmWindowConfig::default();
        assert_eq!(
            top_position(area(0, 0, 1920, 1080, 1.0), &config, &at(CENTER_PRESET_X)),
            WindowPosition { x: 830, y: 0 }
        );
    }

    #[test]
    fn presets_map_to_expected_coordinates() {
        let config = CharmWindowConfig::default();
        let screen = area(0, 0, 1920, 1080, 1.0);

        assert_eq!(normalized_to_window_x(screen, &config, LEFT_PRESET_X), 216);
        assert_eq!(
            normalized_to_window_x(screen, &config, CENTER_PRESET_X),
            830
        );
        assert_eq!(
            normalized_to_window_x(screen, &config, RIGHT_PRESET_X),
            1444
        );
    }

    #[test]
    fn hidpi_uses_physical_window_width() {
        let config = CharmWindowConfig::default();
        assert_eq!(
            normalized_to_window_x(area(0, 0, 3024, 1890, 2.0), &config, RIGHT_PRESET_X),
            2220
        );
    }

    #[test]
    fn negative_monitor_origins_are_preserved() {
        let config = CharmWindowConfig::default();
        assert_eq!(
            normalized_to_window_x(area(-1920, -200, 1920, 1080, 1.0), &config, LEFT_PRESET_X),
            -1704
        );
    }

    #[test]
    fn normalized_and_screen_coordinates_round_trip() {
        let config = CharmWindowConfig::default();
        let screen = area(-1920, 0, 1920, 1080, 1.0);
        let window_x = normalized_to_window_x(screen, &config, 0.63);
        let attachment_x = window_x + (config.width / 2.0) as i32;

        assert!((screen_x_to_normalized(screen, attachment_x) - 0.63).abs() < 0.001);
    }

    #[test]
    fn drag_values_clamp_to_visible_window_bounds() {
        let config = CharmWindowConfig::default();
        let screen = area(0, 0, 1440, 900, 1.0);
        let (minimum, maximum) = valid_normalized_range(screen, &config);

        assert!((minimum - (146.0 / 1440.0)).abs() < 0.0001);
        assert_eq!(clamp_drag_normalized(screen, &config, -4.0), minimum);
        assert_eq!(clamp_drag_normalized(screen, &config, 4.0), maximum);
    }

    #[test]
    fn work_area_origin_and_top_offset_are_respected() {
        let config = CharmWindowConfig {
            top_offset: 24.0,
            ..CharmWindowConfig::default()
        };
        assert_eq!(
            top_position(area(100, 38, 1920, 1042, 1.0), &config, &at(0.5)),
            WindowPosition { x: 930, y: 62 }
        );
    }

    #[test]
    fn oversized_window_stays_at_monitor_origin() {
        let config = CharmWindowConfig {
            width: 400.0,
            ..CharmWindowConfig::default()
        };
        assert_eq!(
            normalized_to_window_x(area(100, 50, 320, 240, 1.0), &config, 0.5),
            100
        );
    }

    #[test]
    fn invalid_scale_factor_falls_back_to_one() {
        let config = CharmWindowConfig::default();
        assert_eq!(
            normalized_to_window_x(area(0, 0, 1920, 1080, 0.0), &config, 0.5),
            830
        );
    }
}
