defmodule LiveMotion.Motion do
  @moduledoc """
  Represents configuration for LiveMotion animations.
  """

  defstruct keyframes: %{}, transition: nil, exit: nil, opts: %{}

  defimpl Phoenix.HTML.Safe, for: LiveMotion.Motion do
    def to_iodata(%LiveMotion.Motion{} = motion) do
      motion
      |> Map.from_struct()
      |> extract_live_view_js()
      |> Phoenix.json_library().encode!()
      |> Phoenix.HTML.Engine.html_escape()
    end

    defp extract_live_view_js(motion) do
      motion =
        update_in(
          motion,
          [:opts, :on_animation_start],
          fn
            %Phoenix.LiveView.JS{} = js ->
              Phoenix.json_library().encode!(js.ops)

            other ->
              other
          end
        )

      update_in(
        motion,
        [:opts, :on_animation_complete],
        fn
          %Phoenix.LiveView.JS{} = js ->
            Phoenix.json_library().encode!(js.ops)

          other ->
            other
        end
      )
    end
  end
end
