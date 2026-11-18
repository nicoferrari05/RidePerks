import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { easeSnappy } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const ease = Easing.bezier(...easeSnappy);

/**
 * The web's press feedback: scales to 0.97 over 160ms on the snappy curve
 * (`active:scale-[0.97]`), so every button answers the touch the same way.
 */
export function PressScale({
  style,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: Omit<PressableProps, "style"> & { style?: StyleProp<ViewStyle> }) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(e) => {
        scale.set(withTiming(0.97, { duration: 160, easing: ease }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withTiming(1, { duration: 160, easing: ease }));
        onPressOut?.(e);
      }}
      style={[style, animated]}
    />
  );
}
