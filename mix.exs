defmodule LiveMotion.MixProject do
  use Mix.Project

  @version "0.3.1"

  def project do
    [
      app: :live_motion,
      version: @version,
      elixir: "~> 1.13",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      package: package(),
      aliases: aliases(),
      docs: docs(),
      name: "LiveMotion",
      homepage_url: "https://github.com/benvp/live_motion",
      description: """
      High performance animations for Phoenix LiveView.
      """
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger]
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:phoenix, ">= 1.6.0 and < 1.8.0"},
      {:phoenix_html, "~> 3.1"},
      {:phoenix_live_view, "~> 0.18"},
      {:jason, "~> 1.3", optional: true},
      {:esbuild, "~> 0.2", only: :dev},
      {:telemetry, "~> 0.4.2 or ~> 1.0"},
      {:ex_doc, "~> 0.29", only: :dev, runtime: false}
    ]
  end

  defp docs do
    [
      main: "LiveMotion",
      source_ref: "v#{@version}",
      source_url: "https://github.com/benvp/live_motion"
    ]
  end

  defp package do
    [
      maintainers: ["Benjamin von Polheim"],
      licenses: ["MIT"],
      links: %{
        Changelog: "https://hexdocs.pm/live_motion/changelog.html",
        GitHub: "https://github.com/benvp/live_motion"
      },
      files:
        ~w(assets/js lib priv) ++
          ~w(CHANGELOG.md LICENSE.md mix.exs package.json README.md)
    ]
  end

  defp aliases do
    [
      setup: ["deps.get", "cmd --cd assets npm install"],
      "assets.build": ["esbuild module", "esbuild cdn", "esbuild cdn_min", "esbuild main"],
      "assets.watch": ["esbuild module --watch"]
    ]
  end
end
