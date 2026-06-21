use std::fmt;
use std::mem;
use std::slice;
use std::str;
use std::sync::{Mutex, OnceLock};

static LAST_ERROR: OnceLock<Mutex<Vec<u8>>> = OnceLock::new();

pub fn format_json_pretty(input: &str) -> Result<String, JsonPrettyError> {
    let value: serde_json::Value = serde_json::from_str(input).map_err(JsonPrettyError::JsonParse)?;
    serde_json::to_string_pretty(&value).map_err(JsonPrettyError::JsonSerialize)
}

#[no_mangle]
pub extern "C" fn wasm_alloc(length: usize) -> *mut u8 {
    let mut buffer = vec![0_u8; length];
    let ptr = buffer.as_mut_ptr();
    mem::forget(buffer);
    ptr
}

#[no_mangle]
pub extern "C" fn wasm_free(ptr: *mut u8, length: usize) {
    if ptr.is_null() {
        return;
    }

    unsafe {
        drop(Vec::from_raw_parts(ptr, 0, length));
    }
}

#[no_mangle]
pub extern "C" fn convert(ptr: *const u8, length: usize) -> *mut u8 {
    let input = match read_input(ptr, length) {
        Ok(input) => input,
        Err(message) => {
            set_last_error(&message);
            return std::ptr::null_mut();
        }
    };

    match format_json_pretty(&input) {
        Ok(output) => {
            clear_last_error();
            allocate_c_string(&output)
        }
        Err(error) => {
            set_last_error(&format_error(&error, &input));
            std::ptr::null_mut()
        }
    }
}

#[no_mangle]
pub extern "C" fn last_error_ptr() -> *const u8 {
    let error = last_error_buffer().lock().expect("last error lock");
    error.as_ptr()
}

#[no_mangle]
pub extern "C" fn last_error_len() -> usize {
    let error = last_error_buffer().lock().expect("last error lock");
    error.len()
}

#[derive(Debug)]
pub enum JsonPrettyError {
    JsonParse(serde_json::Error),
    JsonSerialize(serde_json::Error),
}

impl fmt::Display for JsonPrettyError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::JsonParse(err) => write!(f, "invalid JSON input: {err}"),
            Self::JsonSerialize(err) => write!(f, "failed to serialize JSON: {err}"),
        }
    }
}

impl std::error::Error for JsonPrettyError {}

fn allocate_c_string(value: &str) -> *mut u8 {
    let mut bytes = value.as_bytes().to_vec();
    bytes.push(0);
    let ptr = bytes.as_mut_ptr();
    mem::forget(bytes);
    ptr
}

fn read_input(ptr: *const u8, length: usize) -> Result<String, String> {
    let bytes = unsafe { slice::from_raw_parts(ptr, length) };
    str::from_utf8(bytes)
        .map(|value| value.to_owned())
        .map_err(|error| format!("input text must be valid UTF-8: {error}"))
}

fn format_error(error: &JsonPrettyError, offending_value: &str) -> String {
    format!("{error} Received value: {offending_value}. Expected: valid JSON.")
}

fn set_last_error(message: &str) {
    let mut error = last_error_buffer().lock().expect("last error lock");
    error.clear();
    error.extend_from_slice(message.as_bytes());
}

fn clear_last_error() {
    set_last_error("");
}

fn last_error_buffer() -> &'static Mutex<Vec<u8>> {
    LAST_ERROR.get_or_init(|| Mutex::new(Vec::new()))
}

#[cfg(test)]
mod tests {
    use super::format_json_pretty;

    #[test]
    fn formats_json_with_indentation() {
        let output = format_json_pretty(r#"{"name":"tool-store","enabled":true,"count":3}"#)
            .expect("conversion should succeed");

        assert!(output.contains("{"));
        assert!(output.contains("\n  \"name\": \"tool-store\""));
        assert!(output.contains("\n  \"enabled\": true"));
    }

    #[test]
    fn preserves_nested_structure() {
        let output = format_json_pretty(r#"{"tools":["json-pretty","json-minify"],"meta":{"version":1}}"#)
            .expect("conversion should succeed");

        assert!(output.contains("\"tools\""));
        assert!(output.contains("\"meta\""));
    }

    #[test]
    fn rejects_invalid_json() {
        let error = format_json_pretty("{invalid json}").expect_err("input should fail");

        assert!(error.to_string().contains("invalid JSON input"));
    }
}
