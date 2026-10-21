fn main() {
    // O frontend é embutido no binário release. Recompilar quando o build do
    // Vite mudar garante que o executável não fique com assets antigos.
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=../frontend/dist");
    println!("cargo:rerun-if-changed=../frontend/dist/index.html");
}
