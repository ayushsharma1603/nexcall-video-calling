import { LoaderIcon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const PageLoader = () => {
  const {theme} = useThemeStore()
  return (
    <div data-theme={theme} className="h-screen flex items-center justify-center">
      <div className="min-h-screen gap-3  flex items-center justify-center">
        <h1 className="text-3xl">Loading</h1>
        <LoaderIcon className="animate-spin size-10 text-primary" />
      </div>
    </div>
  );
};

export default PageLoader;
