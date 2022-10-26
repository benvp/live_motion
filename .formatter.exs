locals_without_parens = [
  attr: 2,
  attr: 3,
  slot: 1,
  slot: 2,
  slot: 3
]

# Used by "mix format"
[
  import_deps: [:phoenix],
  plugins: [Phoenix.LiveView.HTMLFormatter],
  inputs: ["*.{heex,ex,exs}", "{mix,.formatter}.exs", "{config,lib,test}/**/*.{heex,ex,exs}"],
  locals_without_parens: locals_without_parens
]
