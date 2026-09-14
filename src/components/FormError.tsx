import { Text } from 'react-native';

interface Props {
  message?: string;
}

export default function FormError({ message }: Props) {
  if (!message) return null;

  return (
    <Text className="rounded-xl bg-red-50 p-3 text-center text-red-700">
      {message}
    </Text>
  );
}
