import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { WikiPage } from "./pages/WikiPage";
import { WikiEntryPage } from "./pages/WikiEntryPage";
import { HarnessPage } from "./pages/HarnessPage";
import { ModelsPage } from "./pages/ModelsPage";
import { InspirePage, WorldPage, TransformPage, QuantPage } from "./pages/WorkbenchPages";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="wiki" element={<WikiPage />} />
          <Route path="wiki/:id" element={<WikiEntryPage />} />
          <Route path="harness" element={<HarnessPage />} />
          <Route path="models" element={<ModelsPage />} />
          <Route path="workbench/inspire" element={<InspirePage />} />
          <Route path="workbench/world" element={<WorldPage />} />
          <Route path="workbench/transform" element={<TransformPage />} />
          <Route path="workbench/quant" element={<QuantPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
