import { csvToTickerBuckets, tickerBucketsToCSV } from "@services/RustService";
import { MAX_CSV_IMPORT_SIZE, PROJECT_NAME } from "@src/constants";
import store, { Store } from "@src/store";
import type { TickerBucket } from "@src/store";
import BaseStatePersistenceAdapter from "@src/store/BaseStatePersistenceAdapter";

import customLogger from "@utils/customLogger";
import formatNumberWithCommas from "@utils/string/formatNumberWithCommas";

export type TickerBucketSet = {
  filename: string;
  buckets: TickerBucket[];
};

export type TickerBucketImportExportServiceState = {
  mergeableSets: TickerBucketSet[] | null;
  isProcessingImport: boolean;
};

export default class TickerBucketImportExportService extends BaseStatePersistenceAdapter<TickerBucketImportExportServiceState> {
  constructor(store: Store) {
    super(store, {
      mergeableSets: null,
      isProcessingImport: false,
    });
  }

  clearMergeableSets() {
    this.setState({ mergeableSets: null });
  }

  async readFiles(fileList: FileList | null) {
    if (!fileList) {
      const errMessage = "No files selected";
      customLogger.error(errMessage);
      throw new Error(errMessage);
    }

    customLogger.debug("import files...");
    customLogger.debug(`${fileList.length} total files`);

    // Helper function to process a file and return a promise
    const processFile = (file: File) => {
      return new Promise<TickerBucket[]>((resolve, reject) => {
        const reader = new FileReader();
        const cleanupReader = () => {
          reader.onload = null;
          reader.onerror = null;
        };

        // Log file metadata
        customLogger.debug(`File Name: ${file.name}`);
        customLogger.debug(`File Size: ${file.size} bytes`);
        customLogger.debug(`File Type: ${file.type}`);
        customLogger.debug(
          `Last Modified: ${new Date(file.lastModified).toLocaleString()}`,
        );

        if (file.size > MAX_CSV_IMPORT_SIZE) {
          throw new Error(
            `Uploaded file larger than ${formatNumberWithCommas(MAX_CSV_IMPORT_SIZE)} bytes`,
          );
        }

        // Set up the FileReader to read the file as text
        reader.onload = (event) => {
          if (event.target?.result) {
            csvToTickerBuckets(event.target.result as string)
              .then((resp) => {
                resolve(resp); // Resolve with the result of csvToTickerBuckets
              })
              .catch((err) => {
                reject(err); // Reject the promise if there was an error
              })
              .finally(cleanupReader);
          } else {
            cleanupReader(); // Ensure cleanup is called if no result
            reject(new Error("Error reading file"));
          }
        };

        // Handle any error during file reading
        reader.onerror = (event) => {
          customLogger.error(
            `Error reading file ${file.name}:`,
            event.target?.error,
          );
          reject(event.target?.error || new Error("Error reading file"));
        };

        // Read the file as text (for CSV, text, etc.)
        reader.readAsText(file);
      });
    };

    // setIsProcessingImport(true);
    this.setState({ isProcessingImport: true });

    let fileResults: TickerBucketSet[] | null = null;

    try {
      fileResults = await Promise.all(
        Array.from(fileList).map(async (file) => {
          try {
            const result = await processFile(file);
            return {
              filename: file.name,
              buckets: result,
            };
          } catch (err) {
            customLogger.error(`Error processing file ${file.name}:`, err);
            throw err; // Propagate the error
          }
        }),
      );
    } finally {
      this.setState({ isProcessingImport: false });
    }

    // Set the mergeable sets to include an ID
    this.setState({ mergeableSets: fileResults });

    // After all files are processed
    customLogger.debug("All files processed:", fileResults);

    // Return the file results as an array
    return fileResults;
  }

  importFilename(filename: string) {
    const mergeableSet = this.state.mergeableSets?.find(
      ({ filename: predicateFilename }) => filename === predicateFilename,
    );

    if (!mergeableSet) {
      throw new Error(
        `Could not locate mergeable set for filename: ${filename}`,
      );
    }

    const incomingTickerBuckets = mergeableSet.buckets;

    for (const incomingBucket of incomingTickerBuckets) {
      const currentBucket = this.getSameLocalBucket(
        incomingBucket.type,
        incomingBucket.name,
      );

      if (currentBucket) {
        store.updateTickerBucket(currentBucket, incomingBucket);
      } else {
        store.createTickerBucket(incomingBucket);
      }
    }

    // Remove the filename from the mergeable sets
    this.setState({
      mergeableSets:
        this.state.mergeableSets?.filter(
          ({ filename: predicateFilename }) => filename !== predicateFilename,
        ) || null,
    });
  }

  writeFile(filename: string, tickerBuckets: TickerBucket[]): Promise<void> {
    return tickerBucketsToCSV(tickerBuckets).then((resp: string) => {
      customLogger.debug(resp);

      // Create a blob with the CSV content
      const blob = new Blob([resp], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      // Create a link element and trigger a download
      const a = window.document.createElement("a");
      a.href = url;

      a.download = filename;

      window.document.body.appendChild(a); // Append the element to the body
      a.click(); // Trigger the download
      window.document.body.removeChild(a); // Remove the element after download
      URL.revokeObjectURL(url); // Release the URL object
    });
  }

  getSameLocalBucket(
    tickerBucketType: TickerBucket["type"],
    tickerBucketName: TickerBucket["name"],
  ) {
    return this._store.getTickerBucketWithTypeAndName(
      tickerBucketType,
      tickerBucketName,
    );
  }

  getDefaultExportFilename() {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-"); // Format: YYYY-MM-DDTHH-MM-SS
    return `${PROJECT_NAME.toLowerCase().replaceAll(" ", "-")}-${timestamp}.csv`;
  }

  // ---
  //
  // FIXME: The following methods are required by the class but are currently
  // not needed with the current implementation. I feel this class should still
  // be a "persistent-adapter-based" class, but perhaps I should just use a
  // different base class that is more appropriate.
  //
  // ---

  protected async _onReady(): Promise<void> {
    throw new Error("_onReady is not currently implemented.");
  }

  protected async _onGetAllKeys(): Promise<
    (keyof TickerBucketImportExportServiceState)[]
  > {
    throw new Error("_onGetAllKeys is not currently implemented.");
  }

  protected async _onGetAllValues(): Promise<
    Array<
      TickerBucketImportExportServiceState[keyof TickerBucketImportExportServiceState]
    >
  > {
    throw new Error("_onGetAllValues is not currently implemented.");
  }

  protected async _onGetItem<
    K extends keyof TickerBucketImportExportServiceState,
  >(_key: K): Promise<TickerBucketImportExportServiceState[K] | undefined> {
    throw new Error("_onGetItem is not currently implemented.");
  }

  protected async _onSetItem<
    K extends keyof TickerBucketImportExportServiceState,
  >(_key: K, _value: TickerBucketImportExportServiceState[K]): Promise<void> {
    throw new Error("_onSetItem is not currently implemented.");
  }

  protected async _onRemoveItem<
    K extends keyof TickerBucketImportExportServiceState,
  >(_key: K): Promise<void> {
    throw new Error("_onRemoveItem is not currently implemented.");
  }

  protected async _onClear(): Promise<void> {
    throw new Error("_onClear is not currently implemented.");
  }
}
