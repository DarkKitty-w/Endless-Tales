import os

OUTPUT_FILE = "output.txt"


def is_text_file(filepath):
    try:
        with open(filepath, "rb") as f:
            return b"\0" not in f.read(1024)
    except:
        return False


def collect_files():
    files = []

    print("\n📂 File Collector CLI")
    print("Enter file paths one by one.")
    print("Type 'done' when finished.\n")

    while True:
        try:
            path = input("➕ Add file: ").strip()
        except EOFError:
            print("\n⚠️ Input closed unexpectedly. Stopping collection.")
            break

        if path.lower() == "done":
            break

        if not path:
            continue

        files.append(path)

    return files


def confirm(files):
    print("\n📋 Selected files:")
    for f in files:
        print(" -", f)

    while True:
        choice = input("\n❓ Generate output.txt? (yes/no): ").strip().lower()
        if choice in ["yes", "y"]:
            return True
        if choice in ["no", "n"]:
            return False


def write_output(files):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:

        for path in files:

            if not os.path.exists(path):
                out.write(f"\n--- {path} (NOT FOUND) ---\n")
                continue

            if not os.path.isfile(path):
                out.write(f"\n--- {path} (NOT A FILE) ---\n")
                continue

            if not is_text_file(path):
                out.write(f"\n--- {path} (BINARY SKIPPED) ---\n")
                continue

            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()

                out.write(f"\n--- {path} ---\n")
                out.write(content)
                out.write("\n")

            except Exception as e:
                out.write(f"\n--- {path} (ERROR: {e}) ---\n")

    print(f"\n✅ Done! Output written to: {OUTPUT_FILE}")


def main():
    files = collect_files()

    if not files:
        print("\n❌ No files selected. Exiting.")
        return

    if confirm(files):
        write_output(files)
    else:
        print("\n❌ Cancelled.")


if __name__ == "__main__":
    main()