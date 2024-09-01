import React, { useState, useRef } from 'react';
import { View, Text, Dimensions, Image, StyleSheet } from 'react-native';
import { Modal, ModalBackdrop, ModalContent } from "@/components/ui/modal";
import { Button, ButtonText } from "@/components/ui/button";
import Carousel from 'react-native-reanimated-carousel';
import colors from '@/styles/COLORS';

export default function WelcomeModal({
    isOpen,
    onClose
}) {
    const { width, height } = Dimensions.get('window');
    const data = [
        { title: "Bienvenue", description: "Bienvenue sur notre application!", image: require('../assets/welcome/0.gif') },
        { title: "Fonctionnalité 1", description: "Découvrez cette incroyable fonctionnalité.", image: require('../assets/welcome/1.gif') },
        { title: "Fonctionnalité 2", description: "Explorez encore plus de possibilités.", image: require('../assets/welcome/2.gif') },
    ];
    const carouselRef = useRef(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [gifKey, setGifKey] = useState(0);

    const closeModal = () => {
        onClose();
    }

    const handleNext = () => {
        if (currentIndex < data.length - 1) {
            carouselRef.current?.scrollTo({ index: currentIndex + 1, animated: true });
            setCurrentIndex(currentIndex + 1);
        } else {
            closeModal();
        }
    };
    
    const handlePrevious = () => {
        if (currentIndex > 0) {
            carouselRef.current?.scrollTo({ index: currentIndex - 1, animated: true });
            setCurrentIndex(currentIndex - 1);
        }
    };     

    return (
        <Modal isOpen={isOpen} onClose={closeModal}>
            <ModalBackdrop />
            <ModalContent style={styles.modalContent}>
                <View style={styles.contentContainer}>
                    <Carousel
                        ref={carouselRef}
                        width={width - 80}
                        data={data}
                        renderItem={({ index }) => (
                            <View style={styles.carouselItem}>
                                <Image 
                                    source={data[index].image} 
                                    style={styles.image}
                                    resizeMode='contain'
                                    key={`image-${gifKey}`}
                                />
                                <View style={styles.textContainer}>
                                    <Text style={styles.title}>{data[index].title}</Text>
                                    <Text style={styles.description}>{data[index].description}</Text>
                                </View>
                            </View>
                        )}
                        onSnapToItem={index => {
                            setCurrentIndex(index);

                            // This will update the key of the GIF to force it to re-render
                            setGifKey(prevKey => prevKey + 1); 
                        }}
                        loop={false}
                        pagingEnabled
                    />
                    <View style={styles.buttonContainer} >
                        <Button onPress={handlePrevious} style={styles.button} variant='outline' size='lg' isDisabled={currentIndex == 0}>
                            <ButtonText>Previous</ButtonText>
                        </Button>
                        <Button onPress={handleNext} style={styles.button} variant={currentIndex == data.length - 1 ? 'solid' : 'outline'} size='lg'>
                            <ButtonText>{currentIndex == data.length - 1 ? "Let's trip !" : "Next"}</ButtonText>
                        </Button>
                    </View>
                </View>
            </ModalContent>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        maxHeight: '75%',
        backgroundColor: colors.background_dark,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselItem: {
        display: 'flex',
        flex: 1,
        backgroundColor: colors.background_dark,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
        flex: 10
    },
    textContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white'
    },
    description: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
        width: '100%'
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
    },
});
