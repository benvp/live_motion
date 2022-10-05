#!/bin/bash
#
# Install ElixirLS extension if we run inside gitpod and run desktop vscode.
# This is a workaround until https://github.com/gitpod-io/gitpod/issues/12791
# is fixed.

ELIXIR_LS_VERSION=0.11.0

if test $USER = "gitpod"
then
  code --install-extension $HOME/extensions/elixir-ls-$ELIXIR_LS_VERSION.vsix
else
  echo "Nothing to do"
fi

exit 0
