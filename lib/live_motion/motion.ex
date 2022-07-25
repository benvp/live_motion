defmodule LiveMotion.Motion do
  @moduledoc """
  Represents configuration for LiveMotion animations.
  """
  @derive Jason.Encoder

  alias LiveMotion.Motion

  defstruct initial: %{},
            animate: %{},
            transition: %{},
            exit: %{},
            defer: false,
            on_animation_start: nil,
            on_animation_complete: nil

  def new(options) do
    %Motion{
      initial: to_map(options[:initial]),
      animate: to_map(options[:animate]),
      transition: to_map(options[:transition]),
      exit: to_map(options[:exit]),
      defer: options[:defer],
      on_animation_start: maybe_create_event(options[:on_animation_start]),
      on_animation_complete: maybe_create_event(options[:on_animation_complete])
    }
  end

  defimpl Phoenix.HTML.Safe, for: LiveMotion.Motion do
    def to_iodata(%LiveMotion.Motion{} = motion) do
      motion
      |> extract_live_view_js()
      |> Phoenix.json_library().encode!()
      |> Phoenix.HTML.Engine.html_escape()
    end

    defp extract_live_view_js(%Motion{} = motion) do
      motion
      |> Map.update(:on_animation_start, nil, fn
        %Phoenix.LiveView.JS{} = js ->
          Phoenix.json_library().encode!(js.ops)

        other ->
          other
      end)
      |> Map.update(:on_animation_complete, nil, fn
        %Phoenix.LiveView.JS{} = js ->
          Phoenix.json_library().encode!(js.ops)

        other ->
          other
      end)
    end
  end

  defp maybe_create_event(event) when is_binary(event) do
    Phoenix.LiveView.JS.push(event)
  end

  defp maybe_create_event(event), do: event

  defp to_map(kw) do
    for {k, v} <- kw, reduce: %{} do
      m ->
        v =
          cond do
            Keyword.keyword?(v) -> to_map(v)
            true -> v
          end

        Map.put(m, k, v)
    end
  end
end
