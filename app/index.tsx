import { useSession } from '@/src/session/context';
import { Redirect } from 'expo-router';


export default function Home() {
  const { user } = useSession();
  if (!user) return <Redirect href="/login" />;
  if (user.tipo_usuario === 'admin') return <Redirect href="/admin" />;
  if (user.tipo_usuario === 'controlador') return <Redirect href="/controlador" />;
  return <Redirect href="/conductor" />;
}
