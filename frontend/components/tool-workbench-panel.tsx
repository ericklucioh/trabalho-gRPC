interface ToolWorkbenchPanelProps {
  inputValue: string;
  inputError: string | null;
  outputValue: string;
  isConfigured: boolean;
  isSubmitting: boolean;
  onChangeInput: (value: string) => void;
  onSubmit: () => void;
}

export function ToolWorkbenchPanel({
  inputValue,
  inputError,
  outputValue,
  isConfigured,
  isSubmitting,
  onChangeInput,
  onSubmit,
}: ToolWorkbenchPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Entrada e resultado</h2>
        <p className="panel-subtitle">Cole o texto, execute a tool e veja a saída no bloco abaixo.</p>
      </div>
      <div className="panel-body">
        <div className="form-grid">
          <label className="field-label" htmlFor="tool-input">
            <span>Conteúdo de entrada</span>
            <textarea
              className="text-area"
              id="tool-input"
              disabled={!isConfigured || isSubmitting}
              onChange={(event) => onChangeInput(event.target.value)}
              placeholder="Cole o texto de entrada aqui"
              value={inputValue}
            />
          </label>
          <p className="helper-text">O resultado aparece logo abaixo da entrada.</p>
          {inputError ? <div className="field-error">{inputError}</div> : null}
          <div className="badge-row">
            <button className="secondary-button" disabled={!isConfigured || isSubmitting} onClick={onSubmit} type="button">
              {isSubmitting ? 'Processando...' : 'Executar conversão'}
            </button>
          </div>
          <div className="output-box">
            <div className="metadata-row">
              <span>{isConfigured ? 'tool configurada' : 'aguardando configuração'}</span>
            </div>
            <pre>{outputValue || 'O resultado convertido aparecerá aqui.'}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}
