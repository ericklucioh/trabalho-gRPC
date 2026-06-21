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
        <h2 className="panel-title">Input and output</h2>
        <p className="panel-subtitle">Paste the text, run the tool, and inspect the output in the block below.</p>
      </div>
      <div className="panel-body">
        <div className="form-grid">
          <label className="field-label" htmlFor="tool-input">
            <span>Input content</span>
            <textarea
              className="text-area"
              id="tool-input"
              disabled={!isConfigured || isSubmitting}
              onChange={(event) => onChangeInput(event.target.value)}
              placeholder="Paste the input text here"
              value={inputValue}
            />
          </label>
          <p className="helper-text">The result appears directly below the input.</p>
          {inputError ? <div className="field-error">{inputError}</div> : null}
          <div className="badge-row">
            <button className="secondary-button" disabled={!isConfigured || isSubmitting} onClick={onSubmit} type="button">
              {isSubmitting ? 'Processing...' : 'Run conversion'}
            </button>
          </div>
          <div className="output-box">
            <div className="metadata-row">
              <span>{isConfigured ? 'tool configured' : 'waiting for configuration'}</span>
            </div>
            <pre>{outputValue || 'The converted result will appear here.'}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}
