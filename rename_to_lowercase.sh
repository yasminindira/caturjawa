#!/bin/bash

# Script: Rename semua file & folder
# - Huruf besar → huruf kecil
# - Spasi → underscore
# - Kecualikan CNAME dan README*
# - Gunakan git mv jika memungkinkan

set -e

echo "=== Mulai proses rename ==="
echo

should_skip() {
    local base="$1"
    local lower
    lower=$(echo "$base" | tr '[:upper:]' '[:lower:]')

    if [[ "$lower" == "cname" ]] || [[ "$lower" == readme* ]]; then
        return 0   # skip
    fi
    return 1
}

# Cari semua item secara depth-first, lewati .git
find . -depth \( -path './.git' -o -path './.git/*' \) -prune -o -print0 | \
while IFS= read -r -d '' path; do
    # Lewati root "."
    [[ "$path" == "." ]] && continue

    dir=$(dirname "$path")
    base=$(basename "$path")

    # Cek apakah harus dilewati
    if should_skip "$base"; then
        echo "SKIP : $path"
        continue
    fi

    # Buat nama baru: lowercase + spasi jadi _
    new_base=$(echo "$base" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')

    # Tidak ada perubahan → lewati
    if [[ "$base" == "$new_base" ]]; then
        continue
    fi

    new_path="${dir}/${new_base}"

    # Cek konflik
    if [[ -e "$new_path" ]]; then
        echo "KONFLIK : $path  →  $new_path  (sudah ada, dilewati)"
        continue
    fi

    # Coba pakai git mv dulu (kalau file di-track Git)
    if git ls-files --error-unmatch "$path" >/dev/null 2>&1; then
        echo "GIT MV : $path  →  $new_path"
        git mv "$path" "$new_path"
    else
        echo "MV     : $path  →  $new_path"
        mv "$path" "$new_path"
    fi
done

echo
echo "=== Selesai ==="
echo "Sekarang jalankan: git status"
echo "Lalu commit & push kalau sudah sesuai."
