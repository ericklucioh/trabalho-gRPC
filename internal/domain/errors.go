package domain

import "fmt"

type ErrorCode string

const (
	ErrorCodeInvalidArgument     ErrorCode = "invalid_argument"
	ErrorCodeUnsupportedVersion  ErrorCode = "unsupported_version"
	ErrorCodeToolNotFound        ErrorCode = "tool_not_found"
	ErrorCodeArtifactUnavailable ErrorCode = "artifact_unavailable"
	ErrorCodeInternal            ErrorCode = "internal"
)

type AppError struct {
	Code           ErrorCode
	Message        string
	OffendingValue string
	ExpectedShape  string
	Err            error
}

func (e AppError) Error() string {
	if e.Err == nil {
		return fmt.Sprintf("%s: %s", e.Code, e.Message)
	}

	return fmt.Sprintf("%s: %s: %v", e.Code, e.Message, e.Err)
}

func (e AppError) Unwrap() error {
	return e.Err
}

func NewError(code ErrorCode, message, offendingValue, expectedShape string, err error) AppError {
	return AppError{
		Code:           code,
		Message:        message,
		OffendingValue: offendingValue,
		ExpectedShape:  expectedShape,
		Err:            err,
	}
}
