defmodule LiveMotion do
  @moduledoc ~S'''
  LiveMotion provides high performance animations declared on the server and run on the client.

  The main goal of LiveMotion is to make animations as easy as possible by using a simple
  declarative model to define animations. Traditionally animations have to be defined upfront
  using CSS transitions and keyframes. This approach requires a lot of context switching and is
  hard to make dependant on server state.

  With LiveMotion animations can be declared by using the `LiveMotion.motion` component.
  Its's props allow dynamic keyframe animations which can be dependant on the server state.
  These animations are only _declared_ on the server, but are _fully performed on the client_.

  It's just a tiny configuration, which is added via a `data-motion` attribute. This attribute
  is picked up by a LiveView JS Hook which performs the animation using the
  [Motion One](https://motion.dev) animation library. Animations happen using the WebAnimations
  API.

  ## Example

  To declare a simple animation which starts immediately after mount, define the following
  component. This will rotate the popcorn 🍿 for 360°.

      def render(assigns) do
        ~H"""
        <LiveMotion.motion id="popcorn" animate={[rotate: 360]}>
          <span>🍿</span>
        </LiveMotion.motion>
        """
      end

  To see all supported options, take a look at the documentation of `LiveMotion.motion`.

  ## Manually triggering animations

  Animations can also be triggered by user events like button clicks. These animations do not
  require a round trip to the server and can be defined upfront. Following the previous example:

      def render(assigns) do
        ~H"""
        <div>
          <LiveMotion.motion id="popcorn">
            <span>🍿</span>
          </LiveMotion.motion>

          <button phx-click={LiveMotion.JS.toggle(
            to: "#popcorn",
            [
              in: [opacity: 1],
              out: [opacity: 0]
            ]
          )}>Toggle me</button>
        </div>
        """
      end

  This will toggle the opacity from the `#popcorn` element. See `LiveMotion.JS` for more
  information on how to manually trigger animations.

  ## Limitations

  LiveMotion is still in the early days, so breaking changes are expected. Additionally, there
  are still a few limitations, which will be added in future releases.

  - `LiveMotion.motion` always renders as a `div` element. There are plans on providing
  an api to support rendering any HTML element.
  - Currently standard easing functions (e.g. `ease-in-out`, bezier curves) and spring
  animations are supported. Due to the nature of spring animations, they do not have
  a fixed duration (theoretically they can run indefinetely). When using unmount transition,
  this adds a challenge, as we do not know how long Phoenix LiveView should defer the actual
  removal of the DOM node. For now, we fall back to the maximum supported duration of ten seconds.
  - Support Stagger and glide animations will be added in a later release.
  - Layout animations are not yet supported. Think of animations which automatically move
  items in the correct place after an element is removed which affects the layout.
  '''

  use Phoenix.Component

  alias LiveMotion.Motion

  @doc ~S'''
  This is the main component for declaring animations.

  > #### Tip {: .tip}
  >
  > As LiveMotion uses Motion One to perform the animations, keyframes and transition
  > options will be passed directly to Motion One. For a more complete reference,
  > have a look at their documentation of the [animate function](https://motion.dev/dom/animate).

  ## Props

  - `id`: *Required*. A unique dom element id for the component.

  - `initial`: Defines the initial style for the component. Useful when using mount transitions
  and you want the component to have an initial state to animate to. Accepts a `keyframe`
  keyword list.

    If set to `false` it will directly apply the styles defined in the `animate` prop and skip the
    animation.

  - `animate`: Defines the target animation style. Accepts a `keyframe` keyword list.

  - `transition`: Additional options to specify the behaviour of the animation. These are things
  like the easing function, duration and delay.

  - `exit`: The target animation to animate to when the component is unmounted. Accepts
  the same options as `animate` does.


  ## Keyframe

  A keyframe is represented by a keyword list defining CSS properties. These can one or multiple
  values. For example:

      [x: 200]

  This will animate the component to 200px on the x axis. As previously mentioned, multiple
  values are supported, too. The following will animate the element on the `x` axis to
  each of the values one after another, spreading the steps equally on the duration.

      [x: [0, 200, 50, 100]]

  You might have noticed that `x` itself is not a valid CSS property. In fact, this is a shorthand
  to make common animation operations easier. `x` eventually translates to the CSS property
  `transform: translateX(200px)`.

  The following shorthands are supported:

  - `x`
  - `y`
  - `y`
  - `scale`
  - `scaleX`
  - `scaleY`
  - `scaleZ`
  - `rotate`
  - `rotateX`
  - `rotateY`
  - `rotateZ`
  - `skewX`
  - `skewY`

  You need to pass the options as a Keyword list and in snake case.

  ## Transition options

  The transition optiona are passed directly to Motion One. The only thing to keep in mind is
  the format when defining `spring` animations. Define a spring animation like this:

      [ease: [spring: [stiffness: 100, damping: 50]]]

  You need to pass the options as a Keyword list and in snake case.
  '''
  def motion(assigns) do
    rest = assigns_to_attributes(assigns, [:animate, :transition, :initial, :exit])

    initial =
      case assigns[:initial] do
        nil ->
          nil

        initial ->
          (initial || assigns.animate)
          |> LiveMotion.Style.create_styles()
          |> LiveMotion.Style.to_style_string()
      end

    assigns =
      assigns
      |> assign_new(:animate, fn -> [] end)
      |> assign_new(:transition, fn -> [] end)
      |> assign_new(:exit, fn -> [] end)
      |> assign(:style, initial)
      |> assign(:rest, rest)

    ~H"""
    <div
      id={@id}
      phx-hook="Motion"
      data-motion={animate(@animate, @transition, @exit)}
      phx-remove={LiveMotion.JS.hide(to: @id)}
      style={@style}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  defp animate(keyframes, transition, exit_keyframes) do
    %Motion{
      keyframes: Enum.into(keyframes, %{}),
      transition: Enum.into(transition, %{}),
      exit: Enum.into(exit_keyframes, %{})
    }
    |> translate_easing()
  end

  defp translate_easing(%Motion{transition: %{easing: [spring: opts]}} = motion) do
    Map.update!(motion, :transition, fn transition ->
      transition
      |> Map.put(:__easing, [:spring, Enum.into(opts, %{})])
      |> Map.delete(:easing)
    end)
  end

  defp translate_easing(%Motion{} = motion), do: motion
end
