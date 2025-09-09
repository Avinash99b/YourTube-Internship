// react-icons-fix.d.ts  (create this file in src/)
import "react-icons";

declare module "react-icons" {
    export type IconType = (props: any) => JSX.Element;
}
