import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import axios from 'axios';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            { email: credentials.email, password: credentials.password },
          );

          if (!data?.access_token) return null;

          return {
            id:                data.user.id,
            email:             data.user.email,
            name:              `${data.user.firstName} ${data.user.lastName}`,
            accessToken:       data.access_token,
            roles:             data.user.roles,
            mustChangePassword: data.user.mustChangePassword,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.accessToken       = (user as any).accessToken;
        token.roles             = (user as any).roles;
        token.mustChangePassword = (user as any).mustChangePassword;
      }
      return token;
    },
    session({ session, token }) {
      (session as any).accessToken        = token.accessToken;
      (session as any).mustChangePassword = token.mustChangePassword;
      if (session.user) {
        (session.user as any).roles = token.roles;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
});
