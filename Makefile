.PHONY: test-rust build-wasm-tools verify-wasm-tools clean-wasm-tools ci-tools-wasm

test-rust:
	cargo test --manifest-path tools/Cargo.toml

build-wasm-tools:
	node scripts/wasm-tools/build.mjs

verify-wasm-tools:
	node scripts/wasm-tools/verify.mjs

clean-wasm-tools:
	node scripts/wasm-tools/clean.mjs

ci-tools-wasm: test-rust build-wasm-tools verify-wasm-tools
