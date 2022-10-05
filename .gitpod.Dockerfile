FROM gitpod/workspace-full

# install tools
RUN brew install fzf \
    && $(brew --prefix)/opt/fzf/install --completion --key-bindings --no-fish

# Erlang dependencies
RUN sudo install-packages build-essential autoconf m4 libncurses5-dev libwxgtk3.0-gtk3-dev libwxgtk-webview3.0-gtk3-dev \
    libgl1-mesa-dev libglu1-mesa-dev libpng-dev libssh-dev unixodbc-dev xsltproc fop libxml2-utils libncurses-dev openjdk-11-jdk

# Phoenix Dependencies
RUN sudo install-packages inotify-tools

RUN brew install asdf \
    && asdf plugin add erlang \
    && asdf plugin add elixir \
    && asdf plugin add nodejs \
    && asdf install erlang 25.1 \
    && asdf global erlang 25.1 \
    && asdf install elixir 1.14.0-otp-25 \
    && asdf global elixir 1.14.0-otp-25 \
    && asdf install nodejs 16.17.1 \
    && asdf global nodejs 16.17.1 \
    && bash -c ". $(brew --prefix asdf)/libexec/asdf.sh \
        && mix local.hex --force \
        && mix local.rebar --force" \
    && echo -e "\n. $(brew --prefix asdf)/libexec/asdf.sh" >> ~/.bashrc

# Build vscode-elixir-ls extension
#
# We build this manually because ElixirLS won't show autocompletions
# when using the `use` macro if ElixirLS has been compiled with a different
# Erlang / Elixir combination. See https://github.com/elixir-lsp/elixir-ls/issues/193
#
# Aditionally, OpenVSX only contains a version published under the deprecated namespace.
# This causes issues when developing locally because it would always install the wrong extension.

RUN bash -c ". $(brew --prefix asdf)/libexec/asdf.sh \
    && git clone --recursive --branch v0.11.0 https://github.com/elixir-lsp/vscode-elixir-ls.git /tmp/vscode-elixir-ls \
    && cd /tmp/vscode-elixir-ls \
    && npm install \
    && cd elixir-ls \
    && mix deps.get \
    && cd .. \
    && npx vsce package \
    && mkdir -p $HOME/extensions \
    && cp /tmp/vscode-elixir-ls/elixir-ls-0.11.0.vsix $HOME/extensions \
    && cd $HOME \
    && rm -rf /tmp/vscode-elixir-ls"

