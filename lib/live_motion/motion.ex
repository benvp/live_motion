defmodule LiveMotion.Motion do
  @moduledoc """
  Represents configuration for LiveMotion animations.
  """

  defstruct keyframes: %{}, transition: nil, exit: nil

  defimpl Phoenix.HTML.Safe, for: LiveMotion.Motion do
    def to_iodata(%LiveMotion.Motion{} = motion) do
      motion
      |> Map.from_struct()
      |> Phoenix.json_library().encode!()
      |> Phoenix.HTML.Engine.html_escape()
    end
  end
end
