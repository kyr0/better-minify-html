#!/usr/bin/env bash

set -Eeuo pipefail

shopt -s nullglob

for i in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
  echo performance | sudo dd status=none of="$i"
done

results_dir="$PWD/results"
input_dir="$PWD/inputs"
iterations=1

pushd runners >/dev/null
for r in *; do
  if [ ! -d "$r" ]; then
    continue
  fi
  echo "Running $r..."
  pushd "$r" >/dev/null
  out="$results_dir/$r.json"
  sudo --preserve-env=MHB_HTML_ONLY,PATH MHB_ITERATIONS=$iterations MHB_INPUT_DIR="$input_dir" nice -n -20 taskset -c 1 ./run > "$out"
  popd >/dev/null
done
popd >/dev/null

echo "All done!"
