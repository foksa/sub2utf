use chardetng::EncodingDetector;
use encoding_rs::Encoding;

#[tauri::command]
fn detect_encoding(data: Vec<u8>) -> Result<(String, f32), String> {
    let mut detector = EncodingDetector::new();
    detector.feed(&data, true);
    let encoding = detector.guess(None, true);
    let name = encoding.name().to_string();
    // chardetng doesn't provide confidence, so we use 1.0 for detected encodings
    Ok((name, 1.0))
}

#[tauri::command]
fn convert_to_utf8(data: Vec<u8>, encoding: String) -> Result<String, String> {
    let enc = Encoding::for_label(encoding.as_bytes())
        .ok_or_else(|| format!("Unknown encoding: {}", encoding))?;

    let (decoded, _, had_errors) = enc.decode(&data);

    if had_errors {
        Err("Decoding had errors".to_string())
    } else {
        Ok(decoded.into_owned())
    }
}

#[tauri::command]
fn save_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, content).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            detect_encoding,
            convert_to_utf8,
            save_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
