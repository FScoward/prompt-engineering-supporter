import { useState } from "react";

export const useUiState = () => {
  const [ui, setUi] = useState<{ isLoading: boolean; isEditorOpen: boolean }>({
    isLoading: false,
    isEditorOpen: false,
  });

  const startLoading = () => {
    setUi((prev) => ({ ...prev, isLoading: true }));
  };

  const endLoading = () => {
    setUi((prev) => ({ ...prev, isLoading: false }));
  };

  const openEditor = () => {
    setUi((prev) => ({ ...prev, isEditorOpen: true }));
  };

  const closeEditor = () => {
    setUi((prev) => ({ ...prev, isEditorOpen: false }));
  };

  return { ui, startLoading, endLoading, openEditor, closeEditor };
};
