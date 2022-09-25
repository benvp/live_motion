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
    && asdf install \
    && bash -c ". $(brew --prefix asdf)/libexec/asdf.sh \
        && mix local.hex --force \
        && mix local.rebar --force" \
    && echo -e "\n. $(brew --prefix asdf)/libexec/asdf.sh" >> ~/.bashrc


