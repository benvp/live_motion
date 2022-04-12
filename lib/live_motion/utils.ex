defmodule LiveMotion.Utils do
  @moduledoc false

  def to_kebab_case(string) do
    string
    |> String.downcase()
    |> String.split(~r/_/)
    |> Enum.join("-")
  end
end
