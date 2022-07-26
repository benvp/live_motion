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
          <LiveMotion.motion
            id="popcorn"
            initial={[opacity: 0]}
            animate={[opacity: 1]}
            exit={[opacity: 0]}
          >
            <span>🍿</span>
          </LiveMotion.motion>

          <button phx-click={LiveMotion.JS.toggle(to: "#popcorn")}>
            Toggle me
          </button>
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

  - `defer`: If set, will defer the animation until it's somehow manually triggered. Use
  in combination with `LiveMotion.JS.show/1`.

  - `on_motion_start`: Lifecycle event when the animation starts. If given a string, then the
  event will be sent to the LiveView. You can also call a `LiveMotion.JS` or `Phoenix.LiveView.JS`
  function.

  - `on_motion_complete`: Lifecycle event when the animation has completed. If given a string, then the
  event will be sent to the LiveView. You can also call a `LiveMotion.JS` or `Phoenix.LiveView.JS`
  function.


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

  The transition options are passed directly to Motion One. Options are provided as a
  keyword list. You can find a full reference of all supported options in the documentation
  of the [`animate` function](https://motion.dev/dom/animate#options) of Motion One.

  ### Spring and glide animations

  Create `spring` or `glide` animations by providing a keyword list with the according
  options for each into the `easing` option of the `transition`.

      [easing: [spring: [stiffness: 100, damping: 50]]]

      [easing: [glide: [velocity: 1000]]]

  You need to pass the options as a Keyword list and in snake case.

  ### Limitations

  As these animations are based on physics, there is no duration provided. However,
  when using `exit` animations (e.g. something is removed from the DOM by LiveView),
  we are forced to provide LiveView with a fixed duration before the element is removed
  from the DOM.

  This currently defaults to the maximum of the WebAnimations API duration (10 seconds).
  If the animation completed before, the element will be hidden until it is removed from the DOM
  by LiveView.

  > #### `duration` hint {: .tip}
  >
  > If you provide a `duration` in the `transition` prop, this will be used a hint
  > for the LiveView transition, so that the actual element is removed from the DOM
  > before reaching the ten seconds timeout.
  >
  > It is recommended to always provide the duration hint when you plan to hide
  > the element via a server event.
  >
  > Please note that the `duration` itself does not have any effect on the actual
  > length of `spring` or `glide` animations.
  '''
  def motion(assigns) do
    rest =
      assigns_to_attributes(assigns, [
        :animate,
        :transition,
        :initial,
        :exit,
        :hover,
        :in_view,
        :in_view_options,
        :press,
        :defer,
        :on_motion_start,
        :on_motion_complete
      ])

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
      |> assign_new(:initial, fn -> [] end)
      |> assign_new(:animate, fn -> [] end)
      |> assign_new(:transition, fn -> [] end)
      |> assign_new(:exit, fn -> [] end)
      |> assign_new(:hover, fn -> [] end)
      |> assign_new(:press, fn -> [] end)
      |> assign_new(:in_view, fn -> [] end)
      |> assign_new(:in_view_options, fn -> [] end)
      |> assign_new(:defer, fn -> false end)
      |> assign_new(:on_motion_start, fn -> nil end)
      |> assign_new(:on_motion_complete, fn -> nil end)
      |> assign(:style, initial)
      |> assign(:rest, rest)

    ~H"""
    <div
      id={@id}
      phx-hook="Motion"
      data-motion={
        Motion.new(
          animate: @animate,
          initial: @initial,
          transition: @transition,
          exit: @exit,
          hover: @hover,
          press: @press,
          in_view: @in_view,
          in_view_options: @in_view_options,
          defer: @defer,
          on_motion_start: @on_motion_start,
          on_motion_complete: @on_motion_complete
        )
      }
      phx-remove={LiveMotion.JS.hide(to: "##{@id}")}
      style={@style}
      {@rest}
    >
      <%= if assigns[:inner_block], do: render_slot(@inner_block) %>
    </div>
    """
  end
end
