mod commands;
mod native;
mod platform;
mod settings;
mod window;

use settings::SettingsState;
use tauri::Manager;
use window::config::CharmWindowConfig;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Must be registered first so subsequent launches forward deep links
        // and focus requests to the existing tray process.
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            native::handle_second_instance(app, args);
        }))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::window::get_monitor_metrics,
            commands::window::begin_charm_drag,
            commands::window::preview_drag_position
        ])
        .setup(|app| {
            let settings_path = app.path().app_config_dir()?.join("settings.json");
            let state = SettingsState::load(settings_path);
            let initial_settings = state
                .current
                .lock()
                .map(|settings| settings.clone())
                .unwrap_or_default();
            app.manage(state);
            app.manage(platform::DesktopPresenceState::default());

            let config = CharmWindowConfig::default().sanitized();
            window::create_charm_window(app.handle(), &config, &initial_settings)?;
            let customizer = window::create_customizer_window(app.handle())?;
            let handle = app.handle().clone();
            customizer.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    native::hide_customizer(&handle);
                }
            });
            native::initialize(app.handle(), &initial_settings)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
