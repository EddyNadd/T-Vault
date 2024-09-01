import React from 'react';
import { View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal, ModalBackdrop, ModalContent } from "@/components/ui/modal";
import { Button, ButtonText } from "@/components/ui/button";

/**
 * Date picker modal component for IOS.
 */
export default function DatePickerModal({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    selectedDate,
    onDateChange,
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalBackdrop />
            <ModalContent>
                <DateTimePicker
                    display='spinner'
                    mode='date'
                    value={selectedDate}
                    onChange={onDateChange}
                    style={styles.datePicker}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button onPress={onCancel} size="md" variant="outline" action="primary">
                        <ButtonText>Cancel</ButtonText>
                    </Button>
                    <Button onPress={onConfirm} size="md" variant="outline" action="primary">
                        <ButtonText>Confirm</ButtonText>
                    </Button>
                </View>
            </ModalContent>
        </Modal>
    );
}

const styles = {
    datePicker: {
        height: 120,
        marginTop: -10,
    },
};
