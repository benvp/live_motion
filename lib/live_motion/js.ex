defmodule LiveMotion.JS do
  @moduledoc ~S'''
  Provides functions for triggering client side animations without a round-trip to the server.

  The functions in this module follow the same conventions (more or less) like in the
  `Phoenix.LiveView.JS` module and are intended to be used instead if you are dealing
  with animations. Most of the functions return a `Phoenix.LiveView.JS` struct, so they
  can be composed with the LiveView utility functions.

  The following utilities are included:

    * `animate` - Triggers an animation on an element.
    * `toggle` - Toggles between two animations.
    * `hide` - Performs an animation and hides the element from the DOM.
    * `show` - Shows elements and immediately performs the animation.

  Consider the following example to hide an element without a round-trip to the server.

      def popcorn(assigns) do
        ~H"""
        <div>
          <LiveMotion.motion
            id="popcorn"
            initial={[opacity: 1]}
            exit={[opacity: 0]}
          >
            <span>🍿</span>
          </LiveMotion.motion>

          <button type="button" phx-click={LiveMotion.JS.hide(to: "#popcorn")}>
            Eat popcorn
          </button>
        </div>
        """
      end

  Clicking the "Eat popcorn" button will trigger the exit animation on the `motion` element.
  You can also define animations in the call to `LiveMotion.JS.hide/1`. See it's documentation
  for more information.
  '''

  alias Phoenix.LiveView.JS

  @doc ~S'''
  Animates the target.

  ## Example

      def popcorn(assigns) do
        ~H"""
        <div>
          <div id="popcorn" style="font-size: 64px">
            <span>🍿</span>
          </div>

          <button
            type="button"
            phx-click={
              LiveMotion.JS.animate(
                [rotate: [0, 20, -10, 30, -10, 0]],
                [duration: 0.5],
                to: "#popcorn"
              )
            }
          >
            Shake it!
          </button>
        </div>
        """
      end

  ## Options

    * `to` - The query selector on which element to perform the animation.
      If the option is not provided, the target element will be used.

  '''
  def animate(keyframes, transition, opts \\ []), do: animate(%JS{}, keyframes, transition, opts)

  @doc "See `animate/3`."
  def animate(js, keyframes, transition, opts) do
    opts = Keyword.merge(opts, detail: build_dispatch_detail(keyframes, transition))
    JS.dispatch(js, "live_motion:animate", opts)
  end

  @doc ~S'''
  Animates between two animation states.

  ## Example

      def popcorn(assigns) do
        ~H"""
        <div>
          <div id="popcorn" style="font-size: 64px">
            <span>🍿</span>
          </div>

          <button
            type="button"
            phx-click={
              LiveMotion.JS.toggle(
                [
                  in: [x: -200],
                  out: [x: 200]
                ],
                [],
                to: "#popcorn"
              )
            }
          >
            Move popcorn
          </button>
        </div>
        """
      end

  ## Options

    * `to` - The query selector on which element to perform the animation.
      If the option is not provided, the target element will be used.

  '''
  def toggle(keyframes, transition \\ [], opts \\ []),
    do: toggle(%JS{}, keyframes, transition, opts)

  @doc "See `toggle/3`."
  def toggle(js, keyframes, transition, opts) do
    opts =
      Keyword.merge(opts,
        detail: %{
          keyframes: %{
            in: Enum.into(keyframes[:in], %{}),
            out: Enum.into(keyframes[:out], %{})
          },
          transition: Enum.into(transition, %{})
        }
      )

    JS.dispatch(js, "live_motion:toggle", opts)
  end

  @doc """
  Performs an animation and hides an element after the animation has finished.

  Triggers the `exit` animation defined on the target.

  Additionally allows `keyframes` and `transition` to be defined. These will be used
  to animate the target element and therefore the target does not require to be a
  `LiveMotion.motion` component.

  ## Options

    * `to` - The query selector on which element to perform the animation.
      If the option is not provided, the target element will be used.
    * `keyframes` - The optional keyframe keyword list defining the animations.
    * `transition` - The optional transition options.

  """
  def hide(opts \\ []), do: hide(%JS{}, opts)

  @doc "See `hide/1`."
  def hide(js, opts) do
    {keyframes, opts} = Keyword.pop(opts, :keyframes, [])
    {transition, opts} = Keyword.pop(opts, :transition, [])

    opts = Keyword.merge(opts, detail: build_dispatch_detail(keyframes, transition))

    JS.dispatch(js, "live_motion:hide", opts)
  end

  @doc """
  Shows an element and triggers the animation defined on the target.

  Additionally allows `keyframes` and `transition` to be defined. These will be used
  to animate the target element and therefore the target does not require to be a
  `LiveMotion.motion` component.

  ## Options

    * `to` - The query selector on which element to perform the animation.
      If the option is not provided, the target element will be used.
    * `keyframes` - The optional keyframe keyword list defining the animations.
    * `transition` - The optional transition options.
    * `display` - The optional display value to set when showing. Defaults to "block".

  """
  def show(opts \\ []), do: show(%JS{}, opts)

  @doc "See `show/1`."
  def show(js, opts) do
    {keyframes, opts} = Keyword.pop(opts, :keyframes, [])
    {transition, opts} = Keyword.pop(opts, :transition, [])
    {display, opts} = Keyword.pop(opts, :display, "block")

    detail =
      build_dispatch_detail(keyframes, transition)
      |> Map.put_new(:display, display)

    opts = Keyword.merge(opts, detail: detail)

    JS.dispatch(js, "live_motion:show", opts)
  end

  defp build_dispatch_detail(keyframes, transition) do
    %{
      keyframes: Enum.into(keyframes, %{}),
      transition: Enum.into(transition, %{})
    }
  end
end
