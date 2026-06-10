use json2yaml::{convert_json_to_yaml, Json2YamlError};

fn assert_yaml_equivalent(input_json: &str) {
    let output = convert_json_to_yaml(input_json).expect("conversion should succeed");

    let expected: serde_yaml::Value =
        serde_yaml::from_str(input_json).expect("input should be valid YAML-compatible JSON");
    let actual: serde_yaml::Value = serde_yaml::from_str(&output).expect("output should be valid YAML");

    assert_eq!(actual, expected);
}

#[test]
fn converts_simple_object_exactly() {
    assert_yaml_equivalent(r#"{"name":"lojinha","enabled":true,"count":3}"#);
}

#[test]
fn converts_nested_structure() {
    assert_yaml_equivalent(r#"{"tools":["json2yaml","jsonlint"],"meta":{"version":1}}"#);
}

#[test]
fn returns_parse_error_for_invalid_json() {
    let error = convert_json_to_yaml("{invalid json}").expect_err("input should fail");

    match error {
        Json2YamlError::JsonParse(_) => {}
        other => panic!("expected JsonParse error, got {other}"),
    }
}
