package domain

import "fmt"

func ValidateRequestHeader(apiVersion string, clientRequestID string) error {
	if apiVersion != SupportedAPIVersion {
		return NewError(
			ErrorCodeUnsupportedVersion,
			"api version is not supported",
			apiVersion,
			SupportedAPIVersion,
			nil,
		)
	}

	if clientRequestID == "" {
		return NewError(
			ErrorCodeInvalidArgument,
			"client request id is required",
			clientRequestID,
			"non-empty string",
			nil,
		)
	}

	return nil
}

func ValidateToolID(toolID string) error {
	if toolID == "" {
		return NewError(
			ErrorCodeInvalidArgument,
			"tool id is required",
			toolID,
			"non-empty string",
			nil,
		)
	}

	if toolID != "json2yaml" && toolID != "yaml2json" {
		return NewError(
			ErrorCodeToolNotFound,
			"tool is not supported",
			toolID,
			"json2yaml or yaml2json",
			nil,
		)
	}

	return nil
}

func ValidateArtifactPath(path string) error {
	if path == "" {
		return NewError(
			ErrorCodeArtifactUnavailable,
			"artifact path is required",
			path,
			"non-empty string",
			nil,
		)
	}

	if len(path) > 512 {
		return NewError(
			ErrorCodeInvalidArgument,
			"artifact path is too long",
			path,
			"relative path under 512 characters",
			nil,
		)
	}

	return nil
}

func ValidateSupportedTools() error {
	for _, toolID := range []string{"json2yaml", "yaml2json"} {
		if err := ValidateToolID(toolID); err != nil {
			return fmt.Errorf("tool allowlist is invalid: %w", err)
		}
	}

	return nil
}
