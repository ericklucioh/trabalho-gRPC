interface ToolOutputPanelProps {
  outputValue: string;
  isConfigured: boolean;
}

export function ToolOutputPanel({ outputValue, isConfigured }: ToolOutputPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Resultado</h2>
        <p className="panel-subtitle">A saída fica separada para deixar o fluxo da demo claro e legível.</p>
      </div>
      <div className="panel-body">
        <div className="output-box">
          <div className="metadata-row">
            <span>{isConfigured ? 'tool configurada' : 'aguardando configuração'}</span>
          </div>
          <pre>{outputValue || 'O resultado convertido aparecerá aqui.'}</pre>
        </div>
      </div>
    </section>
  );
}
