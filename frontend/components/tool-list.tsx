import { type ToolId, type ToolSummary } from '../lib/contracts';
import { ToolCard } from './tool-card';

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
            <ToolCard key={tool.toolId} isSelected={selectedToolId === tool.toolId} onSelect={onSelectTool} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
