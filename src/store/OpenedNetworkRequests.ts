import EventEmitter from "events";

class OpenedNetworkRequests extends Set {
  public static PATH_OPENED = "path_opened";
  public static PATH_CLOSED = "path_closed";

  public emitter: EventEmitter;

  constructor() {
    super();

    this.emitter = new EventEmitter();
  }

  add(pathName: string): this {
    super.add(pathName);

    this.emitter.emit(OpenedNetworkRequests.PATH_OPENED, pathName);

    return this;
  }

  delete(pathName: string): boolean {
    const resp = super.delete(pathName);

    if (resp) {
      this.emitter.emit(OpenedNetworkRequests.PATH_CLOSED, pathName);
    }

    return resp;
  }
}

export class XHROpenedRequests extends OpenedNetworkRequests {}

export class CacheAccessedRequests extends OpenedNetworkRequests {
  add(pathName: string) {
    setTimeout(() => {
      this.delete(pathName);
    }, 100);
    return super.add(pathName);
  }
}
