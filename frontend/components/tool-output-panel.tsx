interface ToolOutputPanelProps {
  outputValue: string;
  requestDurationMs: number | null;
  requestStartedAtIso: string | null;
  requestId: string | null;
  isConfigured: boolean;
}

export function ToolOutputPanel({
  outputValue,
  requestDurationMs,
  requestStartedAtIso,
  requestId,
  isConfigured,
}: ToolOutputPanelProps) {
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
            {requestId ? <span>Request: {requestId}</span> : null}
            {requestStartedAtIso ? <span>Início: {new Date(requestStartedAtIso).toLocaleTimeString('pt-BR')}</span> : null}
            {requestDurationMs != null ? <span>Duração: {requestDurationMs} ms</span> : null}
          </div>
          <pre>{outputValue || 'O resultado convertido aparecerá aqui.'}</pre>
        </div>
      </div>
    </section>
  );
}
