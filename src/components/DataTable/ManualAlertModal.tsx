import React, { useState } from 'react';
import { Button, Group, Modal, Select, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { DataItem, environmentOptions } from './types';

interface ManualAlertModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (alertData: Partial<DataItem>) => void;
}

export const ManualAlertModal: React.FC<ManualAlertModalProps> = ({ opened, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    severity: '',
    entityName: '',
    startDate: '',
    description: '',
    environment: '',
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};

    if (!formData.severity) newErrors.severity = true;
    if (!formData.entityName) newErrors.entityName = true;
    if (!formData.startDate) newErrors.startDate = true;
    if (!formData.description) newErrors.description = true;
    if (!formData.environment) newErrors.environment = true; // Added environment validation

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Create new alert data with only user-provided information
      const newAlert: Partial<DataItem> = {
        id: `manual-${Date.now()}`,
        objectId: formData.entityName,
        description: formData.description,
        startTime: formData.startDate,
        severity: formData.severity as DataItem['severity'],
        environment: formData.environment as DataItem['environment'], // Use selected environment

        lastUpdated: formData.startDate,
        hierarchy: '',
        status: 'active',
        impact: 'medium',
        origin: 'Manual',
        snId: '',
        identities: [],
      };

      onSave(newAlert);

      // Reset form
      setFormData({
        severity: '',
        entityName: '',
        startDate: '',
        description: '',
        environment: '',
      });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      severity: '',
      entityName: '',
      startDate: '',
      description: '',
      environment: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="הוספת התראה ידנית"
      size="md"
      centered
      style={{ direction: 'rtl' }}
      styles={{
        title: {
          fontWeight: 600,
          fontSize: '18px',
          textAlign: 'center',
          width: '100%',
        },
        header: {
          paddingBottom: '20px',
          borderBottom: '1px solid #e9ecef',
        },
        close: {
          position: 'absolute',
          top: '15px',
          left: '15px',
        },
      }}
    >
      <Stack gap="md" p="md">
        <Group grow>
          <div>
            <Text size="sm" fw={500} mb={5}>
              חומרה{' '}
              <Text component="span" c="red">
                *
              </Text>
            </Text>
            <Select
              placeholder="בחר חומרה"
              value={formData.severity}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, severity: value || '' }));
                if (errors.severity) setErrors((prev) => ({ ...prev, severity: false }));
              }}
              data={[
                { value: 'critical', label: 'Critical' },
                { value: 'major', label: 'Major' },
                { value: 'warning', label: 'Warning' },
                { value: 'disabled', label: 'Disabled' },
              ]}
              error={errors.severity}
              styles={{
                input: {
                  borderColor: errors.severity ? '#fa5252' : undefined,
                  textAlign: 'right',
                  direction: 'rtl',
                },
              }}
            />
            {errors.severity && (
              <Text size="xs" c="red" mt={2}>
                ⚠ Error
              </Text>
            )}
          </div>

          <div>
            <Text size="sm" fw={500} mb={5}>
              שם היישות התקולה{' '}
              <Text component="span" c="red">
                *
              </Text>
            </Text>
            <TextInput
              placeholder="שם יישות"
              value={formData.entityName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, entityName: e.target.value }));
                if (errors.entityName) setErrors((prev) => ({ ...prev, entityName: false }));
              }}
              error={errors.entityName}
              styles={{
                input: {
                  textAlign: 'right',
                  direction: 'rtl',
                },
              }}
            />
          </div>
        </Group>

        <Group grow>
          <div>
            <Text size="sm" fw={500} mb={5}>
              זמן התחלה{' '}
              <Text component="span" c="red">
                *
              </Text>
            </Text>
            <TextInput
              placeholder="DD/MM/YY או DD/MM/YYYY"
              value={formData.startDate}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, startDate: e.target.value }));
                if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: false }));
              }}
              error={errors.startDate}
              styles={{
                input: {
                  textAlign: 'right',
                  direction: 'rtl',
                },
              }}
            />
          </div>

          <div>
            <Text size="sm" fw={500} mb={5}>
              סביבה{' '}
              <Text component="span" c="red">
                *
              </Text>
            </Text>
            <Select
              placeholder="בחר סביבה"
              value={formData.environment}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, environment: value || '' }));
                if (errors.environment) setErrors((prev) => ({ ...prev, environment: false }));
              }}
              data={environmentOptions.map((env) => ({
                value: env,
                label: env,
              }))}
              error={errors.environment}
              styles={{
                input: {
                  borderColor: errors.environment ? '#fa5252' : undefined,
                  textAlign: 'right',
                  direction: 'rtl',
                },
              }}
            />
            {errors.environment && (
              <Text size="xs" c="red" mt={2}>
                ⚠ Error
              </Text>
            )}
          </div>
        </Group>

        <div>
          <Text size="sm" fw={500} mb={5}>
            תיאור{' '}
            <Text component="span" c="red">
              *
            </Text>
          </Text>
          <Textarea
            placeholder="תיאור אודות הבעיה והשפתעה"
            value={formData.description}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, description: e.target.value }));
              if (errors.description) setErrors((prev) => ({ ...prev, description: false }));
            }}
            rows={4}
            error={errors.description}
            styles={{
              input: {
                textAlign: 'right',
                direction: 'rtl',
                resize: 'vertical',
              },
            }}
          />
        </div>

        <Group justify="center" mt="xl">
          <Button
            onClick={handleSubmit}
            style={{
              backgroundColor: '#1f3a8a',
              width: '200px',
              height: '40px',
              borderRadius: '8px',
            }}
          >
            הוספת התראה ידנית
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
