package grpctransport

import (
	"context"
	"errors"

	"github.com/erick/projs/trabalho-grpc/gen/lojinhawasm/v1"
	"github.com/erick/projs/trabalho-grpc/internal/application"
	"github.com/erick/projs/trabalho-grpc/internal/domain"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Handler struct {
	lojinhawasmv1.UnimplementedToolCatalogServiceServer
	app *application.Service
}

func NewHandler(app *application.Service) *Handler {
	return &Handler{app: app}
}

func (h *Handler) ListTools(ctx context.Context, request *lojinhawasmv1.ListToolsRequest) (*lojinhawasmv1.ListToolsResponse, error) {
	result, err := h.app.ListTools(ctx, domain.ListToolsRequest{
		APIVersion:      request.GetApiVersion(),
		ClientRequestID: request.GetClientRequestId(),
	})
	if err != nil {
		return nil, toStatus(err)
	}

	return &lojinhawasmv1.ListToolsResponse{
		ApiVersion: result.APIVersion,
		Tools:      toProtoToolSummaries(result.Tools),
	}, nil
}

func (h *Handler) GetToolPackage(ctx context.Context, request *lojinhawasmv1.GetToolPackageRequest) (*lojinhawasmv1.GetToolPackageResponse, error) {
	result, err := h.app.GetToolPackage(ctx, domain.GetToolPackageRequest{
		APIVersion:      request.GetApiVersion(),
		ToolID:          request.GetToolId(),
		ClientRequestID: request.GetClientRequestId(),
	})
	if err != nil {
		return nil, toStatus(err)
	}

	return &lojinhawasmv1.GetToolPackageResponse{
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

func toProtoToolSummaries(tools []domain.ToolSummary) []*lojinhawasmv1.ToolSummary {
	summaries := make([]*lojinhawasmv1.ToolSummary, 0, len(tools))
	for _, tool := range tools {
		summaries = append(summaries, &lojinhawasmv1.ToolSummary{
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
