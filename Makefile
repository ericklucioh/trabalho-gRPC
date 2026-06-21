.PHONY: test-rust build-wasm-tools verify-wasm-tools clean-wasm-tools ci-tools-wasm
.PHONY: build-wasm-tools-docker verify-wasm-tools-docker ci-tools-wasm-docker

test-rust:
	cargo test --manifest-path tools/Cargo.toml

build-wasm-tools:
	node scripts/wasm-tools/build.mjs

build-wasm-tools-docker:
	docker compose run --rm wasm-builder

verify-wasm-tools:
	node scripts/wasm-tools/verify.mjs

verify-wasm-tools-docker:
	docker compose run --rm wasm-builder node scripts/wasm-tools/verify.mjs

clean-wasm-tools:
	node scripts/wasm-tools/clean.mjs

ci-tools-wasm: test-rust build-wasm-tools verify-wasm-tools

ci-tools-wasm-docker: build-wasm-tools-docker verify-wasm-tools-docker
