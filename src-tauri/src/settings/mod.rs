//! Typed, local-only settings and JSON persistence.

use std::{
    fs, io,
    path::{Path, PathBuf},
    sync::Mutex,
};

use serde::{Deserialize, Serialize};

pub const MIN_SCALE: f64 = 0.75;
pub const MAX_SCALE: f64 = 1.30;
pub const LEFT_PRESET_X: f64 = 0.18;
pub const CENTER_PRESET_X: f64 = 0.50;
pub const RIGHT_PRESET_X: f64 = 0.82;

const CHARM_IDS: &[&str] = &[
    "nazar",
    "nimbu-mirchi",
    "lucky-cat",
    "horseshoe",
    "clover",
    "hamsa",
    "daruma",
    "drishti-bommai",
    "scarab",
    "lucky-coin",
    "red-knot",
    "eye-bead",
];
const THREAD_IDS: &[&str] = &["classic", "red", "gold", "beaded", "minimal", "none"];

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct CharmSettings {
    pub charm_id: String,
    pub position: PositionSettings,
    pub thread: ThreadSettings,
    pub scale: f64,
    pub visible: bool,
    pub monitor: MonitorSettings,
}

impl Default for CharmSettings {
    fn default() -> Self {
        Self {
            charm_id: "nazar".into(),
            position: PositionSettings::default(),
            thread: ThreadSettings::default(),
            scale: 1.0,
            visible: true,
            monitor: MonitorSettings::default(),
        }
    }
}

impl CharmSettings {
    pub fn sanitized(mut self) -> Self {
        if !CHARM_IDS.contains(&self.charm_id.as_str()) {
            self.charm_id = CharmSettings::default().charm_id;
        }
        if !THREAD_IDS.contains(&self.thread.id.as_str()) {
            self.thread = ThreadSettings::default();
        }
        if !self.scale.is_finite() {
            self.scale = 1.0;
        }
        self.scale = self.scale.clamp(MIN_SCALE, MAX_SCALE);
        self.position = self.position.sanitized();
        self
    }
}

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PositionSettings {
    /// Horizontal attachment point across the monitor work area, from 0 to 1.
    /// This is the sole source of truth for presets, slider and desktop drag.
    pub normalized_x: f64,
}

impl Default for PositionSettings {
    fn default() -> Self {
        Self {
            normalized_x: CENTER_PRESET_X,
        }
    }
}

impl PositionSettings {
    fn sanitized(mut self) -> Self {
        if !self.normalized_x.is_finite() {
            self.normalized_x = CENTER_PRESET_X;
        }
        self.normalized_x = self.normalized_x.clamp(0.0, 1.0);
        self
    }
}

/// Phase 3 position values accepted only while reading old settings files.
#[derive(Debug, Default, Clone, Copy, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum LegacyPositionMode {
    Left,
    #[default]
    Center,
    Right,
    Custom,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PositionSettingsWire {
    normalized_x: Option<f64>,
    #[serde(default)]
    mode: Option<LegacyPositionMode>,
}

impl<'de> Deserialize<'de> for PositionSettings {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let wire = PositionSettingsWire::deserialize(deserializer)?;
        let normalized_x =
            wire.normalized_x
                .unwrap_or_else(|| match wire.mode.unwrap_or_default() {
                    LegacyPositionMode::Left => LEFT_PRESET_X,
                    LegacyPositionMode::Center | LegacyPositionMode::Custom => CENTER_PRESET_X,
                    LegacyPositionMode::Right => RIGHT_PRESET_X,
                });
        Ok(Self { normalized_x })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(default)]
pub struct ThreadSettings {
    pub id: String,
}

impl Default for ThreadSettings {
    fn default() -> Self {
        Self {
            id: "classic".into(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct MonitorSettings {
    pub mode: MonitorMode,
    pub selected_id: Option<String>,
}

impl Default for MonitorSettings {
    fn default() -> Self {
        Self {
            mode: MonitorMode::Primary,
            selected_id: None,
        }
    }
}

#[derive(Debug, Default, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum MonitorMode {
    #[default]
    Primary,
    Selected,
}

pub struct SettingsState {
    pub current: Mutex<CharmSettings>,
    store: SettingsStore,
}

impl SettingsState {
    pub fn load(path: PathBuf) -> Self {
        let store = SettingsStore::new(path);
        let current = store.load();
        Self {
            current: Mutex::new(current),
            store,
        }
    }

    pub fn save(&self, settings: &CharmSettings) -> io::Result<()> {
        self.store.save(settings)
    }
}

#[derive(Debug, Clone)]
struct SettingsStore {
    path: PathBuf,
}

impl SettingsStore {
    fn new(path: PathBuf) -> Self {
        Self { path }
    }

    fn load(&self) -> CharmSettings {
        let result = fs::read_to_string(&self.path)
            .ok()
            .and_then(|json| serde_json::from_str::<CharmSettings>(&json).ok())
            .map(CharmSettings::sanitized);

        result.unwrap_or_default()
    }

    fn save(&self, settings: &CharmSettings) -> io::Result<()> {
        if let Some(parent) = self.path.parent() {
            fs::create_dir_all(parent)?;
        }

        let json = serde_json::to_vec_pretty(settings)
            .map_err(|error| io::Error::new(io::ErrorKind::InvalidData, error))?;
        let temporary = temporary_path(&self.path);
        fs::write(&temporary, json)?;

        if let Err(rename_error) = fs::rename(&temporary, &self.path) {
            if self.path.exists() {
                fs::remove_file(&self.path)?;
                fs::rename(&temporary, &self.path)?;
            } else {
                return Err(rename_error);
            }
        }

        Ok(())
    }
}

fn temporary_path(path: &Path) -> PathBuf {
    let mut temporary = path.as_os_str().to_owned();
    temporary.push(".tmp");
    temporary.into()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn test_path(name: &str) -> PathBuf {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock should be valid")
            .as_nanos();
        std::env::temp_dir().join(format!("luckydrop-{name}-{nonce}.json"))
    }

    #[test]
    fn defaults_match_the_product_defaults() {
        let settings = CharmSettings::default();
        assert_eq!(settings.charm_id, "nazar");
        assert_eq!(settings.position.normalized_x, CENTER_PRESET_X);
        assert_eq!(settings.thread.id, "classic");
        assert_eq!(settings.scale, 1.0);
        assert!(settings.visible);
        assert_eq!(settings.monitor.mode, MonitorMode::Primary);
    }

    #[test]
    fn invalid_values_are_sanitized() {
        let settings = CharmSettings {
            charm_id: "unknown".into(),
            thread: ThreadSettings { id: "wire".into() },
            scale: f64::INFINITY,
            position: PositionSettings {
                normalized_x: f64::NAN,
            },
            ..CharmSettings::default()
        }
        .sanitized();

        assert_eq!(settings.charm_id, "nazar");
        assert_eq!(settings.thread.id, "classic");
        assert_eq!(settings.scale, 1.0);
        assert_eq!(settings.position.normalized_x, CENTER_PRESET_X);
    }

    #[test]
    fn settings_round_trip_through_disk() {
        let path = test_path("round-trip");
        let store = SettingsStore::new(path.clone());
        let expected = CharmSettings {
            charm_id: "clover".into(),
            position: PositionSettings {
                normalized_x: RIGHT_PRESET_X,
            },
            thread: ThreadSettings { id: "gold".into() },
            scale: 1.2,
            visible: false,
            ..CharmSettings::default()
        };

        store.save(&expected).expect("settings should save");
        assert_eq!(store.load(), expected);
        let _ = fs::remove_file(path);
    }

    #[test]
    fn missing_or_malformed_files_return_defaults() {
        let missing = SettingsStore::new(test_path("missing"));
        assert_eq!(missing.load(), CharmSettings::default());

        let malformed_path = test_path("malformed");
        fs::write(&malformed_path, "{ definitely not json").expect("fixture should write");
        let malformed = SettingsStore::new(malformed_path.clone());
        assert_eq!(malformed.load(), CharmSettings::default());
        let _ = fs::remove_file(malformed_path);
    }

    #[test]
    fn phase_three_position_files_migrate_to_normalized_x() {
        let json = r#"{
          "charmId": "nazar",
          "position": { "mode": "right", "offset": 0 },
          "thread": { "id": "classic" },
          "scale": 1,
          "visible": true,
          "monitor": { "mode": "primary", "selectedId": null }
        }"#;

        let settings: CharmSettings =
            serde_json::from_str(json).expect("legacy settings should load");
        assert_eq!(settings.position.normalized_x, RIGHT_PRESET_X);
    }
}
