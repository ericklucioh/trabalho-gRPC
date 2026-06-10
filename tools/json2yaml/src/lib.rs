use std::fmt;

/// Converts JSON text into YAML text.
pub fn convert_json_to_yaml(input: &str) -> Result<String, Json2YamlError> {
    let value: serde_json::Value = serde_json::from_str(input).map_err(Json2YamlError::JsonParse)?;
    serde_yaml::to_string(&value).map_err(Json2YamlError::YamlSerialize)
}

/// Errors produced by the JSON to YAML conversion pipeline.
#[derive(Debug)]
pub enum Json2YamlError {
    JsonParse(serde_json::Error),
    YamlSerialize(serde_yaml::Error),
}

impl fmt::Display for Json2YamlError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::JsonParse(err) => write!(f, "invalid JSON input: {err}"),
            Self::YamlSerialize(err) => write!(f, "failed to serialize YAML: {err}"),
        }
    }
}

impl std::error::Error for Json2YamlError {}

#[cfg(test)]
mod tests {
    use super::convert_json_to_yaml;

    #[test]
    fn converts_object_json_to_yaml() {
        let input = r#"{"name":"lojinha","enabled":true,"count":3}"#;

        let output = convert_json_to_yaml(input).expect("conversion should succeed");

        assert!(output.contains("name: lojinha"));
        assert!(output.contains("enabled: true"));
        assert!(output.contains("count: 3"));
    }

    #[test]
    fn converts_nested_json_to_yaml() {
        let input = r#"{"tools":["json2yaml","jsonlint"],"meta":{"version":1}}"#;

        let output = convert_json_to_yaml(input).expect("conversion should succeed");

        assert!(output.contains("tools:"));
        assert!(output.contains("- json2yaml"));
        assert!(output.contains("meta:"));
        assert!(output.contains("version: 1"));
    }

    #[test]
    fn rejects_invalid_json() {
        let error = convert_json_to_yaml("{invalid json}").expect_err("input should fail");

        assert!(error.to_string().contains("invalid JSON input"));
    }
}
