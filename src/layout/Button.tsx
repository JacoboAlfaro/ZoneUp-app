import { Pressable, Text } from 'react-native'

interface ButtonProps {
  text: string
  variant: any
  onPress: () => void
}

const Button = ( { text, variant, onPress}: ButtonProps ) => {
  return (
    <Pressable className={ variant } onPress={ onPress }>
      <Text>{text}</Text>
    </Pressable>
  )
}

export default Button