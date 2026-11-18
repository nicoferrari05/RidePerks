import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";

/**
 * The sign-in screens' entrance (`.animate-element` on the web): fade in and
 * rise 10px over 600ms, staggered by `delay`. Skipped when the phone asks
 * for reduced motion (Reanimated follows the system setting).
 */
export function Enter({
  delay = 0,
  style,
  children,
}: {
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const entering = new Keyframe({
    0: { opacity: 0, transform: [{ translateY: 10 }] },
    100: {
      opacity: 1,
      transform: [{ translateY: 0 }],
      easing: Easing.out(Easing.ease),
    },
  })
    .duration(600)
    .delay(delay);
  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
