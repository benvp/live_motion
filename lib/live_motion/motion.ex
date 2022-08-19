defmodule LiveMotion.Motion do
  @moduledoc """
  Represents configuration for LiveMotion animations.
  """
  @derive Jason.Encoder

  alias LiveMotion.Motion

  defstruct initial: nil,
            animate: %{},
            transition: nil,
            exit: nil,
            hover: nil,
            press: nil,
            in_view: nil,
            in_view_options: nil,
            defer: false,
            on_motion_start: nil,
            on_motion_complete: nil

  def new(options) do
    %Motion{
      initial:
        if(is_boolean(options[:initial]), do: options[:initial], else: to_map(options[:initial])),
      animate: to_map(options[:animate]),
      transition: to_map(options[:transition]),
      exit: to_map(options[:exit]),
      hover: to_map(options[:hover]),
      press: to_map(options[:press]),
      in_view: to_map(options[:in_view]),
      in_view_options: to_map(options[:in_view_options]),
      defer: options[:defer],
      on_motion_start: maybe_create_event(options[:on_motion_start]),
      on_motion_complete: maybe_create_event(options[:on_motion_complete])
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
      |> Map.update(:on_motion_start, nil, fn
        %Phoenix.LiveView.JS{} = js ->
          Phoenix.json_library().encode!(js.ops)

        other ->
          other
      end)
      |> Map.update(:on_motion_complete, nil, fn
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

  defp to_map(nil), do: nil

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
