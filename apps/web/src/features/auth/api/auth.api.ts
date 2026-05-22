import { authClient } from "../../../auth-client";

type LoginCredentials = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type SignUpCredentials = {
  name: string;
  email: string;
  password: string;
};

export function login({ email, password, rememberMe }: LoginCredentials) {
  return authClient.signIn.email({
    email,
    password,
    rememberMe,
  });
}

export function signUp({ name, email, password }: SignUpCredentials) {
  return authClient.signUp.email({
    name,
    email,
    password,
  });
}
