package grpctransport

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/erick/projs/wasm-tool-store/gen/wasmtoolstore/v1"
	"github.com/erick/projs/wasm-tool-store/internal/adapters/logging"
	"github.com/erick/projs/wasm-tool-store/internal/application"
	"github.com/erick/projs/wasm-tool-store/internal/domain"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Handler struct {
	wasmtoolstorev1.UnimplementedToolCatalogServiceServer
	app    *application.Service
	logger logging.Logger
}

func NewHandler(app *application.Service, logger logging.Logger) *Handler {
	if logger == nil {
		logger = logging.NopLogger{}
	}

	return &Handler{app: app, logger: logger}
}

func (h *Handler) ListTools(ctx context.Context, request *wasmtoolstorev1.ListToolsRequest) (*wasmtoolstorev1.ListToolsResponse, error) {
	startedAt := time.Now()
	apiVersion := request.GetApiVersion()
	clientRequestID := request.GetClientRequestId()
	h.logRequestStart("ListTools", apiVersion, clientRequestID, "")

	result, err := h.app.ListTools(ctx, domain.ListToolsRequest{
		APIVersion:      apiVersion,
		ClientRequestID: clientRequestID,
	})
	if err != nil {
		h.logRequestError("ListTools", clientRequestID, "", startedAt, err)
		return nil, toStatus(err)
	}

	h.logRequestSuccess("ListTools", clientRequestID, "", startedAt, "tools=%d", len(result.Tools))
	return &wasmtoolstorev1.ListToolsResponse{
		ApiVersion: result.APIVersion,
		Tools:      toProtoToolSummaries(result.Tools),
	}, nil
}

func (h *Handler) GetToolPackage(ctx context.Context, request *wasmtoolstorev1.GetToolPackageRequest) (*wasmtoolstorev1.GetToolPackageResponse, error) {
	startedAt := time.Now()
	apiVersion := request.GetApiVersion()
	toolID := request.GetToolId()
	clientRequestID := request.GetClientRequestId()
	h.logRequestStart("GetToolPackage", apiVersion, clientRequestID, toolID)

	result, err := h.app.GetToolPackage(ctx, domain.GetToolPackageRequest{
		APIVersion:      apiVersion,
		ToolID:          toolID,
		ClientRequestID: clientRequestID,
	})
	if err != nil {
		h.logRequestError("GetToolPackage", clientRequestID, toolID, startedAt, err)
		return nil, toStatus(err)
	}

	h.logRequestSuccess("GetToolPackage", clientRequestID, toolID, startedAt, "wasm_size_bytes=%d sha256=%s", result.WASMSizeBytes, result.WASMSHA256)
	return &wasmtoolstorev1.GetToolPackageResponse{
		ApiVersion:         result.APIVersion,
		ToolId:             result.ToolID,
		ToolName:           result.ToolName,
		Description:        result.Description,
		ModuleVersion:      result.ModuleVersion,
		Entrypoint:         result.Entrypoint,
		InputKind:          result.InputKind,
		OutputKind:         result.OutputKind,
		SupportedMimeTypes: result.SupportedMIMETypes,
		CacheTtlSeconds:    result.CacheTTLSeconds,
		WasmBytes:          result.WASMBytes,
		WasmSha256:         result.WASMSHA256,
		WasmSizeBytes:      result.WASMSizeBytes,
	}, nil
}

func (h *Handler) logRequestStart(method, apiVersion, clientRequestID, toolID string) {
	h.logger.Printf(
		"grpc request start method=%s api_version=%s client_request_id=%s tool_id=%s",
		method,
		apiVersion,
		clientRequestID,
		toolID,
	)
}

func (h *Handler) logRequestSuccess(method, clientRequestID, toolID string, startedAt time.Time, format string, args ...interface{}) {
	h.logger.Printf(
		"grpc request success method=%s client_request_id=%s tool_id=%s duration=%s %s",
		method,
		clientRequestID,
		toolID,
		time.Since(startedAt).Round(time.Millisecond),
		formatWithArgs(format, args...),
	)
}

func (h *Handler) logRequestError(method, clientRequestID, toolID string, startedAt time.Time, err error) {
	h.logger.Printf(
		"grpc request error method=%s client_request_id=%s tool_id=%s duration=%s err=%v",
		method,
		clientRequestID,
		toolID,
		time.Since(startedAt).Round(time.Millisecond),
		err,
	)
}

func formatWithArgs(format string, args ...interface{}) string {
	if len(args) == 0 {
		return format
	}

	return fmt.Sprintf(format, args...)
}

func toProtoToolSummaries(tools []domain.ToolSummary) []*wasmtoolstorev1.ToolSummary {
	summaries := make([]*wasmtoolstorev1.ToolSummary, 0, len(tools))
	for _, tool := range tools {
		summaries = append(summaries, &wasmtoolstorev1.ToolSummary{
			ToolId:        tool.ToolID,
			DisplayName:   tool.DisplayName,
			Description:   tool.Description,
			LatestVersion: tool.LatestVersion,
		})
	}

	return summaries
}

func toStatus(err error) error {
	switch {
	case errors.Is(err, context.Canceled):
		return status.Error(codes.Canceled, err.Error())
	case errors.Is(err, context.DeadlineExceeded):
		return status.Error(codes.DeadlineExceeded, err.Error())
	}

	switch domainErr := err.(type) {
	case domain.AppError:
		return status.Error(toCode(domainErr.Code), domainErr.Error())
	default:
		return status.Error(codes.Internal, err.Error())
	}
}

func toCode(code domain.ErrorCode) codes.Code {
	switch code {
	case domain.ErrorCodeInvalidArgument, domain.ErrorCodeUnsupportedVersion:
		return codes.InvalidArgument
	case domain.ErrorCodeToolNotFound:
		return codes.NotFound
	case domain.ErrorCodeArtifactUnavailable:
		return codes.FailedPrecondition
	default:
		return codes.Internal
	}
}
