'use client';

import { useToolWorkbench } from '../hooks/use-tool-workbench';
import { ErrorBanner } from '../components/error-banner';
import { LoadingIndicator } from '../components/loading-indicator';
import { StatusBadge } from '../components/status-badge';
import { ToolConfigureButton } from '../components/tool-configure-button';
import { ToolList } from '../components/tool-list';
import { ToolWorkbenchPanel } from '../components/tool-workbench-panel';

export default function HomePage() {
  const workbench = useToolWorkbench();

  return (
    <main className="page-shell">
      <section className="hero">
        <span className="eyebrow">Lojinha WASM</span>
        <h1>Demo funcional com gRPC entre Next e Go.</h1>
        <p>Selecione uma tool, busque o pacote no backend, baixe o WASM e execute a conversão no browser.</p>
        <div className="badge-row">
          <StatusBadge label={`Tool atual: ${workbench.selectedToolLabel}`} tone={workbench.isConfigured ? 'success' : 'warning'} />
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
                Clique para buscar o manifest, baixar o módulo e ativar a tool executando o WASM de verdade.
              </p>
            </div>
            <div className="panel-body">
              <div className="configure-box">
                <ToolConfigureButton isDisabled={workbench.isCatalogLoading || workbench.isConfiguring || workbench.selectedToolId === null} isLoading={workbench.isConfiguring} label="Configurar tool" onClick={() => { void workbench.configureSelectedTool(); }} />
                {workbench.isCatalogLoading ? <LoadingIndicator label="Carregando catálogo inicial..." /> : null}
                {workbench.isConfiguring ? <LoadingIndicator label="Recebendo pacote WASM real..." /> : null}
              </div>
            </div>
          </section>
        </div>

        <div className="stack">
          {workbench.errorMessage ? <ErrorBanner message={workbench.errorMessage} /> : null}
          <ToolWorkbenchPanel
            inputError={workbench.inputError}
            inputValue={workbench.inputValue}
            outputValue={workbench.outputValue}
            isConfigured={workbench.isConfigured}
            isSubmitting={workbench.isSubmitting}
            onChangeInput={workbench.setInputValue}
            onSubmit={() => {
              void workbench.submitInput();
            }}
          />
        </div>
      </div>
    </main>
  );
}
