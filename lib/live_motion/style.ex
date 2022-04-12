defmodule LiveMotion.Style do
  @moduledoc false

  alias LiveMotion.{Transform, Utils}

  def create_styles(keyframes) do
    {initial_keyframes, transform_keys} = build_initial_keyframes(keyframes)
    Map.put(initial_keyframes, "transform", Transform.build_transform_template(transform_keys))
  end

  def maybe_convert_unit(key, value) do
    definition = Transform.transform_definitions()[key]

    if definition && is_number(value) do
      definition.to_default_unit.(value)
    else
      value
    end
  end

  defp build_initial_keyframes(keyframes) do
    for {k, v} <- keyframes, reduce: {%{}, []} do
      {initial_keyframes, transform_keys} ->
        string_k = Atom.to_string(k)

        {key, transform_key} =
          if Transform.is_transform(string_k) do
            tkey = Transform.maybe_transform_from_alias(string_k)
            css_variable = Transform.as_transform_css_var(tkey)
            {css_variable, tkey}
          else
            {string_k, nil}
          end

        initial_keyframe = if is_list(v), do: List.first(v), else: v
        initial_keyframe = maybe_convert_unit(key, initial_keyframe)

        transform_keys =
          if transform_key, do: [transform_key | transform_keys], else: transform_keys

        {
          Map.put(initial_keyframes, key, initial_keyframe),
          transform_keys
        }
    end
  end

  def to_style_string(styles) do
    style =
      for {k, v} <- styles, reduce: "" do
        style ->
          case k do
            "--" <> _ -> style <> "#{k}:#{v}; "
            _ -> style <> "#{Utils.to_kebab_case(k)}:#{v}; "
          end
      end

    String.trim(style)
  end
end
