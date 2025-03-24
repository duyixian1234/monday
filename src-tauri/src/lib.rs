use std::env;

#[tauri::command]
fn get_openai_settings() -> (String, String, String, String) {
    let api_key = env::var("OPENAI_API_KEY").unwrap_or_else(|_| "No API Key found".to_string());
    let base_url = env::var("OPENAI_BASE_URL").unwrap_or_else(|_| "No Base URL found".to_string());
    let model = env::var("OPENAI_MODEL").unwrap_or_else(|_| "No Model found".to_string());
    let deep_model = env::var("OPENAI_MODEL_DEEP").unwrap_or_else(|_| "No Deep Model found".to_string());
    (api_key, base_url, model, deep_model)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_openai_settings])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
