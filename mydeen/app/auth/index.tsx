import { Redirect } from "expo-router";

export default function AuthIndex() {
  // При переходе на /auth сразу редиректим на sign-in
  return <Redirect href="/auth/sign-in" />;
}
