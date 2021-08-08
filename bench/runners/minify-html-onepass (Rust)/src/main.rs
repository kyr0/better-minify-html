use std::{env, fs};
use std::io::stdout;
use std::time::Instant;

use minify_html_onepass::{Cfg, in_place};

fn main() {
    let iterations = env::var("MHB_ITERATIONS").unwrap().parse::<usize>().unwrap();
    let input_dir = env::var("MHB_INPUT_DIR").unwrap();
    let html_only = env::var("MHB_HTML_ONLY").unwrap() == "1";

    let tests = fs::read_dir(input_dir).unwrap().map(|d| d.unwrap());

    let mut results: Vec<(String, f64)> = Vec::new();
    let cfg = Cfg {
        minify_css: !html_only,
        minify_js: !html_only,
    };

    for t in tests {
        let source = fs::read(t.path()).unwrap();
        let start = Instant::now();
        for _ in 0..iterations {
            let mut data = source.to_vec();
            let _ = in_place(&mut data, &cfg).expect("failed to minify");
        };
        let elapsed = start.elapsed().as_secs_f64();
        results.push((t.file_name().into_string().unwrap(), elapsed));
    };

    serde_json::to_writer(stdout(), &results).unwrap();
}
