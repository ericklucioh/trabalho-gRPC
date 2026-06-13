import { type ToolSummary } from '../lib/contracts';

interface ToolCardProps {
  tool: ToolSummary;
  isSelected: boolean;
  onSelect: (toolId: ToolSummary['toolId']) => void;
}

export function ToolCard({ tool, isSelected, onSelect }: ToolCardProps) {
  return (
    <button className="tool-card" data-selected={isSelected} onClick={() => onSelect(tool.toolId)} type="button">
      <div className="tool-card-title">
        <span>{tool.displayName}</span>
        <span className="tool-card-meta">{tool.latestVersion}</span>
      </div>
      <p className="tool-card-description">{tool.description}</p>
      <div className="badge-row">
        <span className="status-badge">{tool.executionMode}</span>
        <span className="status-badge">{tool.supportedMimeTypes.join(', ')}</span>
      </div>
    </button>
  );
}
