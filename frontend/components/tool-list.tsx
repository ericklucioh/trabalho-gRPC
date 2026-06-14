import { type ToolId, type ToolSummary } from '../lib/contracts';

interface ToolListProps {
  tools: ToolSummary[];
  selectedToolId: ToolId | null;
  onSelectTool: (toolId: ToolId) => void;
}

export function ToolList({ tools, selectedToolId, onSelectTool }: ToolListProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Tools disponíveis</h2>
        <p className="panel-subtitle">Selecione uma tool do catálogo MVP. A preparação agora vem do backend gRPC real.</p>
      </div>
      <div className="panel-body">
        <div className="tool-grid">
          {tools.map((tool) => (
            <button
              key={tool.toolId}
              className="tool-card"
              data-selected={selectedToolId === tool.toolId}
              onClick={() => onSelectTool(tool.toolId)}
              type="button"
            >
              <div className="tool-card-title">
                <span>{tool.displayName}</span>
                <span className="tool-card-meta">{tool.latestVersion}</span>
              </div>
              <p className="tool-card-description">{tool.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
