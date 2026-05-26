use std::process::Command;

use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

const NEED_LOGIN: &str = "__NEED_LOGIN__";

fn find_gh() -> String {
    let candidates = [
        r"C:\Program Files\GitHub CLI\gh.exe",
        r"C:\Program Files (x86)\GitHub CLI\gh.exe",
    ];
    for p in &candidates {
        if std::path::Path::new(p).exists() {
            return p.to_string();
        }
    }
    "gh".to_string()
}

#[tauri::command]
async fn github_login(proxy: String) -> Result<(), String> {
    let gh = find_gh();
    let mut cmd = Command::new("cmd");
    cmd.args(["/C", "start", "powershell", "-NoExit", "-Command"]);

    let ps_cmd = if proxy.is_empty() {
        format!("& '{}' auth login", gh)
    } else {
        format!(
            "$env:HTTPS_PROXY='{}'; $env:HTTP_PROXY='{}'; & '{}' auth login",
            proxy, proxy, gh
        )
    };
    cmd.arg(&ps_cmd);

    cmd.spawn().map_err(|e| format!("无法打开终端: {}", e))?;
    Ok(())
}

#[tauri::command]
async fn create_and_clone_repo(
    name: String,
    org: String,
    work_dir: String,
    private: bool,
    proxy: String,
) -> Result<String, String> {
    let gh = find_gh();
    let visibility = if private { "--private" } else { "--public" };
    let full_name = format!("{}/{}", org, name);

    let mut cmd = Command::new(&gh);
    cmd.args(["repo", "create", &full_name, visibility, "--confirm"]);
    if !proxy.is_empty() {
        cmd.env("HTTPS_PROXY", &proxy).env("HTTP_PROXY", &proxy);
    }

    let output = cmd.output().map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            NEED_LOGIN.to_string()
        } else {
            format!("gh 执行失败: {}", e)
        }
    })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        if stderr.contains("not logged in") || stderr.contains("authentication") {
            return Err(NEED_LOGIN.to_string());
        }
        return Err(stderr);
    }

    let clone_url = format!("git@github.com:{}/{}.git", org, name);
    let dest = if work_dir.ends_with('/') || work_dir.ends_with('\\') {
        format!("{}{}", work_dir, name)
    } else {
        format!("{}/{}", work_dir, name)
    };

    let output = Command::new("git")
        .args(["clone", &clone_url, &dest])
        .output()
        .map_err(|e| format!("git 执行失败: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(dest)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let show = MenuItemBuilder::with_id("show", "显示主窗口").build(app)?;
            let quit = MenuItemBuilder::with_id("quit", "退出").build(app)?;
            let menu = MenuBuilder::new(app).items(&[&show, &quit]).build()?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("My Tools")
                .on_menu_event(|app: &tauri::AppHandle, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray: &tauri::tray::TrayIcon, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![create_and_clone_repo, github_login])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
