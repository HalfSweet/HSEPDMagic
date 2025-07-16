import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import ProjectManagerPage from "@/pages/project-manager";
import ProjectDetailsPage from "@/pages/project-details";

function App() {
  return (
    <Routes>
      <Route element={<ProjectManagerPage />} path="/" />
      <Route element={<ProjectManagerPage />} path="/project-manager" />
      <Route element={<ProjectDetailsPage />} path="/project-details" />
      <Route element={<IndexPage />} path="/home" />
      <Route element={<DocsPage />} path="/docs" />
      <Route element={<PricingPage />} path="/pricing" />
      <Route element={<BlogPage />} path="/blog" />
      <Route element={<AboutPage />} path="/about" />
    </Routes>
  );
}

export default App;
