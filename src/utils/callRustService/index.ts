import callRustService, { subscribe } from "./callRustService";
import { NotifierEvent } from "./workerMainBindings";

export default callRustService;
export { subscribe };

export { NotifierEvent };
