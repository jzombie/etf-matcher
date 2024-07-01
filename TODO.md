Here's a Dockerfile that sets up a container to compile a Rust "Hello, 
World!" program to WebAssembly and serve it via a simple web server. We'll 
use `wasm-pack` for compiling Rust to WebAssembly and `python3` to serve 
the web page.

1. **Create a new directory for your project:**
   ```bash
   mkdir wasm-hello-world
   cd wasm-hello-world
   ```

2. **Create the Dockerfile:**

   ```Dockerfile
   # Use the official Rust image as the base image
   FROM rust:latest

   # Install wasm-pack
   RUN cargo install wasm-pack

   # Install Python for serving the web page
   RUN apt-get update && apt-get install -y python3

   # Create a new directory for the project
   WORKDIR /usr/src/app

   # Create a new Rust project
   RUN cargo new --lib hello-wasm
   WORKDIR /usr/src/app/hello-wasm

   # Copy the source code into the container
   COPY src/lib.rs src/lib.rs
   COPY Cargo.toml Cargo.toml

   # Build the Rust project with wasm-pack
   RUN wasm-pack build --target web

   # Copy the HTML file into the container
   COPY index.html index.html

   # Expose port 8000 for the web server
   EXPOSE 8000

   # Command to run the web server
   CMD ["python3", "-m", "http.server"]
   ```

3. **Create the `Cargo.toml` file:**

   ```toml
   [package]
   name = "hello-wasm"
   version = "0.1.0"
   authors = ["Your Name <you@example.com>"]
   edition = "2018"

   [lib]
   crate-type = ["cdylib"]

   [dependencies]
   wasm-bindgen = "0.2"
   ```

4. **Create the `src/lib.rs` file:**

   ```rust
   use wasm_bindgen::prelude::*;

   #[wasm_bindgen]
   extern {
       pub fn alert(s: &str);
   }

   #[wasm_bindgen]
   pub fn greet(name: &str) {
       alert(&format!("Hello, {}!", name));
   }
   ```

5. **Create the `index.html` file:**

   ```html
   <!doctype html>
   <html lang="en-US">
     <head>
       <meta charset="utf-8" />
       <title>hello-wasm example</title>
     </head>
     <body>
       <script type="module">
         import init, { greet } from "./pkg/hello_wasm.js";
         init().then(() => {
           greet("WebAssembly");
         });
       </script>
     </body>
   </html>
   ```

6. **Build and run the Docker container:**

   ```bash
   docker build -t wasm-hello-world .
   docker run -p 8000:8000 wasm-hello-world
   ```

7. **Open your browser and go to** `http://localhost:8000` **to see the 
"Hello, WebAssembly" alert.**

This setup will create a Docker container that compiles your Rust code to 
WebAssembly using `wasm-pack`, serves the resulting files with a simple 
Python HTTP server, and displays an alert box with "Hello, WebAssembly!" 
when you open the page.
