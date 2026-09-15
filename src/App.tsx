import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import TrackerLayout from "./components/TrackerLayout";
import PagesList from "./pages/PagesList";
import PageDetail from "./pages/PageDetail";
import ImportMarkdown from "./pages/ImportMarkdown";
import NotFound from "./pages/NotFound";

/**
 * The whole app is the tracker — a private personal wiki, its own
 * deployment, sharing naxits-api and its database with admin.naxits/
 * naxits/imravithedev but unrelated to the portfolio those three serve.
 */
const App = () => (
  <TooltipProvider>
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route element={<TrackerLayout />}>
          <Route path="/" element={<Navigate to="/pages" replace />} />

          <Route path="/pages" element={<PagesList />} />
          <Route path="/pages/:id" element={<PageDetail />} />

          <Route path="/import" element={<ImportMarkdown />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
