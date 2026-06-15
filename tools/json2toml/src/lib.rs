use std::fmt;
use std::mem;
use std::slice;
use std::str;
use std::sync::{Mutex, OnceLock};

static LAST_ERROR: OnceLock<Mutex<Vec<u8>>> = OnceLock::new();

pub fn convert_json_to_toml(input: &str) -> Result<String, Json2TomlError> {
    let value: serde_json::Value = serde_json::from_str(input).map_err(Json2TomlError::JsonParse)?;
    toml::to_string_pretty(&value).map_err(Json2TomlError::TomlSerialize)
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

    match convert_json_to_toml(&input) {
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
pub enum Json2TomlError {
    JsonParse(serde_json::Error),
    TomlSerialize(toml::ser::Error),
}

impl fmt::Display for Json2TomlError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::JsonParse(err) => write!(f, "invalid JSON input: {err}"),
            Self::TomlSerialize(err) => write!(f, "failed to serialize TOML: {err}"),
        }
    }
}

impl std::error::Error for Json2TomlError {}

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

fn format_error(error: &Json2TomlError, offending_value: &str) -> String {
    format!("{error} Valor recebido: {offending_value}. Esperado: JSON válido.")
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
    use super::convert_json_to_toml;

    #[test]
    fn converts_document() {
        let output = convert_json_to_toml(r#"{"name":"lojinha","enabled":true,"count":3,"meta":{"version":1}}"#)
            .expect("conversion should succeed");

        assert!(output.contains("name = \"lojinha\""));
        assert!(output.contains("enabled = true"));
        assert!(output.contains("[meta]"));
    }

    #[test]
    fn rejects_invalid_json() {
        let error = convert_json_to_toml("{invalid json}").expect_err("input should fail");

        assert!(error.to_string().contains("invalid JSON input"));
    }
}
