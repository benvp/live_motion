defmodule LiveMotion.Transform do
  @moduledoc false

  @transform_aliases ~w(x y z)
  @transform_properties ~w(translate scale rotate skew)
  @transform_axes ["", "X", "Y", "Z"]

  def transforms() do
    transforms =
      for property <- @transform_properties, axis <- @transform_axes, into: [] do
        property <> axis
      end

    @transform_aliases ++ transforms
  end

  def transform_definitions() do
    # Theses valeus are taken from @motionone/dom/animate/utils/transforms.js
    transform_definition_base = %{
      "translate" => %{
        syntax: "<length-percentage>",
        initial_value: "0px",
        to_default_unit: fn v -> "#{v}px" end
      },
      "rotate" => %{
        syntax: "<angle>",
        initial_value: "0deg",
        to_default_unit: fn v -> "#{v}deg" end
      },
      "scale" => %{
        syntax: "<number>",
        initial_value: 1,
        to_default_unit: &Function.identity/1
      },
      "skew" => %{
        syntax: "<angle>",
        initial_value: "0deg",
        to_default_unit: fn v -> "#{v}deg" end
      }
    }

    for property <- @transform_properties, axis <- @transform_axes, into: %{} do
      key = as_transform_css_var(property <> axis)

      {key, Map.fetch!(transform_definition_base, property)}
    end
  end

  def as_transform_css_var(name), do: "--motion-#{name}"

  def is_transform(key), do: key in transforms()

  def maybe_transform_from_alias(key) when key in @transform_aliases,
    do: "translate#{String.upcase(key)}"

  def maybe_transform_from_alias(key), do: key

  def build_transform_template(transforms) do
    transforms
    |> Enum.sort(&sort_by_transform_alias/2)
    |> Enum.reduce("", &transforms_to_string/2)
    |> String.trim()
  end

  defp transforms_to_string(name, transforms) do
    "#{transforms} #{name}(var(#{as_transform_css_var(name)}))"
  end

  defp sort_by_transform_alias(a, b) do
    transforms = transforms()
    Enum.find_index(transforms, &(&1 == a)) <= Enum.find_index(transforms, &(&1 == b))
  end
end
