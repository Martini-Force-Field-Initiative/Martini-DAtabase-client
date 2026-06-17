#!/bin/sh
# Print the short hash of the current HEAD by reading the .git directory
# directly, so it works in build environments where `git` is not installed.

GIT_DIR=${GIT_DIR:-.git}

if [ ! -f "$GIT_DIR/HEAD" ]; then
  echo dev
  exit 0
fi

head_content=$(cat "$GIT_DIR/HEAD")
hash=

case "$head_content" in
  "ref: "*)
    ref=${head_content#ref: }
    if [ -f "$GIT_DIR/$ref" ]; then
      hash=$(cat "$GIT_DIR/$ref")
    elif [ -f "$GIT_DIR/packed-refs" ]; then
      hash=$(awk -v r="$ref" '$2==r {print $1; exit}' "$GIT_DIR/packed-refs")
    fi
    ;;
  *)
    hash=$head_content
    ;;
esac

if [ -n "$hash" ]; then
  printf '%s\n' "$hash" | cut -c1-7
else
  echo dev
fi
