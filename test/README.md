# Testing Directory - README

## Purpose of the `test` Directory

This directory contains **mocks** and **setupTests** utilities used for testing purposes across the project. The files in this directory are intended to aid in the configuration and mocking required for testing components and functions, but **actual unit tests do not reside here**.

## Testing Structure

1. **Mocks and Setup Utilities**:
   - Several **mock implementations**, **test setups**, and **global test configurations** (e.g., `setupTests.ts`) are stored in this directory.
   - These files are primarily used to configure the test environment (e.g., global mocks for APIs, services, or any other setup that is shared across multiple tests).

2. **Unit Tests**:
   - Unit tests for components and modules are placed **adjacent to their respective source files**. Each source file typically has a corresponding test file to ensure that the tests remain close to the source code they validate. 
   - Example:
     - `src/components/Button.tsx` will have its test in `src/components/Button.test.tsx`.

3. **Rust Tests**:
   - Rust tests are organized separately under `{project_root}/rust`.
   - Rust tests follow their own idiomatic structures, such as having tests inline with the code in `#[cfg(test)]` modules or being placed in a dedicated `tests` directory in Rust.
   - These tests are scoped differently from the JavaScript/TypeScript tests.

## Additional Notes

- Ensure that this directory is only used for **mocking**, **shared configurations**, and **setup files**. 
- For consistency, all unit tests should be located with their corresponding source files and **not** inside this directory.
- Rust test files are completely isolated from the mocks and setup files in this directory, using their own idiomatic structures.
