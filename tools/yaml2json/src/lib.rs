use std::fmt;

/// Converts YAML text into JSON text.
pub fn convert_yaml_to_json(input: &str) -> Result<String, Yaml2JsonError> {
    let value: serde_yaml::Value = serde_yaml::from_str(input).map_err(Yaml2JsonError::YamlParse)?;
    serde_json::to_string_pretty(&value).map_err(Yaml2JsonError::JsonSerialize)
}

/// Errors produced by the YAML to JSON conversion pipeline.
#[derive(Debug)]
pub enum Yaml2JsonError {
    YamlParse(serde_yaml::Error),
    JsonSerialize(serde_json::Error),
}

impl fmt::Display for Yaml2JsonError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::YamlParse(err) => write!(f, "invalid YAML input: {err}"),
            Self::JsonSerialize(err) => write!(f, "failed to serialize JSON: {err}"),
        }
    }
}

impl std::error::Error for Yaml2JsonError {}

#[cfg(test)]
mod tests {
    use super::convert_yaml_to_json;

    #[test]
    fn converts_mapping_yaml_to_json() {
        let input = "name: lojinha\nenabled: true\ncount: 3\n";

        let output = convert_yaml_to_json(input).expect("conversion should succeed");

        assert!(output.contains("\"name\": \"lojinha\""));
        assert!(output.contains("\"enabled\": true"));
        assert!(output.contains("\"count\": 3"));
    }

    #[test]
    fn converts_nested_yaml_to_json() {
        let input = "tools:\n  - json2yaml\n  - jsonlint\nmeta:\n  version: 1\n";

        let output = convert_yaml_to_json(input).expect("conversion should succeed");

        assert!(output.contains("\"tools\": ["));
        assert!(output.contains("\"json2yaml\""));
        assert!(output.contains("\"meta\": {"));
        assert!(output.contains("\"version\": 1"));
    }

    #[test]
    fn rejects_invalid_yaml() {
        let error = convert_yaml_to_json("name: [invalid").expect_err("input should fail");

        assert!(error.to_string().contains("invalid YAML input"));
    }
}
