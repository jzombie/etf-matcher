import WindowManager, { WindowManagerProps } from "./WindowManager";
import useDetermineAutoTiling from "./hooks/useDetermineAutoTiling";
import useWindowManagerLayout from "./hooks/useWindowManagerLayout";
import addWindowToLayout from "./utils/addWindowToLayout";
import removeWindowFromLayout from "./utils/removeWindowFromLayout";

export default WindowManager;
export type { WindowManagerProps };
export {
  addWindowToLayout,
  removeWindowFromLayout,
  useDetermineAutoTiling,
  useWindowManagerLayout,
};
