interface ToolInputFormProps {
  inputValue: string;
  inputError: string | null;
  isConfigured: boolean;
  isSubmitting: boolean;
  onChangeInput: (value: string) => void;
  onSubmit: () => void;
}

export function ToolInputForm({ inputValue, inputError, isConfigured, isSubmitting, onChangeInput, onSubmit }: ToolInputFormProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Entrada</h2>
        <p className="panel-subtitle">Cole JSON para json2yaml ou YAML para yaml2json. A validação acontece antes do envio.</p>
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
              placeholder='{"name":"Lojinha WASM","active":true}'
              value={inputValue}
            />
          </label>
          <p className="helper-text">O resultado aparece em um bloco separado abaixo da entrada.</p>
          {inputError ? <div className="field-error">{inputError}</div> : null}
          <div className="badge-row">
            <button className="secondary-button" disabled={!isConfigured || isSubmitting} onClick={onSubmit} type="button">
              {isSubmitting ? 'Processando...' : 'Executar conversão'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
