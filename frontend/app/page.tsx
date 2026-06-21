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
        <span className="eyebrow">WASM Tool Store</span>
        <h1>Working demo with gRPC between Next and Go.</h1>
        <p>Select a tool, fetch the package from the backend, download the WASM, and run the conversion in the browser.</p>
        <div className="badge-row">
          <StatusBadge label={`Current tool: ${workbench.selectedToolLabel}`} tone={workbench.isConfigured ? 'success' : 'warning'} />
          <StatusBadge label={workbench.statusMessage} tone={workbench.errorMessage ? 'danger' : 'neutral'} />
        </div>
      </section>

      <div className="layout-grid">
        <div className="stack">
          <ToolList onSelectTool={workbench.selectTool} selectedToolId={workbench.selectedToolId} tools={workbench.tools} />
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Configuration</h2>
              <p className="panel-subtitle">
                Click to fetch the manifest, download the module, and activate the tool by running the real WASM.
              </p>
            </div>
            <div className="panel-body">
              <div className="configure-box">
                <ToolConfigureButton isDisabled={workbench.isCatalogLoading || workbench.isConfiguring || workbench.selectedToolId === null} isLoading={workbench.isConfiguring} label="Configure tool" onClick={() => { void workbench.configureSelectedTool(); }} />
                {workbench.isCatalogLoading ? <LoadingIndicator label="Loading initial catalog..." /> : null}
                {workbench.isConfiguring ? <LoadingIndicator label="Receiving real WASM package..." /> : null}
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
