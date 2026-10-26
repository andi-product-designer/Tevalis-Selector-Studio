import { defineConfig, mergeConfig } from "vite";
import config from "./vite.config";

export default mergeConfig(config, defineConfig({
  base: process.env["PAGES_BASE_PATH"] || "/Tevalis-Selector-Studio/",
}));
