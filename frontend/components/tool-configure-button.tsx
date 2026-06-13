interface ToolConfigureButtonProps {
  label: string;
  isDisabled: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export function ToolConfigureButton({ label, isDisabled, isLoading, onClick }: ToolConfigureButtonProps) {
  return (
    <button className="primary-button" disabled={isDisabled} onClick={onClick} type="button">
      {isLoading ? 'Configurando...' : label}
    </button>
  );
}
