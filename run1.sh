#!/bin/bash
set +H

# Cek apakah di dalam git repository
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  echo "Error: Bukan di dalam git repository!"
  exit 1
fi

# Deteksi branch aktif & remote secara otomatis (universal)
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "HEAD")
REMOTE=$(git remote | head -n1)
if [ -z "$REMOTE" ]; then
  REMOTE="origin"
fi

echo "======================================"
echo "  Daftar Commit / Restore Point"
echo "  Branch aktif : $CURRENT_BRANCH"
echo "  Remote       : $REMOTE"
echo "======================================"
echo ""

# Ambil 15 commit terakhir
mapfile -t commits < <(git log --pretty=format:"%h|%ad|%s" --date=short -15 2>/dev/null)

if [ ${#commits[@]} -eq 0 ]; then
  echo "Tidak ada commit ditemukan."
  exit 1
fi

# Tampilkan daftar
for i in "${!commits[@]}"; do
  hash=$(echo "${commits[$i]}" | cut -d'|' -f1)
  date=$(echo "${commits[$i]}" | cut -d'|' -f2)
  msg=$(echo "${commits[$i]}" | cut -d'|' -f3-)
  printf "%2d) %s  %s  %s\n" $((i+1)) "$hash" "$date" "$msg"
done

echo ""
echo "======================================"
read -p "Pilih nomor commit (atau Enter untuk batal): " pilihan

if [[ -z "$pilihan" ]]; then
  echo "Dibatalkan."
  exit 0
fi

# Validasi input
if ! [[ "$pilihan" =~ ^[0-9]+$ ]] || [ "$pilihan" -lt 1 ] || [ "$pilihan" -gt ${#commits[@]} ]; then
  echo "Pilihan tidak valid."
  exit 1
fi

selected=$(echo "${commits[$((pilihan-1))]}" | cut -d'|' -f1)

echo ""
echo "Commit terpilih: $selected"
echo ""
echo "Pilih aksi:"
echo "  1) Lihat detail (git show)"
echo "  2) Checkout sementara (detached HEAD - tidak ubah GitHub)"
echo "  3) Reset --hard + Force Push ke GitHub (HATI-HATI!)"
echo "  4) Batal"
read -p "Pilihan (1-4): " aksi

case $aksi in
  1)
    echo ""
    git show "$selected"
    ;;
  2)
    git checkout "$selected"
    echo ""
    echo "Sekarang di mode detached HEAD."
    echo "Kembali ke branch sebelumnya: git checkout $CURRENT_BRANCH"
    ;;
  3)
    echo ""
    echo "PERINGATAN KERAS!"
    echo "Ini akan menimpa history di remote ($REMOTE / $CURRENT_BRANCH)."
    echo "Semua commit setelah $selected akan HILANG di GitHub."
    echo ""
    read -p "Yakin reset --hard ke $selected lalu force push? (ketik yes): " yakin
    if [ "$yakin" = "yes" ]; then
      git reset --hard "$selected"
      echo "Local sudah di-reset ke $selected."
      echo "Sedang force push ke $REMOTE $CURRENT_BRANCH ..."
      git push --force "$REMOTE" "$CURRENT_BRANCH"
      echo ""
      echo "Selesai! Remote sudah diubah."
      echo "Tunggu 1-3 menit lalu refresh website / Codespaces."
    else
      echo "Dibatalkan."
    fi
    ;;
  *)
    echo "Dibatalkan."
    ;;
esac
