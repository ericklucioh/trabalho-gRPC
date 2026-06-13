'use client';

import { useToolWorkbench } from '../hooks/use-tool-workbench';
import { ErrorBanner } from '../components/error-banner';
import { LoadingIndicator } from '../components/loading-indicator';
import { StatusBadge } from '../components/status-badge';
import { ToolConfigureButton } from '../components/tool-configure-button';
import { ToolInputForm } from '../components/tool-input-form';
import { ToolList } from '../components/tool-list';
import { ToolOutputPanel } from '../components/tool-output-panel';

export default function HomePage() {
  const workbench = useToolWorkbench();

  return (
    <main className="page-shell">
      <section className="hero">
        <span className="eyebrow">Lojinha WASM</span>
        <h1>Frontend pronto para a demo, com contratos tipados e adapter mockável.</h1>
        <p>
          A interface já simula o recebimento do pacote WASM, marca a tool como configurada e executa a conversão local
          no browser. O backend real entra depois, sem precisar reescrever a UI.
        </p>
        <div className="badge-row">
          <StatusBadge label={`Tool atual: ${workbench.selectedToolLabel}`} tone={workbench.isConfigured ? 'success' : 'warning'} />
          <StatusBadge label={`Status: ${workbench.toolStatus}`} tone={workbench.toolStatus === 'failed' ? 'danger' : workbench.isConfigured ? 'success' : 'neutral'} />
          <StatusBadge label={workbench.statusMessage} tone={workbench.errorMessage ? 'danger' : 'neutral'} />
        </div>
      </section>

      <div className="layout-grid">
        <div className="stack">
          <ToolList onSelectTool={workbench.selectTool} selectedToolId={workbench.selectedToolId} tools={workbench.tools} />
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Configuração</h2>
              <p className="panel-subtitle">
                Clique para simular a busca do manifest, o download do módulo e a ativação da tool no browser.
              </p>
            </div>
            <div className="panel-body">
              <div className="configure-box">
                <ToolConfigureButton
                  isDisabled={workbench.isCatalogLoading || workbench.isConfiguring || workbench.selectedToolId === null}
                  isLoading={workbench.isConfiguring}
                  label="Configurar tool"
                  onClick={() => {
                    void workbench.configureSelectedTool();
                  }}
                />
                {workbench.isCatalogLoading ? <LoadingIndicator label="Carregando catálogo inicial..." /> : null}
                {workbench.isConfiguring ? <LoadingIndicator label="Recebendo pacote WASM simulado..." /> : null}
              </div>
            </div>
          </section>
        </div>

        <div className="stack">
          {workbench.errorMessage ? <ErrorBanner message={workbench.errorMessage} /> : null}
          <ToolInputForm
            inputError={workbench.inputError}
            inputValue={workbench.inputValue}
            isConfigured={workbench.isConfigured}
            isSubmitting={workbench.isSubmitting}
            onChangeInput={workbench.setInputValue}
            onSubmit={() => {
              void workbench.submitInput();
            }}
          />
          <ToolOutputPanel
            isConfigured={workbench.isConfigured}
            outputValue={workbench.outputValue}
            requestId={workbench.requestId}
            requestDurationMs={workbench.requestDurationMs}
            requestStartedAtIso={workbench.requestStartedAtIso}
          />
        </div>
      </div>
    </main>
  );
}
