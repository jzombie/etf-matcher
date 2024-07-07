import store from "@src/store";

const useStoreStateReader = store.createReactHookStateReader();

export default useStoreStateReader;
export { store };
