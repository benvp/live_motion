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
  Triggers the animation of the target.

  ## Example

      def popcorn(assigns) do
        ~H"""
        <div>
          <LiveMotion.motion
            id="popcorn"
            animate={[rotate: [0, 20, -10, 30, -10, 0]]}
            style="font-size: 64px"
          >
            <span>🍿</span>
          </LiveMotion.motion>

          <button
            type="button"
            phx-click={LiveMotion.JS.animate(to: "#popcorn")}
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
  def animate(opts \\ []), do: animate(%JS{}, opts)

  @doc "See `animate/3`."
  def animate(js, opts) do
    JS.dispatch(js, "live_motion:animate", opts)
  end

  @doc ~S'''
  Animates between the `animate` and `exit` props.

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
              LiveMotion.JS.toggle(to: "#popcorn")
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
  def toggle(opts \\ []),
    do: toggle(%JS{}, opts)

  @doc "See `toggle/3`."
  def toggle(js, opts) do
    JS.dispatch(js, "live_motion:toggle", opts)
  end

  @doc """
  Performs an animation and hides an element after the animation has finished.

  Triggers the `exit` animation defined on the target.

  ## Options

    * `to` - The query selector on which element to perform the animation.
      If the option is not provided, the target element will be used.

  """
  def hide(opts \\ []), do: hide(%JS{}, opts)

  @doc "See `hide/1`."
  def hide(js, opts) do
    JS.dispatch(js, "live_motion:hide", opts)
  end

  @doc """
  Shows an element and triggers the animation defined on the target.

  ## Options

    * `to` - The query selector on which element to perform the animation.
      If the option is not provided, the target element will be used.
    * `display` - The optional display value to set when showing. Defaults to "block".

  """
  def show(opts \\ []), do: show(%JS{}, opts)

  @doc "See `show/1`."
  def show(js, opts) do
    {display, opts} = Keyword.pop(opts, :display, "block")
    opts = Keyword.merge(opts, detail: %{ display: display})

    JS.dispatch(js, "live_motion:show", opts)
  end
end
