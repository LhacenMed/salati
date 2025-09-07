import { SvgProps } from "react-native-svg";

export interface IconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  size?: number;
}

export interface TabIconProps extends IconProps {
  isFocused?: boolean;
}

export interface LogoProps extends IconProps {
  variant?: "default" | "white" | "dark";
}
