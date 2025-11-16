use static_include_bytes::static_include_bytes;

static_include_bytes!(#[unsafe(export_name="DIST")] DIST = "../../dist/main.js");
