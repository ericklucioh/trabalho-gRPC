use yaml2json::{convert_yaml_to_json, Yaml2JsonError};

fn assert_json_equivalent(input_yaml: &str) {
    let output = convert_yaml_to_json(input_yaml).expect("conversion should succeed");

    let expected: serde_json::Value =
        serde_yaml::from_str(input_yaml).expect("input should be valid YAML");
    let actual: serde_json::Value = serde_json::from_str(&output).expect("output should be valid JSON");

    assert_eq!(actual, expected);
}

#[test]
fn converts_simple_mapping() {
    assert_json_equivalent("name: lojinha\nenabled: true\ncount: 3\n");
}

#[test]
fn converts_nested_structure() {
    assert_json_equivalent("tools:\n  - json2yaml\n  - jsonlint\nmeta:\n  version: 1\n");
}

#[test]
fn returns_parse_error_for_invalid_yaml() {
    let error = convert_yaml_to_json("name: [invalid").expect_err("input should fail");

    match error {
        Yaml2JsonError::YamlParse(_) => {}
        other => panic!("expected YamlParse error, got {other}"),
    }
}
