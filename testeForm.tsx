import React from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';

export default function TestForm() {
  const { control, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    alert(JSON.stringify(data));
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Email"
            style={{ borderWidth: 1, padding: 10 }}
          />
        )}
      />
      <Button title="Enviar" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
