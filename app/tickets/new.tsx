/**
 * Registro de una solicitud de soporte (F01 del documento de visión).
 *
 * El solicitante describe el problema en lenguaje natural; categoría y
 * prioridad tienen un valor por defecto razonable para que registrar un caso
 * no tome más de un minuto.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { createTicket } from '../../src/api/tickets';
import Button from '../../src/components/Button';
import Field from '../../src/components/Field';
import Select from '../../src/components/Select';
import { CATEGORIES, PRIORITIES, type NewTicket } from '../../src/types';

export default function NewTicket() {
  // Identificador del ticket recién creado; mientras sea null se ve el formulario.
  const [createdId, setCreatedId] = useState<string | null>(null);

  const { control, handleSubmit, setError, reset, formState } = useForm<NewTicket>({
    defaultValues: {
      subject: '',
      description: '',
      category: 'OTRO',
      // MEDIA por defecto: el solicitante no siempre sabe priorizar, y el
      // sistema puede escalar después según el SLA (F08).
      priority: 'MEDIA',
    },
  });

  const submit = async (data: NewTicket) => {
    try {
      const ticket = await createTicket(data);
      setCreatedId(ticket.id);
      reset();
    } catch (error) {
      setError('root', { message: (error as Error).message });
    }
  };

  // Acuse de recibo (F02): el solicitante se lleva el identificador del caso.
  if (createdId) {
    return (
      <View className="flex-1 justify-center gap-4 bg-neutral-50 p-6">
        <Text className="text-center text-xl font-bold text-neutral-900">Solicitud registrada</Text>
        <Text className="text-center text-neutral-500">
          Tu caso quedó con el número{'\n'}
          <Text className="font-semibold text-neutral-900">{createdId}</Text>
        </Text>
        <Button text="Reportar otra" onPress={() => setCreatedId(null)} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled">
      <Field
        control={control}
        name="subject"
        label="Asunto"
        placeholder="No hay internet en el laboratorio 3"
        rules={{
          required: 'El asunto es obligatorio',
          minLength: { value: 5, message: 'Describe el caso en al menos 5 caracteres' },
        }}
      />

      <Field
        control={control}
        name="description"
        label="¿Qué está pasando?"
        placeholder="Cuenta qué intentabas hacer, qué pasó y desde cuándo."
        multiline
        numberOfLines={5}
        // Sin esto el texto se centra verticalmente en Android.
        textAlignVertical="top"
        className="h-32"
        rules={{
          required: 'La descripción es obligatoria',
          minLength: { value: 10, message: 'Cuéntanos un poco más (mínimo 10 caracteres)' },
        }}
      />

      <Select control={control} name="category" label="Categoría" options={CATEGORIES} />
      <Select control={control} name="priority" label="Prioridad" options={PRIORITIES} />

      {!!formState.errors.root && (
        <Text className="rounded-lg bg-red-50 p-3 text-center text-red-700">
          {formState.errors.root.message}
        </Text>
      )}

      <Button
        text={formState.isSubmitting ? 'Enviando…' : 'Enviar solicitud'}
        onPress={handleSubmit(submit)}
        disabled={formState.isSubmitting}
      />
    </ScrollView>
  );
}
